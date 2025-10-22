/**
 * Node Graph Data Models
 * 노드 기반 세무 최적화 시스템의 핵심 데이터 구조
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

// ===================================================
// Issue Node Class
// ===================================================
export class IssueNode {
  constructor(data) {
    this.id = data.id || `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'ISSUE';
    this.title = data.title;
    this.description = data.description || '';
    this.category = data.category; // '상속세', '증여세', '양도소득세', etc.
    this.relatedLaw = data.relatedLaw || []; // 관련 법조항
    this.priority = data.priority || 'MEDIUM'; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    this.taxImpact = null; // Issues don't have direct tax impact
    this.connectedSolutions = data.connectedSolutions || []; // Solution IDs
    this.createdBy = data.createdBy || 'AI';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * 이슈를 JSON으로 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      category: this.category,
      relatedLaw: this.relatedLaw,
      priority: this.priority,
      connectedSolutions: this.connectedSolutions,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * JSON에서 IssueNode 생성
   */
  static fromJSON(json) {
    return new IssueNode(json);
  }
}

// ===================================================
// Solution Node Class
// ===================================================
export class SolutionNode {
  constructor(data) {
    this.id = data.id || `solution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'SOLUTION';
    this.title = data.title;
    this.description = data.description || '';
    this.category = data.category;

    // Tax Impact (핵심!)
    this.taxImpact = data.taxImpact || 0; // 절세액 (음수) or 추가 세금 (양수)
    this.taxImpactPercentage = data.taxImpactPercentage || 0; // 절세 비율 (%)

    // Implementation Details
    this.requirements = data.requirements || []; // 적용 요건
    this.risks = data.risks || []; // 리스크
    this.dependencies = data.dependencies || []; // [solutionId1, solutionId2]
    this.executionOrder = data.executionOrder || null; // null이면 순서 무관
    this.estimatedTime = data.estimatedTime || ''; // "30일", "3개월"
    this.complexity = data.complexity || 'MEDIUM'; // 'LOW', 'MEDIUM', 'HIGH'

    // Legal Basis
    this.legalBasis = data.legalBasis || []; // 법적 근거

    // Related Issues
    this.relatedIssues = data.relatedIssues || []; // Issue IDs

    // Metadata
    this.createdBy = data.createdBy || 'AI';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * 솔루션을 JSON으로 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      category: this.category,
      taxImpact: this.taxImpact,
      taxImpactPercentage: this.taxImpactPercentage,
      requirements: this.requirements,
      risks: this.risks,
      dependencies: this.dependencies,
      executionOrder: this.executionOrder,
      estimatedTime: this.estimatedTime,
      complexity: this.complexity,
      legalBasis: this.legalBasis,
      relatedIssues: this.relatedIssues,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * JSON에서 SolutionNode 생성
   */
  static fromJSON(json) {
    return new SolutionNode(json);
  }

  /**
   * 복잡도 점수 계산 (1-10)
   */
  getComplexityScore() {
    const complexityMap = {
      'LOW': 3,
      'MEDIUM': 5,
      'HIGH': 8
    };
    return complexityMap[this.complexity] || 5;
  }

  /**
   * 리스크 점수 계산 (1-10)
   */
  getRiskScore() {
    // 리스크 개수에 비례
    return Math.min(this.risks.length * 2, 10);
  }
}

// ===================================================
// Edge Class (Relationship)
// ===================================================
export class Edge {
  constructor(from, to, type, strength = 1.0, reasoning = '') {
    this.id = `edge-${from}-${to}`;
    this.type = type; // 'ISSUE_TO_SOLUTION' | 'DEPENDENCY' | 'CONFLICT' | 'PREREQUISITE'
    this.from = from; // Node ID
    this.to = to; // Node ID
    this.strength = Math.max(0, Math.min(1, strength)); // 0.0 ~ 1.0 (연관도)
    this.reasoning = reasoning;
  }

  /**
   * Edge를 JSON으로 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      from: this.from,
      to: this.to,
      strength: this.strength,
      reasoning: this.reasoning
    };
  }

  /**
   * JSON에서 Edge 생성
   */
  static fromJSON(json) {
    return new Edge(json.from, json.to, json.type, json.strength, json.reasoning);
  }
}

// ===================================================
// Node Graph Class
// ===================================================
export class NodeGraph {
  constructor() {
    this.issueNodes = new Map(); // id -> IssueNode
    this.solutionNodes = new Map(); // id -> SolutionNode
    this.edges = new Map(); // edgeId -> Edge
  }

  // ===================================================
  // Node Management
  // ===================================================

  /**
   * Issue Node 추가
   */
  addIssueNode(node) {
    this.issueNodes.set(node.id, node);
    return node.id;
  }

  /**
   * Solution Node 추가
   */
  addSolutionNode(node) {
    this.solutionNodes.set(node.id, node);
    return node.id;
  }

  /**
   * Edge 추가
   */
  addEdge(edge) {
    this.edges.set(edge.id, edge);
    return edge.id;
  }

  /**
   * Node 삭제 (Issue or Solution)
   */
  removeNode(nodeId) {
    // Remove from both maps
    this.issueNodes.delete(nodeId);
    this.solutionNodes.delete(nodeId);

    // Remove all edges connected to this node
    const edgesToRemove = [];
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
  }

  /**
   * Edge 삭제
   */
  removeEdge(edgeId) {
    this.edges.delete(edgeId);
  }

  // ===================================================
  // Graph Traversal & Queries
  // ===================================================

  /**
   * 특정 Issue에 연결된 모든 Solution 가져오기
   */
  getSolutionsByIssue(issueId) {
    const solutions = [];
    for (const edge of this.edges.values()) {
      if (edge.type === 'ISSUE_TO_SOLUTION' && edge.from === issueId) {
        const solution = this.solutionNodes.get(edge.to);
        if (solution) {
          solutions.push({
            solution,
            strength: edge.strength,
            reasoning: edge.reasoning
          });
        }
      }
    }
    // Sort by strength (높은 연관도 우선)
    return solutions.sort((a, b) => b.strength - a.strength);
  }

  /**
   * 특정 Solution의 종속성 가져오기
   */
  getDependencies(solutionId) {
    const dependencies = [];
    for (const edge of this.edges.values()) {
      if (edge.type === 'DEPENDENCY' && edge.from === solutionId) {
        const depSolution = this.solutionNodes.get(edge.to);
        if (depSolution) {
          dependencies.push(depSolution);
        }
      }
    }
    return dependencies;
  }

  /**
   * 순환 종속성 감지 (DFS)
   */
  detectCircularDependency(solutionId, visited = new Set()) {
    if (visited.has(solutionId)) {
      return true; // 순환 발견!
    }

    visited.add(solutionId);

    const solution = this.solutionNodes.get(solutionId);
    if (!solution) return false;

    for (const depId of solution.dependencies) {
      if (this.detectCircularDependency(depId, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 충돌하는 Solution 쌍 찾기
   */
  getConflicts(solutionId) {
    const conflicts = [];
    for (const edge of this.edges.values()) {
      if (edge.type === 'CONFLICT' && (edge.from === solutionId || edge.to === solutionId)) {
        const conflictId = edge.from === solutionId ? edge.to : edge.from;
        const conflictSolution = this.solutionNodes.get(conflictId);
        if (conflictSolution) {
          conflicts.push({
            solution: conflictSolution,
            reasoning: edge.reasoning
          });
        }
      }
    }
    return conflicts;
  }

  /**
   * 전체 그래프 통계
   */
  getStats() {
    return {
      totalIssues: this.issueNodes.size,
      totalSolutions: this.solutionNodes.size,
      totalEdges: this.edges.size,
      edgeTypes: this.getEdgeTypeDistribution()
    };
  }

  /**
   * Edge 타입별 분포
   */
  getEdgeTypeDistribution() {
    const distribution = {};
    for (const edge of this.edges.values()) {
      distribution[edge.type] = (distribution[edge.type] || 0) + 1;
    }
    return distribution;
  }

  // ===================================================
  // Serialization
  // ===================================================

  /**
   * 전체 그래프를 JSON으로 직렬화
   */
  toJSON() {
    return {
      issues: Array.from(this.issueNodes.values()).map(n => n.toJSON()),
      solutions: Array.from(this.solutionNodes.values()).map(n => n.toJSON()),
      edges: Array.from(this.edges.values()).map(e => e.toJSON()),
      stats: this.getStats()
    };
  }

  /**
   * JSON에서 NodeGraph 생성
   */
  static fromJSON(json) {
    const graph = new NodeGraph();

    // Restore Issue Nodes
    if (json.issues) {
      json.issues.forEach(issueData => {
        graph.addIssueNode(IssueNode.fromJSON(issueData));
      });
    }

    // Restore Solution Nodes
    if (json.solutions) {
      json.solutions.forEach(solutionData => {
        graph.addSolutionNode(SolutionNode.fromJSON(solutionData));
      });
    }

    // Restore Edges
    if (json.edges) {
      json.edges.forEach(edgeData => {
        graph.addEdge(Edge.fromJSON(edgeData));
      });
    }

    return graph;
  }

  /**
   * 그래프를 Supabase에 저장할 형식으로 변환
   */
  toSupabaseFormat() {
    const nodes = Array.from(this.issueNodes.values()).map(node => ({
      id: node.id,
      node_type: node.type,
      title: node.title,
      description: node.description,
      category: node.category,
      related_law: node.relatedLaw,
      priority: node.priority,
      created_by: node.createdBy
    }));

    const solutions = Array.from(this.solutionNodes.values()).map(node => ({
      id: node.id,
      node_type: node.type,
      title: node.title,
      description: node.description,
      category: node.category,
      tax_impact: node.taxImpact,
      tax_impact_percentage: node.taxImpactPercentage,
      requirements: node.requirements,
      risks: node.risks,
      estimated_time: node.estimatedTime,
      complexity: node.complexity,
      legal_basis: node.legalBasis,
      execution_order: node.executionOrder,
      created_by: node.createdBy
    }));

    const edges = Array.from(this.edges.values()).map(edge => ({
      edge_type: edge.type,
      from_node_id: edge.from,
      from_node_type: this.getNodeType(edge.from),
      to_node_id: edge.to,
      to_node_type: this.getNodeType(edge.to),
      strength: edge.strength,
      reasoning: edge.reasoning
    }));

    return { nodes, solutions, edges };
  }

  /**
   * Node ID로 Node 타입 확인
   */
  getNodeType(nodeId) {
    if (this.issueNodes.has(nodeId)) return 'ISSUE';
    if (this.solutionNodes.has(nodeId)) return 'SOLUTION';
    return null;
  }
}

// ===================================================
// Export
// ===================================================
export default NodeGraph;
