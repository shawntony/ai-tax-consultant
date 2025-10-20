# E2E Testing Quick Start Guide
# 양도소득세 계산기 E2E 테스트 빠른 시작 가이드

## 📖 개요
이 문서는 Playwright를 사용한 양도소득세 계산기의 E2E 테스트를 빠르게 시작하는 방법을 안내합니다.

## 🚀 빠른 시작

### 1단계: 의존성 설치
```bash
# 프로젝트 루트에서 실행
npm install
```

### 2단계: Playwright 브라우저 설치
```bash
npm run playwright:install
```

### 3단계: 테스트 실행
```bash
# Headless 모드 (기본)
npm run test:e2e

# UI 모드 (대화형 - 권장)
npm run test:e2e:ui

# Headed 모드 (브라우저 보임)
npm run test:e2e:headed

# 디버그 모드
npm run test:e2e:debug
```

## 📊 테스트 구조

```
tests/e2e/
├── capitalGainsTaxForm.spec.js   # 메인 테스트 파일 (1,100+ 줄)
└── README.md                      # 이 파일
```

## 🧪 테스트 스위트

### 총 14개 테스트 스위트, 40+ 테스트 케이스

1. **페이지 로드 및 초기 상태** (4 tests)
2. **실시간 보유기간 계산** (2 tests)
3. **숫자 포맷팅** (2 tests)
4. **폼 유효성 검증** (2 tests)
5. **조건부 렌더링** (3 tests)
6. **1세대1주택 비과세** (2 tests)
7. **다주택자 중과세** (2 tests)
8. **엣지 케이스** (3 tests)
9. **초기화 기능** (2 tests)
10. **접근성 테스트** (3 tests)
11. **반응형 디자인** (2 tests)
12. **성능 테스트** (2 tests)
13. **브라우저 호환성** (2 tests)
14. **사용자 플로우 통합** (2 tests)

**보너스**: 시각적 회귀 테스트 (3 tests)

## 🎯 주요 테스트 시나리오

### 시나리오 1: 1세대1주택 비과세
```javascript
test('예시 1: 전액 비과세 (일반 케이스)', async ({ page }) => {
  await fillBasicInfo(page, {
    acquisitionDate: '2019-01-15',
    transferDate: '2024-06-20',
    acquisitionPrice: '500000000',
    transferPrice: '800000000'
  });

  await fillHouseInfo(page, {
    houseCount: 1,
    address: '서울특별시 강남구',
    residenceYears: '3'
  });

  await submitForm(page);

  await expect(page.locator('.result-highlight.success')).toBeVisible();
  await expect(page.locator('.result-highlight.success')).toContainText('0원');
});
```

### 시나리오 2: 다주택 중과세
```javascript
test('예시 3: 3주택 이상 중과세', async ({ page }) => {
  await fillBasicInfo(page, {
    acquisitionDate: '2020-05-01',
    transferDate: '2024-05-01',
    acquisitionPrice: '400000000',
    transferPrice: '700000000'
  });

  await fillHouseInfo(page, {
    houseCount: 3,
    address: '서울특별시 강남구'
  });

  await submitForm(page);

  await expect(page.locator('.warnings-box')).toContainText('다주택자 중과세 적용');
});
```

## 🛠️ 헬퍼 함수

테스트 작성을 쉽게 하기 위한 3가지 헬퍼 함수:

### 1. fillBasicInfo(page, data)
기본 정보 입력 자동화
```javascript
await fillBasicInfo(page, {
  acquisitionDate: '2019-01-15',
  transferDate: '2024-06-20',
  acquisitionPrice: '500000000',
  transferPrice: '800000000',
  necessaryExpenses: '10000000'  // Optional
});
```

### 2. fillHouseInfo(page, data)
주택 정보 입력 자동화
```javascript
await fillHouseInfo(page, {
  houseCount: 1,                 // 1, 2, 3
  address: '서울특별시 강남구',
  residenceYears: '3',           // 1주택만
  tempDual2Years: true           // 2주택만
});
```

### 3. submitForm(page)
폼 제출 및 결과 대기
```javascript
await submitForm(page);
// 자동으로 결과 섹션 표시 대기 (5초 타임아웃)
```

## 🎨 테스트 실행 옵션

### 특정 브라우저만 실행
```bash
# Chromium만
npx playwright test --project=chromium

# Firefox만
npx playwright test --project=firefox

# WebKit (Safari)만
npx playwright test --project=webkit

# Mobile Chrome만
npx playwright test --project="Mobile Chrome"

# Mobile Safari만
npx playwright test --project="Mobile Safari"
```

### 특정 테스트 스위트만 실행
```bash
# 페이지 로드 테스트만
npx playwright test -g "페이지 로드 및 초기 상태"

# 계산 시나리오만
npx playwright test -g "계산 시나리오"

# 접근성 테스트만
npx playwright test -g "접근성"
```

### 특정 테스트만 실행
```bash
# 테스트 이름으로 필터링
npx playwright test -g "전액 비과세"
```

## 📊 테스트 리포트

### HTML 리포트 보기 (권장)
```bash
npx playwright show-report
```
- 각 테스트 결과 상세 확인
- 스크린샷 보기
- 실패 시 비디오 재생
- Trace 파일 다운로드

### 리포트 위치
- **HTML**: `playwright-report/index.html`
- **JSON**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

## 🐛 디버깅

### 디버그 모드 실행
```bash
npm run test:e2e:debug
```
- 브라우저가 열림
- Playwright Inspector 표시
- 단계별 실행 가능
- 코드 하이라이팅

### 특정 테스트 디버깅
```bash
npx playwright test --debug -g "전액 비과세"
```

### VSCode 확장 프로그램 (선택사항)
1. "Playwright Test for VSCode" 설치
2. 테스트 파일에서 직접 실행/디버그 가능
3. 코드에서 브레이크포인트 설정

## 📸 스크린샷 및 비디오

### 자동 캡처
- **스크린샷**: 테스트 실패 시 자동 저장
- **비디오**: 테스트 실패 시 자동 녹화
- **Trace**: 재시도 시 자동 기록

### 저장 위치
```
test-results/
├── screenshots/
├── videos/
└── traces/
```

### 수동 스크린샷
```javascript
test('내 테스트', async ({ page }) => {
  await page.screenshot({ path: 'my-screenshot.png' });
});
```

## ⚡ 성능 최적화

### 병렬 실행
```bash
# 워커 수 지정 (기본: CPU 코어 수)
npx playwright test --workers=4
```

### 단일 브라우저만 테스트
```bash
# 개발 중에는 Chromium만
npx playwright test --project=chromium
```

### 빠른 테스트 (Smoke Test)
```bash
# 중요한 테스트만 실행
npx playwright test -g "전액 비과세|다주택 중과세"
```

## 🔄 CI/CD 통합

### GitHub Actions
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Jenkins
```groovy
stage('E2E Tests') {
  steps {
    sh 'npm run test:e2e'
  }
  post {
    always {
      publishHTML([
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report'
      ])
    }
  }
}
```

## 📋 체크리스트

### 새 테스트 추가 시
- [ ] 의미 있는 테스트 이름 작성
- [ ] 헬퍼 함수 활용
- [ ] 적절한 대기 시간 설정
- [ ] Assertions 명확하게 작성
- [ ] 테스트 격리 (독립성) 확인

### 테스트 실패 시
- [ ] 스크린샷 확인
- [ ] 비디오 재생
- [ ] Trace 파일 다운로드
- [ ] 디버그 모드로 재실행
- [ ] 로컬 환경에서 재현 확인

## 🆘 문제 해결

### 문제: Playwright 명령어를 찾을 수 없음
```bash
# npx를 사용하거나 전역 설치
npx playwright test

# 또는 전역 설치
npm install -g @playwright/test
playwright test
```

### 문제: 브라우저 실행 실패
```bash
# 브라우저 재설치
npm run playwright:install
```

### 문제: 포트 3000 사용 중
```bash
# 다른 포트로 변경 (playwright.config.js)
baseURL: 'http://localhost:3001',
```

### 문제: 타임아웃 에러
```javascript
// 특정 테스트의 타임아웃 증가
test('긴 테스트', async ({ page }) => {
  test.setTimeout(60000); // 60초
  // ...
});
```

## 📚 추가 리소스

### 공식 문서
- [Playwright 공식 문서](https://playwright.dev)
- [Playwright API 레퍼런스](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### 프로젝트 문서
- [M2.2.7 E2E 테스트 구현 요약](../../claudedocs/M2.2.7_e2e_testing_implementation_summary.md)
- [M2.2.6 UI 구현 가이드](../../claudedocs/M2.2.6_ui_implementation_guide.md)
- [양도소득세 계산기 사용 가이드](../../claudedocs/capital_gains_tax_calculator_usage_guide.md)

## 💡 팁

### 1. UI 모드 사용 (권장)
```bash
npm run test:e2e:ui
```
- 가장 직관적인 테스트 실행 방법
- 테스트 선택, 재실행, 디버그 모두 가능
- 실행 중인 테스트 실시간 확인

### 2. watch 모드
```bash
npx playwright test --ui
# 파일 변경 시 자동 재실행
```

### 3. 코드 생성
```bash
npx playwright codegen http://localhost:3000
# 브라우저에서 동작을 녹화하여 테스트 코드 생성
```

### 4. 스크린샷 업데이트
```bash
npx playwright test --update-snapshots
# 시각적 회귀 테스트 스냅샷 업데이트
```

---

**작성일**: 2024-10-18
**버전**: 1.0.0
**테스트 프레임워크**: Playwright 1.40.0
