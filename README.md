# AI Tax Consultant - Korean Tax Optimization Workflow

AI 기반 한국 세무 최적화 워크플로우 시스템

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-3.5%20Sonnet-7C3AED)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 프로젝트 개요

고령 부모님의 부동산을 자녀에게 이전할 때, **증여와 상속 중 어떤 전략이 세금 측면에서 유리한지** AI가 자동으로 분석하고 시각화하는 시스템입니다.

### 주요 기능

- 🤖 **AI 기반 전략 분석**: Claude 3.5 Sonnet을 활용한 지능형 세무 전략 생성
- 💰 **정확한 세금 계산**: 2024년 한국 세법 기준 4가지 세금 계산 엔진
- 📊 **5가지 시각화**: 노드 그래프, 시나리오 비교표, 의사결정 트리, 실행 계획서, 세금 시뮬레이터
- ⚡ **부담부증여 최적화**: 자동으로 최적 채무 비율을 계산하여 절세 전략 제시
- 💬 **대화형 정보 수집**: 30+ 질문 템플릿으로 정확한 상황 파악

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 16.x 이상
- npm 또는 yarn
- Anthropic API 키 ([여기서 발급](https://console.anthropic.com/))

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/aitaxconsultant.git
cd aitaxconsultant

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 실행

**두 개의 터미널이 필요합니다:**

**터미널 1: React 프론트엔드**
```bash
npm start
```
→ http://localhost:3000

**터미널 2: Express 백엔드**
```bash
npm run server
```
→ http://localhost:3001

## 📖 사용 방법

### 기본 워크플로우

1. **케이스 입력**
   - 홈 화면에서 "세무 최적화 워크플로우" 클릭
   - 케이스 설명 입력 또는 예시 케이스 선택

2. **상세 정보 수집**
   - 5개 카테고리별 질문에 답변
   - 진행률 바로 완성도 확인

3. **AI 분석**
   - "분석 시작" 클릭
   - Claude AI가 최적 전략 자동 생성

4. **결과 탐색**
   - 🎯 **노드 그래프**: 전략 흐름 시각화
   - 📊 **시나리오 비교표**: 세금 비교 및 정렬
   - 🌳 **의사결정 트리**: 시각적 선택 가이드
   - 📋 **실행 계획서**: 단계별 로드맵
   - 💰 **세금 시뮬레이터**: 실시간 파라미터 조정

## 🏗️ 프로젝트 구조

```
aitaxconsultant/
├── server.js                          # Express 백엔드 서버
├── src/
│   ├── pages/
│   │   ├── Home.jsx                   # 홈 페이지
│   │   └── TaxOptimizationWorkflow.jsx # 메인 워크플로우
│   ├── components/
│   │   ├── conversation/              # 대화형 정보 수집
│   │   │   └── ConversationFlow.jsx
│   │   ├── strategy/                  # 전략 시각화
│   │   │   ├── StrategyComparison.jsx # 시나리오 비교표
│   │   │   ├── DecisionTree.jsx       # 의사결정 트리
│   │   │   └── ActionPlan.jsx         # 실행 계획서
│   │   ├── tax/                       # 세금 계산
│   │   │   └── TaxSimulator.jsx       # 세금 시뮬레이터
│   │   └── workflow/
│   │       └── SimpleNodeFlow.jsx     # 노드 그래프
│   ├── data/
│   │   └── questionTemplates.js       # 질문 템플릿 시스템
│   └── utils/
│       └── taxCalculator.js           # 세금 계산 엔진
└── claudedocs/                        # 프로젝트 문서
    ├── phase-5-testing-guide.md
    └── project-completion-summary.md
```

## 💡 주요 기능 상세

### 세금 계산 엔진

#### 1. 증여세 계산
- 누진세율 (10% ~ 50%)
- 증여공제 (성인자녀 5천만원, 배우자 6억원)
- 세대생략 할증 30%
- 신고세액공제 3%

#### 2. 상속세 계산
- 기초공제 2억원
- 배우자공제 5억~30억원
- 일괄공제 5억 vs 개별공제 자동 선택

#### 3. 취득세 계산
- 1주택: 1%~3% (금액별)
- 2주택: 조정지역 8%, 비조정 4%
- 3주택: 조정지역 12%, 비조정 4%

#### 4. 양도소득세 계산
- 장기보유특별공제 (연 8%, 최대 80%)
- 다주택자 중과세 (2주택 60%, 3주택 70%)

#### 5. 부담부증여 최적화
- 5가지 시나리오 자동 생성 (0%, 10%, 30%, 50%, 70% 채무)
- 총 세금 최소화 전략 자동 추천

### 시각화 컴포넌트

#### 📊 시나리오 비교표
- 다중 시나리오 한눈에 비교
- 클릭 정렬 기능 (세금, 복잡도 등)
- 장단점 및 리스크 상세 분석

#### 🌳 의사결정 트리
- ReactFlow + Dagre 자동 레이아웃
- 전략 선택 과정 시각화
- MiniMap 네비게이션

#### 📋 실행 계획서
- 타임라인 기반 단계별 가이드
- 필요 서류 체크리스트
- 비용 상세 분석

#### 💰 세금 시뮬레이터
- 실시간 파라미터 조정
- 즉시 세금 재계산
- 시나리오별 비교

## 🧪 테스팅

### 단위 테스트 실행
```bash
npm test
```

### E2E 테스트 실행
```bash
npm run test:e2e
```

### 테스트 커버리지
```bash
npm run test:coverage
```

## 📚 기술 스택

### Frontend
- **React 18.2.0**: UI 프레임워크
- **React Router DOM 6.20.0**: 라우팅
- **ReactFlow 11.11.4**: 노드 그래프 시각화
- **Dagre 0.8.5**: 자동 레이아웃 알고리즘

### Backend
- **Node.js + Express 5.1.0**: 서버 프레임워크
- **Anthropic Claude API**: AI 전략 생성
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: 환경 변수 관리

### Development
- **React Scripts 5.0.1**: 빌드 도구
- **Jest**: 유닛 테스팅
- **Playwright**: E2E 테스팅
- **Babel**: JavaScript 컴파일러

## 🎯 사용 사례

### 케이스 1: 순수 증여 vs 부담부 증여
```
부동산 시가: 10억원
취득가액: 7억원

결과:
- 순수 증여: 총 세금 2.3억원
- 부담부 증여 (30%): 총 세금 1.41억원
→ 절세액: 8,900만원 (38.7%)
```

### 케이스 2: 증여 vs 상속 비교
```
부동산 시가: 10억원
상속인: 배우자 + 자녀 2명

결과:
- 증여 (현재): 증여세 2억원
- 상속 (대기): 상속세 1.5억원
→ 추천: 상속 대기 (5천만원 절세)
```

## 🔧 환경 설정

### 개발 모드
```bash
# React 개발 서버 (Hot Reload)
npm start

# 백엔드 서버 (Nodemon)
npm run server
```

### 프로덕션 빌드
```bash
# React 빌드
npm run build

# 빌드 테스트
npm run serve
```

## 📦 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 환경 변수 설정 (Vercel)
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## 🤝 기여하기

기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발팀

AI Tax Consultant Development Team

## 📞 문의

프로젝트 관련 문의사항은 Issues 탭을 이용해주세요.

## 🙏 감사의 말

- [Anthropic](https://www.anthropic.com/) - Claude AI 제공
- [ReactFlow](https://reactflow.dev/) - 노드 그래프 라이브러리
- [Dagre](https://github.com/dagrejs/dagre) - 자동 레이아웃 알고리즘

## 📝 변경 이력

### v1.0.0 (2025-10-22)
- ✅ Phase 1: 대화형 정보 수집 시스템
- ✅ Phase 2: 세금 계산 엔진 (증여세, 상속세, 취득세, 양도세)
- ✅ Phase 3: AI 전략 생성 엔진 (Claude 3.5 Sonnet)
- ✅ Phase 4: 5가지 시각화 컴포넌트
- ✅ Phase 5: 품질 개선 및 테스트

---

**Made with ❤️ by AI Tax Consultant Team**
