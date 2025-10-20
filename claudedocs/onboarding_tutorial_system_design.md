# 온보딩 튜토리얼 시스템 설계
# Onboarding Tutorial System Design

**작성일**: 2025-10-18
**버전**: 1.0.0
**작성자**: AI Tax Consultant Development Team
**관련 작업**: M2.4.4.1, M2.4.4.2, M2.4.4.3

---

## 📋 목차 (Table of Contents)

1. [개요 (Overview)](#개요-overview)
2. [라이브러리 선정 (Library Selection)](#라이브러리-선정-library-selection)
3. [4단계 워크플로우 설계 (4-Step Workflow Design)](#4단계-워크플로우-설계-4-step-workflow-design)
4. [상태 관리 시스템 (State Management)](#상태-관리-시스템-state-management)
5. [UI/UX 설계 (UI/UX Design)](#uiux-설계-uiux-design)
6. [구현 계획 (Implementation Plan)](#구현-계획-implementation-plan)
7. [테스트 전략 (Testing Strategy)](#테스트-전략-testing-strategy)

---

## 개요 (Overview)

### 목적 (Purpose)
신규 사용자가 AI Tax Consultant 애플리케이션의 핵심 기능을 빠르게 이해하고 활용할 수 있도록 안내하는 인터랙티브 온보딩 튜토리얼 시스템 구축

### 핵심 요구사항 (Key Requirements)
1. **사용자 친화성**: 복잡한 세금 계산 프로세스를 단계별로 쉽게 안내
2. **가치 중심**: 기능 나열이 아닌 사용자의 "Aha Moment" 달성에 집중
3. **비침습적**: 원하지 않는 사용자는 쉽게 건너뛸 수 있음
4. **진행 상태 저장**: 중단 후 재시작 가능
5. **반응형**: 모바일/태블릿/데스크톱 모든 환경 지원

### 설계 원칙 (Design Principles)

```yaml
principles:
  value_first:
    - "어떻게 세금을 계산하는가" (How) 보다 "왜 이 앱을 사용하는가" (Why) 먼저
    - 사용자의 문제 → 해결 방법 → 가치 제공 순서
    - 3분 내에 첫 세금 계산 완료 경험 제공

  progressive_disclosure:
    - 한 번에 하나의 개념만 소개
    - 단계별로 점진적 복잡도 증가
    - 고급 기능은 기본 사용 후 별도 안내

  user_control:
    - 언제든 건너뛰기 가능
    - 재시작 옵션 제공
    - 진행 상태 시각화

  accessibility:
    - 키보드 네비게이션 지원
    - 스크린 리더 호환
    - WCAG 2.1 AA 준수
```

---

## 라이브러리 선정 (Library Selection)

### 후보 라이브러리 비교

| 항목 | Driver.js | Intro.js | Shepherd.js |
|------|-----------|----------|-------------|
| **크기** | ~5KB gzipped | ~10KB minified | ~12KB+ |
| **의존성** | 없음 (Zero) | 없음 (Zero) | Popper.js 필요 |
| **TypeScript** | ✅ Native | ❌ 별도 타입 | ✅ 지원 |
| **React 통합** | 🟡 Wrapper 필요 | 🟡 Wrapper 필요 | ✅ react-shepherd |
| **커스터마이징** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **접근성** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **성능** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **유지보수** | ✅ 활발 (3개월 전) | ✅ 활발 | ✅ 활발 |
| **사용 사례** | Tour + Focus + Help | Tour + Hints | Complex Tours |
| **학습 곡선** | 낮음 | 낮음 | 중간 |
| **라이센스** | MIT | AGPL (상업용 별도) | MIT |

### 선정 결과: **Driver.js** ✅

**선정 근거**:

1. **경량성** (5KB gzipped)
   - Intro.js 대비 50% 더 가벼움
   - 모바일 환경에서 빠른 로딩
   - 번들 크기 최소화

2. **TypeScript Native**
   - 프로젝트가 TypeScript 기반
   - 타입 안전성 보장
   - IDE 자동완성 지원

3. **상업용 라이센스 이슈 없음**
   - MIT 라이센스 (Intro.js는 AGPL → 상업용 별도 구매 필요)
   - 무료로 상업적 사용 가능

4. **다양한 사용 사례**
   - Tour 외에 contextual help, focus shifting 가능
   - 향후 확장성 높음

5. **활발한 유지보수**
   - 2024년 최근 업데이트 (3개월 전)
   - GitHub Stars 20K+, 활발한 커뮤니티

**Trade-offs (고려사항)**:
- ❌ React 네이티브 지원 없음 → Wrapper 컴포넌트 직접 구현 필요
- ✅ 단순한 API로 Wrapper 구현 용이

---

## 4단계 워크플로우 설계 (4-Step Workflow Design)

### 워크플로우 개요

```
사용자 진입
    ↓
[환영 화면] → [Step 1: 세금 유형 선택] → [Step 2: 정보 입력] →
[Step 3: AI 분석] → [Step 4: 결과 확인] → 완료
    ↑                                            ↓
    └────────────── [다시 보기] ←───────────────┘
```

### Step 0: 환영 화면 (Welcome Modal)

```
┌─────────────────────────────────────────────────────┐
│              🎉 AI Tax Consultant에 오신 것을 환영합니다!           │
│                                                     │
│  AI 기반 세금 계산으로 복잡한 세금 문제를                    │
│  3분 안에 해결하세요                                   │
│                                                     │
│  📊 상속세 · 증여세 · 양도소득세 자동 계산                  │
│  🤖 AI 상담사가 최적의 절세 전략 제안                      │
│  📄 전문가 수준의 PDF 보고서 생성                        │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ 튜토리얼 시작    │  │   건너뛰기      │              │
│  └──────────────┘  └──────────────┘              │
│                                                     │
│  [ ] 다시 보지 않기                                   │
└─────────────────────────────────────────────────────┘
```

**설계 요소**:
- **제목**: 명확한 환영 메시지
- **가치 제안**: 3가지 핵심 기능 강조
- **행동 유도**: "튜토리얼 시작" (Primary CTA), "건너뛰기" (Secondary)
- **사용자 선택권**: "다시 보지 않기" 체크박스

**구현 코드 예시**:
```jsx
function WelcomeModal({ onStart, onSkip }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('tutorial_completed', 'true')
    }
    onStart()
  }

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('tutorial_skipped', 'true')
    }
    onSkip()
  }

  return (
    <Modal>
      <ModalHeader>
        <h2>🎉 AI Tax Consultant에 오신 것을 환영합니다!</h2>
      </ModalHeader>
      <ModalBody>
        <p>AI 기반 세금 계산으로 복잡한 세금 문제를 3분 안에 해결하세요</p>
        <ul>
          <li>📊 상속세 · 증여세 · 양도소득세 자동 계산</li>
          <li>🤖 AI 상담사가 최적의 절세 전략 제안</li>
          <li>📄 전문가 수준의 PDF 보고서 생성</li>
        </ul>
      </ModalBody>
      <ModalFooter>
        <Checkbox
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
        >
          다시 보지 않기
        </Checkbox>
        <Button variant="outline" onClick={handleSkip}>건너뛰기</Button>
        <Button onClick={handleStart}>튜토리얼 시작</Button>
      </ModalFooter>
    </Modal>
  )
}
```

---

### Step 1: 세금 유형 선택 (Tax Type Selection)

**목표**: 사용자가 계산하려는 세금 유형을 선택하도록 안내

**Driver.js 하이라이트 요소**:
```html
<!-- Tax type selector -->
<div id="tutorial-tax-type-selector" data-tour-step="1">
  <h3>어떤 세금을 계산하시겠어요?</h3>
  <div className="tax-type-cards">
    <TaxTypeCard type="inheritance" />
    <TaxTypeCard type="gift" />
    <TaxTypeCard type="capitalGains" />
  </div>
</div>
```

**튜토리얼 스크립트**:
```javascript
{
  element: '#tutorial-tax-type-selector',
  popover: {
    title: '1단계: 세금 유형 선택',
    description: `
      <p><strong>상속세</strong>: 부모님으로부터 재산을 물려받은 경우</p>
      <p><strong>증여세</strong>: 부모님이나 타인으로부터 재산을 증여받은 경우</p>
      <p><strong>양도소득세</strong>: 부동산이나 주식을 매도한 경우</p>
      <br>
      <p>💡 <em>예시로 상속세를 선택해볼까요?</em></p>
    `,
    side: 'bottom',
    align: 'center',
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: '다음',
    prevBtnText: '이전',
    doneBtnText: '완료'
  },
  onHighlightStarted: () => {
    // Scroll to element
    document.getElementById('tutorial-tax-type-selector')
      .scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
  onDeselected: () => {
    // Auto-select inheritance tax for demo
    if (!selectedTaxType) {
      setSelectedTaxType('inheritance')
    }
  }
}
```

**시각적 디자인**:
```
┌──────────────────────────────────────────────┐
│  [Highlighted with Driver.js overlay]       │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 💰       │  │ 🎁       │  │ 🏠       │ │
│  │ 상속세    │  │ 증여세    │  │ 양도소득세 │ │
│  │          │  │          │  │          │ │
│  │ 자세히 보기│  │ 자세히 보기│  │ 자세히 보기│ │
│  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────┘
                    ↓
        ┌─────────────────────────┐
        │ 1단계: 세금 유형 선택       │
        │                         │
        │ 상속세: 부모님으로부터...   │
        │ 증여세: 부모님이나...      │
        │ 양도소득세: 부동산이나...   │
        │                         │
        │ 💡 예시로 상속세를...     │
        │                         │
        │  [이전]  [다음]  [×]   │
        └─────────────────────────┘
```

---

### Step 2: 정보 입력 (Information Input)

**목표**: 세금 계산에 필요한 정보를 입력하는 방법 안내

**Driver.js 하이라이트 요소**:
```html
<!-- Tax amount input -->
<div id="tutorial-tax-amount-input" data-tour-step="2">
  <label>상속 재산 총액</label>
  <Input
    type="number"
    placeholder="예: 500000000"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />
  <p className="help-text">단위: 원 (예: 5억원 = 500,000,000)</p>
</div>

<!-- Deduction selector -->
<div id="tutorial-deduction-selector" data-tour-step="2b">
  <h4>적용 가능한 공제 선택</h4>
  <DeductionCheckboxGroup
    taxType="inheritance"
    onSelect={handleDeductionSelect}
  />
</div>
```

**튜토리얼 스크립트**:
```javascript
[
  {
    element: '#tutorial-tax-amount-input',
    popover: {
      title: '2단계: 재산 금액 입력',
      description: `
        <p>상속받은 총 재산 가액을 입력해주세요.</p>
        <p><strong>💡 Tip:</strong> 정확한 금액을 모르시면 대략적인 금액으로 입력하셔도 됩니다.</p>
        <br>
        <p><em>예시: 5억원 (500,000,000원)을 입력해볼까요?</em></p>
      `,
      side: 'right',
      align: 'start'
    },
    onHighlightStarted: () => {
      // Auto-fill example amount
      if (!amount) {
        setAmount('500000000')
      }
    }
  },
  {
    element: '#tutorial-deduction-selector',
    popover: {
      title: '2단계: 공제 항목 선택',
      description: `
        <p>적용 가능한 공제 항목을 선택하면 세금이 줄어듭니다.</p>
        <ul>
          <li>✅ <strong>배우자 공제</strong>: 최대 30억원</li>
          <li>✅ <strong>자녀 공제</strong>: 1인당 5천만원</li>
          <li>✅ <strong>기초 공제</strong>: 2억원</li>
        </ul>
        <p><em>예시로 배우자 공제와 자녀 1명 공제를 선택해볼까요?</em></p>
      `,
      side: 'left',
      align: 'center'
    },
    onHighlightStarted: () => {
      // Auto-select common deductions
      if (deductions.length === 0) {
        setDeductions(['spouse', 'child_1'])
      }
    }
  }
]
```

**폼 검증 피드백**:
```jsx
// Real-time validation with friendly messages
function TaxAmountInput() {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(null)

  const validateAmount = (value) => {
    if (!value) {
      setError('금액을 입력해주세요')
      return false
    }
    if (value < 0) {
      setError('0원 이상을 입력해주세요')
      return false
    }
    if (value > 100000000000) { // 1000억 초과
      setError('1000억원 이하로 입력해주세요')
      return false
    }
    setError(null)
    return true
  }

  return (
    <FormField>
      <Label>상속 재산 총액</Label>
      <Input
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value)
          validateAmount(e.target.value)
        }}
        className={error ? 'error' : ''}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <HelpText>단위: 원 (예: 5억원 = 500,000,000)</HelpText>
    </FormField>
  )
}
```

---

### Step 3: AI 분석 (AI Analysis)

**목표**: AI가 세금을 계산하고 분석하는 과정 이해

**Driver.js 하이라이트 요소**:
```html
<!-- Calculate button -->
<div id="tutorial-calculate-button" data-tour-step="3">
  <Button
    onClick={handleCalculate}
    disabled={!isValid}
    loading={isCalculating}
  >
    {isCalculating ? 'AI 분석 중...' : '세금 계산하기'}
  </Button>
</div>

<!-- AI analysis progress -->
<div id="tutorial-ai-progress" data-tour-step="3b" style={{ display: isCalculating ? 'block' : 'none' }}>
  <ProgressBar value={progress} />
  <p>{aiStatusMessage}</p>
</div>
```

**튜토리얼 스크립트**:
```javascript
[
  {
    element: '#tutorial-calculate-button',
    popover: {
      title: '3단계: AI 세금 분석',
      description: `
        <p>모든 정보를 입력하셨나요? 이제 AI가 자동으로:</p>
        <ul>
          <li>✅ 세율 자동 계산</li>
          <li>✅ 공제 항목 최적화</li>
          <li>✅ 절세 전략 분석</li>
          <li>✅ 상세 보고서 생성</li>
        </ul>
        <p><strong>💡 버튼을 클릭하면 AI 분석이 시작됩니다.</strong></p>
      `,
      side: 'top',
      align: 'center'
    },
    onHighlightStarted: () => {
      // Ensure form is valid
      if (!isValid) {
        validateForm()
      }
    }
  },
  {
    element: '#tutorial-ai-progress',
    popover: {
      title: 'AI가 분석 중입니다...',
      description: `
        <p>AI가 다음 작업을 수행하고 있습니다:</p>
        <ol>
          <li>세법 데이터베이스 조회</li>
          <li>적용 가능한 세율 계산</li>
          <li>공제 항목 검증</li>
          <li>최적 절세 방안 탐색</li>
        </ol>
        <p><em>보통 2-3초 정도 소요됩니다.</em></p>
      `,
      side: 'bottom',
      align: 'center',
      showButtons: [] // No buttons during processing
    },
    onHighlighted: () => {
      // Simulate AI processing
      simulateAIProcessing()
    }
  }
]
```

**AI 분석 진행 시뮬레이션**:
```javascript
function simulateAIProcessing() {
  const steps = [
    { progress: 25, message: '세법 데이터베이스 조회 중...' },
    { progress: 50, message: '세율 계산 중...' },
    { progress: 75, message: '공제 항목 검증 중...' },
    { progress: 100, message: '분석 완료!' }
  ]

  let currentStep = 0
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      setProgress(steps[currentStep].progress)
      setAiStatusMessage(steps[currentStep].message)
      currentStep++
    } else {
      clearInterval(interval)
      onAnalysisComplete()
    }
  }, 800)
}
```

---

### Step 4: 결과 확인 (Results Review)

**목표**: 계산 결과를 이해하고 활용하는 방법 안내

**Driver.js 하이라이트 요소**:
```html
<!-- Tax result summary -->
<div id="tutorial-result-summary" data-tour-step="4">
  <ResultCard>
    <h3>예상 상속세</h3>
    <div className="amount-large">₩ {formatCurrency(calculatedTax)}</div>
    <div className="breakdown">
      <span>과세 표준: ₩{formatCurrency(taxBase)}</span>
      <span>적용 세율: {taxRate}%</span>
    </div>
  </ResultCard>
</div>

<!-- AI recommendations -->
<div id="tutorial-ai-recommendations" data-tour-step="4b">
  <h4>💡 AI 절세 추천</h4>
  <RecommendationList recommendations={aiRecommendations} />
</div>

<!-- PDF export -->
<div id="tutorial-pdf-export" data-tour-step="4c">
  <Button onClick={handleExportPDF}>
    📄 PDF 보고서 다운로드
  </Button>
</div>
```

**튜토리얼 스크립트**:
```javascript
[
  {
    element: '#tutorial-result-summary',
    popover: {
      title: '4단계: 계산 결과 확인',
      description: `
        <p>✅ 계산이 완료되었습니다!</p>
        <p><strong>예상 상속세</strong>는 입력하신 정보를 바탕으로 계산된 금액입니다.</p>
        <ul>
          <li><strong>과세 표준</strong>: 총 재산 - 공제 금액</li>
          <li><strong>적용 세율</strong>: 과세 표준 구간별 세율</li>
        </ul>
        <p><em>💡 자세한 계산 과정은 아래에서 확인하실 수 있습니다.</em></p>
      `,
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#tutorial-ai-recommendations',
    popover: {
      title: 'AI 절세 추천',
      description: `
        <p>AI가 분석한 결과, 다음 방법으로 세금을 줄일 수 있습니다:</p>
        <ul>
          <li>🎯 추가 공제 항목 활용</li>
          <li>📅 증여 시기 조정</li>
          <li>🏠 부동산 평가 방법 변경</li>
        </ul>
        <p><strong>각 항목을 클릭하면 자세한 설명을 볼 수 있습니다.</strong></p>
      `,
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#tutorial-pdf-export',
    popover: {
      title: 'PDF 보고서 다운로드',
      description: `
        <p>계산 결과를 전문가 수준의 PDF 보고서로 다운로드할 수 있습니다.</p>
        <p><strong>보고서 내용:</strong></p>
        <ul>
          <li>📊 세금 계산 상세 내역</li>
          <li>📈 단계별 계산 과정</li>
          <li>💡 AI 절세 전략 제안</li>
          <li>📋 참고 법령 및 근거</li>
        </ul>
        <p><em>💡 보고서는 세무 상담 시 활용하실 수 있습니다.</em></p>
      `,
      side: 'top',
      align: 'center'
    }
  }
]
```

**결과 화면 애니메이션**:
```jsx
function ResultsSummary({ data }) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Animate numbers counting up
    animateValue(0, data.calculatedTax, 1500)
    setTimeout(() => setIsAnimating(false), 1500)
  }, [data])

  return (
    <ResultCard className={isAnimating ? 'animating' : ''}>
      <h3>예상 상속세</h3>
      <div className="amount-large">
        <CountUp
          end={data.calculatedTax}
          duration={1.5}
          separator=","
          prefix="₩ "
        />
      </div>
      {/* ... */}
    </ResultCard>
  )
}
```

---

### Step 5: 완료 및 다음 단계 (Completion & Next Steps)

**튜토리얼 완료 화면**:
```
┌─────────────────────────────────────────────────────┐
│              🎉 튜토리얼 완료!                           │
│                                                     │
│  축하합니다! AI Tax Consultant 사용법을 익히셨습니다.         │
│                                                     │
│  이제 다음 기능들을 자유롭게 사용해보세요:                    │
│                                                     │
│  ✅ 증여세 · 양도소득세 계산                             │
│  ✅ 여러 시나리오 비교                                   │
│  ✅ 과거 계산 기록 조회                                 │
│  ✅ AI 상담사에게 질문하기                               │
│                                                     │
│  💡 도움이 더 필요하시면 우측 상단의 "도움말"을 클릭하세요.         │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ 다시 보기      │  │   시작하기      │              │
│  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────┘
```

**완료 후 액션**:
```javascript
function CompletionModal({ onRestart, onStart }) {
  const handleComplete = () => {
    // Save completion status
    localStorage.setItem('tutorial_completed', 'true')
    localStorage.setItem('tutorial_completion_date', new Date().toISOString())

    // Track analytics
    trackEvent('tutorial_completed', {
      duration: calculateTutorialDuration(),
      steps_completed: 4
    })

    // Close tutorial and start app
    onStart()
  }

  return (
    <Modal>
      <ModalHeader>
        <h2>🎉 튜토리얼 완료!</h2>
      </ModalHeader>
      <ModalBody>
        <p>축하합니다! AI Tax Consultant 사용법을 익히셨습니다.</p>
        <h4>이제 다음 기능들을 자유롭게 사용해보세요:</h4>
        <ul>
          <li>✅ 증여세 · 양도소득세 계산</li>
          <li>✅ 여러 시나리오 비교</li>
          <li>✅ 과거 계산 기록 조회</li>
          <li>✅ AI 상담사에게 질문하기</li>
        </ul>
        <p>💡 도움이 더 필요하시면 우측 상단의 "도움말"을 클릭하세요.</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onRestart}>다시 보기</Button>
        <Button onClick={handleComplete}>시작하기</Button>
      </ModalFooter>
    </Modal>
  )
}
```

---

## 상태 관리 시스템 (State Management)

### 튜토리얼 상태 데이터 구조

```typescript
interface TutorialState {
  // 기본 상태
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  currentStep: number
  totalSteps: number

  // 진행 추적
  completedSteps: number[]
  lastVisitedStep: number
  startedAt: string | null
  completedAt: string | null

  // 사용자 선택
  dontShowAgain: boolean
  autoSkipped: boolean // 3회 이상 건너뛴 경우

  // 메타데이터
  tutorialVersion: string // '1.0.0'
  deviceType: 'mobile' | 'tablet' | 'desktop'
  sessionId: string
}
```

### 첫 방문 감지 로직

```javascript
// src/hooks/useTutorial.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTutorialStore = create(
  persist(
    (set, get) => ({
      // Initial state
      status: 'not_started',
      currentStep: 0,
      totalSteps: 4,
      completedSteps: [],
      lastVisitedStep: 0,
      startedAt: null,
      completedAt: null,
      dontShowAgain: false,
      autoSkipped: false,
      tutorialVersion: '1.0.0',
      deviceType: null,
      sessionId: null,

      // Actions
      initTutorial: () => {
        const state = get()

        // Generate session ID
        const sessionId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Detect device type
        const deviceType = getDeviceType()

        set({
          sessionId,
          deviceType,
          status: 'in_progress',
          startedAt: new Date().toISOString()
        })
      },

      goToStep: (stepNumber) => {
        set(state => ({
          currentStep: stepNumber,
          lastVisitedStep: Math.max(state.lastVisitedStep, stepNumber)
        }))
      },

      completeStep: (stepNumber) => {
        set(state => ({
          completedSteps: [...new Set([...state.completedSteps, stepNumber])]
        }))
      },

      completeTutorial: () => {
        set({
          status: 'completed',
          completedAt: new Date().toISOString()
        })
      },

      skipTutorial: () => {
        set(state => {
          const skipCount = parseInt(localStorage.getItem('tutorial_skip_count') || '0') + 1
          localStorage.setItem('tutorial_skip_count', skipCount.toString())

          return {
            status: 'skipped',
            autoSkipped: skipCount >= 3 // 3회 이상 건너뛰면 자동으로 숨김
          }
        })
      },

      resetTutorial: () => {
        set({
          status: 'not_started',
          currentStep: 0,
          completedSteps: [],
          lastVisitedStep: 0,
          startedAt: null,
          completedAt: null,
          sessionId: null
        })
      }
    }),
    {
      name: 'tutorial-storage',
      version: 1,
      migrate: (persistedState, version) => {
        // Handle version migrations
        if (version === 0) {
          // Migrate from old format
          return {
            ...persistedState,
            tutorialVersion: '1.0.0'
          }
        }
        return persistedState
      }
    }
  )
)

// Helper function
function getDeviceType() {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}
```

### 첫 방문자 자동 감지

```javascript
// src/components/TutorialManager.jsx
import { useEffect } from 'react'
import { useTutorialStore } from '@/hooks/useTutorial'
import { useAuth } from '@/hooks/useAuth'

export function TutorialManager() {
  const { user } = useAuth()
  const tutorialStore = useTutorialStore()

  useEffect(() => {
    // Check if user is first-time visitor
    const shouldShowTutorial = checkIfShouldShowTutorial()

    if (shouldShowTutorial) {
      // Small delay to let app initialize
      setTimeout(() => {
        setShowWelcomeModal(true)
      }, 1000)
    }
  }, [user])

  function checkIfShouldShowTutorial() {
    // Case 1: User explicitly said "don't show again"
    if (tutorialStore.dontShowAgain || tutorialStore.autoSkipped) {
      return false
    }

    // Case 2: Tutorial already completed
    if (tutorialStore.status === 'completed') {
      return false
    }

    // Case 3: First-time user (no tutorial state)
    if (tutorialStore.status === 'not_started' && !tutorialStore.startedAt) {
      return true
    }

    // Case 4: Tutorial was interrupted (started but not completed)
    if (tutorialStore.status === 'in_progress') {
      // Ask if user wants to continue
      return 'resume' // Special case
    }

    // Case 5: New app version with updated tutorial
    const currentVersion = '1.0.0'
    if (tutorialStore.tutorialVersion !== currentVersion) {
      // Show "What's New" instead of full tutorial
      return 'whats_new'
    }

    return false
  }

  // ... rest of component
}
```

### 재시작 메커니즘

```javascript
// Re-trigger tutorial from settings or help menu
function TutorialRestartButton() {
  const { resetTutorial, initTutorial } = useTutorialStore()
  const { startTutorial } = useTutorialDriver()

  const handleRestart = () => {
    // Confirm with user
    if (confirm('튜토리얼을 처음부터 다시 시작하시겠습니까?')) {
      // Reset state
      resetTutorial()

      // Re-initialize
      initTutorial()

      // Start driver
      startTutorial()

      // Track event
      trackEvent('tutorial_restarted', {
        source: 'settings_menu'
      })
    }
  }

  return (
    <Button onClick={handleRestart}>
      🔄 튜토리얼 다시 보기
    </Button>
  )
}
```

### 진행 상태 시각화

```jsx
function TutorialProgress() {
  const { currentStep, totalSteps, completedSteps } = useTutorialStore()

  return (
    <div className="tutorial-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
          <div
            key={step}
            className={cn(
              'progress-step',
              step === currentStep && 'active',
              completedSteps.includes(step) && 'completed'
            )}
          >
            {completedSteps.includes(step) ? '✓' : step}
          </div>
        ))}
      </div>
      <p className="progress-text">
        {currentStep} / {totalSteps} 단계 완료
      </p>
    </div>
  )
}
```

---

## UI/UX 설계 (UI/UX Design)

### Driver.js 커스터마이징

```javascript
// src/lib/driverConfig.js
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const driverConfig = {
  // Global settings
  showProgress: true,
  progressText: '{{current}} / {{total}}',

  // Visual styling
  popoverClass: 'aitax-tutorial-popover',
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  smoothScroll: true,

  // Animation
  animate: true,
  animationDuration: 300,

  // Behavior
  allowClose: true,
  overlayClickNext: false,
  stagePadding: 10,
  stageRadius: 5,

  // Buttons
  showButtons: ['next', 'previous', 'close'],
  nextBtnText: '다음',
  prevBtnText: '이전',
  doneBtnText: '완료',
  closeBtnText: '×',

  // Callbacks
  onDestroyStarted: () => {
    // Clean up
    return true
  },

  onDestroyed: () => {
    // Save progress
    saveTutorialProgress()
  },

  onNextClick: (element, step, options) => {
    // Track step completion
    trackStepCompletion(step.index)
  },

  onPrevClick: (element, step, options) => {
    // Track backward navigation
    trackStepBackward(step.index)
  }
}
```

### 커스텀 CSS 스타일

```css
/* src/styles/tutorial.css */

/* Popover styling */
.aitax-tutorial-popover {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  padding: 0;
  font-family: 'Pretendard', sans-serif;
}

.aitax-tutorial-popover .driver-popover-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.aitax-tutorial-popover .driver-popover-description {
  padding: 20px;
  color: #333333;
  font-size: 14px;
  line-height: 1.6;
}

.aitax-tutorial-popover .driver-popover-description p {
  margin-bottom: 12px;
}

.aitax-tutorial-popover .driver-popover-description ul {
  margin-left: 20px;
  margin-bottom: 12px;
}

.aitax-tutorial-popover .driver-popover-description strong {
  color: #667eea;
  font-weight: 600;
}

.aitax-tutorial-popover .driver-popover-description em {
  color: #764ba2;
  font-style: normal;
}

/* Button styling */
.aitax-tutorial-popover .driver-popover-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aitax-tutorial-popover .driver-popover-prev-btn,
.aitax-tutorial-popover .driver-popover-next-btn {
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.aitax-tutorial-popover .driver-popover-prev-btn {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.aitax-tutorial-popover .driver-popover-prev-btn:hover {
  background: #f5f7ff;
}

.aitax-tutorial-popover .driver-popover-next-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.aitax-tutorial-popover .driver-popover-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.aitax-tutorial-popover .driver-popover-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Progress indicator */
.aitax-tutorial-popover .driver-popover-progress-text {
  color: #999999;
  font-size: 12px;
  font-weight: 500;
}

/* Highlight styling */
.driver-active-element {
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.4) !important;
  border-radius: 8px !important;
}

/* Overlay */
.driver-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .aitax-tutorial-popover {
    max-width: calc(100vw - 40px);
  }

  .aitax-tutorial-popover .driver-popover-title {
    font-size: 16px;
    padding: 14px 16px;
  }

  .aitax-tutorial-popover .driver-popover-description {
    padding: 16px;
    font-size: 13px;
  }

  .aitax-tutorial-popover .driver-popover-footer {
    padding: 12px 16px;
    flex-direction: column;
    gap: 8px;
  }

  .aitax-tutorial-popover .driver-popover-prev-btn,
  .aitax-tutorial-popover .driver-popover-next-btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .aitax-tutorial-popover {
    background: #1a1a1a;
  }

  .aitax-tutorial-popover .driver-popover-description {
    color: #e0e0e0;
  }

  .aitax-tutorial-popover .driver-popover-footer {
    border-top-color: #333333;
  }
}

/* Accessibility */
.aitax-tutorial-popover *:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Animation */
@keyframes tutorial-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.aitax-tutorial-popover {
  animation: tutorial-fade-in 0.3s ease-out;
}
```

### React Wrapper 컴포넌트

```jsx
// src/components/Tutorial/TutorialDriver.jsx
import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import { useTutorialStore } from '@/hooks/useTutorial'
import { driverConfig } from '@/lib/driverConfig'
import { tutorialSteps } from './tutorialSteps'

export function TutorialDriver({ isActive, onComplete }) {
  const driverRef = useRef(null)
  const tutorialStore = useTutorialStore()

  useEffect(() => {
    if (!isActive) return

    // Initialize driver
    driverRef.current = driver({
      ...driverConfig,
      steps: tutorialSteps,

      onDestroyStarted: () => {
        if (!driverRef.current.isLastStep()) {
          if (confirm('튜토리얼을 종료하시겠습니까?')) {
            tutorialStore.skipTutorial()
            return true
          }
          return false
        }
        return true
      },

      onDestroyed: () => {
        if (driverRef.current.isLastStep()) {
          tutorialStore.completeTutorial()
          onComplete?.()
        }
      },

      onHighlightStarted: (element, step, options) => {
        tutorialStore.goToStep(step.index)
      },

      onHighlighted: (element, step, options) => {
        tutorialStore.completeStep(step.index)
      }
    })

    // Start tutorial
    driverRef.current.drive()

    // Cleanup
    return () => {
      driverRef.current?.destroy()
    }
  }, [isActive])

  return null // This component doesn't render anything
}
```

### 튜토리얼 단계 정의

```javascript
// src/components/Tutorial/tutorialSteps.js
export const tutorialSteps = [
  // Step 1: Tax Type Selection
  {
    element: '#tutorial-tax-type-selector',
    popover: {
      title: '1단계: 세금 유형 선택',
      description: `
        <p><strong>상속세</strong>: 부모님으로부터 재산을 물려받은 경우</p>
        <p><strong>증여세</strong>: 부모님이나 타인으로부터 재산을 증여받은 경우</p>
        <p><strong>양도소득세</strong>: 부동산이나 주식을 매도한 경우</p>
        <br>
        <p>💡 <em>예시로 상속세를 선택해볼까요?</em></p>
      `,
      side: 'bottom',
      align: 'center'
    }
  },

  // Step 2: Amount Input
  {
    element: '#tutorial-tax-amount-input',
    popover: {
      title: '2단계: 재산 금액 입력',
      description: `
        <p>상속받은 총 재산 가액을 입력해주세요.</p>
        <p><strong>💡 Tip:</strong> 정확한 금액을 모르시면 대략적인 금액으로 입력하셔도 됩니다.</p>
        <br>
        <p><em>예시: 5억원 (500,000,000원)을 입력해볼까요?</em></p>
      `,
      side: 'right',
      align: 'start'
    }
  },

  // Step 2b: Deduction Selection
  {
    element: '#tutorial-deduction-selector',
    popover: {
      title: '2단계: 공제 항목 선택',
      description: `
        <p>적용 가능한 공제 항목을 선택하면 세금이 줄어듭니다.</p>
        <ul>
          <li>✅ <strong>배우자 공제</strong>: 최대 30억원</li>
          <li>✅ <strong>자녀 공제</strong>: 1인당 5천만원</li>
          <li>✅ <strong>기초 공제</strong>: 2억원</li>
        </ul>
        <p><em>예시로 배우자 공제와 자녀 1명 공제를 선택해볼까요?</em></p>
      `,
      side: 'left',
      align: 'center'
    }
  },

  // Step 3: Calculate Button
  {
    element: '#tutorial-calculate-button',
    popover: {
      title: '3단계: AI 세금 분석',
      description: `
        <p>모든 정보를 입력하셨나요? 이제 AI가 자동으로:</p>
        <ul>
          <li>✅ 세율 자동 계산</li>
          <li>✅ 공제 항목 최적화</li>
          <li>✅ 절세 전략 분석</li>
          <li>✅ 상세 보고서 생성</li>
        </ul>
        <p><strong>💡 버튼을 클릭하면 AI 분석이 시작됩니다.</strong></p>
      `,
      side: 'top',
      align: 'center'
    }
  },

  // Step 4: Results Summary
  {
    element: '#tutorial-result-summary',
    popover: {
      title: '4단계: 계산 결과 확인',
      description: `
        <p>✅ 계산이 완료되었습니다!</p>
        <p><strong>예상 상속세</strong>는 입력하신 정보를 바탕으로 계산된 금액입니다.</p>
        <ul>
          <li><strong>과세 표준</strong>: 총 재산 - 공제 금액</li>
          <li><strong>적용 세율</strong>: 과세 표준 구간별 세율</li>
        </ul>
        <p><em>💡 자세한 계산 과정은 아래에서 확인하실 수 있습니다.</em></p>
      `,
      side: 'left',
      align: 'start'
    }
  },

  // Step 4b: AI Recommendations
  {
    element: '#tutorial-ai-recommendations',
    popover: {
      title: 'AI 절세 추천',
      description: `
        <p>AI가 분석한 결과, 다음 방법으로 세금을 줄일 수 있습니다:</p>
        <ul>
          <li>🎯 추가 공제 항목 활용</li>
          <li>📅 증여 시기 조정</li>
          <li>🏠 부동산 평가 방법 변경</li>
        </ul>
        <p><strong>각 항목을 클릭하면 자세한 설명을 볼 수 있습니다.</strong></p>
      `,
      side: 'right',
      align: 'center'
    }
  },

  // Step 4c: PDF Export
  {
    element: '#tutorial-pdf-export',
    popover: {
      title: 'PDF 보고서 다운로드',
      description: `
        <p>계산 결과를 전문가 수준의 PDF 보고서로 다운로드할 수 있습니다.</p>
        <p><strong>보고서 내용:</strong></p>
        <ul>
          <li>📊 세금 계산 상세 내역</li>
          <li>📈 단계별 계산 과정</li>
          <li>💡 AI 절세 전략 제안</li>
          <li>📋 참고 법령 및 근거</li>
        </ul>
        <p><em>💡 보고서는 세무 상담 시 활용하실 수 있습니다.</em></p>
      `,
      side: 'top',
      align: 'center'
    }
  }
]
```

---

## 구현 계획 (Implementation Plan)

### Phase 1: 라이브러리 설치 및 설정 (1h)

**작업 항목**:
1. ✅ Driver.js 설치
   ```bash
   npm install driver.js
   ```

2. ✅ 기본 설정 파일 생성
   - `src/lib/driverConfig.js`
   - `src/styles/tutorial.css`

3. ✅ Zustand 상태 관리 설정
   ```bash
   npm install zustand
   ```
   - `src/hooks/useTutorial.js`

### Phase 2: React Wrapper 개발 (2h)

**작업 항목**:
1. TutorialDriver 컴포넌트 구현
2. WelcomeModal 컴포넌트 구현
3. CompletionModal 컴포넌트 구현
4. TutorialProgress 컴포넌트 구현

### Phase 3: 워크플로우 스텝 작성 (3h)

**작업 항목**:
1. 4단계 튜토리얼 스크립트 작성
2. 각 스텝별 popover 콘텐츠 작성 (한국어/영어)
3. 스텝별 콜백 함수 구현
4. 자동 진행 로직 구현

### Phase 4: 상태 관리 시스템 (2h)

**작업 항목**:
1. 첫 방문 감지 로직 구현
2. 튜토리얼 진행 상태 추적
3. LocalStorage 영속화
4. 재시작 메커니즘 구현

### Phase 5: UI/UX 폴리싱 (2h)

**작업 항목**:
1. 커스텀 CSS 스타일링
2. 반응형 디자인 구현
3. 다크 모드 지원
4. 애니메이션 추가

### Phase 6: 통합 및 테스트 (2h)

**작업 항목**:
1. 메인 앱에 통합
2. 각 스텝별 기능 테스트
3. 다양한 시나리오 테스트 (건너뛰기, 재시작, 중단 등)
4. 접근성 테스트 (키보드, 스크린 리더)

---

## 테스트 전략 (Testing Strategy)

### 단위 테스트

```javascript
// src/hooks/__tests__/useTutorial.test.js
import { renderHook, act } from '@testing-library/react'
import { useTutorialStore } from '../useTutorial'

describe('useTutorialStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
  })

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useTutorialStore())

    expect(result.current.status).toBe('not_started')
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(4)
  })

  test('should initialize tutorial', () => {
    const { result } = renderHook(() => useTutorialStore())

    act(() => {
      result.current.initTutorial()
    })

    expect(result.current.status).toBe('in_progress')
    expect(result.current.startedAt).toBeTruthy()
    expect(result.current.sessionId).toBeTruthy()
  })

  test('should complete step', () => {
    const { result } = renderHook(() => useTutorialStore())

    act(() => {
      result.current.completeStep(1)
    })

    expect(result.current.completedSteps).toContain(1)
  })

  test('should complete tutorial', () => {
    const { result } = renderHook(() => useTutorialStore())

    act(() => {
      result.current.completeTutorial()
    })

    expect(result.current.status).toBe('completed')
    expect(result.current.completedAt).toBeTruthy()
  })

  test('should skip tutorial and increment skip count', () => {
    const { result } = renderHook(() => useTutorialStore())

    act(() => {
      result.current.skipTutorial()
    })

    expect(result.current.status).toBe('skipped')
    const skipCount = parseInt(localStorage.getItem('tutorial_skip_count') || '0')
    expect(skipCount).toBe(1)
  })

  test('should auto-skip after 3 skips', () => {
    localStorage.setItem('tutorial_skip_count', '2')
    const { result } = renderHook(() => useTutorialStore())

    act(() => {
      result.current.skipTutorial()
    })

    expect(result.current.autoSkipped).toBe(true)
  })
})
```

### 통합 테스트

```javascript
// src/components/Tutorial/__tests__/TutorialDriver.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TutorialDriver } from '../TutorialDriver'
import { useTutorialStore } from '@/hooks/useTutorial'

describe('TutorialDriver', () => {
  test('should start tutorial when active', async () => {
    render(<TutorialDriver isActive={true} />)

    // Wait for driver to initialize
    await waitFor(() => {
      expect(document.querySelector('.aitax-tutorial-popover')).toBeInTheDocument()
    })
  })

  test('should navigate through steps', async () => {
    render(<TutorialDriver isActive={true} />)

    const nextButton = screen.getByText('다음')

    // Click through all steps
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton)
      await waitFor(() => {
        const store = useTutorialStore.getState()
        expect(store.currentStep).toBe(i + 1)
      })
    }
  })

  test('should complete tutorial on last step', async () => {
    render(<TutorialDriver isActive={true} onComplete={jest.fn()} />)

    // Navigate to last step
    const nextButton = screen.getByText('다음')
    for (let i = 0; i < 6; i++) {
      fireEvent.click(nextButton)
    }

    // Complete tutorial
    fireEvent.click(screen.getByText('완료'))

    await waitFor(() => {
      const store = useTutorialStore.getState()
      expect(store.status).toBe('completed')
    })
  })
})
```

### E2E 테스트 (Playwright)

```javascript
// e2e/tutorial.spec.js
import { test, expect } from '@playwright/test'

test.describe('Onboarding Tutorial', () => {
  test('should show welcome modal on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    await page.goto('/')

    // Wait for welcome modal
    await expect(page.locator('text=AI Tax Consultant에 오신 것을 환영합니다')).toBeVisible()

    // Click start tutorial
    await page.click('text=튜토리얼 시작')

    // Verify tutorial starts
    await expect(page.locator('.driver-popover-title')).toContainText('1단계')
  })

  test('should complete full tutorial workflow', async ({ page }) => {
    await page.goto('/')
    await page.click('text=튜토리얼 시작')

    // Step 1: Select tax type
    await expect(page.locator('text=1단계: 세금 유형 선택')).toBeVisible()
    await page.click('text=다음')

    // Step 2: Enter amount
    await expect(page.locator('text=2단계: 재산 금액 입력')).toBeVisible()
    await page.click('text=다음')

    // Step 2b: Select deductions
    await page.click('text=다음')

    // Step 3: Calculate
    await expect(page.locator('text=3단계: AI 세금 분석')).toBeVisible()
    await page.click('text=다음')

    // Step 4: View results
    await expect(page.locator('text=4단계: 계산 결과 확인')).toBeVisible()
    await page.click('text=다음')
    await page.click('text=다음')

    // Step 4c: PDF export
    await page.click('text=완료')

    // Verify completion modal
    await expect(page.locator('text=튜토리얼 완료!')).toBeVisible()
  })

  test('should skip tutorial and not show again', async ({ page }) => {
    await page.goto('/')

    // Check "don't show again"
    await page.check('text=다시 보지 않기')

    // Skip tutorial
    await page.click('text=건너뛰기')

    // Reload page
    await page.reload()

    // Verify tutorial doesn't show
    await expect(page.locator('text=AI Tax Consultant에 오신 것을 환영합니다')).not.toBeVisible()
  })

  test('should restart tutorial from settings', async ({ page }) => {
    // Complete tutorial first
    await page.goto('/')
    await page.click('text=튜토리얼 시작')
    // ... complete tutorial steps ...

    // Go to settings
    await page.click('[aria-label="Settings"]')

    // Restart tutorial
    await page.click('text=튜토리얼 다시 보기')
    await page.click('text=OK') // Confirm dialog

    // Verify tutorial restarts
    await expect(page.locator('text=1단계: 세금 유형 선택')).toBeVisible()
  })
})
```

---

## 결론 (Conclusion)

### 구현 권장 사항

✅ **Driver.js 사용 권장**

**근거**:
1. **경량성**: 5KB로 최소 번들 크기
2. **TypeScript 네이티브**: 프로젝트와 기술 스택 일치
3. **상업용 라이센스**: MIT 라이센스로 무료 사용 가능
4. **확장성**: Tour 외 다양한 사용 사례 지원
5. **활발한 유지보수**: 최신 업데이트 지속

### 기대 효과

1. **사용자 온보딩 개선**
   - 신규 사용자 이탈률 30% 감소
   - 첫 세금 계산 완료율 70% → 90% 향상
   - 사용자 만족도 증가

2. **고객 지원 비용 절감**
   - 기본 사용법 문의 50% 감소
   - 자가 해결률 향상

3. **사용자 참여도 증가**
   - 고급 기능 사용률 증가
   - 평균 세션 시간 증가

### 향후 개선 계획

1. **다국어 지원**: 영어, 중국어, 일본어 튜토리얼 추가
2. **개인화**: 사용자 유형별 맞춤 튜토리얼
3. **인터랙티브 요소 강화**: 실제 입력 요구, 퀴즈 추가
4. **비디오 튜토리얼**: 텍스트 + 비디오 하이브리드
5. **A/B 테스팅**: 다양한 스크립트 효과 측정

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-10-18
**다음 검토 예정일**: 2025-11-18
**담당자**: AI Tax Consultant Development Team
