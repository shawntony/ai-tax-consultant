# Product Requirements Document (PRD)
## 세무 컨설팅 자동화 워크플로우

---

## 📋 Document Information

| 항목 | 내용 |
|------|------|
| **프로젝트명** | AI Tax Consulting Automation Workflow |
| **버전** | 1.0.0 |
| **작성일** | 2024-10-17 |
| **문서 상태** | Approved |
| **담당자** | Product Team |
| **최종 수정일** | 2024-10-17 |

---

## 1. Executive Summary

### 1.1 프로젝트 개요
세무 컨설팅 자동화 워크플로우는 AI 기술을 활용하여 상속세, 증여세, 양도소득세, 법인세, 소득세 관련 세무 상담을 체계적으로 처리하고, 여러 시나리오를 비교 분석할 수 있는 통합 솔루션입니다.

### 1.2 비즈니스 목표
- **효율성 향상**: 세무 분석 시간 90% 단축 (2분 → 10초)
- **품질 개선**: AI 기반 정확한 세무 분석 제공
- **고객 만족**: 다양한 시나리오 비교를 통한 최적 절세 방안 제시
- **비용 절감**: 반복 작업 자동화를 통한 운영 비용 절감

### 1.3 핵심 가치 제안
- **완전 자동화**: API 키만 설정하면 원클릭으로 AI 분석 완료
- **멀티 AI 지원**: Claude, ChatGPT, Perplexity 3개 AI 엔진 선택 가능
- **실시간 계산**: 여러 시나리오 동시 계산 및 비교
- **데이터 관리**: JSON 형식으로 결과 저장 및 재사용

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

#### Use Case 1: 부동산 상속 상담
**Actor:** 세무사
**Goal:** 10억원 부동산 상속 시 세금 계산 및 절세 방안 제시

**Preconditions:**
- 사용자가 로그인되어 있음
- API 키가 설정되어 있음

**Main Flow:**
1. 세무사가 "부동산 10억, 현금 2억, 배우자+자녀2명" 입력
2. Claude AI 선택
3. 시스템이 자동으로 AI 분석 수행 (10초)
4. AI가 상속세 관련 이슈 및 필요 데이터 추출
5. 세무사가 구체적인 수치 입력 (상속재산 12억, 채무 1억)
6. 시스템이 상속세 자동 계산 (과세표준, 공제액, 산출세액)
7. 세무사가 다른 시나리오 추가 (배우자 선상속, 사전증여 등)
8. 시스템이 모든 시나리오 비교표 제공
9. 세무사가 최적 시나리오 선택 및 JSON 다운로드

**Postconditions:**
- 계산 결과가 JSON 파일로 저장됨
- 고객 상담 자료로 활용 가능

**Alternative Flows:**
- 3a. API 호출 실패 → 자동 재시도 → 수동 모드 제안
- 6a. 계산 오류 발견 → 입력값 수정 → 재계산

#### Use Case 2: 주식 증여 시뮬레이션
**Actor:** 기업 경리팀
**Goal:** 법인 주식 증여 시 세금 사전 계산

**Main Flow:**
1. 경리팀장이 "법인 주식 5억 증여 예정" 입력
2. Perplexity 선택 (최신 주식 평가 기준 확인)
3. AI가 주식 평가 방법 및 증여세 계산 방법 제시
4. 팀장이 주식 평가액 및 증여자 관계 입력
5. 여러 지분 비율로 시나리오 생성 (10%, 20%, 30%)
6. 각 시나리오별 증여세 비교
7. 최적 지분 비율 확인
8. 결과를 세무사에게 공유

**Postconditions:**
- 사전 시뮬레이션 완료
- 세무사 상담 준비 자료 확보

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

#### 5.1.2 AI 자동 분석 (Step 2)

**FR-2.1: 프롬프트 자동 생성**
- **Priority:** P0 (Critical)
- **Description:** 입력 사례를 기반으로 AI별 최적 프롬프트 생성
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

### 7.3 Technology Stack

#### 7.3.1 Frontend
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
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

#### Phase 2: Early Adoption (3개월)
**Duration:** 3개월
**Target:** 2025 Q1

**Milestones:**
- M2.1: 세법 DB 구축
  - Week 1-2: 세율 테이블 데이터 수집
  - Week 3-4: DB 설계 및 구축
  - Week 5-6: 자동 업데이트 시스템
- M2.2: 양도소득세 계산 추가
  - Week 1-2: 요구사항 분석
  - Week 3-4: 계산 로직 구현
  - Week 5-6: UI 통합 및 테스트
- M2.3: PDF 보고서 생성
  - Week 1-2: 템플릿 디자인
  - Week 3-4: jsPDF 통합
  - Week 5-6: 차트 생성 및 최적화
- M2.4: 100명 베타 사용자 확보
  - 사용자 피드백 수집
  - 주간 업데이트 배포

**Deliverables:**
- 세법 DB 시스템
- 양도소득세 계산 기능
- PDF 보고서 기능
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

**Phase 1 (MVP):**
- 1 Full-stack Developer
- 1 Product Manager
- 1 QA Tester (part-time)

**Phase 2-3 (Growth):**
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

| Category | Phase 1 | Phase 2-3 | Phase 4 |
|----------|---------|-----------|---------|
| **Personnel** | ₩100M | ₩300M | ₩600M |
| **Infrastructure** | ₩5M | ₩20M | ₩50M |
| **AI API Costs** | ₩10M | ₩30M | ₩100M |
| **Marketing** | ₩10M | ₩50M | ₩200M |
| **Total** | ₩125M | ₩400M | ₩950M |

### 9.3 Risk Management

#### 9.3.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **AI API 장애** | Medium | High | 다중 AI 지원, 자동 재시도 |
| **계산 오류** | Low | Critical | 철저한 테스트, 전문가 검증 |
| **성능 문제** | Low | Medium | 최적화, CDN 사용 |
| **보안 취약점** | Medium | High | 정기 감사, HTTPS, 암호화 |

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
- **Coverage Target:** >80%
- **Framework:** Jest + React Testing Library
- **Scope:**
  - 세금 계산 로직
  - 입력 검증 함수
  - 유틸리티 함수
  - React 컴포넌트

**Example:**
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

**Example:**
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
