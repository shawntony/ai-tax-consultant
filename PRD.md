# Product Requirements Document (PRD)
## 세무 컨설팅 자동화 워크플로우

---

## 📋 Document Information

| 항목 | 내용 |
|------|------|
| **프로젝트명** | AI Tax Consulting Automation Workflow with Knowledge Graph |
| **버전** | 2.0.0 |
| **작성일** | 2024-10-17 |
| **문서 상태** | In Development |
| **담당자** | Product Team |
| **최종 수정일** | 2025-10-20 |
| **주요 변경** | 지식 그래프 기반 노드 시스템 추가 |

---

## 1. Executive Summary

### 1.1 프로젝트 개요
**지식 그래프 기반 AI 세무 컨설팅 시스템**은 AI 전문가가 고객의 상황을 분석하여 세무상의 이슈를 노드로 추출하고, 각 이슈에 대한 해결 방안을 연결된 노드로 생성합니다. 이러한 노드들의 실행 순서를 변경함으로써 세금이 어떻게 달라지는지 시뮬레이션하고, 여러 솔루션 대안을 비교하여 최적의 절세 전략을 제시하는 혁신적인 시스템입니다.

**핵심 차별점:**
- **노드 기반 의사결정**: 이슈와 해결방안을 그래프 구조로 시각화
- **순서 최적화**: 실행 순서 변경을 통한 절세 효과 자동 계산
- **지능형 추론**: AI가 복잡한 세무 관계를 자동으로 파악하고 최적 전략 제시

### 1.2 비즈니스 목표
- **효율성 향상**: 세무 분석 시간 90% 단축 (2분 → 10초)
- **품질 개선**: AI 기반 정확한 세무 분석 제공
- **고객 만족**: 다양한 시나리오 비교를 통한 최적 절세 방안 제시
- **비용 절감**: 반복 작업 자동화를 통한 운영 비용 절감

### 1.3 핵심 가치 제안
- **지식 그래프 기반 분석**: 세무 이슈와 해결방안을 노드로 시각화하여 직관적 이해
- **순서 최적화 엔진**: 실행 순서를 자동으로 최적화하여 최대 절세 효과 도출
- **AI 전문가 시스템**: Claude/ChatGPT가 국내 최고 세무 전문가처럼 분석
- **솔루션 비교**: 여러 대안을 자동 생성하고 세금 영향을 한눈에 비교
- **실행 가능한 보고서**: 단계별 실행 계획과 예상 세금을 포함한 컨설팅 보고서 자동 생성
- **데이터 관리**: 노드 그래프와 솔루션을 JSON/PDF로 저장 및 재사용

---

## 1.4 혁신적 노드 시스템 아키텍처

### 1.4.1 지식 그래프 개념

본 시스템은 세무 컨설팅을 **이슈 노드(Issue Nodes)**와 **해결 노드(Solution Nodes)**로 구조화하여, 복잡한 세무 상황을 직관적으로 시각화하고 최적화합니다.

```
고객 상황 입력
    ↓
AI 전문가 분석
    ↓
┌─────────────────────────────────┐
│  이슈 노드 추출 (Issue Nodes)   │
│  • 상속세 과세 대상             │
│  • 배우자 공제 적용 여부         │
│  • 일괄공제 vs 개별공제 선택    │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  해결 노드 생성 (Solution Nodes)│
│  • 배우자 선상속 (1.5억 절세)   │
│  • 일괄공제 선택 (8천만 절세)   │
│  • 사전증여 활용 (1억 절세)     │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  노드 연결 + 실행 순서 정의     │
│  이슈 A → 해결 A1, A2           │
│  이슈 B → 해결 B1, B2           │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  순서 조합 생성 (Solutions)     │
│  대안 1: A1→B1→A2 (총 3억 절세)│
│  대안 2: B1→A1→A2 (총 3.5억)   │
│  대안 3: A2→A1→B1 (총 2.8억)   │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  최적 솔루션 추천 + 비교 보고서 │
└─────────────────────────────────┘
```

### 1.4.2 노드 데이터 구조

**이슈 노드 (Issue Node)**
```javascript
{
  id: "issue-001",
  type: "ISSUE",
  title: "상속세 과세 대상 판정",
  description: "10억원 상속재산의 과세 여부 및 공제 적용 검토 필요",
  category: "상속세", // 상속세, 증여세, 양도소득세
  relatedLaw: ["상속세법 제1조", "제13조", "제18조"],
  priority: "HIGH", // HIGH, MEDIUM, LOW
  taxImpact: null, // 이슈 자체는 세금 영향 없음
  connectedSolutions: ["solution-001", "solution-002"],
  createdBy: "AI",
  createdAt: "2025-10-20T10:00:00Z"
}
```

**해결 노드 (Solution Node)**
```javascript
{
  id: "solution-001",
  type: "SOLUTION",
  title: "배우자 공제 적용",
  description: "최대 30억원 한도 내 배우자 공제를 활용하여 상속세 절감",
  category: "공제 활용",
  taxImpact: -150000000, // 음수는 절세, 양수는 과세
  taxImpactPercentage: 35, // 전체 세금 대비 비율
  requirements: [
    "배우자가 생존해 있어야 함",
    "법정상속분 이내에서 적용",
    "실제 상속받는 재산이 있어야 함"
  ],
  risks: [
    "배우자 사망 시 2차 상속세 발생 가능",
    "상속재산분할협의서 작성 필요"
  ],
  dependencies: [], // 선행 조건 (다른 Solution ID)
  executionOrder: 1, // 실행 순서 (동적으로 변경 가능)
  estimatedTime: "7일", // 실행 소요 시간
  complexity: "MEDIUM", // LOW, MEDIUM, HIGH
  legalBasis: ["상속세법 제19조", "제19조의2"],
  relatedIssues: ["issue-001"],
  createdBy: "AI",
  createdAt: "2025-10-20T10:01:00Z"
}
```

**노드 간 연결 (Edge)**
```javascript
{
  id: "edge-001",
  type: "ISSUE_TO_SOLUTION", // ISSUE_TO_SOLUTION, SOLUTION_DEPENDENCY
  from: "issue-001",
  to: "solution-001",
  strength: 0.9, // 관련성 강도 (0~1)
  reasoning: "상속세 과세 대상에 대한 직접적인 해결 방안"
}
```

### 1.4.3 솔루션 대안 (Solution Alternative)

```javascript
{
  id: "alternative-A",
  name: "배우자 우선 전략",
  description: "배우자 공제를 최대한 활용한 후 나머지 공제 적용",
  executionPlan: [
    {
      step: 1,
      solutionId: "solution-001",
      solutionTitle: "배우자 공제 적용",
      taxImpact: -150000000,
      cumulativeTax: 200000000
    },
    {
      step: 2,
      solutionId: "solution-002",
      solutionTitle: "일괄공제 적용",
      taxImpact: -80000000,
      cumulativeTax: 120000000
    },
    {
      step: 3,
      solutionId: "solution-003",
      solutionTitle: "자녀 공제 적용",
      taxImpact: -50000000,
      cumulativeTax: 70000000
    }
  ],
  totalTaxBefore: 350000000,
  totalTaxAfter: 70000000,
  totalSavings: 280000000,
  savingsPercentage: 80,
  pros: [
    "최대 절세 효과",
    "법적 안정성 높음",
    "실행 난이도 낮음"
  ],
  cons: [
    "2차 상속세 고려 필요",
    "배우자 의사 확인 필수"
  ],
  recommendationScore: 95, // AI 추천 점수 (0~100)
  estimatedDuration: "2주",
  complexity: "MEDIUM"
}
```

### 1.4.4 실행 순서 최적화 알고리즘

시스템은 다음 알고리즘을 사용하여 최적 실행 순서를 자동으로 도출합니다:

1. **순열 생성**: 모든 가능한 해결 노드 순서 조합 생성
2. **종속성 검증**: 선행 조건(dependencies)이 있는 노드는 순서 제약 적용
3. **세금 계산**: 각 순서 조합마다 누적 세금 계산
4. **최적화 평가**:
   - 총 절세 금액
   - 실행 난이도
   - 법적 리스크
   - 소요 시간
5. **상위 N개 추천**: 종합 점수 기준 상위 3~5개 대안 제시

**최적화 수식**:
```
점수 = (절세금액 × 0.5) + (100 - 난이도 × 0.2) + (100 - 리스크 × 0.2) + (100 - 시간/일 × 0.1)
```

---

## 2. Problem Statement

### 2.1 현재 문제점

#### 2.1.1 비효율적인 반복 작업
- **문제**: 세무사들이 매번 동일한 계산을 수동으로 반복
- **영향**: 하루 2시간 이상 단순 계산에 소요
- **비용**: 시간당 ₩100,000 × 2시간 = ₩200,000/일 손실

#### 2.1.2 AI 활용의 어려움
- **문제**: AI를 활용하려 해도 매번 프롬프트를 수동으로 복사/붙여넣기
- **영향**: AI 활용의 번거로움으로 인한 낮은 채택률
- **비용**: 프롬프트 작성 및 복사 작업에 건당 2분 소요

#### 2.1.3 시나리오 비교의 어려움
- **문제**: Excel로 여러 시나리오를 수동으로 관리
- **영향**: 실수 발생 가능성, 비교 분석의 어려움
- **비용**: 시나리오당 10분 추가 작업 시간

#### 2.1.4 문서화의 어려움
- **문제**: 계산 결과를 체계적으로 저장하고 공유하기 어려움
- **영향**: 후속 상담 시 이전 데이터 재활용 불가
- **비용**: 동일 고객 재상담 시 처음부터 다시 시작

#### 2.1.5 **NEW** 순서 최적화의 부재
- **문제**: 여러 세무 전략을 어떤 순서로 실행해야 최적인지 알 수 없음
- **영향**: 순서만 바꿔도 수천만원~수억원 절세 가능하지만 수동으로 모든 경우의 수 계산 불가능
- **비용**: 최적화 분석에 전문가 시간 3~5시간 소요, 복잡한 경우 정확한 최적화 자체가 불가능
- **예시**: 배우자 공제 → 일괄공제 → 사전증여 (5천만원 세금) vs 사전증여 → 배우자 공제 → 일괄공제 (3천만원 세금)

#### 2.1.6 **NEW** 시각화 및 의사결정 지원 부족
- **문제**: 복잡한 세무 이슈와 해결방안의 관계를 한눈에 파악하기 어려움
- **영향**: 고객에게 설명하기 어렵고, 전문가도 전체 구조를 놓치기 쉬움
- **비용**: 고객 설명 시간 30분~1시간, 오해로 인한 재상담 발생

### 2.2 타겟 사용자

#### 2.2.1 Primary Users
**세무사 / 세무법인**
- 규모: 개인 세무사부터 중대형 세무법인
- 상담 건수: 월 20~100건
- 기술 수준: 중급 (기본적인 웹 애플리케이션 사용 가능)
- Pain Point: 반복 작업의 비효율성, AI 활용 어려움

#### 2.2.2 Secondary Users
**기업 경리/재무팀**
- 규모: 중소기업 ~ 대기업
- 사용 빈도: 분기별 ~ 연간
- 기술 수준: 중급
- Pain Point: 세무 시뮬레이션의 복잡성

#### 2.2.3 Tertiary Users
**일반 개인 (고객)**
- 상황: 상속, 증여 예정자
- 사용 빈도: 일회성 ~ 연간 1-2회
- 기술 수준: 초급 ~ 중급
- Pain Point: 세무 계산의 어려움, 전문가 상담 비용

---

## 3. Goals and Success Metrics

### 3.1 Business Goals

#### 3.1.1 Short-term Goals (3개월)
1. **사용자 확보**: 100명 이상의 활성 사용자
2. **처리 건수**: 월 500건 이상의 세무 상담 처리
3. **시간 절감**: 사용자당 주 10시간 이상 시간 절감
4. **만족도**: NPS 50 이상 달성

#### 3.1.2 Long-term Goals (1년)
1. **시장 점유율**: 국내 세무사 시장 5% 점유
2. **수익화**: 월 구독 모델로 ₩50M ARR 달성
3. **기능 확장**: 양도소득세, 법인세, 소득세 계산 추가
4. **생태계 구축**: 파트너 세무 프로그램 5개 이상 연동

### 3.2 Key Performance Indicators (KPIs)

#### 3.2.1 Usage Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Users (DAU)** | 50+ | Google Analytics |
| **Monthly Active Users (MAU)** | 200+ | Google Analytics |
| **Cases Processed/Month** | 500+ | Backend Analytics |
| **API Calls/Day** | 100+ | API Monitoring |

#### 3.2.2 Performance Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Analysis Time** | <15초 | Performance Monitoring |
| **Calculation Time** | <1초 | Performance Monitoring |
| **Page Load Time** | <2초 | Lighthouse |
| **API Success Rate** | >95% | Error Tracking |

#### 3.2.3 Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time Saved/User** | >10시간/주 | User Survey |
| **Cost Savings** | ₩200K/일/사용자 | ROI Calculator |
| **Customer Satisfaction** | NPS >50 | User Survey |
| **Retention Rate** | >80% (월간) | User Analytics |

#### 3.2.4 Quality Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Calculation Accuracy** | >99% | Validation Tests |
| **AI Response Accuracy** | >90% | Manual Review |
| **Bug Rate** | <1% | Issue Tracking |
| **Uptime** | >99.5% | Server Monitoring |

### 3.3 Success Criteria

#### Phase 1: MVP Launch (완료)
- ✅ 기본 4단계 워크플로우 구현
- ✅ AI API 자동 연동 (Claude, ChatGPT, Perplexity)
- ✅ 상속세, 증여세 계산 엔진
- ✅ 시나리오 비교 기능
- ✅ JSON 다운로드 기능

#### Phase 2: Early Adoption (3개월)
- 100명 이상의 베타 사용자 확보
- 월 500건 이상 처리
- 사용자 피드백 수집 및 개선
- 세법 DB 구축 완료

#### Phase 3: Growth (6개월)
- 500명 이상의 유료 사용자
- 추가 세목 계산 기능 (양도소득세, 법인세)
- PDF 보고서 자동 생성
- 모바일 앱 베타 출시

#### Phase 4: Scale (1년)
- 2,000명 이상의 사용자
- 고객 DB 시스템 구축
- 전자신고 연동
- 파트너십 5개 이상

---

## 4. User Stories and Use Cases

### 4.1 Primary User Stories

#### 4.1.1 세무사 A씨
**As a** 개인 세무사
**I want to** AI를 활용하여 빠르게 세무 분석을 수행하고
**So that** 고객 상담에 더 많은 시간을 할애할 수 있다

**Acceptance Criteria:**
- 사례 입력부터 AI 분석까지 30초 이내 완료
- AI 분석 결과가 구조화된 형태로 제공
- 수동 프롬프트 복사 없이 원클릭 분석

#### 4.1.2 세무법인 B
**As a** 중형 세무법인의 팀장
**I want to** 여러 시나리오를 동시에 비교 분석하고
**So that** 고객에게 최적의 절세 방안을 제시할 수 있다

**Acceptance Criteria:**
- 무제한 시나리오 생성 가능
- 실시간 계산 및 비교
- 시각적으로 명확한 비교표 제공
- JSON/PDF로 결과 저장

#### 4.1.3 기업 경리팀
**As a** 중소기업 경리팀장
**I want to** 상속/증여 시뮬레이션을 직접 수행하고
**So that** 세무사 상담 전에 대략적인 세금을 파악할 수 있다

**Acceptance Criteria:**
- 전문 지식 없이도 사용 가능한 UI
- 단계별 가이드 제공
- 참고사항 및 주의사항 표시
- 계산 결과 자동 저장

### 4.2 Use Cases

#### Use Case 1: 부동산 상속 상담 (노드 기반 워크플로우)
**Actor:** 세무사
**Goal:** 10억원 부동산 상속 시 최적 실행 순서를 통한 최대 절세 방안 제시

**Preconditions:**
- 사용자가 로그인되어 있음
- API 키가 설정되어 있음

**Main Flow:**

**Phase 1: 사례 입력 및 AI 분석**
1. 세무사가 자유 텍스트로 상황 입력:
   ```
   "부친께서 보유하신 서울 강남구 아파트(시가 10억원)와
   현금 2억원을 상속받을 예정입니다. 상속인은 배우자(모친)와
   자녀 2명(본인 포함)이며, 부채는 1억원 있습니다."
   ```
2. Claude AI 선택
3. 시스템이 AI 초기 분석 수행 (10초)

**Phase 2a: 정보 충분성 분석 및 추가 질의** 🆕
4. AI가 초기 입력의 정보 충분성 평가:
   ```json
   {
     "completenessScore": 60,
     "missingCritical": [
       "배우자 생존 여부 불명확",
       "동거주택 여부 및 기간 미제시",
       "정확한 부동산 시가 (10억 상당이 모호함)"
     ]
   }
   ```

5. 시스템이 추가 질의 UI 표시 (충분도 < 80%):
   ```
   💡 추가 정보가 필요합니다 (현재 충분도: 60%)

   Q1. [재산 정보] 부동산의 정확한 시가는 얼마입니까? (필수)
       입력: __________ 원
       💡 '10억 상당'을 구체적 금액으로 확인합니다

   Q2. [관계 정보] 상속인 중 배우자가 계십니까? (필수)
       [○ 예, 생존]  [○ 아니오]
       💡 배우자 공제(최대 30억) 적용 판단에 필요

   Q3. [법적 상황] 동거한 주택입니까? (필수)
       [○ 예]  [○ 아니오]
       💡 동거주택 상속공제 6억 적용 가능성 검토

   Q4. [타이밍] 동거 기간은 얼마나 됩니까?
       [○ 10년 이상]  [○ 5~10년]  [○ 5년 미만]
   ```

6. 세무사가 추가 정보 응답:
   - 부동산 시가: 10억원 (정확한 금액)
   - 배우자: 예, 생존
   - 동거주택: 예
   - 동거 기간: 15년 (10년 이상)

**Phase 2b: 노드 그래프 자동 생성 (보강된 정보 기반)**
7. AI가 보강된 정보로 세무 이슈 노드 자동 추출:
   - Issue-001: 상속세 과세 대상 판정 (12억 - 1억 = 11억)
   - Issue-002: 배우자 공제 적용 가능 여부 ✅ 확정 (배우자 생존)
   - Issue-003: 일괄공제 vs 법정공제 선택
   - Issue-004: 동거주택 상속공제 적용 가능성 ✅ 확정 (15년 동거)

8. AI가 해결 노드 자동 생성:
   - Solution-001: 배우자 공제 적용 (최대 5억, 절세 1.5억)
   - Solution-002: 일괄공제 5억 적용 (절세 1억)
   - Solution-003: 동거주택 공제 6억 적용 (절세 1.8억) ✅ 적용 가능 확정
   - Solution-004: 금융재산 공제 2천만원 (절세 400만원)

9. 시스템이 노드 간 연결 관계 시각화 (React Flow)
   ```
   Issue-001 ⟶ Solution-001 (배우자 공제)
            ⟶ Solution-002 (일괄공제)
   Issue-002 ⟶ Solution-003 (동거주택 공제) ✅
   Issue-003 ⟶ Solution-004 (금융재산 공제)
   ```

**Phase 3: 실행 순서 최적화**
10. 시스템이 모든 가능한 실행 순서 조합 생성 (4! = 24가지)
   - 배우자 생존 여부: 예
   - 동거 여부: 예 (10년)
   - 1세대 1주택 해당: 예

8. 시스템이 모든 가능한 실행 순서 조합 생성 (4! = 24가지)

9. 시스템이 각 조합에 대해 세금 자동 계산:
   - Alternative 1: Sol-003 → Sol-001 → Sol-002 → Sol-004 = **총 세금 0.8억**
   - Alternative 2: Sol-001 → Sol-003 → Sol-002 → Sol-004 = **총 세금 1.2억**
   - Alternative 3: Sol-002 → Sol-001 → Sol-003 → Sol-004 = **총 세금 1.5억**
   - ... (24가지 조합)

10. 시스템이 최적화 알고리즘으로 상위 3개 대안 추천:
    ```
    🥇 추천 1위: 동거주택 공제 → 배우자 공제 → 금융재산 공제 → 일괄공제
       - 절세액: 3.2억 (73% 절감)
       - 난이도: 중 (5/10)
       - 리스크: 낮음 (2/10)
       - 소요기간: 30일
       - 종합점수: 92/100

    🥈 추천 2위: 배우자 공제 → 동거주택 공제 → 금융재산 공제 → 일괄공제
       - 절세액: 2.8억 (64% 절감)
       - 난이도: 낮음 (3/10)
       - 리스크: 낮음 (1/10)
       - 소요기간: 20일
       - 종합점수: 88/100
    ```

**Phase 4: 비교 분석 및 보고서**
11. 세무사가 비교 분석 리포트 확인:
    - 노드 그래프 시각화 (Interactive)
    - 실행 순서별 세금 변화 차트
    - 각 대안별 장단점 분석
    - 법적 근거 및 주의사항

12. 세무사가 "추천 1위" 선택 및 JSON/PDF 다운로드

**Postconditions:**
- 노드 그래프와 최적 실행 순서가 JSON으로 저장
- 고객 상담용 PDF 보고서 생성 (그래프 포함)
- 실행 체크리스트 자동 생성

**Alternative Flows:**
- 4a. AI가 추가 정보 필요 판단 → 동적 입력 폼 생성 → 사용자 입력 후 재분석
- 9a. 법적 종속성 위반 감지 → 해당 조합 자동 제외 → 유효한 조합만 계산
- 10a. 모든 대안이 비슷한 점수 → 리스크가 가장 낮은 대안 1순위 추천

**Key Differentiator:**
- 기존: 수동으로 시나리오 하나씩 계산 → 3-4개만 비교 → 최적 순서 발견 어려움
- 신규: 자동으로 24가지 조합 계산 → 최적화 알고리즘으로 최상위 대안 발견 → 수억원 추가 절세

#### Use Case 2: 주식 증여 시뮬레이션 (복잡한 순서 최적화)
**Actor:** 기업 경리팀
**Goal:** 법인 주식 10억 증여 시 다단계 증여 순서 최적화로 세금 최소화

**Preconditions:**
- API 키 설정됨
- 주식 평가 데이터 보유

**Main Flow:**

**Phase 1: 복잡한 상황 입력**
1. 경리팀장이 상세 상황 입력:
   ```
   "대표이사(60세)가 보유한 비상장 법인 주식(평가액 10억원)을
   자녀 3명에게 나눠서 증여하려 합니다. 자녀들은 각각 30세, 28세, 25세이며,
   향후 5년간 단계적으로 증여할 계획입니다. 증여재산공제를 최대한 활용하고,
   세대생략 증여 시 할증도 고려해야 합니다."
   ```
2. Perplexity AI 선택 (최신 주식 평가 및 증여세법 확인)

**Phase 2: AI의 복잡한 노드 그래프 생성**
3. AI가 9개 이슈 노드 추출:
   - Issue-001: 증여재산공제 활용 (자녀당 5천만원)
   - Issue-002: 세대생략 증여 할증 여부
   - Issue-003: 최대주주 할증 적용 여부
   - Issue-004: 단계적 증여 시기 최적화
   - Issue-005: 자녀 간 지분 배분 비율
   - Issue-006: 경영권 프리미엄 평가
   - Issue-007: 향후 주가 상승 리스크
   - Issue-008: 증여 후 양도세 고려
   - Issue-009: 상속세와의 비교 필요

4. AI가 12개 해결 노드 생성:
   - Sol-001: 1차 증여 - 자녀1에게 3억 (2025년)
   - Sol-002: 1차 증여 - 자녀2에게 2억 (2025년)
   - Sol-003: 1차 증여 - 자녀3에게 2억 (2025년)
   - Sol-004: 2차 증여 - 자녀1에게 1억 (2028년)
   - Sol-005: 2차 증여 - 자녀2에게 1억 (2028년)
   - Sol-006: 2차 증여 - 자녀3에게 1억 (2028년)
   - Sol-007: 증여재산공제 5천만원 × 3명 적용
   - Sol-008: 최대주주 할증 20% 적용 조정
   - Sol-009: 경영권 프리미엄 10% 할인
   - Sol-010: 단계적 증여로 누진세 회피
   - Sol-011: 합병 전 증여 타이밍 활용
   - Sol-012: 사전 배당으로 주가 조정

5. 시스템이 복잡한 의존 관계 시각화:
   ```
   Issue-001 ⟶ Sol-007 (증여재산공제)
            ⟶ Sol-010 (단계적 증여)

   Issue-003 ⟶ Sol-008 (최대주주 할증)
            ⟶ Sol-009 (경영권 할인)

   Sol-001, Sol-002, Sol-003 → [3년 후] → Sol-004, Sol-005, Sol-006
   (종속성: 1차 증여 완료 후에만 2차 증여 가능)
   ```

**Phase 3: 순서 조합 폭발 및 최적화**
6. 경리팀장이 추가 데이터 입력:
   - 현재 지분율: 80%
   - 예상 주가 상승률: 연 10%
   - 합병 계획: 2027년 예정

7. 시스템이 유효한 실행 순서 조합 생성:
   - 단순 계산: 12! = 479,001,600가지
   - 종속성 필터링: 248가지 유효 조합으로 축소
   - 타이밍 제약: 72가지 실현 가능 조합

8. 시스템이 72가지 조합 자동 계산 (30초 소요):
   ```
   대안 A: Sol-012 → Sol-007 → Sol-001~003 → [3년] → Sol-004~006 → Sol-008
          총 증여세: 1.8억 (18%)

   대안 B: Sol-007 → Sol-001~003 → Sol-010 → [3년] → Sol-011 → Sol-004~006
          총 증여세: 2.3억 (23%)

   대안 C: Sol-009 → Sol-001~003 → Sol-007 → [3년] → Sol-008 → Sol-004~006
          총 증여세: 2.1억 (21%)

   ... (72가지)
   ```

9. 최적화 알고리즘이 상위 5개 추천:
   ```
   🥇 최적 순서 (절세 2.7억):
      2024년: 사전 배당 → 경영권 할인 평가
      2025년: 증여재산공제 → 1차 증여 (자녀당 2.3억)
      2027년: 합병 직전 타이밍 활용
      2028년: 2차 증여 (자녀당 1.1억) → 최대주주 할증 회피

      세금: 1.8억 (기본 대비 60% 절감)
      리스크: 중 (합병 일정 변동 가능)
      복잡도: 높음 (8/10)

   🥈 안정적 대안 (절세 2.2억):
      2025년: 증여재산공제 → 1차 증여
      2028년: 2차 증여 → 단계적 공제 활용

      세금: 2.3억 (기본 대비 48% 절감)
      리스크: 낮음
      복잡도: 중간 (5/10)
   ```

**Phase 4: 실행 계획 및 시뮬레이션**
10. 경리팀장이 "최적 순서" 시뮬레이션 실행:
    - 타임라인 차트: 2024~2028년 단계별 액션 시각화
    - 누적 세금 그래프: 각 단계에서 발생하는 세금 누적
    - 대안 간 비교표: 5가지 대안 병렬 비교
    - 리스크 분석: "합병 일정 1년 지연 시" 시뮬레이션

11. 민감도 분석:
    - 주가 상승률 15% 가정 시: 절세액 3.2억으로 증가
    - 합병 취소 시: 대안 B로 자동 전환 추천

12. 결과를 세무사와 공유 (JSON + PDF):
    - 인터랙티브 노드 그래프
    - 5년 실행 타임라인
    - 단계별 체크리스트
    - 법적 근거 및 판례

**Postconditions:**
- 5년간의 최적 증여 실행 계획 확보
- 72가지 대안 중 최적안 식별
- 세무사 상담 시 구체적 질문 리스트 준비

**Alternative Flows:**
- 7a. 조합 수가 너무 많음 (>500) → 사용자에게 제약 조건 추가 입력 요청
- 10a. "합병 일정 변동" 시나리오 → 시스템이 자동으로 대안 재계산 및 추천
- 11a. 민감도 분석에서 리스크 높음 감지 → 보수적 대안 우선 추천

**Key Differentiator:**
- 기존: 단순 지분 배분만 고려 → 3-4가지 시나리오 비교 → 순서/타이밍 최적화 불가
- 신규: 72가지 복잡한 조합 자동 계산 → 시간축 고려한 최적 순서 발견 → 수억원 추가 절세

#### Use Case 3: 배치 처리 (고급 사용자)
**Actor:** 대형 세무법인 시스템 관리자
**Goal:** 월말 정산 시 50건의 사례를 일괄 처리

**Main Flow:**
1. 관리자가 고객 데이터를 CSV로 준비
2. 배치 처리 스크립트 실행
3. 각 고객별로 자동 분석 수행
4. 시나리오 자동 생성 (기본 3가지)
5. 모든 결과를 JSON 배열로 저장
6. 세무사들에게 결과 배포

**Postconditions:**
- 50건 모두 처리 완료 (약 30분)
- 개별 JSON 파일 생성
- 요약 리포트 생성

---

## 5. Functional Requirements

### 5.1 Core Features

#### 5.1.1 사례 입력 및 AI 선택 (Step 1)

**FR-1.1: 사례 입력 인터페이스**
- **Priority:** P0 (Critical)
- **Description:** 사용자가 세무 상담 사례를 자유 텍스트로 입력
- **Requirements:**
  - 최소 100자 이상 입력 가능한 텍스트 영역
  - 실시간 글자 수 표시
  - 입력 가이드 제공 (필수 정보 체크리스트)
  - 입력 예시 제공 (샘플 케이스)
- **Validation:**
  - 최소 50자 이상 입력 필수
  - 특수문자 제한 없음
  - 최대 10,000자 제한

**FR-1.2: AI 도구 선택**
- **Priority:** P0 (Critical)
- **Description:** Claude, ChatGPT, Perplexity 중 AI 선택
- **Requirements:**
  - 라디오 버튼 또는 카드 선택 UI
  - 각 AI의 특징 및 추천 상황 표시
  - 기본 AI 자동 선택 (환경 변수 기반)
  - AI별 예상 비용 표시
- **Business Rules:**
  - API 키가 없는 AI는 비활성화
  - 선택한 AI가 실패 시 다른 AI 제안

**FR-1.3: 입력 데이터 저장**
- **Priority:** P1 (High)
- **Description:** 입력한 사례를 세션에 저장
- **Requirements:**
  - 브라우저 새로고침 시 데이터 유지 (localStorage)
  - 뒤로가기 시 데이터 보존
  - 자동 임시 저장 (30초마다)

#### 5.1.2 🆕 AI 초기 분석 및 추가 질의 (Step 2)

**FR-2.0: 정보 충분성 판단 및 추가 질의 생성** 🔥
- **Priority:** P0 (Critical)
- **Description:** 초기 입력 분석 후 불충분한 정보 식별 및 추가 질문 자동 생성
- **Requirements:**
  - AI가 초기 입력 분석 (Information Completeness Check)
  - 필수 정보 누락 항목 식별
  - 모호한 표현 식별
  - 타겟팅된 추가 질문 자동 생성 (2~7개)
  - 사용자 친화적 인터페이스로 응답 수집
  - 응답 기반 컨텍스트 보강

**Information Completeness Analysis:**
```javascript
// AI 프롬프트: 정보 충분성 분석
const analysisPrompt = `
다음 세무 상담 사례를 분석하여 정보 충분성을 평가하세요:

사례: ${userInput}

다음 관점에서 분석하세요:
1. **필수 정보 누락**: 세금 계산에 반드시 필요한 정보가 빠졌는가?
2. **모호한 표현**: 해석이 여러 가지로 가능한 애매한 표현이 있는가?
3. **숨겨진 이슈**: 언급되지 않았지만 중요할 수 있는 사항은?
4. **타이밍 정보**: 거래 시점, 보유 기간 등 시간 관련 정보 부족?
5. **관계 정보**: 상속인/증여자 관계가 명확한가?

응답 형식:
{
  "completenessScore": 0-100,  // 100 = 완전, 0 = 매우 불충분
  "missingCritical": ["필수 누락 항목들"],
  "ambiguities": ["모호한 표현들"],
  "followUpQuestions": [
    {
      "id": "q1",
      "category": "재산 정보|관계 정보|타이밍|법적 상황",
      "question": "구체적 질문",
      "type": "text|number|date|select|multiselect",
      "options": ["옵션1", "옵션2"],  // type이 select일 때만
      "required": true|false,
      "placeholder": "입력 예시",
      "helpText": "이 정보가 필요한 이유"
    }
  ],
  "reasoning": "왜 이 질문들이 필요한지 설명"
}
`;
```

**Follow-up Question UI:**
```javascript
// FollowUpQuestions.jsx
const FollowUpQuestionsComponent = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});

  return (
    <div className="followup-container">
      <div className="followup-header">
        <h2>💡 추가 정보가 필요합니다</h2>
        <p className="followup-description">
          보다 정확한 분석을 위해 몇 가지 추가 정보를 알려주세요.
        </p>
        <div className="completeness-indicator">
          <span>현재 정보 충분도: {completenessScore}%</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completenessScore}%` }} />
          </div>
        </div>
      </div>

      <div className="followup-questions">
        {questions.map((q, index) => (
          <div key={q.id} className={`question-card ${q.required ? 'required' : ''}`}>
            <div className="question-header">
              <span className="question-number">Q{index + 1}</span>
              <span className="question-category">{q.category}</span>
              {q.required && <span className="required-badge">필수</span>}
            </div>

            <label className="question-text">
              {q.question}
            </label>

            {q.type === 'text' && (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={q.placeholder}
                required={q.required}
              />
            )}

            {q.type === 'number' && (
              <input
                type="number"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={q.placeholder}
                required={q.required}
              />
            )}

            {q.type === 'select' && (
              <select
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                required={q.required}
              >
                <option value="">선택하세요</option>
                {q.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.helpText && (
              <div className="help-text">
                <span className="help-icon">💡</span>
                {q.helpText}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="followup-actions">
        <button
          onClick={() => onSubmit(answers)}
          className="btn-submit"
          disabled={!areRequiredAnswered(questions, answers)}
        >
          추가 정보 제출하고 분석 진행
        </button>
        <button
          onClick={() => onSubmit(null)}
          className="btn-skip"
        >
          건너뛰고 분석 진행 (정확도 낮을 수 있음)
        </button>
      </div>
    </div>
  );
};
```

**Workflow Integration:**
```
Step 1: 사례 입력
    ↓
Step 2a: AI 초기 분석 (정보 충분성 판단)
    ↓
    ├─ 충분도 ≥ 80% → 즉시 Step 2b (노드 추출)
    └─ 충분도 < 80% → 추가 질의 UI 표시
         ↓
         사용자 응답 수집
         ↓
         컨텍스트 보강 (원본 + 추가 정보)
         ↓
Step 2b: 노드 자동 추출 (Issue & Solution Nodes)
    ↓
Step 3: 노드 그래프 최적화
    ↓
Step 4: 결과 비교
```

**Example Follow-up Questions:**
```json
{
  "completenessScore": 65,
  "followUpQuestions": [
    {
      "id": "q1",
      "category": "재산 정보",
      "question": "상속재산 중 부동산의 정확한 시가는 얼마입니까?",
      "type": "number",
      "placeholder": "예: 1000000000",
      "required": true,
      "helpText": "공시지가가 아닌 실제 거래가 기준 시가를 입력해주세요"
    },
    {
      "id": "q2",
      "category": "관계 정보",
      "question": "상속인 중 배우자가 계십니까?",
      "type": "select",
      "options": ["예, 있습니다", "아니오, 없습니다"],
      "required": true,
      "helpText": "배우자 공제(최대 30억) 적용 여부 판단에 필요합니다"
    },
    {
      "id": "q3",
      "category": "타이밍",
      "question": "상속 개시일은 언제입니까?",
      "type": "date",
      "placeholder": "2024-01-01",
      "required": true,
      "helpText": "공제 한도 및 세율 결정에 필요합니다"
    },
    {
      "id": "q4",
      "category": "법적 상황",
      "question": "피상속인이 5년 이내 증여한 재산이 있습니까?",
      "type": "select",
      "options": ["예, 있습니다", "아니오, 없습니다", "잘 모르겠습니다"],
      "required": false,
      "helpText": "사전증여재산 합산 검토가 필요할 수 있습니다"
    }
  ],
  "reasoning": "상속세 계산에는 정확한 재산가액, 상속인 구성, 시점 정보가 필수입니다. 현재 입력에서는 '10억 상당'이라는 모호한 표현과 배우자 존재 여부가 명확하지 않아 추가 정보가 필요합니다."
}
```

**Benefits:**
- ✅ **정확도 향상**: 불충분한 정보로 인한 오류 방지
- ✅ **사용자 교육**: 왜 이 정보가 필요한지 설명 → 세무 이해도 증가
- ✅ **프로 느낌**: 전문가가 꼼꼼하게 질문하는 것처럼 느껴짐
- ✅ **유연성**: 필수 질문만 강제, 나머지는 선택 가능
- ✅ **스킵 가능**: 사용자가 원하면 바로 진행 (정확도 낮을 수 있다는 경고)

---

**FR-2.1: 프롬프트 자동 생성 (보강된 컨텍스트 기반)**
- **Priority:** P0 (Critical)
- **Description:** 초기 입력 + 추가 질의 응답을 결합하여 AI별 최적 프롬프트 생성
- **Requirements:**
  - AI별 맞춤형 프롬프트 템플릿
  - JSON 응답 형식 가이드 포함
  - 세목별 필수 분석 항목 자동 요청
  - 프롬프트 미리보기 기능
- **Output Format:**
```json
{
  "prompt": "생성된 프롬프트 전문",
  "expectedFields": ["taxCategories", "requiredData", "recommendations"],
  "estimatedTokens": 3500
}
```

**FR-2.2: AI API 자동 호출**
- **Priority:** P0 (Critical)
- **Description:** 선택한 AI의 API를 자동으로 호출
- **Requirements:**
  - 환경 변수에서 API 키 자동 로드
  - HTTP 요청 헤더 자동 설정 (AI별 차이 처리)
  - 타임아웃 30초 설정
  - 실시간 진행 상태 표시
- **API Endpoints:**
  - Claude: `https://api.anthropic.com/v1/messages`
  - ChatGPT: `https://api.openai.com/v1/chat/completions`
  - Perplexity: `https://api.perplexity.ai/chat/completions`
- **Error Handling:**
  - 401: API 키 오류 → 사용자에게 안내
  - 429: Rate Limit → 자동 재시도 (exponential backoff)
  - 500: Server Error → 다른 AI 제안
  - Timeout: 자동 재시도 (최대 3회)

**FR-2.3: 응답 파싱 및 검증**
- **Priority:** P0 (Critical)
- **Description:** AI 응답을 파싱하고 필수 필드 검증
- **Requirements:**
  - Markdown 코드 블록 자동 제거
  - JSON 파싱 및 유효성 검사
  - 필수 필드 존재 여부 확인
  - 데이터 타입 검증
- **Required Fields:**
```json
{
  "taxCategories": [
    {
      "category": "상속세",
      "issues": ["주요 이슈 설명"],
      "applicableLaws": ["관련 조항"],
      "requiredData": [
        {
          "name": "상속재산가액",
          "type": "number",
          "unit": "원",
          "description": "설명"
        }
      ],
      "notes": ["주의사항"],
      "references": ["참고 자료"]
    }
  ],
  "recommendations": ["절세 포인트"],
  "warnings": ["주의사항"]
}
```

**FR-2.4: 수동 모드 지원**
- **Priority:** P1 (High)
- **Description:** API 키 없이도 사용 가능한 수동 모드
- **Requirements:**
  - API 키 미설정 시 자동으로 수동 모드 활성화
  - 프롬프트 복사 버튼 제공
  - AI 웹사이트 링크 제공
  - 샘플 데이터 로드 기능
- **User Flow:**
  1. 프롬프트 표시 및 복사 버튼
  2. AI 웹사이트 새 탭으로 열기
  3. "AI 분석 완료" 버튼 클릭
  4. 샘플 데이터 자동 로드 또는 수동 입력

**FR-2.5: 재시도 및 복구 로직**
- **Priority:** P1 (High)
- **Description:** API 실패 시 자동 재시도 및 복구
- **Requirements:**
  - 첫 실패: 3초 후 자동 재시도
  - 두 번째 실패: 수동 모드 전환 제안
  - 세 번째 실패: 수동 모드로 자동 전환
  - 에러 타입별 맞춤 메시지
- **Retry Strategy:**
```javascript
// Exponential backoff
retryDelays = [3000, 6000, 12000] // ms
maxRetries = 3
```

#### 5.1.3 수치 입력 및 계산 (Step 3)

**FR-3.1: 동적 입력 폼 생성**
- **Priority:** P0 (Critical)
- **Description:** AI 분석 결과 기반 입력 폼 자동 생성
- **Requirements:**
  - AI가 추출한 `requiredData` 기반 폼 생성
  - 입력 타입별 적절한 컴포넌트 사용
    - number: 숫자 입력 (콤마 자동 추가)
    - date: 날짜 선택기
    - select: 드롭다운 (예: 관계 선택)
  - 필수 입력 표시 (*)
  - 각 필드별 설명 툴팁
- **Input Validation:**
  - 금액: 0 이상, 1조 이하
  - 날짜: 과거 날짜만 허용
  - 관계: 정해진 옵션만 선택

**FR-3.2: 실시간 계산 엔진**
- **Priority:** P0 (Critical)
- **Description:** 입력값 변경 시 즉시 계산
- **Requirements:**
  - 입력 완료 시 자동 계산 (debounce 500ms)
  - 계산 중 로딩 인디케이터 표시
  - 계산 결과 실시간 업데이트
  - 오류 발생 시 명확한 메시지

**FR-3.3: 상속세 계산 로직**
- **Priority:** P0 (Critical)
- **Description:** 상속세법에 따른 정확한 계산
- **Formula:**
```javascript
// 1. 과세표준 계산
과세표준 = 상속재산가액 - 채무 - 공제액

// 2. 공제액 계산
기초공제 = 2억원
배우자공제 = min(상속재산 * 0.3, 30억, max(5억, 상속재산))
자녀공제 = 자녀수 * 5천만원
일괄공제 = max(5억, 기초공제 + 인적공제)

// 3. 세율 적용 (누진세율)
구간별세액 = 과세표준 × 세율 - 누진공제액
```
- **Tax Brackets (2024):**
| 과세표준 | 세율 | 누진공제 |
|---------|------|---------|
| 1억 이하 | 10% | 0 |
| 5억 이하 | 20% | 1천만 |
| 10억 이하 | 30% | 6천만 |
| 30억 이하 | 40% | 1억6천만 |
| 30억 초과 | 50% | 4억6천만 |

**FR-3.4: 증여세 계산 로직**
- **Priority:** P0 (Critical)
- **Description:** 증여세법에 따른 정확한 계산
- **Formula:**
```javascript
// 1. 과세표준 계산
과세표준 = 증여재산가액 - 관계별공제

// 2. 관계별 공제 (10년 합산)
배우자 = 6억원
직계존속(성년) = 5천만원
직계존속(미성년) = 2천만원
직계비속 = 5천만원
기타친족 = 1천만원

// 3. 세율 적용 (상속세와 동일한 누진세율)
```

**FR-3.5: 양도소득세 계산 로직 (향후)**
- **Priority:** P2 (Medium)
- **Description:** 양도소득세 계산 (Phase 3)
- **Requirements:**
  - 1세대1주택 비과세 검토
  - 장기보유특별공제 계산
  - 다주택자 중과세율 적용

**FR-3.6: 참고사항 및 가이드**
- **Priority:** P1 (High)
- **Description:** 사용자에게 유용한 정보 제공
- **Requirements:**
  - 공제 한도 표시
  - 세율표 제공
  - 입력 가이드
  - 주의사항 하이라이트
- **Information Provided:**
  - 2024년 기준 공제 한도
  - 세율표 및 누진공제액
  - 관련 법조항
  - 자주 묻는 질문

#### 5.1.4 시나리오 비교 및 최적화 (Step 4)

**FR-4.1: 시나리오 생성**
- **Priority:** P0 (Critical)
- **Description:** 무제한 시나리오 생성 및 관리
- **Requirements:**
  - "새 시나리오 추가" 버튼
  - 각 시나리오에 이름 지정 가능
  - 시나리오 복제 기능
  - 시나리오 삭제 기능
- **Data Structure:**
```json
{
  "id": "scenario-uuid",
  "name": "시나리오 1: 즉시 상속",
  "inputs": { /* 입력값 */ },
  "results": { /* 계산 결과 */ },
  "createdAt": "2024-10-17T10:00:00Z"
}
```

**FR-4.2: 시나리오 비교표**
- **Priority:** P0 (Critical)
- **Description:** 모든 시나리오를 한눈에 비교
- **Requirements:**
  - 테이블 형식 비교 (가로 스크롤 지원)
  - 세목별 세액 표시
  - 전체 세금 합계 계산
  - 최저 세금 시나리오 하이라이트
- **Display Format:**
```
| 항목      | 시나리오1 | 시나리오2 | 시나리오3 |
|-----------|----------|----------|----------|
| 상속세     | 1.2억    | 8천만    | 1억      |
| 증여세     | -        | 3천만    | 2천만    |
| 합계       | 1.2억    | 1.1억    | 1.2억    |
| 최적       |          | ⭐       |          |
```

**FR-4.3: 최적 시나리오 자동 추천**
- **Priority:** P1 (High)
- **Description:** 가장 낮은 세금의 시나리오 자동 선택
- **Requirements:**
  - 전체 세금 합계 기준 비교
  - 최적 시나리오에 배지 표시
  - 절세 금액 계산 및 표시
- **Calculation:**
```javascript
최적시나리오 = min(시나리오들.map(s => s.총세금))
절세금액 = max(시나리오들.총세금) - min(시나리오들.총세금)
절세비율 = (절세금액 / max(시나리오들.총세금)) * 100
```

**FR-4.4: 상세 분석 뷰**
- **Priority:** P1 (High)
- **Description:** 각 시나리오의 상세 계산 과정 표시
- **Requirements:**
  - 펼치기/접기 가능한 아코디언 UI
  - 과세표준 계산 과정
  - 공제액 상세 내역
  - 세율 적용 과정
- **Display Example:**
```
시나리오 1: 즉시 상속
├─ 상속재산가액: 12억
├─ 채무: 1억
├─ 공제액
│  ├─ 기초공제: 2억
│  ├─ 배우자공제: 5억
│  └─ 자녀공제: 1억 (2명)
├─ 과세표준: 3억 (= 12억 - 1억 - 8억)
├─ 세율 적용: 30% - 6천만
└─ 산출세액: 2천4백만원
```

**FR-4.5: 차트 시각화**
- **Priority:** P2 (Medium)
- **Description:** 시나리오별 세금을 차트로 시각화
- **Requirements:**
  - 막대 그래프 (세목별 비교)
  - 원형 차트 (세목 구성비)
  - 인터랙티브 툴팁
- **Chart Library:** Chart.js 또는 Recharts

#### 5.1.5 데이터 저장 및 공유

**FR-5.1: JSON 다운로드**
- **Priority:** P0 (Critical)
- **Description:** 모든 데이터를 JSON 파일로 저장
- **Requirements:**
  - "결과 다운로드 (JSON)" 버튼
  - 파일명 자동 생성 (세무컨설팅_YYYY-MM-DD.json)
  - 전체 데이터 포함 (사례, AI분석, 시나리오)
- **JSON Structure:**
```json
{
  "version": "1.0.0",
  "exportDate": "2024-10-17T10:30:00Z",
  "case": {
    "description": "사례 내용",
    "ai": "claude",
    "analysisDate": "2024-10-17T10:00:00Z"
  },
  "taxData": {
    "taxCategories": [...],
    "recommendations": [...]
  },
  "scenarios": [
    {
      "id": "uuid",
      "name": "시나리오 1",
      "inputs": {...},
      "results": {...}
    }
  ],
  "metadata": {
    "appVersion": "1.0.0",
    "browser": "Chrome 118"
  }
}
```

**FR-5.2: JSON 불러오기 (향후)**
- **Priority:** P2 (Medium)
- **Description:** 저장된 JSON 파일을 다시 불러오기
- **Requirements:**
  - 파일 업로드 버튼
  - JSON 유효성 검증
  - 버전 호환성 확인
  - 데이터 복원

**FR-5.3: PDF 보고서 생성 (Phase 4)**
- **Priority:** P3 (Low)
- **Description:** 전문적인 PDF 보고서 자동 생성
- **Requirements:**
  - 회사 로고 및 헤더
  - 사례 요약
  - 시나리오 비교표
  - 차트 포함
  - 권고사항 및 주의사항
- **Library:** jsPDF + html2canvas

**FR-5.4: 이메일 공유 (Phase 4)**
- **Priority:** P3 (Low)
- **Description:** 결과를 이메일로 직접 전송
- **Requirements:**
  - 이메일 주소 입력
  - 제목 및 메시지 커스터마이징
  - PDF 첨부
  - 전송 상태 확인

#### 5.1.6 **NEW** 노드 그래프 시스템 (Knowledge Graph System)

**FR-NODE-1: 노드 자동 추출**
- **Priority:** P0 (Critical)
- **Description:** AI가 사례 분석 결과를 Issue/Solution 노드로 자동 변환
- **Requirements:**
  - AI 응답에서 세무 이슈 자동 식별 및 노드화
  - 각 이슈에 대한 해결 방안을 Solution 노드로 생성
  - 노드 간 연결 관계 (Edge) 자동 생성
  - 법적 종속성 (dependencies) 자동 추출
- **AI Prompt Engineering:**
```
"다음 세무 상황을 분석하여 JSON 형식으로 반환하세요:
1. Issue Nodes: 식별된 세무 이슈들 (id, title, description, priority)
2. Solution Nodes: 각 이슈에 대한 해결 방안들 (id, title, taxImpact, dependencies)
3. Edges: 이슈와 해결방안 간의 연결 (from, to, strength)
4. 법적 종속성: 어떤 해결방안이 다른 해결방안보다 먼저 실행되어야 하는지"
```
- **Output Schema:** Section 1.4.2 참조 (Issue Node, Solution Node, Edge 구조)
- **Validation:**
  - 최소 1개 이상의 Issue Node 필수
  - 각 Issue는 최소 1개 이상의 Solution 연결 필요
  - 순환 종속성(Circular Dependency) 자동 감지 및 경고

**FR-NODE-2: 노드 그래프 시각화**
- **Priority:** P0 (Critical)
- **Description:** React Flow를 사용한 인터랙티브 노드 그래프 표시
- **Requirements:**
  - Issue 노드 (빨간색 원형)와 Solution 노드 (파란색 사각형) 구분
  - 엣지(Edge)로 노드 간 연결 표시
  - 노드 클릭 시 상세 정보 표시 (툴팁 또는 사이드 패널)
  - 노드 드래그로 레이아웃 조정 가능
  - 줌 인/아웃 및 패닝 지원
- **React Flow Configuration:**
```javascript
const nodeTypes = {
  issue: IssueNode,      // 빨간색 원형, 이슈 아이콘
  solution: SolutionNode // 파란색 사각형, 절세액 표시
};

const edgeTypes = {
  issue_to_solution: CustomEdge, // 실선
  dependency: DependencyEdge     // 점선 (순서 종속성)
};
```
- **Interactive Features:**
  - 노드 hover 시 연결된 노드 하이라이트
  - Solution 노드에 절세액 배지 표시 (예: "-1.5억")
  - 종속성 엣지는 화살표로 방향 표시
- **Auto-Layout:** Dagre 알고리즘으로 노드 자동 배치

**FR-NODE-3: 실행 순서 조합 생성**
- **Priority:** P0 (Critical)
- **Description:** 모든 가능한 Solution 노드 실행 순서 조합 자동 생성
- **Requirements:**
  - 법적 종속성(dependencies)을 만족하는 모든 순열 생성
  - 조합 수 제한 (최대 500개, 초과 시 사용자에게 제약 추가 요청)
  - 무효한 조합 자동 필터링 (종속성 위반, 상호 배타적 솔루션)
  - 생성 과정을 진행 바로 표시 (대량 조합 시)
- **Algorithm:**
```javascript
function generateValidCombinations(solutionNodes, dependencies) {
  // 1. 모든 순열 생성
  let allPermutations = permute(solutionNodes);

  // 2. 종속성 필터링
  let validCombinations = allPermutations.filter(combo => {
    return dependencies.every(dep => {
      let depIndex = combo.findIndex(n => n.id === dep.dependsOn);
      let nodeIndex = combo.findIndex(n => n.id === dep.nodeId);
      return depIndex < nodeIndex; // 종속성 노드가 먼저 실행되어야 함
    });
  });

  // 3. 상호 배타적 솔루션 필터링
  validCombinations = validCombinations.filter(combo => {
    return !hasConflictingSolutions(combo);
  });

  // 4. 조합 수 제한
  if (validCombinations.length > 500) {
    return validCombinations.slice(0, 500); // 상위 500개만
  }

  return validCombinations;
}
```
- **Performance:** 12개 노드 기준 479M 조합 → 종속성 필터링 → 248개 유효 조합 (30초 이내)

**FR-NODE-4: 최적화 알고리즘**
- **Priority:** P0 (Critical)
- **Description:** Section 1.4.4 최적화 알고리즘으로 최상위 대안 추천
- **Requirements:**
  - 각 조합에 대해 종합 점수 계산
  - 상위 3-5개 대안 자동 추천
  - 점수 구성 요소별 가중치 표시
- **Scoring Formula:**
```javascript
function calculateScore(alternative) {
  const savingsScore = (alternative.totalSavings / 1000000000) * 0.5; // 절세액 (10억 단위)
  const complexityScore = (100 - alternative.complexity * 10) * 0.2;  // 난이도 (10점 척도)
  const riskScore = (100 - alternative.risk * 10) * 0.2;             // 리스크 (10점 척도)
  const timeScore = (100 - alternative.days / 10) * 0.1;             // 소요일 (최대 1000일)

  return savingsScore + complexityScore + riskScore + timeScore;
}

// 점수 = (절세액 × 0.5) + (100 - 난이도 × 0.2) + (100 - 리스크 × 0.2) + (100 - 시간/일 × 0.1)
```
- **Recommendation Output:**
```javascript
{
  rank: 1,
  score: 92,
  executionOrder: [
    {nodeId: "sol-003", name: "동거주택 공제", taxImpact: -180000000},
    {nodeId: "sol-001", name: "배우자 공제", taxImpact: -150000000},
    ...
  ],
  totalTax: 80000000,      // 총 세금
  totalSavings: 320000000, // 총 절세액
  savingsRate: 80,         // 절세율 (%)
  complexity: 5,           // 난이도 (10점 척도)
  risk: 2,                 // 리스크 (10점 척도)
  estimatedDays: 30,       // 예상 소요일
  legalBasis: ["상속세법 제23조", ...], // 법적 근거
  warnings: ["배우자 사망 시 2차 상속세 발생 가능"]
}
```
- **Visual Display:** 금/은/동 메달 아이콘, 점수 바 차트, 비교표

**FR-NODE-5: 대안별 세금 시뮬레이션**
- **Priority:** P0 (Critical)
- **Description:** 각 실행 순서 조합에 대해 세금을 단계별로 계산
- **Requirements:**
  - 노드 실행 순서대로 순차적 세금 계산
  - 이전 단계의 공제가 다음 단계에 영향 반영
  - 각 단계별 중간 결과 저장 (디버깅/설명 용도)
  - 최종 총 세금 계산
- **Calculation Logic:**
```javascript
function simulateTaxByExecutionOrder(executionOrder, initialTaxBase) {
  let remainingTaxBase = initialTaxBase; // 초기 과세표준
  let totalTax = 0;
  let steps = [];

  for (let solution of executionOrder) {
    // 1. 이 솔루션 적용
    let deduction = calculateDeduction(solution, remainingTaxBase);
    remainingTaxBase -= deduction;

    // 2. 현재 과세표준에서 세금 계산
    let stepTax = calculateTax(remainingTaxBase);
    totalTax += stepTax;

    // 3. 중간 결과 저장
    steps.push({
      solutionId: solution.id,
      solutionName: solution.title,
      deduction: deduction,
      remainingBase: remainingTaxBase,
      stepTax: stepTax,
      cumulativeTax: totalTax
    });
  }

  return {totalTax, steps};
}
```
- **Output:** 단계별 계산 과정과 최종 세금

**FR-NODE-6: 대안 비교 리포트**
- **Priority:** P1 (High)
- **Description:** 최적화된 대안들을 시각적으로 비교
- **Requirements:**
  - 상위 3-5개 대안을 테이블로 병렬 비교
  - 타임라인 차트: 시간축에 따른 실행 순서 시각화
  - 누적 세금 그래프: 각 단계에서 발생하는 세금 누적 표시
  - 절세액 비교 막대 차트
  - 대안별 장단점 표 (리스크, 난이도, 소요 시간)
- **Comparison Table:**
```
| 순위 | 실행 순서 | 총 세금 | 절세액 | 난이도 | 리스크 | 소요일 | 점수 |
|------|----------|---------|--------|--------|--------|--------|------|
| 🥇 1 | Sol-3 → Sol-1 → Sol-4 → Sol-2 | 0.8억 | 3.2억 (80%) | 5/10 | 2/10 | 30일 | 92 |
| 🥈 2 | Sol-1 → Sol-3 → Sol-4 → Sol-2 | 1.2억 | 2.8억 (70%) | 3/10 | 1/10 | 20일 | 88 |
| 🥉 3 | Sol-2 → Sol-1 → Sol-3 → Sol-4 | 1.5억 | 2.5억 (63%) | 4/10 | 3/10 | 25일 | 82 |
```
- **Timeline Chart:** Gantt 차트 형식으로 각 솔루션 실행 시점 표시
- **Interactive:** 대안 클릭 시 상세 단계별 계산 과정 표시

**FR-NODE-7: 민감도 분석**
- **Priority:** P2 (Medium)
- **Description:** 변수 변경 시 최적 순서가 어떻게 달라지는지 분석
- **Requirements:**
  - 주요 변수 선택 (예: 주가 상승률, 공제 한도 변경)
  - 변수값 범위 입력 (예: 10% → 15%)
  - 시스템이 자동으로 재계산 및 대안 재정렬
  - 민감도가 높은 변수 하이라이트
- **Example:**
```
변수: 주가 상승률
- 10% (현재): 추천 1위 = Sol-3 → Sol-1 → ...
- 15% (가정): 추천 1위 = Sol-1 → Sol-3 → ... (순서 변경!)
- 민감도: 높음 ⚠️ (5% 변동으로 최적 순서 변경)
```
- **Display:** Before/After 비교표, 민감도 차트

**FR-NODE-8: 노드 수동 편집**
- **Priority:** P2 (Medium)
- **Description:** 사용자가 AI 생성 노드를 수정/추가/삭제 가능
- **Requirements:**
  - 노드 추가 버튼 (Issue 또는 Solution)
  - 노드 편집 모달 (title, description, taxImpact 수정)
  - 노드 삭제 (연결된 엣지도 함께 삭제)
  - 엣지 추가/삭제 (연결 관계 수정)
  - 종속성(dependencies) 수동 지정
- **Validation:**
  - 삭제 시 영향받는 대안 수 경고
  - 순환 종속성 감지 및 차단
  - 변경 후 자동으로 조합 재생성 및 재계산

**FR-NODE-9: 노드 그래프 저장/로드**
- **Priority:** P1 (High)
- **Description:** 노드 그래프와 대안을 JSON으로 저장/복원
- **Requirements:**
  - JSON 다운로드 시 노드 그래프 포함
  - JSON 로드 시 그래프 복원 및 재시각화
  - 버전 호환성 확인
- **JSON Structure Extension:**
```json
{
  "version": "2.0.0",
  "exportDate": "2025-10-20T10:00:00Z",
  "case": {...},
  "nodeGraph": {
    "issueNodes": [...],
    "solutionNodes": [...],
    "edges": [...],
    "dependencies": [...]
  },
  "alternatives": [
    {
      "rank": 1,
      "score": 92,
      "executionOrder": [...],
      "totalTax": 80000000,
      "simulationSteps": [...]
    }
  ],
  "metadata": {...}
}
```

**FR-NODE-10: 체크리스트 자동 생성**
- **Priority:** P2 (Medium)
- **Description:** 선택한 대안의 실행 순서를 체크리스트로 변환
- **Requirements:**
  - 단계별 액션 아이템 생성
  - 각 단계의 마감일 제안
  - 필요 서류 목록
  - 진행 상황 체크박스
- **Example Output:**
```markdown
# 실행 계획 (추천 1위)

## Phase 1: 사전 준비 (2025-01-01 ~ 2025-01-15)
- [ ] 동거주택 상속공제 요건 확인
  - 필요 서류: 주민등록등본, 재산세 납부 확인서
- [ ] 배우자 공제 서류 준비
  - 필요 서류: 가족관계증명서, 혼인관계증명서

## Phase 2: 1차 공제 적용 (2025-01-16 ~ 2025-02-15)
- [ ] 동거주택 공제 신청 (최대 6억)
- [ ] 세무서 제출 및 확인

## Phase 3: 2차 공제 적용 (2025-02-16 ~ 2025-03-15)
- [ ] 배우자 공제 적용 (최대 5억)
- [ ] 최종 상속세 신고
```

### 5.2 Supporting Features

#### 5.2.1 사용자 설정

**FR-6.1: API 키 관리**
- **Priority:** P0 (Critical)
- **Description:** 사용자가 직접 API 키 입력 및 관리
- **Requirements:**
  - 설정 페이지에서 API 키 입력
  - 키 유효성 테스트 버튼
  - 안전한 저장 (localStorage 암호화)
  - 키 삭제 기능
- **Security:**
  - 입력 시 마스킹 (••••••)
  - 복사 방지
  - HTTPS 통신 필수

**FR-6.2: 기본 AI 설정**
- **Priority:** P1 (High)
- **Description:** 선호하는 AI를 기본값으로 설정
- **Requirements:**
  - 드롭다운에서 기본 AI 선택
  - 설정 저장 및 복원
  - 환경 변수 우선순위 > 사용자 설정

**FR-6.3: 테마 설정**
- **Priority:** P2 (Medium)
- **Description:** 라이트/다크 모드 전환
- **Requirements:**
  - 토글 버튼
  - 시스템 설정 자동 감지
  - 설정 저장

#### 5.2.2 도움말 및 가이드

**FR-7.1: 온보딩 튜토리얼**
- **Priority:** P1 (High)
- **Description:** 첫 사용자를 위한 단계별 가이드
- **Requirements:**
  - 첫 방문 시 자동 실행
  - 각 단계별 설명
  - 건너뛰기 옵션
  - "다시 보지 않기" 옵션

**FR-7.2: 인라인 도움말**
- **Priority:** P1 (High)
- **Description:** 각 섹션별 물음표 아이콘 툴팁
- **Requirements:**
  - 간결한 설명
  - 관련 문서 링크
  - 예시 제공

**FR-7.3: FAQ 페이지**
- **Priority:** P2 (Medium)
- **Description:** 자주 묻는 질문 모음
- **Requirements:**
  - 카테고리별 분류
  - 검색 기능
  - 접기/펼치기 UI

#### 5.2.3 에러 처리 및 로깅

**FR-8.1: 사용자 친화적 에러 메시지**
- **Priority:** P0 (Critical)
- **Description:** 명확하고 실행 가능한 에러 메시지
- **Requirements:**
  - 에러 타입별 맞춤 메시지
  - 해결 방법 제시
  - 관련 문서 링크
  - 재시도 버튼

**FR-8.2: 에러 로깅**
- **Priority:** P1 (High)
- **Description:** 개발자를 위한 상세 로그
- **Requirements:**
  - 콘솔에 상세 로그 출력
  - 에러 스택 추적
  - API 요청/응답 로깅
  - 사용자 액션 추적

**FR-8.3: 에러 리포팅 (향후)**
- **Priority:** P3 (Low)
- **Description:** Sentry 등 에러 모니터링 도구 연동
- **Requirements:**
  - 자동 에러 수집
  - 사용자 컨텍스트 포함
  - 알림 설정

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### 6.1.1 Response Time
| Operation | Target | Max |
|-----------|--------|-----|
| **Page Load** | <2초 | <5초 |
| **AI Analysis** | <15초 | <30초 |
| **Calculation** | <1초 | <2초 |
| **Scenario Addition** | <1초 | <2초 |
| **JSON Download** | <1초 | <2초 |

#### 6.1.2 Throughput
- **Concurrent Users:** 100명 동시 접속 지원
- **API Calls:** 초당 10건 처리
- **Data Processing:** 시나리오 100개까지 원활한 처리

#### 6.1.3 Resource Usage
- **Frontend Bundle Size:** <500KB (gzipped)
- **Memory Usage:** <100MB (브라우저)
- **API Token Usage:** 건당 평균 4,000 tokens

### 6.2 Security Requirements

#### 6.2.1 Authentication & Authorization
- **Phase 1 (MVP):** 인증 없음 (로컬 사용)
- **Phase 5 (DB 구축 후):**
  - JWT 기반 인증
  - OAuth 2.0 소셜 로그인
  - 역할 기반 접근 제어 (RBAC)

#### 6.2.2 Data Protection
- **API Keys:**
  - localStorage 저장 시 AES-256 암호화
  - 전송 시 HTTPS 필수
  - 로그에 키 노출 방지
- **User Data:**
  - 브라우저 메모리에만 저장 (현재)
  - 서버 저장 시 암호화 (향후)
  - GDPR 준수 (향후)

#### 6.2.3 API Security
- **Rate Limiting:**
  - 사용자당 분당 10회 API 호출 제한
  - IP당 시간당 100회 제한
- **Input Validation:**
  - XSS 방지 (입력 새니타이제이션)
  - SQL Injection 방지 (향후 DB 구축 시)
  - CSRF 토큰 (향후 인증 구현 시)

#### 6.2.4 Secure Communication
- **HTTPS:** 모든 통신 HTTPS 필수
- **API Endpoints:** CORS 정책 적용
- **Content Security Policy (CSP):** 헤더 설정

### 6.3 Reliability & Availability

#### 6.3.1 Uptime
- **Target:** 99.5% uptime
- **Downtime:** 월 3.6시간 이하
- **Maintenance Window:** 주말 새벽 2-4시

#### 6.3.2 Error Recovery
- **API Failures:**
  - 자동 재시도 (최대 3회)
  - Exponential backoff
  - 다른 AI로 자동 전환 제안
- **Data Loss Prevention:**
  - 자동 임시 저장 (30초마다)
  - 브라우저 종료 시 경고
  - 복구 기능 제공

#### 6.3.3 Backup & Recovery
- **Current (No DB):** localStorage 자동 백업
- **Future (With DB):**
  - 일일 전체 백업
  - 실시간 트랜잭션 로그
  - RTO: 4시간, RPO: 1시간

### 6.4 Scalability

#### 6.4.1 Horizontal Scaling
- **Frontend:** CDN 배포 (Vercel, Netlify)
- **Backend (향후):**
  - 로드 밸런서
  - Auto-scaling (K8s)
  - 서버리스 아키텍처

#### 6.4.2 Database Scaling (Phase 5)
- **Read Replicas:** 읽기 부하 분산
- **Sharding:** 사용자 ID 기반
- **Caching:** Redis 활용

### 6.5 Usability

#### 6.5.1 Accessibility
- **WCAG 2.1 Level AA 준수:**
  - 키보드 네비게이션 지원
  - 스크린 리더 호환
  - 색상 대비 4.5:1 이상
  - ARIA 레이블 적용

#### 6.5.2 Internationalization (향후)
- **Multi-language Support:**
  - 한국어 (기본)
  - 영어 (2025 Q4)
  - 중국어, 일본어 (2026)
- **Locale Support:**
  - 날짜/시간 형식
  - 통화 표시
  - 숫자 형식

#### 6.5.3 Browser Compatibility
| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| IE | ❌ Not Supported |

#### 6.5.4 Mobile Responsiveness
- **Breakpoints:**
  - Mobile: <640px
  - Tablet: 640-1024px
  - Desktop: >1024px
- **Touch Optimization:**
  - 버튼 최소 크기 44x44px
  - 터치 제스처 지원

### 6.6 Maintainability

#### 6.6.1 Code Quality
- **Linting:** ESLint + Prettier
- **Type Safety:** TypeScript (향후 마이그레이션)
- **Testing:**
  - Unit Tests: Jest (커버리지 >80%)
  - Integration Tests: React Testing Library
  - E2E Tests: Playwright (주요 플로우)

#### 6.6.2 Documentation
- **Code Documentation:**
  - JSDoc 주석
  - README per module
  - API 문서 (Swagger/OpenAPI)
- **User Documentation:**
  - 사용자 가이드
  - API 키 설정 가이드
  - 문제 해결 가이드

#### 6.6.3 Monitoring & Logging
- **Performance Monitoring:**
  - Google Analytics
  - Core Web Vitals
  - API 응답 시간 추적
- **Error Tracking:**
  - Sentry (향후)
  - 콘솔 로그 수집
- **Usage Analytics:**
  - DAU/MAU
  - 기능별 사용률
  - 이탈률 추적

### 6.7 Compliance

#### 6.7.1 Legal Compliance
- **개인정보보호법:** 개인정보 최소 수집
- **전자서명법:** 전자서명 지원 (향후)
- **세무사법:** 세무 대리 제한 고지

#### 6.7.2 Tax Law Compliance
- **계산 정확성:**
  - 국세청 세율표 준수
  - 세법 개정 사항 반영
  - 계산 검증 절차
- **Disclaimer:**
  - "참고용 계산" 명시
  - 전문가 상담 권고
  - 법적 책임 한계 고지

---

## 7. Technical Architecture

### 7.1 System Architecture

#### 7.1.1 High-Level Architecture
```
┌─────────────────────────────────────────┐
│          User Browser (Client)          │
│  ┌────────────────────────────────────┐ │
│  │      React 18 Application          │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  Components                  │  │ │
│  │  │  - TaxWorkflow.jsx          │  │ │
│  │  │  - StepIndicator.jsx        │  │ │
│  │  │  - ScenarioComparison.jsx   │  │ │
│  │  └──────────────────────────────┘  │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  State Management            │  │ │
│  │  │  - React Hooks (useState)    │  │ │
│  │  │  - localStorage              │  │ │
│  │  └──────────────────────────────┘  │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  Utils                       │  │ │
│  │  │  - aiClient.js               │  │ │
│  │  │  - promptGenerator.js        │  │ │
│  │  │  - taxCalculator.js          │  │ │
│  │  └──────────────────────────────┘  │ │
│  └────────────────────────────────────┘ │
└─────────────┬───────────────────────────┘
              │ HTTPS
              │
┌─────────────▼───────────────────────────┐
│         AI API Services                 │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Claude API                       │   │
│  │ (Anthropic)                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ChatGPT API                      │   │
│  │ (OpenAI)                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Perplexity API                   │   │
│  │ (Perplexity AI)                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

Future: Backend API (Phase 5)
┌─────────────────────────────────────────┐
│     Backend Server (Node.js/Express)    │
├─────────────────────────────────────────┤
│  - API Key Management                   │
│  - User Authentication                  │
│  - Database Operations                  │
│  - File Storage                         │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       PostgreSQL Database               │
├─────────────────────────────────────────┤
│  - Users                                │
│  - Cases                                │
│  - Scenarios                            │
│  - Audit Logs                           │
└─────────────────────────────────────────┘
```

#### 7.1.2 Component Architecture
```
src/
├── components/
│   ├── TaxWorkflow.jsx          # 메인 워크플로우 컴포넌트
│   ├── StepIndicator.jsx        # 단계 표시 컴포넌트
│   ├── CaseInput.jsx            # 사례 입력 (Step 1)
│   ├── AIAnalysis.jsx           # AI 분석 (Step 2)
│   ├── NumericalInput.jsx       # 수치 입력 (Step 3)
│   ├── ScenarioComparison.jsx   # 시나리오 비교 (Step 4)
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       └── Card.jsx
├── utils/
│   ├── aiClient.js              # AI API 호출 로직
│   ├── promptGenerator.js       # 프롬프트 생성
│   ├── taxCalculator.js         # 세금 계산 엔진
│   ├── dataExporter.js          # JSON 다운로드
│   └── validators.js            # 입력 검증
├── hooks/
│   ├── useLocalStorage.js       # localStorage 관리
│   ├── useAutoSave.js           # 자동 저장
│   └── useAPICall.js            # API 호출 훅
├── constants/
│   ├── taxRates.js              # 세율 테이블
│   ├── deductions.js            # 공제 한도
│   └── aiConfig.js              # AI 설정
├── styles/
│   └── tailwind.config.js       # Tailwind 설정
└── App.jsx                      # 메인 앱
```

### 7.2 Data Flow

#### 7.2.1 User Input Flow
```
1. User Input (사례 입력)
   ↓
2. Validation (입력 검증)
   ↓
3. State Update (React useState)
   ↓
4. localStorage Save (자동 저장)
   ↓
5. AI API Call (자동 분석)
   ↓
6. Response Parsing (응답 파싱)
   ↓
7. UI Update (화면 업데이트)
```

#### 7.2.2 Calculation Flow
```
1. Numerical Input (수치 입력)
   ↓
2. Input Validation (유효성 검사)
   ↓
3. Tax Calculation Engine
   ├─ Calculate Deductions (공제액 계산)
   ├─ Calculate Tax Base (과세표준)
   ├─ Apply Tax Rate (세율 적용)
   └─ Calculate Tax (세액 계산)
   ↓
4. Store Result (결과 저장)
   ↓
5. Update Comparison Table (비교표 업데이트)
```

### 7.3 **NEW** Node Graph System Architecture

#### 7.3.1 Graph Data Structures

**Core Data Models:**
```javascript
// src/models/NodeGraph.js

class IssueNode {
  constructor(data) {
    this.id = data.id || `issue-${Date.now()}`;
    this.type = 'ISSUE';
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.relatedLaw = data.relatedLaw || [];
    this.priority = data.priority || 'MEDIUM';
    this.taxImpact = null; // Issues don't have direct tax impact
    this.connectedSolutions = data.connectedSolutions || [];
    this.createdBy = data.createdBy || 'AI';
    this.createdAt = new Date().toISOString();
  }
}

class SolutionNode {
  constructor(data) {
    this.id = data.id || `solution-${Date.now()}`;
    this.type = 'SOLUTION';
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.taxImpact = data.taxImpact; // 절세액 (음수) or 추가 세금 (양수)
    this.taxImpactPercentage = data.taxImpactPercentage;
    this.requirements = data.requirements || [];
    this.risks = data.risks || [];
    this.dependencies = data.dependencies || []; // [solutionId1, solutionId2]
    this.executionOrder = data.executionOrder || null;
    this.estimatedTime = data.estimatedTime; // "30일"
    this.complexity = data.complexity || 'MEDIUM'; // LOW/MEDIUM/HIGH
    this.legalBasis = data.legalBasis || [];
    this.relatedIssues = data.relatedIssues || [];
    this.createdBy = data.createdBy || 'AI';
    this.createdAt = new Date().toISOString();
  }
}

class Edge {
  constructor(from, to, type, strength = 1.0, reasoning = '') {
    this.id = `edge-${from}-${to}`;
    this.type = type; // 'ISSUE_TO_SOLUTION' | 'DEPENDENCY' | 'CONFLICT'
    this.from = from;
    this.to = to;
    this.strength = strength; // 0.0 ~ 1.0 (연관도)
    this.reasoning = reasoning;
  }
}

class NodeGraph {
  constructor() {
    this.issueNodes = new Map(); // id -> IssueNode
    this.solutionNodes = new Map(); // id -> SolutionNode
    this.edges = new Map(); // edgeId -> Edge
  }

  addIssueNode(node) {
    this.issueNodes.set(node.id, node);
  }

  addSolutionNode(node) {
    this.solutionNodes.set(node.id, node);
  }

  addEdge(edge) {
    this.edges.set(edge.id, edge);
  }

  getSolutionsByIssue(issueId) {
    return Array.from(this.edges.values())
      .filter(e => e.type === 'ISSUE_TO_SOLUTION' && e.from === issueId)
      .map(e => this.solutionNodes.get(e.to));
  }

  getDependencies(solutionId) {
    const solution = this.solutionNodes.get(solutionId);
    return solution?.dependencies.map(id => this.solutionNodes.get(id)) || [];
  }

  // 순환 종속성 감지
  detectCircularDependency(solutionId, visited = new Set()) {
    if (visited.has(solutionId)) return true; // 순환 발견
    visited.add(solutionId);

    const solution = this.solutionNodes.get(solutionId);
    if (!solution) return false;

    for (let depId of solution.dependencies) {
      if (this.detectCircularDependency(depId, visited)) return true;
    }

    return false;
  }

  toJSON() {
    return {
      issues: Array.from(this.issueNodes.values()),
      solutions: Array.from(this.solutionNodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  static fromJSON(json) {
    const graph = new NodeGraph();
    json.issues.forEach(i => graph.addIssueNode(new IssueNode(i)));
    json.solutions.forEach(s => graph.addSolutionNode(new SolutionNode(s)));
    json.edges.forEach(e => graph.addEdge(new Edge(e.from, e.to, e.type, e.strength, e.reasoning)));
    return graph;
  }
}
```

#### 7.3.2 Optimization Engine

**Combination Generator & Optimizer:**
```javascript
// src/engines/OptimizationEngine.js

class OptimizationEngine {
  constructor(nodeGraph, taxCalculator) {
    this.graph = nodeGraph;
    this.calculator = taxCalculator;
  }

  // 모든 유효한 실행 순서 조합 생성
  generateValidCombinations(maxCombinations = 500) {
    const solutions = Array.from(this.graph.solutionNodes.values());

    // 1. 모든 순열 생성
    const allPermutations = this.permute(solutions);

    // 2. 종속성 필터링
    const validCombos = allPermutations.filter(combo =>
      this.validateDependencies(combo)
    );

    // 3. 상호 배타적 솔루션 필터링
    const finalCombos = validCombos.filter(combo =>
      !this.hasConflictingSolutions(combo)
    );

    // 4. 최대 개수 제한
    return finalCombos.slice(0, maxCombinations);
  }

  // 순열 생성 (재귀)
  permute(arr) {
    if (arr.length <= 1) return [arr];

    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPermuted = this.permute(remaining);

      for (let perm of remainingPermuted) {
        result.push([current, ...perm]);
      }
    }
    return result;
  }

  // 종속성 검증
  validateDependencies(combination) {
    for (let i = 0; i < combination.length; i++) {
      const solution = combination[i];

      // 이 솔루션의 종속성들이 모두 앞에 나왔는지 확인
      for (let depId of solution.dependencies) {
        const depIndex = combination.findIndex(s => s.id === depId);
        if (depIndex === -1 || depIndex > i) {
          return false; // 종속성 위반
        }
      }
    }
    return true;
  }

  // 상호 배타적 솔루션 체크
  hasConflictingSolutions(combination) {
    const conflicts = [
      ['solution-002', 'solution-008'], // 일괄공제 vs 법정공제 (둘 중 하나만)
      // 추가 충돌 정의...
    ];

    for (let [sol1, sol2] of conflicts) {
      const has1 = combination.some(s => s.id === sol1);
      const has2 = combination.some(s => s.id === sol2);
      if (has1 && has2) return true; // 충돌 발견
    }
    return false;
  }

  // 최적화 점수 계산
  calculateScore(alternative) {
    const savingsScore = (alternative.totalSavings / 1_000_000_000) * 0.5;
    const complexityScore = (100 - this.getComplexityScore(alternative) * 10) * 0.2;
    const riskScore = (100 - this.getRiskScore(alternative) * 10) * 0.2;
    const timeScore = (100 - alternative.estimatedDays / 10) * 0.1;

    return savingsScore + complexityScore + riskScore + timeScore;
  }

  getComplexityScore(alternative) {
    // 솔루션들의 평균 복잡도 (1-10)
    const complexityMap = { 'LOW': 3, 'MEDIUM': 5, 'HIGH': 8 };
    const scores = alternative.executionOrder.map(s => complexityMap[s.complexity]);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  getRiskScore(alternative) {
    // 솔루션들의 최대 리스크 (1-10)
    const riskMap = { 'LOW': 2, 'MEDIUM': 5, 'HIGH': 9 };
    const scores = alternative.executionOrder.map(s =>
      Math.max(...s.risks.map(r => riskMap[r.level] || 5))
    );
    return Math.max(...scores);
  }

  // 실행 순서별 세금 시뮬레이션
  simulateTaxByExecutionOrder(executionOrder, initialTaxBase) {
    let remainingBase = initialTaxBase;
    let totalTax = 0;
    let steps = [];

    for (let solution of executionOrder) {
      // 공제 적용
      const deduction = this.calculator.calculateDeduction(solution, remainingBase);
      remainingBase -= deduction;

      // 세금 계산
      const stepTax = this.calculator.calculateTax(remainingBase);
      totalTax += stepTax;

      steps.push({
        solutionId: solution.id,
        solutionName: solution.title,
        deduction,
        remainingBase,
        stepTax,
        cumulativeTax: totalTax
      });
    }

    return { totalTax, steps };
  }

  // 전체 최적화 프로세스
  async optimize(initialTaxBase, topN = 3) {
    // 1. 유효한 조합 생성
    const combinations = this.generateValidCombinations();

    // 2. 각 조합에 대해 세금 시뮬레이션
    const alternatives = combinations.map((combo, index) => {
      const {totalTax, steps} = this.simulateTaxByExecutionOrder(combo, initialTaxBase);

      const estimatedDays = combo.reduce((sum, s) =>
        sum + parseInt(s.estimatedTime), 0
      );

      const totalSavings = initialTaxBase * 0.3 - totalTax; // 기본 세율 30% 가정

      return {
        id: `alt-${index}`,
        executionOrder: combo,
        totalTax,
        totalSavings,
        savingsRate: (totalSavings / (initialTaxBase * 0.3)) * 100,
        estimatedDays,
        steps,
        score: 0 // 나중에 계산
      };
    });

    // 3. 점수 계산
    alternatives.forEach(alt => {
      alt.score = this.calculateScore(alt);
      alt.rank = 0; // 나중에 정렬 후 부여
    });

    // 4. 점수 기준 정렬
    alternatives.sort((a, b) => b.score - a.score);

    // 5. 순위 부여
    alternatives.forEach((alt, index) => {
      alt.rank = index + 1;
    });

    // 6. 상위 N개 반환
    return alternatives.slice(0, topN);
  }
}
```

#### 7.3.3 React Flow Integration

**Graph Visualization Component:**
```javascript
// src/components/NodeGraphVisualization.jsx

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Custom Node Components
const IssueNodeComponent = ({ data }) => (
  <div className="issue-node">
    <div className="node-icon">⚠️</div>
    <div className="node-title">{data.title}</div>
    <div className="node-priority">{data.priority}</div>
  </div>
);

const SolutionNodeComponent = ({ data }) => (
  <div className="solution-node">
    <div className="node-icon">💡</div>
    <div className="node-title">{data.title}</div>
    <div className="tax-impact">
      {data.taxImpact > 0 ? '+' : ''}{(data.taxImpact / 100000000).toFixed(1)}억
    </div>
    <div className="node-complexity">{data.complexity}</div>
  </div>
);

const nodeTypes = {
  issue: IssueNodeComponent,
  solution: SolutionNodeComponent,
};

// Auto-layout using Dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';
    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 50,
    };
  });

  return { nodes, edges };
};

export default function NodeGraphVisualization({ nodeGraph }) {
  // Convert NodeGraph to ReactFlow format
  const initialNodes = useMemo(() => {
    const issueNodes = Array.from(nodeGraph.issueNodes.values()).map(node => ({
      id: node.id,
      type: 'issue',
      data: node,
      position: { x: 0, y: 0 }, // Will be set by layout
    }));

    const solutionNodes = Array.from(nodeGraph.solutionNodes.values()).map(node => ({
      id: node.id,
      type: 'solution',
      data: node,
      position: { x: 0, y: 0 },
    }));

    return [...issueNodes, ...solutionNodes];
  }, [nodeGraph]);

  const initialEdges = useMemo(() => {
    return Array.from(nodeGraph.edges.values()).map(edge => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: edge.type === 'DEPENDENCY' ? 'step' : 'default',
      animated: edge.type === 'DEPENDENCY',
      style: {
        stroke: edge.type === 'DEPENDENCY' ? '#f59e0b' : '#3b82f6',
        strokeWidth: 2,
      },
      label: edge.reasoning,
    }));
  }, [nodeGraph]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    // Show details in sidebar or modal
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
```

#### 7.3.4 State Management for Node System

**Node Graph Store:**
```javascript
// src/stores/useNodeGraphStore.js

import { create } from 'zustand';
import { NodeGraph } from '../models/NodeGraph';
import { OptimizationEngine } from '../engines/OptimizationEngine';

export const useNodeGraphStore = create((set, get) => ({
  // State
  nodeGraph: new NodeGraph(),
  alternatives: [],
  selectedAlternative: null,
  isOptimizing: false,
  optimizationProgress: 0,

  // Actions
  setNodeGraph: (graph) => set({ nodeGraph: graph }),

  addIssueNode: (node) => {
    const graph = get().nodeGraph;
    graph.addIssueNode(node);
    set({ nodeGraph: graph });
  },

  addSolutionNode: (node) => {
    const graph = get().nodeGraph;
    graph.addSolutionNode(node);
    set({ nodeGraph: graph });
  },

  addEdge: (edge) => {
    const graph = get().nodeGraph;
    graph.addEdge(edge);
    set({ nodeGraph: graph });
  },

  runOptimization: async (initialTaxBase) => {
    set({ isOptimizing: true, optimizationProgress: 0 });

    try {
      const engine = new OptimizationEngine(get().nodeGraph, get().taxCalculator);

      // Progress simulation
      const progressInterval = setInterval(() => {
        set((state) => ({
          optimizationProgress: Math.min(state.optimizationProgress + 10, 90)
        }));
      }, 500);

      const alternatives = await engine.optimize(initialTaxBase, 5);

      clearInterval(progressInterval);

      set({
        alternatives,
        selectedAlternative: alternatives[0],
        isOptimizing: false,
        optimizationProgress: 100
      });
    } catch (error) {
      console.error('Optimization failed:', error);
      set({ isOptimizing: false });
    }
  },

  selectAlternative: (alternativeId) => {
    const alternative = get().alternatives.find(alt => alt.id === alternativeId);
    set({ selectedAlternative: alternative });
  },

  exportNodeGraph: () => {
    return {
      nodeGraph: get().nodeGraph.toJSON(),
      alternatives: get().alternatives,
    };
  },

  importNodeGraph: (data) => {
    const graph = NodeGraph.fromJSON(data.nodeGraph);
    set({
      nodeGraph: graph,
      alternatives: data.alternatives || [],
    });
  },
}));
```

#### 7.3.5 Performance Optimizations

**Optimization Strategies:**

1. **Web Workers for Heavy Computation:**
```javascript
// src/workers/optimizationWorker.js
self.addEventListener('message', (e) => {
  const { combinations, initialTaxBase } = e.data;

  // Run heavy computation in worker thread
  const results = combinations.map(combo => {
    return simulateTaxInWorker(combo, initialTaxBase);
  });

  self.postMessage({ results });
});
```

2. **Memoization for Repeated Calculations:**
```javascript
import memoize from 'lodash/memoize';

const memoizedTaxCalc = memoize(
  (taxBase, solutionId) => calculateTax(taxBase, solutionId),
  (taxBase, solutionId) => `${taxBase}-${solutionId}` // cache key
);
```

3. **Virtual Scrolling for Large Node Graphs:**
```javascript
// Use react-window for rendering large lists of alternatives
import { FixedSizeList } from 'react-window';

const AlternativesList = ({ alternatives }) => (
  <FixedSizeList
    height={600}
    itemCount={alternatives.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <AlternativeCard alternative={alternatives[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

4. **Progressive Loading:**
```javascript
// Load and optimize in chunks
async function optimizeInChunks(combinations, chunkSize = 50) {
  const results = [];

  for (let i = 0; i < combinations.length; i += chunkSize) {
    const chunk = combinations.slice(i, i + chunkSize);
    const chunkResults = await optimizeChunk(chunk);
    results.push(...chunkResults);

    // Update progress
    updateProgress((i + chunkSize) / combinations.length * 100);
  }

  return results;
}
```

### 7.4 Technology Stack

#### 7.4.1 Frontend
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Visualization** | React Flow | 11.x | Node graph visualization |
| **Graph Layout** | Dagre | Latest | Auto-layout algorithm |
| **State Management** | Zustand | 4.x | Node graph state |
| **Framework** | React | 18.x | UI 라이브러리 |
| **Language** | JavaScript | ES2022 | 프로그래밍 언어 |
| **Styling** | Tailwind CSS | 3.x | 유틸리티 CSS |
| **Icons** | Lucide React | Latest | 아이콘 라이브러리 |
| **Build Tool** | Create React App | 5.x | 빌드 시스템 |

#### 7.3.2 Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | 코드 품질 검사 |
| **Prettier** | 코드 포매팅 |
| **Jest** | 유닛 테스트 |
| **React Testing Library** | 컴포넌트 테스트 |
| **Git** | 버전 관리 |

#### 7.3.3 External APIs
| API | Purpose | Pricing |
|-----|---------|---------|
| **Claude API** | AI 분석 | $3/1M input, $15/1M output |
| **ChatGPT API** | AI 분석 | $30/1M input, $60/1M output |
| **Perplexity API** | AI 검색 | $1/1M tokens |

#### 7.3.4 Future Stack (Phase 5)
| Category | Technology | Purpose |
|----------|-----------|---------|
| **Backend** | Node.js + Express | API 서버 |
| **Database** | PostgreSQL | 데이터 저장 |
| **ORM** | Prisma | DB 쿼리 |
| **Auth** | JWT + OAuth | 인증 |
| **Storage** | AWS S3 | 파일 저장 |
| **Hosting** | Vercel / AWS | 배포 |

### 7.4 API Design (향후)

#### 7.4.1 RESTful Endpoints
```
POST   /api/v1/analyze          # AI 분석 요청
GET    /api/v1/cases/:id        # 사례 조회
POST   /api/v1/cases            # 사례 생성
PUT    /api/v1/cases/:id        # 사례 수정
DELETE /api/v1/cases/:id        # 사례 삭제
GET    /api/v1/scenarios/:id    # 시나리오 조회
POST   /api/v1/scenarios        # 시나리오 생성
GET    /api/v1/users/me         # 사용자 정보
PUT    /api/v1/users/me/settings # 설정 수정
```

#### 7.4.2 API Request/Response Examples
```javascript
// POST /api/v1/analyze
Request:
{
  "caseDescription": "부동산 10억 상속 예정...",
  "aiProvider": "claude"
}

Response:
{
  "analysisId": "uuid",
  "taxCategories": [...],
  "recommendations": [...],
  "processingTime": 8.5, // seconds
  "tokensUsed": 3842
}
```

---

## 8. User Interface Design

### 8.1 Design Principles

#### 8.1.1 Core Principles
1. **Simplicity First**: 복잡한 세무 계산을 단순하게
2. **Progressive Disclosure**: 필요한 정보만 단계별로 표시
3. **Clear Feedback**: 모든 액션에 즉각적인 피드백
4. **Error Prevention**: 입력 검증으로 오류 사전 방지
5. **Accessibility**: 누구나 사용할 수 있는 UI

#### 8.1.2 Visual Design
- **Color Palette:**
  - Primary: Blue (#3B82F6) - 신뢰, 전문성
  - Success: Green (#10B981) - 완료, 긍정
  - Warning: Yellow (#F59E0B) - 주의
  - Error: Red (#EF4444) - 오류, 긴급
  - Neutral: Gray (#6B7280) - 텍스트, 배경

- **Typography:**
  - Heading: 'Pretendard', sans-serif
  - Body: 'Pretendard', sans-serif
  - Monospace: 'Fira Code', monospace (숫자)

- **Spacing:**
  - Base unit: 4px (Tailwind 기본)
  - 일관된 여백 사용

### 8.2 Key Screens

#### 8.2.1 Step 1: 사례 입력
```
┌─────────────────────────────────────────┐
│  [1] 사례 입력  →  [2]  →  [3]  →  [4]  │
├─────────────────────────────────────────┤
│                                         │
│  세무 상담 사례를 입력하세요             │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ 부친께서 5억원 상당의 부동산과      ││
│  │ 3억원의 현금을 보유하고 계십니다.   ││
│  │ 배우자와 자녀 2명이 있으며,         ││
│  │ 상속 시 예상 세금과 절세 방안을     ││
│  │ 알고 싶습니다.                      ││
│  │                                     ││
│  │ [입력 가이드 보기] [예시 불러오기]  ││
│  └────────────────────────────────────┘│
│                                         │
│  AI 도구 선택:                          │
│  ○ Claude     (복잡한 분석 추천)        │
│  ● ChatGPT    (일반 상담)               │
│  ○ Perplexity (최신 세법 확인)          │
│                                         │
│             [다음 단계로 →]             │
└─────────────────────────────────────────┘
```

#### 8.2.2 Step 2: AI 자동 분석
```
┌─────────────────────────────────────────┐
│  [1]  →  [2] AI 분석  →  [3]  →  [4]    │
├─────────────────────────────────────────┤
│                                         │
│  🔄 ChatGPT가 사례를 분석하고 있습니다... │
│                                         │
│  ✓ 프롬프트 생성 완료                    │
│  ✓ API 호출 완료                         │
│  ⏳ 응답 수신 중... (8초)                │
│  ⏳ 데이터 파싱 중...                    │
│                                         │
│  [───────────●───────] 75%              │
│                                         │
│  💡 Tip: 평균 10-15초가 소요됩니다       │
│                                         │
│  [수동 모드로 전환]                     │
└─────────────────────────────────────────┘

↓ 분석 완료 후

┌─────────────────────────────────────────┐
│  ✅ AI 분석 완료! (소요 시간: 10초)       │
├─────────────────────────────────────────┤
│                                         │
│  📊 분석 결과 요약:                      │
│                                         │
│  ▸ 관련 세목: 상속세                    │
│  ▸ 주요 이슈:                           │
│    - 배우자 공제 활용                   │
│    - 자녀 공제 검토                     │
│  ▸ 절세 포인트:                         │
│    - 일괄공제 vs 개별공제 비교 필요     │
│                                         │
│  [상세 보기 ▼]                          │
│                                         │
│             [다음 단계로 →]             │
└─────────────────────────────────────────┘
```

#### 8.2.3 Step 3: 수치 입력
```
┌─────────────────────────────────────────┐
│  [1]  →  [2]  →  [3] 수치 입력  →  [4]  │
├─────────────────────────────────────────┤
│                                         │
│  📝 상속세 계산을 위한 정보를 입력하세요 │
│                                         │
│  상속재산가액 *                          │
│  ┌────────────────────────────────────┐│
│  │ 800,000,000                        ││
│  └────────────────────────────────────┘│
│  💡 시가 기준으로 입력하세요 (단위: 원)  │
│                                         │
│  채무액                                 │
│  ┌────────────────────────────────────┐│
│  │ 100,000,000                        ││
│  └────────────────────────────────────┘│
│  💡 공제 가능한 부채만 입력              │
│                                         │
│  상속인 수 *                            │
│  ┌────────────────────────────────────┐│
│  │ 3 (배우자 1명 + 자녀 2명)           ││
│  └────────────────────────────────────┘│
│                                         │
│  📋 참고사항:                           │
│  • 기초공제: 2억원                      │
│  • 배우자 공제: 5억~30억               │
│  • 자녀 공제: 1인당 5천만원            │
│                                         │
│  [계산하고 다음 단계로 →]               │
└─────────────────────────────────────────┘
```

#### 8.2.4 Step 4: 시나리오 비교
```
┌─────────────────────────────────────────────────────┐
│  [1]  →  [2]  →  [3]  →  [4] 시나리오 비교          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 시나리오 비교 결과         [+ 새 시나리오 추가] │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 시나리오 1: 즉시 상속          [수정] [삭제] │  │
│  ├─────────────────────────────────────────────┤  │
│  │ 과세표준:     3억원                         │  │
│  │ 공제액:       5억원                         │  │
│  │ 산출세액:     2,400만원                     │  │
│  │                                             │  │
│  │ [상세 보기 ▼]                               │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ⭐ 시나리오 2: 배우자 선상속   [수정] [삭제] │  │
│  ├─────────────────────────────────────────────┤  │
│  │ 과세표준:     1억원                         │  │
│  │ 공제액:       7억원                         │  │
│  │ 산출세액:     1,000만원          ← 최적!   │  │
│  │                                             │  │
│  │ 💰 절세 금액: 1,400만원 (58% 절감)         │  │
│  │ [상세 보기 ▼]                               │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📊 전체 비교표:                                   │
│  ┌───────────────┬──────────┬──────────┐          │
│  │ 항목          │ 시나리오1 │ 시나리오2 │          │
│  ├───────────────┼──────────┼──────────┤          │
│  │ 상속세        │ 2,400만  │ 1,000만  │          │
│  │ 증여세        │ -        │ -        │          │
│  │ 합계          │ 2,400만  │ 1,000만  │          │
│  └───────────────┴──────────┴──────────┘          │
│                                                     │
│  [결과 다운로드 (JSON)] [PDF 보고서] [이메일 공유] │
└─────────────────────────────────────────────────────┘
```

### 8.3 Mobile UI

#### 8.3.1 Responsive Breakpoints
- **Mobile (<640px):**
  - 단일 컬럼 레이아웃
  - 풀 너비 입력 필드
  - 스택형 시나리오 카드
- **Tablet (640-1024px):**
  - 2컬럼 레이아웃
  - 사이드바 접기
- **Desktop (>1024px):**
  - 3컬럼 레이아웃
  - 고정 사이드바

#### 8.3.2 Touch Optimization
- 최소 터치 영역: 44x44px
- 제스처 지원: 스와이프, 핀치 줌
- 가상 키보드 최적화

---

## 9. Development Plan

### 9.1 Phases and Milestones

#### Phase 1: MVP (완료) ✅
**Duration:** 2개월
**Status:** Completed

**Milestones:**
- ✅ M1.1: 프로젝트 셋업 및 기본 UI
- ✅ M1.2: 4단계 워크플로우 구현
- ✅ M1.3: AI API 자동 연동
- ✅ M1.4: 상속세/증여세 계산 엔진
- ✅ M1.5: 시나리오 비교 기능
- ✅ M1.6: JSON 다운로드
- ✅ M1.7: 베타 테스트 및 버그 수정

**Deliverables:**
- 작동하는 MVP 애플리케이션
- 사용자 가이드 문서
- API 키 설정 가이드

#### Phase 2: Early Adoption (5개월) 🆕 NODE SYSTEM
**Duration:** 5개월 (기존 3개월 + 노드 시스템 2개월)
**Target:** 2025 Q1-Q2

**Milestones:**

**M2.0: Node System Core (노드 시스템 핵심 - 우선 구현)** 🔥
- **Week 1-2: Data Structures & Graph Engine**
  - IssueNode, SolutionNode, Edge, NodeGraph 클래스 구현
  - 순환 종속성 감지 알고리즘
  - JSON 직렬화/역직렬화
  - Unit tests: 노드 생성, 엣지 추가, 종속성 검증

- **Week 3-4: Optimization Engine**
  - 순열 생성 알고리즘 (Heap's algorithm)
  - 종속성 필터링 로직
  - 상호 배타적 솔루션 필터링
  - 점수 계산 공식 구현
  - Unit tests: 조합 생성 (24개, 72개 케이스)

- **Week 5-6: React Flow Integration**
  - React Flow 11.x 설치 및 설정
  - IssueNodeComponent, SolutionNodeComponent 구현
  - Dagre auto-layout 통합
  - 노드 드래그, 줌, 패닝 기능
  - 미니맵, 배경 그리드

- **Week 7-8: Optimization UI & State Management**
  - Zustand store (useNodeGraphStore) 구현
  - 대안 비교 테이블 컴포넌트
  - 타임라인 차트 (Recharts)
  - 진행 상태 표시 (Progress bar)
  - 실행 순서 선택 인터페이스

- **Week 9: Performance Optimization**
  - Web Workers for permutation generation
  - Memoization with lodash (세금 계산 캐싱)
  - React-window for virtual scrolling (500+ 대안)
  - Progressive loading (50개씩 청크)
  - Performance testing: 10+ 노드 시나리오

- **Week 10: Integration & Testing**
  - 기존 워크플로우와 통합 (Step 2-3 사이에 삽입)
  - AI 프롬프트 엔지니어링 (노드 자동 추출)
  - End-to-end tests: 전체 노드 워크플로우
  - 사용자 시나리오 테스트 (부동산 상속, 주식 증여)

**M2.0 Deliverables:**
- ✅ 완전한 노드 그래프 시스템 (IssueNode, SolutionNode, Edge, NodeGraph)
- ✅ 최적화 엔진 (순열 생성, 종속성 필터링, 점수 계산)
- ✅ React Flow 시각화 (인터랙티브 그래프)
- ✅ 대안 비교 UI (테이블, 타임라인 차트)
- ✅ 성능 최적화 (Web Workers, memoization, virtual scrolling)
- ✅ 테스트 커버리지 >80% (unit + integration)

---

**M2.1: 세법 DB 구축**
- Week 11-12: 세율 테이블 데이터 수집
- Week 13-14: DB 설계 및 구축
- Week 15-16: 자동 업데이트 시스템

**M2.2: 양도소득세 계산 추가**
- Week 17-18: 요구사항 분석
- Week 19-20: 계산 로직 구현
- Week 21-22: UI 통합 및 테스트

**M2.3: PDF 보고서 생성 (노드 그래프 포함)**
- Week 23-24: 템플릿 디자인 (노드 다이어그램 추가)
- Week 25-26: jsPDF 통합 + html2canvas (그래프 이미지)
- Week 27-28: 차트 생성 및 최적화

**M2.4: 100명 베타 사용자 확보**
- 사용자 피드백 수집 (특히 노드 시스템 UX)
- 주간 업데이트 배포

**Deliverables:**
- 🆕 **노드 기반 최적화 시스템** (핵심 차별화 기능)
- 세법 DB 시스템
- 양도소득세 계산 기능
- PDF 보고서 기능 (노드 다이어그램 포함)
- 사용자 피드백 리포트

#### Phase 3: Growth (6개월)
**Duration:** 6개월
**Target:** 2025 Q2-Q3

**Milestones:**
- M3.1: 법인세/소득세 계산 (2개월)
- M3.2: 모바일 앱 개발 (3개월)
  - iOS 앱 (TestFlight 베타)
  - Android 앱 (내부 테스트)
- M3.3: 고객 DB 시스템 (2개월)
  - PostgreSQL 백엔드 구축
  - 사용자 인증 시스템
  - 데이터 마이그레이션
- M3.4: 500명 유료 사용자 확보

**Deliverables:**
- 법인세/소득세 계산 기능
- iOS/Android 앱 베타 버전
- 백엔드 API 서버
- 고객 DB 시스템

#### Phase 4: Scale (1년)
**Duration:** 12개월
**Target:** 2025 Q4 - 2026 Q3

**Milestones:**
- M4.1: 실시간 협업 기능 (3개월)
- M4.2: 전자신고 연동 (4개월)
- M4.3: 파트너십 5개 이상 (지속)
- M4.4: 2,000명 사용자 확보

**Deliverables:**
- 협업 플랫폼
- 전자신고 시스템
- 파트너 통합 API
- 엔터프라이즈 기능

### 9.2 Resource Plan

#### 9.2.1 Team Structure

**Phase 1 (MVP):** ✅ 완료
- 1 Full-stack Developer
- 1 Product Manager
- 1 QA Tester (part-time)

**Phase 2 (Node System + Early Adoption):** 🆕
- **2 Frontend Developers** (1명 노드 시스템 전담)
  - Developer 1: React Flow, Zustand, Optimization UI
  - Developer 2: 세법 DB, 양도세 계산, PDF 리포트
- **1 Algorithm Engineer** (노드 최적화 엔진 전담)
  - 순열 생성, 종속성 필터링, 점수 계산 알고리즘
  - 성능 최적화 (Web Workers, memoization)
- 1 Backend Developer
- 1 Product Manager
- 1 Designer (노드 UX/UI 전담)
- 1 QA Tester

**Phase 3 (Growth):**
- 2 Frontend Developers
- 1 Backend Developer
- 1 Mobile Developer
- 1 Product Manager
- 1 Designer
- 1 QA Tester

**Phase 4 (Scale):**
- 3 Frontend Developers
- 2 Backend Developers
- 2 Mobile Developers
- 1 DevOps Engineer
- 1 Product Manager
- 1 Designer
- 2 QA Testers
- 1 Customer Success Manager

#### 9.2.2 Budget Estimate (연간)

| Category | Phase 1 | Phase 2 (Node System) | Phase 3 | Phase 4 |
|----------|---------|----------------------|---------|---------|
| **Personnel** | ₩100M | ₩350M (+알고리즘 엔지니어) | ₩300M | ₩600M |
| **Infrastructure** | ₩5M | ₩25M (+Web Workers, CDN) | ₩20M | ₩50M |
| **AI API Costs** | ₩10M | ₩40M (+노드 추출) | ₩30M | ₩100M |
| **Libraries** | ₩0 | ₩5M (React Flow, Dagre) | ₩3M | ₩5M |
| **Marketing** | ₩10M | ₩60M (+노드 차별화) | ₩50M | ₩200M |
| **Total** | ₩125M | ₩480M | ₩403M | ₩955M |

**Phase 2 추가 비용 상세:**
- Algorithm Engineer 인건비: +₩50M
- React Flow Pro License (팀): ₩3M
- AI 노드 추출 API 호출량 증가: +₩10M
- CDN & Web Workers 인프라: +₩5M
- 노드 시스템 마케팅 캠페인: +₩10M

### 9.3 Risk Management

#### 9.3.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **AI API 장애** | Medium | High | 다중 AI 지원, 자동 재시도 |
| **계산 오류** | Low | Critical | 철저한 테스트, 전문가 검증 |
| **성능 문제** | Low | Medium | 최적화, CDN 사용 |
| **보안 취약점** | Medium | High | 정기 감사, HTTPS, 암호화 |
| **🆕 노드 조합 폭발** | High | High | 최대 500개 제한, Progressive loading |
| **🆕 최적화 알고리즘 정확도** | Medium | High | 전문가 검증, A/B 테스트 |
| **🆕 React Flow 성능 저하** | Medium | Medium | Virtual rendering, 노드 개수 제한 |
| **🆕 순환 종속성 버그** | Low | Critical | 자동 감지 알고리즘, Unit tests |
| **🆕 Web Worker 호환성** | Low | Medium | Fallback to main thread |

**노드 시스템 특화 위험 관리:**
- **조합 폭발 대응**: 10개 노드 → 3.6M 조합 → 500개로 조기 차단
- **알고리즘 검증**: 세무사 3명 × 10개 시나리오 × 교차 검증
- **성능 모니터링**: Lighthouse CI, Core Web Vitals 추적
- **점진적 롤아웃**: 베타 사용자 10명 → 50명 → 100명

#### 9.3.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **사용자 확보 실패** | Medium | High | 마케팅 강화, 무료 체험 |
| **경쟁 제품 출현** | High | Medium | 차별화 기능, 빠른 혁신 |
| **세법 개정** | High | Medium | 자동 업데이트 시스템 |
| **AI 비용 급등** | Low | Medium | 다중 AI 지원, 비용 최적화 |

#### 9.3.3 Legal Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **세무 대리 규제** | Low | Critical | 명확한 Disclaimer |
| **개인정보 유출** | Low | Critical | 암호화, 최소 수집 |
| **계산 오류 책임** | Medium | High | 보험 가입, 면책 조항 |

---

## 10. Testing Strategy

### 10.1 Testing Levels

#### 10.1.1 Unit Testing
- **Coverage Target:** >80% (노드 시스템 >85%)
- **Framework:** Jest + React Testing Library
- **Scope:**
  - 세금 계산 로직
  - 입력 검증 함수
  - 유틸리티 함수
  - React 컴포넌트
  - 🆕 **노드 시스템 핵심 모듈**

**🆕 Node System Unit Tests:**
```javascript
// NodeGraph.test.js
describe('NodeGraph', () => {
  test('노드 추가 및 엣지 생성', () => {
    const graph = new NodeGraph();
    const issue = new IssueNode({ title: '상속세 과세' });
    const solution = new SolutionNode({ title: '배우자 공제', taxImpact: -150000000 });

    graph.addIssueNode(issue);
    graph.addSolutionNode(solution);
    graph.addEdge(new Edge(issue.id, solution.id, 'SOLVES'));

    expect(graph.issueNodes.size).toBe(1);
    expect(graph.solutionNodes.size).toBe(1);
    expect(graph.edges.size).toBe(1);
  });

  test('순환 종속성 감지', () => {
    const graph = new NodeGraph();
    const sol1 = new SolutionNode({ id: 'sol-1', dependencies: ['sol-2'] });
    const sol2 = new SolutionNode({ id: 'sol-2', dependencies: ['sol-1'] });

    graph.addSolutionNode(sol1);
    graph.addSolutionNode(sol2);

    expect(graph.detectCircularDependency('sol-1')).toBe(true);
  });

  test('JSON 직렬화/역직렬화', () => {
    const graph = new NodeGraph();
    graph.addIssueNode(new IssueNode({ title: 'Test Issue' }));

    const json = graph.toJSON();
    const restored = NodeGraph.fromJSON(json);

    expect(restored.issueNodes.size).toBe(1);
    expect(Array.from(restored.issueNodes.values())[0].title).toBe('Test Issue');
  });
});

// OptimizationEngine.test.js
describe('OptimizationEngine', () => {
  test('순열 생성 - 4개 노드', () => {
    const engine = new OptimizationEngine(new NodeGraph(), mockCalculator);
    const solutions = [
      new SolutionNode({ id: 's1' }),
      new SolutionNode({ id: 's2' }),
      new SolutionNode({ id: 's3' }),
      new SolutionNode({ id: 's4' })
    ];

    const perms = engine.permute(solutions);
    expect(perms.length).toBe(24); // 4! = 24
  });

  test('종속성 필터링', () => {
    const sol1 = new SolutionNode({ id: 's1', dependencies: [] });
    const sol2 = new SolutionNode({ id: 's2', dependencies: ['s1'] });
    const sol3 = new SolutionNode({ id: 's3', dependencies: ['s2'] });

    const validCombo = [sol1, sol2, sol3];
    const invalidCombo = [sol2, sol1, sol3]; // s2 before s1 (invalid)

    expect(engine.validateDependencies(validCombo)).toBe(true);
    expect(engine.validateDependencies(invalidCombo)).toBe(false);
  });

  test('점수 계산 공식', () => {
    const alt = {
      totalSavings: 300000000, // 3억
      estimatedDays: 30,
      complexity: 5,
      risk: 3
    };

    const score = engine.calculateScore(alt);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('최적화 - 상위 3개 추출', async () => {
    const alternatives = await engine.optimize(1000000000, 3);
    expect(alternatives.length).toBeLessThanOrEqual(3);
    expect(alternatives[0].score).toBeGreaterThanOrEqual(alternatives[1].score);
    expect(alternatives[1].score).toBeGreaterThanOrEqual(alternatives[2].score);
  });
});
```

**기존 계산 로직 테스트:**
```javascript
describe('taxCalculator', () => {
  test('상속세 계산 - 기본 시나리오', () => {
    const result = calculateInheritanceTax({
      inheritanceValue: 1000000000,
      debt: 100000000,
      heirs: 3
    });
    expect(result.taxBase).toBe(300000000);
    expect(result.tax).toBe(24000000);
  });
});
```

#### 10.1.2 Integration Testing
- **Scope:**
  - AI API 통합
  - localStorage 저장/로드
  - 워크플로우 단계 전환
  - 시나리오 추가/삭제
  - 🆕 **노드 그래프 시스템 통합**

**🆕 Node System Integration Tests:**
```javascript
// NodeWorkflow.integration.test.jsx
describe('Node Workflow Integration', () => {
  test('전체 노드 워크플로우: 입력 → AI 추출 → 최적화 → 결과', async () => {
    const { getByText, getByLabelText } = render(<TaxWorkflow />);

    // Step 1: 사례 입력
    const input = getByLabelText('상담 사례');
    fireEvent.change(input, { target: { value: mockCaseDescription } });
    fireEvent.click(getByText('다음 단계로'));

    // Step 2: AI가 노드 자동 추출
    await waitFor(() => {
      expect(getByText('Issue-001: 상속세 과세 대상 판정')).toBeInTheDocument();
      expect(getByText('Solution-001: 배우자 공제 적용')).toBeInTheDocument();
    });

    // 노드 그래프 시각화 확인
    expect(screen.queryByTestId('react-flow-graph')).toBeInTheDocument();

    // Step 3: 최적화 실행
    fireEvent.click(getByText('최적화 실행'));

    await waitFor(() => {
      expect(getByText('24가지 실행 순서 조합 생성')).toBeInTheDocument();
    });

    // Step 4: 대안 비교 결과 확인
    await waitFor(() => {
      expect(getByText('추천 1위')).toBeInTheDocument();
      expect(getByText('절세액: 3.2억')).toBeInTheDocument();
    });
  });

  test('노드 수동 편집 및 재최적화', async () => {
    const { getByText, getByTestId } = render(<NodeGraphEditor />);

    // 솔루션 노드 추가
    fireEvent.click(getByText('솔루션 추가'));
    fireEvent.change(getByTestId('solution-title'), {
      target: { value: '신규 공제' }
    });
    fireEvent.click(getByText('저장'));

    // 종속성 추가
    await userEvent.click(getByTestId('add-dependency-btn'));

    // 재최적화
    fireEvent.click(getByText('재최적화'));

    await waitFor(() => {
      expect(getByText(/새로운 조합/)).toBeInTheDocument();
    });
  });

  test('노드 그래프 저장 및 로드', async () => {
    const { getByText } = render(<NodeGraphVisualization />);

    // 그래프 저장
    fireEvent.click(getByText('그래프 저장'));
    await waitFor(() => {
      expect(localStorage.getItem('nodeGraph')).toBeTruthy();
    });

    // 페이지 새로고침 시뮬레이션
    cleanup();
    const { getByTestId } = render(<NodeGraphVisualization />);

    // 자동 로드 확인
    await waitFor(() => {
      expect(getByTestId('node-issue-001')).toBeInTheDocument();
      expect(getByTestId('node-solution-001')).toBeInTheDocument();
    });
  });

  test('성능: 10개 노드 최적화 (500개 조합)', async () => {
    const startTime = performance.now();

    const graph = createMockGraphWith10Nodes();
    const engine = new OptimizationEngine(graph, mockCalculator);
    const alternatives = await engine.optimize(1000000000, 5);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(alternatives.length).toBeLessThanOrEqual(5);
    expect(duration).toBeLessThan(5000); // 5초 이내
  });

  test('Web Worker 최적화 실행', async () => {
    const workerSpy = jest.spyOn(window, 'Worker');

    const { getByText } = render(<OptimizationEngine />);
    fireEvent.click(getByText('최적화 실행'));

    await waitFor(() => {
      expect(workerSpy).toHaveBeenCalled();
    });

    expect(getByText(/진행 중/)).toBeInTheDocument();
  });
});
```

**기존 워크플로우 테스트:**
```javascript
test('AI 분석 플로우', async () => {
  const { getByText, getByRole } = render(<TaxWorkflow />);

  // 1. 사례 입력
  const textarea = getByRole('textbox');
  fireEvent.change(textarea, { target: { value: '상속 사례...' } });

  // 2. AI 선택
  fireEvent.click(getByText('Claude'));

  // 3. 다음 단계
  fireEvent.click(getByText('다음 단계로'));

  // 4. AI 분석 완료 대기
  await waitFor(() => {
    expect(getByText(/분석 완료/)).toBeInTheDocument();
  });
});
```

#### 10.1.3 End-to-End Testing
- **Framework:** Playwright
- **Scope:**
  - 전체 워크플로우 (Step 1 → 4)
  - 여러 시나리오 생성 및 비교
  - JSON 다운로드
  - 에러 복구

**Example:**
```javascript
test('전체 워크플로우', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Step 1: 사례 입력
  await page.fill('textarea', '상속 사례...');
  await page.click('text=Claude');
  await page.click('text=다음 단계로');

  // Step 2: AI 분석 대기
  await page.waitForSelector('text=분석 완료');

  // Step 3: 수치 입력
  await page.fill('input[name="inheritanceValue"]', '1000000000');
  await page.click('text=계산하고 다음 단계로');

  // Step 4: 결과 확인
  await expect(page.locator('text=산출세액')).toBeVisible();

  // JSON 다운로드
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=결과 다운로드')
  ]);
  expect(download.suggestedFilename()).toContain('.json');
});
```

### 10.2 Test Cases

#### 10.2.1 Critical Test Cases

**TC-001: 기본 상속세 계산**
- **Priority:** P0
- **Precondition:** 사용자가 Step 3에 진입
- **Steps:**
  1. 상속재산 10억 입력
  2. 채무 1억 입력
  3. 상속인 3명 입력
  4. 계산 버튼 클릭
- **Expected Result:**
  - 과세표준: 1억원
  - 산출세액: 1천만원
- **Actual Result:** (테스트 실행 시 기록)

**TC-002: AI 자동 분석**
- **Priority:** P0
- **Precondition:** API 키가 설정됨
- **Steps:**
  1. 사례 입력
  2. Claude 선택
  3. 다음 단계 클릭
- **Expected Result:**
  - 15초 이내 분석 완료
  - taxCategories 포함
  - requiredData 포함
- **Actual Result:** (테스트 실행 시 기록)

**TC-003: 시나리오 비교**
- **Priority:** P0
- **Precondition:** 2개 이상의 시나리오 생성
- **Steps:**
  1. 시나리오 1 생성
  2. 시나리오 2 추가
  3. 비교표 확인
- **Expected Result:**
  - 비교표에 2개 시나리오 표시
  - 최적 시나리오 자동 선택
  - 절세 금액 표시
- **Actual Result:** (테스트 실행 시 기록)

#### 10.2.2 Edge Cases

**TC-101: 매우 큰 금액 입력**
- **Input:** 상속재산 1조원
- **Expected:** 계산 성공, 오버플로우 없음

**TC-102: 0원 입력**
- **Input:** 상속재산 0원
- **Expected:** 유효성 검증 오류 표시

**TC-103: API 타임아웃**
- **Setup:** 네트워크 지연 시뮬레이션
- **Expected:** 30초 후 타임아웃, 재시도 제안

**TC-104: 잘못된 JSON 응답**
- **Setup:** 모킹된 잘못된 AI 응답
- **Expected:** 파싱 오류 처리, 수동 모드 제안

### 10.3 Performance Testing

#### 10.3.1 Load Testing
- **Tool:** Artillery, k6
- **Scenarios:**
  - 동시 사용자 100명
  - 초당 10건 AI 호출
  - 1,000개 시나리오 생성 (스트레스 테스트)
- **Success Criteria:**
  - 응답 시간 <2초 (95th percentile)
  - 에러율 <1%

#### 10.3.2 Stress Testing
- **Scenarios:**
  - 시나리오 100개 동시 계산
  - 10MB JSON 파일 다운로드
  - 1시간 연속 사용 (메모리 누수 확인)

### 10.4 Security Testing

#### 10.4.1 OWASP Top 10 Testing
- XSS (Cross-Site Scripting)
- SQL Injection (향후 백엔드)
- CSRF (향후 인증)
- 민감 데이터 노출

#### 10.4.2 Penetration Testing
- API 키 추출 시도
- localStorage 암호화 검증
- HTTPS 강제 확인

---

## 11. Deployment and Operations

### 11.1 Deployment Strategy

#### 11.1.1 Environment Setup
| Environment | Purpose | URL |
|-------------|---------|-----|
| **Development** | 개발 및 테스트 | http://localhost:3000 |
| **Staging** | QA 및 UAT | https://staging.taxworkflow.com |
| **Production** | 실제 서비스 | https://taxworkflow.com |

#### 11.1.2 CI/CD Pipeline
```
┌──────────────────────────────────────────┐
│ 1. Code Commit (GitHub)                  │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│ 2. Automated Tests (GitHub Actions)      │
│    - Lint (ESLint)                       │
│    - Unit Tests (Jest)                   │
│    - Build Test                          │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│ 3. Build (Create React App)              │
│    - npm run build                       │
│    - Optimize bundle size                │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│ 4. Deploy (Vercel / Netlify)             │
│    - Preview deployment (PR)             │
│    - Production deployment (main branch) │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│ 5. Post-deployment Tests                 │
│    - Smoke tests                         │
│    - Performance check                   │
└──────────────────────────────────────────┘
```

#### 11.1.3 Deployment Checklist
- [ ] 모든 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] CHANGELOG 업데이트
- [ ] 환경 변수 설정 확인
- [ ] 백업 완료 (향후)
- [ ] 롤백 계획 준비
- [ ] 모니터링 대시보드 확인
- [ ] 사용자 공지 (주요 업데이트)

### 11.2 Monitoring and Logging

#### 11.2.1 Application Monitoring
- **Tool:** Google Analytics, Mixpanel
- **Metrics:**
  - Page views
  - User sessions
  - Feature usage
  - Conversion funnel

#### 11.2.2 Performance Monitoring
- **Tool:** Lighthouse, Web Vitals
- **Metrics:**
  - LCP (Largest Contentful Paint) <2.5s
  - FID (First Input Delay) <100ms
  - CLS (Cumulative Layout Shift) <0.1

#### 11.2.3 Error Tracking
- **Tool:** Sentry (향후)
- **Capture:**
  - JavaScript errors
  - API failures
  - User context
  - Stack traces

#### 11.2.4 Log Aggregation (향후)
- **Tool:** ELK Stack, CloudWatch
- **Logs:**
  - Application logs
  - Access logs
  - Error logs
  - Audit logs

### 11.3 Maintenance

#### 11.3.1 Regular Maintenance
- **Daily:**
  - 모니터링 대시보드 확인
  - 에러 로그 검토
- **Weekly:**
  - 성능 리포트 검토
  - 사용자 피드백 분석
  - 의존성 업데이트 확인
- **Monthly:**
  - 세법 업데이트 확인
  - 보안 패치 적용
  - 백업 검증 (향후)

#### 11.3.2 Incident Response
- **P0 (Critical):**
  - 서비스 완전 중단
  - 데이터 손실
  - **Response Time:** 15분 이내
  - **Resolution Time:** 1시간 이내

- **P1 (High):**
  - 주요 기능 장애
  - 성능 저하 (>50%)
  - **Response Time:** 1시간 이내
  - **Resolution Time:** 4시간 이내

- **P2 (Medium):**
  - 부분 기능 장애
  - 경미한 버그
  - **Response Time:** 4시간 이내
  - **Resolution Time:** 1일 이내

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|------------|
| **과세표준** | 세금을 계산하기 위한 기준 금액 (재산 - 공제) |
| **누진세율** | 과세표준이 높아질수록 높은 세율이 적용되는 세율 체계 |
| **누진공제** | 누진세율 계산 시 세액을 조정하기 위한 공제액 |
| **기초공제** | 모든 상속인에게 기본적으로 제공되는 공제 (2억) |
| **일괄공제** | 기초공제와 인적공제를 합산하여 최소 5억 보장 |
| **10년 합산** | 증여세는 10년간 받은 증여를 합산하여 계산 |

### 12.2 References

#### 12.2.1 Legal References
- 상속세 및 증여세법
- 소득세법
- 법인세법
- 국세기본법

#### 12.2.2 Technical References
- React 공식 문서: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Claude API: https://docs.anthropic.com
- OpenAI API: https://platform.openai.com
- Perplexity: https://www.perplexity.ai

### 12.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-10-17 | Initial PRD creation | Product Team |

---

## 13. Approval

### 13.1 Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Manager** | | | |
| **Engineering Lead** | | | |
| **Design Lead** | | | |
| **QA Lead** | | | |
| **Business Stakeholder** | | | |

### 13.2 Review History

| Reviewer | Date | Comments | Status |
|----------|------|----------|--------|
| | | | |

---

**Document End**

© 2024 Tax Consulting Workflow Team. All rights reserved.
