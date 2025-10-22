# Node Extraction Service - 사용 가이드

노드 기반 세무 최적화 시스템의 AI 자동 노드 추출 서비스 사용 방법입니다.

## 목차

1. [개요](#개요)
2. [설치 및 설정](#설치-및-설정)
3. [기본 사용법](#기본-사용법)
4. [고급 기능](#고급-기능)
5. [프롬프트 시스템](#프롬프트-시스템)
6. [성능 최적화](#성능-최적화)
7. [문제 해결](#문제-해결)

---

## 개요

### 주요 기능

- **자동 Issue 노드 추출**: 사용자 케이스에서 세무 이슈 자동 식별
- **자동 Solution 노드 추출**: 적용 가능한 세무 솔루션 자동 생성
- **관계 분석**: Issue-Solution 연결, 종속성, 충돌 자동 감지
- **세금 영향 계산**: 각 솔루션의 절세액 자동 계산
- **검증 및 개선**: 추출된 그래프의 정확성 및 완성도 검증

### 아키텍처

```
User Case Description
        ↓
Claude API (Sonnet 3.5)
        ↓
Structured JSON Output
        ↓
NodeGraph Construction
        ↓
Validation & Refinement
        ↓
Ready for Optimization
```

---

## 설치 및 설정

### 1. 패키지 설치

```bash
npm install @anthropic-ai/sdk
```

### 2. 환경 변수 설정

`.env` 파일에 Anthropic API 키 추가:

```env
REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

또는 백엔드 환경에서:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 3. API 키 발급

1. https://console.anthropic.com/ 접속
2. Settings → API Keys → Create Key
3. 생성된 키를 `.env` 파일에 저장

---

## 기본 사용법

### Method 1: Complete Extraction (권장)

한 번의 API 호출로 전체 그래프 추출:

```javascript
import NodeExtractionService from './services/nodeExtractionService.js';

const service = new NodeExtractionService();

const caseDescription = `
저희 아버지께서 10억원 상당의 아파트를 저에게 상속하려고 합니다.
배우자(저희 어머니)는 생존해 계시고, 저희는 20년째 같은 집에서 거주하고 있습니다.
저는 무주택자이며, 아버지께서는 이 아파트만 보유하고 계십니다.
`;

// 전체 그래프 추출 (한 번에)
const result = await service.extractAndBuildGraph(caseDescription, {
  method: 'complete',  // 'complete' (한 번에) or 'stepwise' (3단계)
  validate: true       // 검증 활성화
});

console.log('Generated Graph:', result.graph);
console.log('Metadata:', result.metadata);
console.log('Validation:', result.validation);
```

### Method 2: Step-by-Step Extraction

3단계로 나누어 추출 (더 정확하지만 느림):

```javascript
const result = await service.extractAndBuildGraph(caseDescription, {
  method: 'stepwise',  // 3단계 프로세스
  validate: true
});

// 동일한 결과 구조
console.log('Graph:', result.graph);
```

### 결과 구조

```javascript
{
  graph: NodeGraph {
    issueNodes: Map(2),      // IssueNode 인스턴스들
    solutionNodes: Map(3),   // SolutionNode 인스턴스들
    edges: Map(5)            // Edge 인스턴스들
  },
  extractedData: {
    issues: [...],           // 원본 추출 데이터
    solutions: [...],
    edges: [...],
    metadata: {
      totalEstimatedTax: 500000000,
      maxPossibleSavings: 400000000,
      analysisConfidence: 0.85,
      recommendedApproach: "배우자 공제와 동거주택 공제를 함께 적용"
    }
  },
  validation: {
    validation: {
      isValid: true,
      completenessScore: 0.88,
      accuracyScore: 0.92,
      issues: []
    },
    improvements: [...]
  }
}
```

---

## 고급 기능

### 1. 개별 단계 실행

필요한 경우 각 단계를 개별적으로 실행 가능:

```javascript
// Step 1: Issue 추출
const issues = await service.extractIssues(caseDescription);
console.log('Issues:', issues);

// Step 2: Solution 추출
const solutions = await service.extractSolutions(caseDescription, issues);
console.log('Solutions:', solutions);

// Step 3: Edge 추출
const edges = await service.extractEdges(issues, solutions);
console.log('Edges:', edges);

// NodeGraph 구성
const graph = service.buildNodeGraph({ issues, solutions, edges });
```

### 2. 세금 영향 재계산

더 정확한 계산이 필요한 경우:

```javascript
const solution = {
  title: "배우자 공제 적용",
  description: "...",
  taxImpact: -300000000  // 초기 추정치
};

const caseContext = {
  totalInheritance: 1000000000,
  spouseExists: true,
  estateTaxRate: 0.30
};

const detailedCalculation = await service.recalculateTaxImpact(
  solution,
  caseContext
);

console.log('Detailed Calculation:', detailedCalculation);
/*
{
  taxImpact: -300000000,
  taxImpactPercentage: -30.0,
  calculation: {
    baseTax: 1000000000,
    deduction: 300000000,
    adjustedTax: 700000000,
    savings: 300000000,
    formula: "배우자 공제 최대 30억원 중 실제 상속액의 30% 적용",
    assumptions: [
      "배우자 생존 가정",
      "법정 상속 비율 준수"
    ]
  },
  confidence: 0.90,
  legalBasis: ["상속세및증여세법 제19조"]
}
*/
```

### 3. 검증 및 개선

추출된 그래프의 품질 검증:

```javascript
const validation = await service.validateAndRefine(extractedData);

if (!validation.validation.isValid) {
  console.error('Validation failed:', validation.validation.issues);
}

if (validation.improvements.length > 0) {
  console.log('Suggested improvements:');
  validation.improvements.forEach(imp => {
    console.log(`- ${imp.type}: ${imp.reasoning}`);
  });
}
```

### 4. 순환 종속성 검사

Solution 간 순환 종속성 감지:

```javascript
const dependencyEdges = extractedData.edges.filter(e => e.type === 'DEPENDENCY');

const circularCheck = await service.checkCircularDependencies(
  extractedData.solutions,
  dependencyEdges
);

if (circularCheck.hasCircularDependency) {
  console.error('Circular dependencies found:');
  circularCheck.cycles.forEach(cycle => {
    console.log(`- ${cycle.description}`);
    console.log(`  Resolution: ${cycle.resolution}`);
  });
}

console.log('Valid execution order:', circularCheck.validExecutionOrder);
```

---

## 프롬프트 시스템

### 시스템 프롬프트

모든 API 호출에 사용되는 기본 시스템 프롬프트:

```javascript
import prompts from './prompts/nodeExtraction.js';

console.log(prompts.NODE_EXTRACTION_SYSTEM_PROMPT);
```

### 커스텀 프롬프트 생성

필요한 경우 프롬프트 직접 생성 가능:

```javascript
// Issue 추출 프롬프트
const issuePrompt = prompts.createIssueExtractionPrompt(caseDescription);

// Solution 추출 프롬프트
const solutionPrompt = prompts.createSolutionExtractionPrompt(
  caseDescription,
  issues
);

// Edge 추출 프롬프트
const edgePrompt = prompts.createEdgeExtractionPrompt(issues, solutions);

// 완전 그래프 추출 프롬프트
const completePrompt = prompts.createCompleteGraphExtractionPrompt(
  caseDescription
);
```

### 프롬프트 커스터마이징

프롬프트 함수를 수정하여 도메인에 맞게 조정:

```javascript
// nodeExtraction.js 수정 예시
export function createIssueExtractionPrompt(caseDescription) {
  return `Analyze the following tax case...

추가 지침:
- 특별히 부동산 관련 이슈에 집중
- 상속세 및 증여세법 우선 적용
- 지방세법 관련 이슈도 포함

Tax Case:
"""
${caseDescription}
"""
...
`;
}
```

---

## 성능 최적화

### 1. API 호출 최적화

```javascript
// ✅ Good: Complete extraction (1 API call)
const result = await service.extractAndBuildGraph(caseDescription, {
  method: 'complete'
});

// ❌ Avoid: Stepwise unless needed (3+ API calls)
const result = await service.extractAndBuildGraph(caseDescription, {
  method: 'stepwise'
});
```

### 2. 토큰 사용 최적화

```javascript
// 간단한 케이스는 작은 토큰 한도 사용
const service = new NodeExtractionService();
service.callClaude(prompt, 4000);  // 기본: 8000

// 복잡한 케이스는 큰 토큰 한도
service.callClaude(prompt, 16000);
```

### 3. 캐싱 전략

```javascript
class CachedNodeExtractionService extends NodeExtractionService {
  constructor(apiKey) {
    super(apiKey);
    this.cache = new Map();
  }

  async extractAndBuildGraph(caseDescription, options = {}) {
    const cacheKey = `${caseDescription}_${options.method}`;

    if (this.cache.has(cacheKey)) {
      console.log('Cache hit!');
      return this.cache.get(cacheKey);
    }

    const result = await super.extractAndBuildGraph(caseDescription, options);
    this.cache.set(cacheKey, result);

    return result;
  }
}
```

### 4. 병렬 처리

복수 케이스 동시 처리:

```javascript
const cases = [case1, case2, case3];

const results = await Promise.all(
  cases.map(caseDesc =>
    service.extractAndBuildGraph(caseDesc, { validate: false })
  )
);

console.log(`Processed ${results.length} cases`);
```

---

## 문제 해결

### 문제 1: API 키 오류

```
Error: Anthropic API key is required
```

**해결책:**
```bash
# .env 파일 확인
cat .env | grep ANTHROPIC_API_KEY

# 환경 변수 재설정
export REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 문제 2: JSON 파싱 실패

```
Error: No JSON found in Claude response
```

**해결책:**

Claude 응답이 JSON 형식이 아닐 수 있음. 프롬프트를 더 명확하게 수정:

```javascript
// 프롬프트에 강조 추가
const prompt = `...

IMPORTANT: Respond with VALID JSON ONLY.
Do not include any explanatory text before or after the JSON.

{
  "issues": [...]
}`;
```

### 문제 3: 낮은 분석 품질

```javascript
// validation.completenessScore < 0.7
```

**해결책:**

1. **더 상세한 케이스 설명 제공:**
```javascript
const caseDescription = `
상속 상황:
- 피상속인: 아버지 (만 75세)
- 상속 재산: 서울 강남구 아파트 (시가 10억원)
- 상속인: 배우자 (생존), 자녀 2명 (본인 포함)

동거 이력:
- 30년 동거 (주민등록상 확인 가능)
- 1세대 1주택 (피상속인 다른 부동산 없음)

상속인 현황:
- 배우자: 무주택 상태 유지
- 본인: 무주택, 결혼 예정
- 형제: 유주택 (서울 송파구 아파트 소유)
`;
```

2. **Stepwise 방법 사용:**
```javascript
// 더 정확하지만 느림
const result = await service.extractAndBuildGraph(caseDescription, {
  method: 'stepwise',
  validate: true
});
```

3. **수동 검증 및 수정:**
```javascript
const result = await service.extractAndBuildGraph(caseDescription);

// 수동으로 노드 추가
const additionalSolution = new SolutionNode({
  title: "장기보유특별공제 적용",
  taxImpact: -150000000,
  // ...
});

result.graph.addSolutionNode(additionalSolution);
```

### 문제 4: 순환 종속성 발견

```javascript
// circularCheck.hasCircularDependency === true
```

**해결책:**

자동으로 제안된 해결책 적용:

```javascript
const circularCheck = await service.checkCircularDependencies(
  extractedData.solutions,
  dependencyEdges
);

if (circularCheck.hasCircularDependency) {
  circularCheck.cycles.forEach(cycle => {
    console.log(`Cycle found: ${cycle.description}`);
    console.log(`Resolution: ${cycle.resolution}`);

    // 제안된 해결책 적용 (예: DEPENDENCY → PREREQUISITE로 변경)
    const problematicEdge = extractedData.edges.find(e =>
      e.fromIndex === cycle.path[0] && e.toIndex === cycle.path[1]
    );

    if (problematicEdge) {
      problematicEdge.type = 'PREREQUISITE';  // 순환 제거
    }
  });

  // 그래프 재구성
  const fixedGraph = service.buildNodeGraph(extractedData);
}
```

---

## 실제 사용 예시

### 예시 1: 상속세 케이스

```javascript
const inheritanceCase = `
아버지 사망 (2024년 1월)
상속 재산: 강남 아파트 15억원, 예금 5억원 (총 20억원)
상속인: 배우자 (생존), 자녀 3명
배우자와 아파트에서 25년 동거
자녀들은 모두 무주택
`;

const result = await service.extractAndBuildGraph(inheritanceCase);

console.log('Issues found:', result.extractedData.issues.length);
console.log('Solutions found:', result.extractedData.solutions.length);
console.log('Max savings:', result.extractedData.metadata.maxPossibleSavings);

// Expected output:
// Issues found: 2
//   1. 상속세 과세 (20억원)
//   2. 부동산 명의 이전 시 취득세
// Solutions found: 4
//   1. 배우자 공제 적용 (-6억원 절세)
//   2. 동거주택 상속공제 (-6억원 절세)
//   3. 자녀공제 적용 (-1.5억원 절세)
//   4. 금융재산 상속공제 (-0.5억원 절세)
// Max savings: 900000000원
```

### 예시 2: 증여세 케이스

```javascript
const giftCase = `
부모님이 자녀(30세)에게 아파트 증여 계획
아파트 시가: 8억원
자녀는 현재 무주택, 결혼 예정
증여 후 10년간 거주 계획
`;

const result = await service.extractAndBuildGraph(giftCase);

// OptimizationEngine과 연결
import OptimizationEngine from './engines/OptimizationEngine.js';

const optimizer = new OptimizationEngine(result.graph);
const alternatives = optimizer.optimize();

console.log('Top 3 alternatives:');
alternatives.slice(0, 3).forEach((alt, idx) => {
  console.log(`${idx + 1}. ${alt.name}`);
  console.log(`   절세액: ${alt.totalSavings.toLocaleString()}원`);
  console.log(`   복잡도: ${alt.complexityScore.toFixed(1)}`);
  console.log(`   리스크: ${alt.riskScore.toFixed(1)}`);
  console.log(`   점수: ${alt.optimizationScore.toFixed(1)}`);
});
```

---

## 다음 단계

Phase 5 완료 후:

- **Phase 6**: NodeGraph 시각화 컴포넌트 (React) 구현
- **Phase 7**: 전체 워크플로우 통합 및 테스트

이 문서는 AI 노드 추출 시스템의 완전한 사용 가이드입니다.
