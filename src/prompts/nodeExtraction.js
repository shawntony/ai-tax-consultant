/**
 * AI Node Extraction Prompts
 * Claude API 통합을 위한 프롬프트 템플릿
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

// ===================================================
// System Prompts
// ===================================================

/**
 * 노드 추출을 위한 시스템 프롬프트
 */
export const NODE_EXTRACTION_SYSTEM_PROMPT = `You are a Korean tax law expert AI specialized in analyzing tax cases and extracting structured information.

Your task is to:
1. Identify tax issues (problems, challenges, concerns) from the user's case description
2. Identify potential tax solutions (strategies, deductions, exemptions)
3. Determine relationships between issues and solutions
4. Calculate or estimate tax impacts for each solution
5. Identify dependencies and conflicts between solutions
6. Assess complexity and risks for each solution

You must respond in JSON format only, following the exact schema provided.

Korean Tax Law Context:
- 상속세 (Inheritance Tax): 상속세및증여세법
- 증여세 (Gift Tax): 상속세및증여세법
- 양도소득세 (Capital Gains Tax): 소득세법
- 부동산 관련 세금: 종합부동산세법, 지방세법

Always provide:
- Specific legal basis (법조항)
- Realistic tax impact estimates
- Practical requirements and risks
- Clear Korean terminology`;

// ===================================================
// Issue Node Extraction Prompts
// ===================================================

/**
 * Issue Node 추출 프롬프트 생성
 * @param {string} caseDescription - 사용자 케이스 설명
 * @returns {string} 완성된 프롬프트
 */
export function createIssueExtractionPrompt(caseDescription) {
  return `Analyze the following tax case and extract all tax issues (problems, challenges, concerns).

Tax Case:
"""
${caseDescription}
"""

Extract tax issues and respond in this exact JSON format:
{
  "issues": [
    {
      "title": "Brief issue title in Korean",
      "description": "Detailed description of the issue",
      "category": "상속세|증여세|양도소득세|부동산|금융자산|사업승계|기타",
      "relatedLaw": ["법조항1", "법조항2"],
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "estimatedTaxAmount": 123456789,
      "reasoning": "Why this is an issue"
    }
  ]
}

Guidelines:
- Identify all significant tax challenges
- Prioritize based on financial impact and urgency
- Include relevant legal references
- Provide realistic tax amount estimates
- Use clear Korean terminology

Respond with JSON only.`;
}

/**
 * Solution Node 추출 프롬프트 생성
 * @param {string} caseDescription - 사용자 케이스 설명
 * @param {Array} issues - 추출된 Issue 노드들
 * @returns {string} 완성된 프롬프트
 */
export function createSolutionExtractionPrompt(caseDescription, issues) {
  const issuesSummary = issues.map((issue, idx) =>
    `${idx + 1}. ${issue.title} (${issue.category})`
  ).join('\n');

  return `Analyze the following tax case and identified issues, then extract all applicable tax solutions.

Tax Case:
"""
${caseDescription}
"""

Identified Issues:
${issuesSummary}

Extract tax solutions and respond in this exact JSON format:
{
  "solutions": [
    {
      "title": "Brief solution title in Korean",
      "description": "Detailed description of the solution",
      "category": "상속세|증여세|양도소득세|부동산|금융자산|사업승계|기타",
      "taxImpact": -300000000,
      "taxImpactPercentage": -30.5,
      "requirements": [
        "적용 요건 1",
        "적용 요건 2"
      ],
      "risks": [
        "리스크 1",
        "리스크 2"
      ],
      "estimatedTime": "30일|3개월|6개월|1년",
      "complexity": "LOW|MEDIUM|HIGH",
      "legalBasis": [
        "상속세및증여세법 제19조",
        "소득세법 제88조"
      ],
      "relatedIssueIndices": [0, 1],
      "reasoning": "Why this solution works"
    }
  ]
}

Guidelines:
- taxImpact: Negative for tax savings (절세), positive for additional tax
- taxImpactPercentage: Percentage of tax reduction/increase
- Include all applicable deductions, exemptions, and strategies
- Specify concrete requirements for each solution
- Identify potential risks and challenges
- Estimate realistic implementation timeframes
- Assess complexity level (LOW/MEDIUM/HIGH)
- Provide specific legal basis (법조항)
- Link solutions to relevant issues using relatedIssueIndices

Important:
- Be conservative with tax impact estimates
- Consider real-world applicability
- Include both common and advanced strategies
- Highlight compliance requirements

Respond with JSON only.`;
}

// ===================================================
// Edge (Relationship) Extraction Prompts
// ===================================================

/**
 * Edge 추출 프롬프트 생성 (관계 분석)
 * @param {Array} issues - Issue 노드들
 * @param {Array} solutions - Solution 노드들
 * @returns {string} 완성된 프롬프트
 */
export function createEdgeExtractionPrompt(issues, solutions) {
  const issuesList = issues.map((issue, idx) =>
    `Issue ${idx}: ${issue.title}`
  ).join('\n');

  const solutionsList = solutions.map((sol, idx) =>
    `Solution ${idx}: ${sol.title} (절세액: ${Math.abs(sol.taxImpact).toLocaleString()}원)`
  ).join('\n');

  return `Analyze the relationships between the following issues and solutions.

Issues:
${issuesList}

Solutions:
${solutionsList}

Identify relationships and respond in this exact JSON format:
{
  "edges": [
    {
      "type": "ISSUE_TO_SOLUTION|DEPENDENCY|CONFLICT|PREREQUISITE",
      "fromIndex": 0,
      "toIndex": 1,
      "fromType": "ISSUE|SOLUTION",
      "toType": "ISSUE|SOLUTION",
      "strength": 0.95,
      "reasoning": "Why this relationship exists"
    }
  ]
}

Relationship Types:
1. ISSUE_TO_SOLUTION: Issue → Solution (this solution addresses this issue)
   - strength: 0.0-1.0 (how well the solution addresses the issue)

2. DEPENDENCY: Solution A → Solution B (A must be done before B)
   - Example: "법인 설립" must come before "주식 증여"

3. CONFLICT: Solution A ⇄ Solution B (mutually exclusive)
   - Example: "1세대 1주택 공제" conflicts with "임대사업자 등록"

4. PREREQUISITE: Solution A → Solution B (A is recommended before B)
   - Softer than DEPENDENCY, but order matters for optimization

Guidelines:
- For ISSUE_TO_SOLUTION: Assess how effectively the solution addresses the issue (strength 0.0-1.0)
- For DEPENDENCY: Only include if execution order is mandatory
- For CONFLICT: Only include if solutions are mutually exclusive
- For PREREQUISITE: Include if order optimization matters but not mandatory
- Provide clear reasoning for each relationship
- Be conservative - only include strong relationships

Respond with JSON only.`;
}

// ===================================================
// Complete Node Graph Extraction (All-in-One)
// ===================================================

/**
 * 전체 노드 그래프 추출 프롬프트 (한 번에)
 * @param {string} caseDescription - 사용자 케이스 설명
 * @returns {string} 완성된 프롬프트
 */
export function createCompleteGraphExtractionPrompt(caseDescription) {
  return `Analyze the following Korean tax case and extract a complete node graph (issues, solutions, relationships).

Tax Case:
"""
${caseDescription}
"""

Extract the complete graph and respond in this exact JSON format:
{
  "issues": [
    {
      "title": "Brief issue title in Korean",
      "description": "Detailed description",
      "category": "상속세|증여세|양도소득세|부동산|금융자산|사업승계|기타",
      "relatedLaw": ["법조항1", "법조항2"],
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "estimatedTaxAmount": 123456789
    }
  ],
  "solutions": [
    {
      "title": "Brief solution title in Korean",
      "description": "Detailed description",
      "category": "상속세|증여세|양도소득세|부동산|금융자산|사업승계|기타",
      "taxImpact": -300000000,
      "taxImpactPercentage": -30.5,
      "requirements": ["요건1", "요건2"],
      "risks": ["리스크1", "리스크2"],
      "estimatedTime": "30일|3개월|6개월|1년",
      "complexity": "LOW|MEDIUM|HIGH",
      "legalBasis": ["법조항1", "법조항2"]
    }
  ],
  "edges": [
    {
      "type": "ISSUE_TO_SOLUTION|DEPENDENCY|CONFLICT|PREREQUISITE",
      "fromType": "ISSUE|SOLUTION",
      "fromIndex": 0,
      "toType": "ISSUE|SOLUTION",
      "toIndex": 0,
      "strength": 0.95,
      "reasoning": "Relationship explanation"
    }
  ],
  "metadata": {
    "totalEstimatedTax": 1000000000,
    "maxPossibleSavings": 500000000,
    "analysisConfidence": 0.85,
    "recommendedApproach": "Brief recommendation"
  }
}

Analysis Guidelines:

1. Issues Extraction:
   - Identify all tax challenges and problems
   - Estimate tax liability for each issue
   - Prioritize by financial impact and urgency
   - Include relevant legal references

2. Solutions Extraction:
   - Include all applicable deductions, exemptions, strategies
   - Calculate realistic tax impact (negative = savings)
   - Specify concrete requirements for applicability
   - Identify risks and implementation challenges
   - Provide legal basis for each solution
   - Assess complexity and time requirements

3. Relationships:
   - ISSUE_TO_SOLUTION: Which solutions address which issues (with strength 0.0-1.0)
   - DEPENDENCY: Solutions that must be executed in order
   - CONFLICT: Mutually exclusive solutions
   - PREREQUISITE: Recommended execution order for optimization

4. Metadata:
   - totalEstimatedTax: Total tax liability from all issues
   - maxPossibleSavings: Maximum achievable tax savings
   - analysisConfidence: Your confidence in this analysis (0.0-1.0)
   - recommendedApproach: Brief strategic recommendation

Important Considerations:
- Be conservative with tax impact estimates
- Only include solutions with strong legal basis
- Consider real-world applicability and compliance
- Identify genuine conflicts and dependencies
- Provide actionable, practical recommendations
- Use precise Korean legal terminology

Respond with JSON only.`;
}

// ===================================================
// Validation & Refinement Prompts
// ===================================================

/**
 * 노드 그래프 검증 및 개선 프롬프트
 * @param {Object} extractedGraph - 추출된 그래프
 * @returns {string} 검증 프롬프트
 */
export function createGraphValidationPrompt(extractedGraph) {
  return `Review and validate the following extracted tax node graph for accuracy, completeness, and consistency.

Extracted Graph:
${JSON.stringify(extractedGraph, null, 2)}

Validate and respond in this exact JSON format:
{
  "validation": {
    "isValid": true|false,
    "issues": [
      {
        "severity": "ERROR|WARNING|INFO",
        "category": "legal|calculation|relationship|completeness",
        "message": "Description of the issue",
        "suggestion": "How to fix it"
      }
    ],
    "completenessScore": 0.85,
    "accuracyScore": 0.90,
    "consistencyScore": 0.88
  },
  "improvements": [
    {
      "type": "add_solution|modify_solution|add_edge|remove_edge|update_tax_impact",
      "target": "Solution 2|Edge 3|Issue 1",
      "reasoning": "Why this improvement is needed",
      "details": {}
    }
  ],
  "missingAspects": [
    "Aspect that should be considered"
  ]
}

Validation Checklist:
1. Legal Accuracy:
   - Are legal references (법조항) correct and current?
   - Are solutions legally sound and compliant?

2. Calculation Accuracy:
   - Are tax impact calculations realistic?
   - Do percentages match absolute amounts?
   - Is totalEstimatedTax sum of all issues?

3. Relationship Consistency:
   - Are ISSUE_TO_SOLUTION edges properly connected?
   - Are there circular DEPENDENCY chains?
   - Are CONFLICT edges bidirectional when needed?

4. Completeness:
   - Are major tax strategies missing?
   - Are all significant issues identified?
   - Are edge relationships comprehensive?

5. Practical Applicability:
   - Are requirements realistic?
   - Are risks properly identified?
   - Are timeframes reasonable?

Provide specific, actionable feedback for improvements.

Respond with JSON only.`;
}

/**
 * 순환 종속성 감지 프롬프트
 * @param {Array} solutions - Solution 노드들
 * @param {Array} dependencyEdges - DEPENDENCY 엣지들
 * @returns {string} 검증 프롬프트
 */
export function createCircularDependencyCheckPrompt(solutions, dependencyEdges) {
  const solutionsList = solutions.map((sol, idx) =>
    `${idx}: ${sol.title}`
  ).join('\n');

  const edgesList = dependencyEdges.map(edge =>
    `${edge.fromIndex} → ${edge.toIndex}: ${edge.reasoning}`
  ).join('\n');

  return `Check for circular dependencies in the following solution dependency graph.

Solutions:
${solutionsList}

Dependencies (fromIndex → toIndex):
${edgesList}

Analyze and respond in this exact JSON format:
{
  "hasCircularDependency": true|false,
  "cycles": [
    {
      "path": [0, 3, 5, 0],
      "description": "Solution 0 → 3 → 5 → 0",
      "severity": "ERROR|WARNING",
      "resolution": "How to break this cycle"
    }
  ],
  "validExecutionOrder": [0, 1, 2, 3, 4, 5],
  "analysis": "Overall dependency analysis"
}

Guidelines:
- Identify all circular dependency cycles
- Suggest valid execution orders
- Recommend how to resolve conflicts
- Consider if some dependencies could be PREREQUISITE instead

Respond with JSON only.`;
}

// ===================================================
// Tax Impact Calculation Prompts
// ===================================================

/**
 * 세금 영향 계산 프롬프트
 * @param {Object} solution - Solution 노드
 * @param {Object} caseContext - 케이스 컨텍스트 (금액, 자산 정보 등)
 * @returns {string} 계산 프롬프트
 */
export function createTaxImpactCalculationPrompt(solution, caseContext) {
  return `Calculate the precise tax impact for the following solution given the case context.

Solution:
${JSON.stringify(solution, null, 2)}

Case Context:
${JSON.stringify(caseContext, null, 2)}

Calculate and respond in this exact JSON format:
{
  "taxImpact": -300000000,
  "taxImpactPercentage": -30.5,
  "calculation": {
    "baseTax": 1000000000,
    "deduction": 300000000,
    "adjustedTax": 700000000,
    "savings": 300000000,
    "formula": "Base Tax - Deduction Amount",
    "assumptions": [
      "Assumption 1",
      "Assumption 2"
    ]
  },
  "confidence": 0.85,
  "variableFactors": [
    "Factor that could affect the calculation"
  ],
  "legalBasis": [
    "법조항 supporting this calculation"
  ]
}

Calculation Guidelines:
- Use current Korean tax rates and thresholds
- Show step-by-step calculation
- State all assumptions clearly
- Identify variable factors
- Provide confidence level (0.0-1.0)
- Include specific legal basis

Respond with JSON only.`;
}

// ===================================================
// Export All Prompts
// ===================================================

export default {
  NODE_EXTRACTION_SYSTEM_PROMPT,
  createIssueExtractionPrompt,
  createSolutionExtractionPrompt,
  createEdgeExtractionPrompt,
  createCompleteGraphExtractionPrompt,
  createGraphValidationPrompt,
  createCircularDependencyCheckPrompt,
  createTaxImpactCalculationPrompt
};
