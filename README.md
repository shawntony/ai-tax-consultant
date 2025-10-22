# AI Tax Consultant - Korean Tax Optimization Workflow

> AI 기반 한국 세무 최적화 - 증여세·상속세·양도소득세 전략 분석 시스템

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![AI Powered](https://img.shields.io/badge/AI-Claude%203.5-orange.svg)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [빠른 시작](#-빠른-시작)
- [사용 방법](#-사용-방법)
- [기술 스택](#-기술-스택)
- [API 키 설정](#-api-키-설정)
- [개발 가이드](#-개발-가이드)
- [FAQ](#-faq)

---

## 🎯 프로젝트 소개

**AI Tax Consultant**는 고령 부모님의 부동산을 자녀에게 이전하는 복잡한 세무 전략을 AI 기반으로 분석하고 시각화하는 통합 솔루션입니다.

### 핵심 특징

**🤖 완전 자동화된 AI 분석**
- 대화형 정보 수집 시스템 (30+ 질문, 조건부 로직)
- Claude 3.5 Sonnet 기반 전략 생성
- 5가지 시각화 모드 (노드 그래프, 비교표, 의사결정 트리, 실행 계획서, 세금 시뮬레이터)

**💰 정밀한 세금 계산**
- 증여세 계산 (누진세율 10-50%, 관계별 공제)
- 상속세 계산 (기초공제 2억, 배우자공제 5-30억)
- 취득세 계산 (1-3주택 차등 세율)
- 양도소득세 계산 (장기보유특별공제, 다주택 중과세)
- 부담부증여 최적화 (5개 시나리오 자동 비교)

**📊 다각도 시각화**
1. 🎯 노드 그래프 - 전략 흐름 파악
2. 📊 시나리오 비교표 - 세금 비교 및 정렬
3. 🌳 의사결정 트리 - ReactFlow + Dagre 자동 레이아웃
4. 📋 실행 계획서 - 타임라인 기반 단계별 가이드
5. 💰 세금 시뮬레이터 - 실시간 파라미터 조정

### 해결하는 문제

- ❌ 복잡한 세무 전략 수립의 어려움
- ❌ 시나리오별 세금 비교의 복잡성
- ❌ 전문가 수준의 분석 도구 부재

### 제공하는 솔루션

- ✅ 5단계 워크플로우로 체계적인 세무 컨설팅
- ✅ AI 기반 자동 전략 생성 및 분석
- ✅ 실시간 세금 계산 및 시뮬레이션
- ✅ 다양한 시각화로 이해도 향상

---

## 🚀 주요 기능

### Phase 1: 대화형 정보 수집
- **ConversationFlow**: 5개 카테고리, 30+ 질문
- **조건부 로직**: 이전 답변에 따른 동적 질문 생성
- **진행률 추적**: 실시간 완성도 계산 및 표시

### Phase 2: 세금 계산 엔진
- **증여세**: 누진세율(10-50%), 관계별 공제, 세대생략 할증
- **상속세**: 기초공제, 배우자공제, 일괄공제 vs 개별공제
- **취득세**: 주택 수에 따른 차등 세율 (1-12%)
- **양도소득세**: 장기보유특별공제, 다주택 중과세
- **부담부증여**: 5개 부채 비율 시나리오 자동 최적화

### Phase 3: AI 전략 생성
- **Backend API**: `/api/generate-strategy` (Claude 3.5 Sonnet)
- **구조화된 응답**: scenarios, actionPlan, recommendedScenario
- **Fallback 시스템**: API 실패 시 샘플 데이터 제공

### Phase 4: 전략 시각화
- **StrategyComparison**: 다중 시나리오 비교 테이블 (정렬 기능)
- **DecisionTree**: ReactFlow + Dagre 의사결정 트리
- **ActionPlan**: 타임라인 기반 실행 계획 (체크리스트, 비용 분석)
- **TaxSimulator**: 3개 탭 (증여세, 상속세, 부담부증여)

### Phase 5: 품질 개선
- **완전한 데이터 구조**: cautions, checklist, costBreakdown 포함
- **확장된 Fallback**: 3개 완전한 시나리오, 5단계 actionPlan
- **테스트 가이드**: 10단계 E2E 시나리오

---

## 🏁 빠른 시작

### 필요 환경

```bash
- Node.js 16.x 이상
- React 18.x
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
```

### 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-repo/aitaxconsultant.git
cd aitaxconsultant

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (선택사항)
cp .env.example .env
# .env 파일에서 ANTHROPIC_API_KEY 설정

# 4. 서버 실행 (2개 터미널 필요)
# 터미널 1: React 개발 서버
npm start

# 터미널 2: Express 백엔드 서버
npm run server
```

**접속**: `http://localhost:3000` (React), `http://localhost:3001` (Express)

---

## 📖 사용 방법

### 기본 워크플로우

1. **홈 화면**
   - "세무 최적화 워크플로우" 클릭
   - 케이스 설명 입력 또는 예시 케이스 선택

2. **정보 수집**
   - 5개 카테고리별 질문 답변
   - 진행률 확인 및 완료

3. **AI 분석**
   - "분석 시작" 클릭
   - Claude 3.5 Sonnet이 자동으로 전략 생성

4. **시각화 탐색**
   - **노드 그래프**: 전략 흐름 확인
   - **비교표**: 시나리오별 세금 비교 및 정렬
   - **의사결정 트리**: 선택 과정 시각화
   - **실행 계획서**: 단계별 실행 로드맵 (체크리스트 포함)
   - **세금 시뮬레이터**: 파라미터 조정 및 실시간 재계산

5. **결과 활용**
   - 최적 시나리오 확인
   - 단계별 실행 계획 체크
   - 필요 시 정보 수정 후 재분석

---

## 🛠 기술 스택

### Frontend
- **React 18.2.0**: UI 컴포넌트
- **React Router DOM 6.20.0**: 라우팅
- **ReactFlow 11.11.4**: 노드 그래프
- **Dagre 0.8.5**: 자동 레이아웃
- **CSS3**: 모던 스타일링

### Backend
- **Node.js + Express 5.1.0**: 서버
- **Anthropic Claude API**: AI 전략 생성 (Claude 3.5 Sonnet)
- **CORS 2.8.5**: CORS 처리
- **dotenv 17.2.3**: 환경 변수

### 세금 계산
- **2024년 한국 세법 기준**
- 증여세, 상속세, 취득세, 양도소득세
- 부담부증여 최적화 알고리즘

---

## 🔑 API 키 설정

### Anthropic Claude API 키 발급

```bash
1. https://console.anthropic.com 방문
2. 계정 생성 또는 로그인
3. "API Keys" 메뉴에서 "Create Key" 클릭
4. 생성된 키 복사 (sk-ant-로 시작)
```

### 환경 변수 설정

`.env` 파일 생성:

```env
# Anthropic Claude API 키
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# 또는
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**보안 주의사항**:
- ⚠️ `.env` 파일은 절대 Git에 커밋하지 마세요
- ✅ `.gitignore`에 `.env` 포함 확인
- ✅ API 키 안전 보관 및 정기 교체

---

## 💻 개발 가이드

### 프로젝트 구조

```
aitaxconsultant/
├── server.js                          # Express 백엔드 서버
├── src/
│   ├── pages/
│   │   ├── Home.jsx                   # 홈 페이지
│   │   ├── TaxOptimizationWorkflow.jsx # 메인 워크플로우
│   │   └── TaxOptimizationWorkflow.css
│   ├── components/
│   │   ├── conversation/
│   │   │   └── ConversationFlow.jsx   # 대화형 정보 수집
│   │   ├── strategy/
│   │   │   ├── StrategyComparison.jsx # 시나리오 비교표
│   │   │   ├── DecisionTree.jsx       # 의사결정 트리
│   │   │   └── ActionPlan.jsx         # 실행 계획서
│   │   ├── tax/
│   │   │   └── TaxSimulator.jsx       # 세금 시뮬레이터
│   │   └── workflow/
│   │       └── SimpleNodeFlow.jsx     # 기본 노드 그래프
│   ├── data/
│   │   └── questionTemplates.js       # 질문 템플릿
│   └── utils/
│       └── taxCalculator.js           # 세금 계산 엔진
└── claudedocs/
    ├── phase-5-testing-guide.md       # 테스트 가이드
    └── project-completion-summary.md  # 완료 문서
```

### 주요 API 엔드포인트

**POST `/api/generate-strategy`**
```javascript
// Request
{
  "collectedInfo": {
    "formattedText": "수집된 정보 텍스트"
  }
}

// Response
{
  "success": true,
  "strategy": {
    "scenarios": [...],
    "recommendedScenario": "추천 전략명",
    "reasoning": "추천 이유",
    "actionPlan": [...],
    "nodes": [...]
  }
}
```

### 세금 계산 함수

```javascript
// utils/taxCalculator.js
import {
  calculateGiftTax,           // 증여세 계산
  calculateInheritanceTax,    // 상속세 계산
  calculateAcquisitionTax,    // 취득세 계산
  calculateCapitalGainsTax,   // 양도소득세 계산
  optimizeBurdensomeGift      // 부담부증여 최적화
} from './utils/taxCalculator';
```

---

## ❓ FAQ

### Q1. API 키가 없어도 사용 가능한가요?

**A**: 네, API 키가 없어도 샘플 데이터로 테스트 가능합니다. 하지만 실제 AI 분석을 위해서는 Anthropic API 키가 필요합니다.

### Q2. 계산 결과의 정확성은?

**A**: 2024년 한국 세법 기준으로 주요 계산은 정확하나, 다음 요소는 고려되지 않습니다:
- 할증평가 (대주주, 소액주주)
- 특수관계인 간 거래
- 복잡한 재산 평가 방법
- 가업상속 공제 등

**⚠️ 최종 세무 신고 전 반드시 세무 전문가와 상담하세요.**

### Q3. 데이터 보안은?

**A**:
- ✅ 모든 데이터는 브라우저 메모리에만 저장
- ✅ 페이지 새로고침 시 초기화
- ✅ 서버로 전송되는 데이터: API 요청 시 정보만

### Q4. 어떤 AI 모델을 사용하나요?

**A**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) - Anthropic의 최신 모델로 복잡한 논리적 추론에 최적화되어 있습니다.

### Q5. 모바일에서 사용 가능한가요?

**A**: 네, 반응형 디자인으로 모바일/태블릿에서도 사용 가능합니다. 최적 환경은 태블릿 또는 데스크톱입니다.

---

## 🚀 향후 계획

### 단기 (2025 Q1-Q2)
- [ ] PDF 보고서 자동 생성 (jsPDF)
- [ ] 전략 저장 및 불러오기 (LocalStorage)
- [ ] 이메일 알림 기능
- [ ] 세무사 상담 예약 연동

### 중기 (2025 Q3-Q4)
- [ ] TypeScript 마이그레이션
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 자동화 (Playwright)
- [ ] PWA 변환 (오프라인 지원)

### 장기 (2026+)
- [ ] 다크 모드 지원
- [ ] 다국어 지원 (i18n)
- [ ] 고급 절세 전략 AI
- [ ] 고객 DB 통합

---

## ⚠️ 주의사항

### 법적 고지

```
⚠️ 이 시스템은 세무 컨설팅을 보조하는 도구입니다.

1. 계산 결과는 참고용이며, 실제 세액과 차이가 있을 수 있습니다.
2. 최종 세무 신고 전 반드시 세무사와 상담하세요.
3. 세법 개정에 따라 계산 방식이 달라질 수 있습니다.
4. 본 시스템 사용으로 인한 법적 책임은 사용자에게 있습니다.
```

---

## 🤝 기여하기

### 기여 방법

1. Fork 이 저장소
2. 새 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

### 코드 컨벤션

```javascript
// 변수명: camelCase
const taxAmount = 1000000;

// 함수명: camelCase
function calculateTax() { }

// 컴포넌트명: PascalCase
function TaxCalculator() { }

// 상수: UPPER_SNAKE_CASE
const MAX_TAX_RATE = 0.5;
```

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 📚 참고 자료

### 세법 관련
- [국세청 홈택스](https://www.hometax.go.kr)
- [국세법령정보시스템](https://txsi.hometax.go.kr)
- [상속세 및 증여세법](https://law.go.kr)

### 기술 문서
- [React 공식 문서](https://react.dev)
- [ReactFlow 문서](https://reactflow.dev)
- [Anthropic Claude API](https://docs.anthropic.com)

---

## 📞 지원 및 문의

- **Issues**: [GitHub Issues](https://github.com/your-repo/aitaxconsultant/issues)
- **Email**: support@aitaxconsultant.com
- **Documentation**: [Full Docs](./claudedocs/)

---

<div align="center">

**AI Tax Consultant** - 2024 © All Rights Reserved

Made with ❤️ by Tax Optimization Team

[🏠 Homepage](https://aitaxconsultant.com) • [📖 Docs](./claudedocs/) • [🐛 Report Bug](https://github.com/your-repo/aitaxconsultant/issues)

</div>
