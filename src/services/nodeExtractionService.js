/**
 * Node Extraction Service
 * Claude API 통합을 통한 노드 자동 추출 서비스
 *
 * @version 2.1.0
 * @date 2025-10-21
 * @changes Backend proxy를 통한 API 호출로 변경 (브라우저 보안 문제 해결)
 */

import NodeGraph, { IssueNode, SolutionNode, Edge } from '../models/NodeGraph.js';
import prompts from '../prompts/nodeExtraction.js';

// ===================================================
// Configuration
// ===================================================

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const MAX_TOKENS = 8000;
const MAX_TOKENS_LIMIT = 8192; // Claude 3.5 Sonnet maximum output tokens

// ===================================================
// Node Extraction Service Class
// ===================================================

export class NodeExtractionService {
  constructor() {
    this.backendUrl = BACKEND_API_URL;
  }

  /**
   * Claude API 호출 헬퍼 (백엔드 프록시 사용)
   * @param {string} userPrompt - 사용자 프롬프트
   * @param {number} maxTokens - 최대 토큰 수
   * @returns {Promise<Object>} JSON 응답
   */
  async callClaude(userPrompt, maxTokens = MAX_TOKENS) {
    // Ensure maxTokens doesn't exceed API limit
    const safeMaxTokens = Math.min(maxTokens, MAX_TOKENS_LIMIT);

    try {
      const response = await fetch(`${this.backendUrl}/api/extract-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userPrompt,
          systemPrompt: prompts.NODE_EXTRACTION_SYSTEM_PROMPT,
          maxTokens: safeMaxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract text content
      const textContent = data.content?.find(block => block.type === 'text');
      if (!textContent) {
        throw new Error('No text content in Claude response');
      }

      // Parse JSON response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[NodeExtractionService] Claude API call failed:', error);
      throw new Error(`Claude API call failed: ${error.message}`);
    }
  }

  // ===================================================
  // Step-by-Step Extraction (3단계)
  // ===================================================

  /**
   * Step 1: Issue 노드 추출
   * @param {string} caseDescription - 사용자 케이스 설명
   * @returns {Promise<Array>} Issue 노드 배열
   */
  async extractIssues(caseDescription) {
    console.log('[NodeExtractionService] Extracting issues...');

    const prompt = prompts.createIssueExtractionPrompt(caseDescription);
    const response = await this.callClaude(prompt);

    if (!response.issues || !Array.isArray(response.issues)) {
      throw new Error('Invalid issues response format');
    }

    console.log(`[NodeExtractionService] Extracted ${response.issues.length} issues`);
    return response.issues;
  }

  /**
   * Step 2: Solution 노드 추출
   * @param {string} caseDescription - 사용자 케이스 설명
   * @param {Array} issues - 추출된 Issue 노드들
   * @returns {Promise<Array>} Solution 노드 배열
   */
  async extractSolutions(caseDescription, issues) {
    console.log('[NodeExtractionService] Extracting solutions...');

    const prompt = prompts.createSolutionExtractionPrompt(caseDescription, issues);
    const response = await this.callClaude(prompt, 12000); // More tokens for solutions

    if (!response.solutions || !Array.isArray(response.solutions)) {
      throw new Error('Invalid solutions response format');
    }

    console.log(`[NodeExtractionService] Extracted ${response.solutions.length} solutions`);
    return response.solutions;
  }

  /**
   * Step 3: Edge 추출 (관계 분석)
   * @param {Array} issues - Issue 노드들
   * @param {Array} solutions - Solution 노드들
   * @returns {Promise<Array>} Edge 배열
   */
  async extractEdges(issues, solutions) {
    console.log('[NodeExtractionService] Extracting relationships...');

    const prompt = prompts.createEdgeExtractionPrompt(issues, solutions);
    const response = await this.callClaude(prompt);

    if (!response.edges || !Array.isArray(response.edges)) {
      throw new Error('Invalid edges response format');
    }

    console.log(`[NodeExtractionService] Extracted ${response.edges.length} edges`);
    return response.edges;
  }

  // ===================================================
  // Complete Graph Extraction (한 번에)
  // ===================================================

  /**
   * 전체 노드 그래프 추출 (한 번에)
   * @param {string} caseDescription - 사용자 케이스 설명
   * @returns {Promise<Object>} { issues, solutions, edges, metadata }
   */
  async extractCompleteGraph(caseDescription) {
    console.log('[NodeExtractionService] Extracting complete graph...');

    const prompt = prompts.createCompleteGraphExtractionPrompt(caseDescription);
    const response = await this.callClaude(prompt, 16000); // Large context for complete extraction

    // Validate response structure
    if (!response.issues || !response.solutions || !response.edges) {
      throw new Error('Incomplete graph response');
    }

    console.log(`[NodeExtractionService] Complete graph extracted:`, {
      issues: response.issues.length,
      solutions: response.solutions.length,
      edges: response.edges.length
    });

    return response;
  }

  // ===================================================
  // NodeGraph Construction
  // ===================================================

  /**
   * 추출된 데이터로부터 NodeGraph 객체 생성
   * @param {Object} extractedData - { issues, solutions, edges }
   * @returns {NodeGraph} NodeGraph 인스턴스
   */
  buildNodeGraph(extractedData) {
    console.log('[NodeExtractionService] Building NodeGraph...');

    const graph = new NodeGraph();

    // Add Issue Nodes
    const issueNodeMap = new Map();
    extractedData.issues.forEach((issueData, idx) => {
      const issueNode = new IssueNode({
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        relatedLaw: issueData.relatedLaw || [],
        priority: issueData.priority || 'MEDIUM',
        createdBy: 'AI'
      });

      const nodeId = graph.addIssueNode(issueNode);
      issueNodeMap.set(idx, nodeId);
    });

    // Add Solution Nodes
    const solutionNodeMap = new Map();
    extractedData.solutions.forEach((solutionData, idx) => {
      const solutionNode = new SolutionNode({
        title: solutionData.title,
        description: solutionData.description,
        category: solutionData.category,
        taxImpact: solutionData.taxImpact || 0,
        taxImpactPercentage: solutionData.taxImpactPercentage || 0,
        requirements: solutionData.requirements || [],
        risks: solutionData.risks || [],
        estimatedTime: solutionData.estimatedTime || '30일',
        complexity: solutionData.complexity || 'MEDIUM',
        legalBasis: solutionData.legalBasis || [],
        relatedIssues: solutionData.relatedIssueIndices?.map(i => issueNodeMap.get(i)) || [],
        createdBy: 'AI'
      });

      const nodeId = graph.addSolutionNode(solutionNode);
      solutionNodeMap.set(idx, nodeId);

      // Also store dependencies for later processing
      if (solutionData.dependencies) {
        solutionNode.dependencies = solutionData.dependencies;
      }
    });

    // Add Edges
    extractedData.edges.forEach(edgeData => {
      let fromNodeId, toNodeId;

      // Resolve node IDs from indices
      if (edgeData.fromType === 'ISSUE') {
        fromNodeId = issueNodeMap.get(edgeData.fromIndex);
      } else {
        fromNodeId = solutionNodeMap.get(edgeData.fromIndex);
      }

      if (edgeData.toType === 'ISSUE') {
        toNodeId = issueNodeMap.get(edgeData.toIndex);
      } else {
        toNodeId = solutionNodeMap.get(edgeData.toIndex);
      }

      if (!fromNodeId || !toNodeId) {
        console.warn('[NodeExtractionService] Invalid edge indices:', edgeData);
        return;
      }

      const edge = new Edge(
        fromNodeId,
        toNodeId,
        edgeData.type,
        edgeData.strength || 1.0,
        edgeData.reasoning || ''
      );

      graph.addEdge(edge);

      // Update dependencies in solution nodes
      if (edgeData.type === 'DEPENDENCY') {
        const fromSolution = graph.solutionNodes.get(fromNodeId);
        if (fromSolution) {
          if (!fromSolution.dependencies.includes(toNodeId)) {
            fromSolution.dependencies.push(toNodeId);
          }
        }
      }
    });

    console.log('[NodeExtractionService] NodeGraph built successfully');
    return graph;
  }

  // ===================================================
  // Validation & Refinement
  // ===================================================

  /**
   * 추출된 그래프 검증 및 개선 제안
   * @param {Object} extractedGraph - 추출된 그래프 데이터
   * @returns {Promise<Object>} 검증 결과 및 개선 제안
   */
  async validateAndRefine(extractedGraph) {
    console.log('[NodeExtractionService] Validating graph...');

    const prompt = prompts.createGraphValidationPrompt(extractedGraph);
    const response = await this.callClaude(prompt);

    console.log('[NodeExtractionService] Validation complete:', {
      isValid: response.validation?.isValid,
      issuesFound: response.validation?.issues?.length || 0,
      improvementsCount: response.improvements?.length || 0
    });

    return response;
  }

  /**
   * 순환 종속성 검사
   * @param {Array} solutions - Solution 노드들
   * @param {Array} dependencyEdges - DEPENDENCY 엣지들
   * @returns {Promise<Object>} 순환 종속성 분석 결과
   */
  async checkCircularDependencies(solutions, dependencyEdges) {
    console.log('[NodeExtractionService] Checking circular dependencies...');

    const prompt = prompts.createCircularDependencyCheckPrompt(solutions, dependencyEdges);
    const response = await this.callClaude(prompt);

    if (response.hasCircularDependency) {
      console.warn('[NodeExtractionService] Circular dependencies detected:', response.cycles);
    } else {
      console.log('[NodeExtractionService] No circular dependencies found');
    }

    return response;
  }

  // ===================================================
  // Main Workflow: Complete Extraction Pipeline
  // ===================================================

  /**
   * 전체 워크플로우: 케이스 설명 → NodeGraph 생성
   * @param {string} caseDescription - 사용자 케이스 설명
   * @param {Object} options - { method: 'complete'|'stepwise', validate: boolean }
   * @returns {Promise<Object>} { graph: NodeGraph, metadata, validation }
   */
  async extractAndBuildGraph(caseDescription, options = {}) {
    const { method = 'complete', validate = true } = options;

    console.log(`[NodeExtractionService] Starting extraction (method: ${method})...`);

    let extractedData;

    if (method === 'stepwise') {
      // 3-step process
      const issues = await this.extractIssues(caseDescription);
      const solutions = await this.extractSolutions(caseDescription, issues);
      const edges = await this.extractEdges(issues, solutions);

      extractedData = {
        issues,
        solutions,
        edges,
        metadata: {
          method: 'stepwise',
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // Complete graph extraction (한 번에)
      extractedData = await this.extractCompleteGraph(caseDescription);
      extractedData.metadata = {
        ...extractedData.metadata,
        method: 'complete',
        timestamp: new Date().toISOString()
      };
    }

    // Build NodeGraph
    const graph = this.buildNodeGraph(extractedData);

    // Validate if requested
    let validationResult = null;
    if (validate) {
      validationResult = await this.validateAndRefine(extractedData);

      // Check for circular dependencies
      const dependencyEdges = extractedData.edges.filter(e => e.type === 'DEPENDENCY');
      if (dependencyEdges.length > 0) {
        const circularCheck = await this.checkCircularDependencies(
          extractedData.solutions,
          dependencyEdges
        );

        if (circularCheck.hasCircularDependency) {
          validationResult.circularDependencies = circularCheck.cycles;
        }
      }
    }

    return {
      graph,
      extractedData,
      metadata: extractedData.metadata,
      validation: validationResult
    };
  }

  // ===================================================
  // Tax Impact Calculation
  // ===================================================

  /**
   * 세금 영향 재계산 (더 정확한 계산)
   * @param {Object} solution - Solution 노드
   * @param {Object} caseContext - 케이스 컨텍스트
   * @returns {Promise<Object>} 계산 결과
   */
  async recalculateTaxImpact(solution, caseContext) {
    console.log('[NodeExtractionService] Recalculating tax impact...');

    const prompt = prompts.createTaxImpactCalculationPrompt(solution, caseContext);
    const response = await this.callClaude(prompt);

    console.log('[NodeExtractionService] Tax impact recalculated:', {
      taxImpact: response.taxImpact,
      confidence: response.confidence
    });

    return response;
  }
}

// ===================================================
// Export
// ===================================================

export default NodeExtractionService;
