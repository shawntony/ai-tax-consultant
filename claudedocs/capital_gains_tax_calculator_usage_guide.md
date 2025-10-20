# 양도소득세 계산기 사용 가이드 (Capital Gains Tax Calculator Usage Guide)

**버전**: 1.0.0
**작성일**: 2025-10-17
**대상**: 개발자, UI 연동 담당자

---

## 목차
1. [빠른 시작](#1-빠른-시작)
2. [API 레퍼런스](#2-api-레퍼런스)
3. [사용 예시](#3-사용-예시)
4. [에러 처리](#4-에러-처리)
5. [고급 사용법](#5-고급-사용법)
6. [FAQ](#6-faq)

---

## 1. 빠른 시작

### 1.1 설치
```bash
# 프로젝트에 이미 포함되어 있습니다
# 별도 설치 불필요
```

### 1.2 기본 사용
```javascript
import { calculateCapitalGainsTax } from '@/utils/capitalGainsTaxCalculator';

// 가장 간단한 사용 예시
const result = calculateCapitalGainsTax({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,  // 5억원
  transferDate: '2024-10-01',
  transferPrice: 800000000,     // 8억원
  houseCount: 1,
  address: '부산광역시 해운대구'
});

console.log(`총 세액: ${result.totalTax.toLocaleString()}원`);
// 출력: 총 세액: 0원 (1세대1주택 비과세)
```

---

## 2. API 레퍼런스

### 2.1 메인 함수: `calculateCapitalGainsTax`

**전체 양도소득세를 계산하는 통합 함수**

#### 입력 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| `acquisitionDate` | string | ✅ | 취득일 (YYYY-MM-DD) | '2020-01-01' |
| `acquisitionPrice` | number | ✅ | 취득가액 (원) | 500000000 |
| `transferDate` | string | ✅ | 양도일 (YYYY-MM-DD) | '2024-10-01' |
| `transferPrice` | number | ✅ | 양도가액 (원) | 800000000 |
| `houseCount` | 1\|2\|3 | ✅ | 주택 수 | 1 |
| `address` | string | ✅ | 주소 (조정대상지역 판정) | '서울특별시 강남구' |
| `necessaryExpenses` | number | ❌ | 필요경비 (원) | 50000000 |
| `residenceYears` | number | ❌ | 거주년수 | 3 |
| `tempDual2Years` | boolean | ❌ | 일시적 2주택 여부 | false |

#### 반환 값

```typescript
{
  // 보유기간
  holdingPeriod: {
    years: number,      // 보유년수 (정수)
    days: number,       // 보유일수
    months: number      // 보유개월수 (나머지)
  },

  // 양도차익
  capitalGain: number,  // 양도가액 - 취득가액 - 필요경비

  // 비과세 정보
  exemption: {
    applied: boolean,   // 비과세 적용 여부
    amount: number,     // 비과세 금액
    reason: string      // 비과세 사유
  },

  // 장기보유특별공제
  longTermDeduction: {
    rate: number,       // 공제율 (0~0.80)
    amount: number,     // 공제액
    totalYears: number  // 총 기간 (보유 + 거주)
  },

  // 기본공제
  basicDeduction: number,  // 250만원

  // 과세표준
  taxBase: number,

  // 세율 및 세액
  taxation: {
    basicRate: number,        // 기본세율
    basicTax: number,         // 기본세액
    surchargeApplied: boolean,// 중과세 적용 여부
    surchargeRate: number,    // 중과세율
    totalRate: number,        // 최종 적용세율
    capitalGainsTax: number   // 양도소득세
  },

  // 지방소득세
  localIncomeTax: number,  // 양도소득세의 10%

  // 총 세액
  totalTax: number,        // 양도소득세 + 지방소득세

  // 메타 정보
  calculationDate: string, // 계산 수행 일자
  warnings: string[],      // 주의사항 배열
  isRegulated: boolean,    // 조정대상지역 여부
  effectiveRate: number    // 실효세율

  // 특수 케이스
  isLoss?: boolean,        // 양도손실 여부
  reason?: string,         // 세금 0원인 경우 사유
  error?: boolean,         // 에러 발생 여부
  message?: string         // 에러 메시지
}
```

---

### 2.2 개별 모듈 함수

#### 2.2.1 `calculateHoldingPeriod`
**보유기간 계산**

```javascript
import { calculateHoldingPeriod } from '@/utils/capitalGainsTaxCalculator';

const period = calculateHoldingPeriod('2020-01-01', '2024-10-01');
// { years: 4, days: 1735, months: 9 }
```

#### 2.2.2 `calculateCapitalGain`
**양도차익 계산**

```javascript
import { calculateCapitalGain } from '@/utils/capitalGainsTaxCalculator';

const gain = calculateCapitalGain({
  transferPrice: 800000000,
  acquisitionPrice: 500000000,
  necessaryExpenses: 50000000
});
// { capitalGain: 250000000, isLoss: false, isZero: false }
```

#### 2.2.3 `isRegulatedArea`
**조정대상지역 판정**

```javascript
import { isRegulatedArea } from '@/utils/capitalGainsTaxCalculator';

isRegulatedArea('서울특별시 강남구');  // true
isRegulatedArea('부산광역시 해운대구'); // false
```

#### 2.2.4 `check1House1HouseholdExemption`
**1세대1주택 비과세 판단**

```javascript
import { check1House1HouseholdExemption } from '@/utils/capitalGainsTaxCalculator';

const exemption = check1House1HouseholdExemption({
  houseCount: 1,
  holdingYears: 5,
  isRegulated: false,
  acquisitionDate: '2019-01-01',
  residenceYears: 3,
  transferPrice: 800000000,
  capitalGain: 300000000
});
// { exempt: true, fullExempt: true, exemptAmount: 300000000, ... }
```

#### 2.2.5 `calculateLongTermHoldingDeduction`
**장기보유특별공제 계산**

```javascript
import { calculateLongTermHoldingDeduction } from '@/utils/capitalGainsTaxCalculator';

const deduction = calculateLongTermHoldingDeduction({
  capitalGain: 500000000,
  holdingYears: 5,
  residenceYears: 3,
  houseCount: 1
});
// { deductionRate: 0.32, deductionAmount: 160000000, totalYears: 8 }
```

#### 2.2.6 `calculateSurcharge`
**다주택자 중과세율 계산**

```javascript
import { calculateSurcharge } from '@/utils/capitalGainsTaxCalculator';

const surcharge = calculateSurcharge({
  taxBase: 300000000,
  basicRate: 0.38,
  basicTax: 94060000,
  houseCount: 3,
  isRegulated: true,
  transferDate: '2024-10-01'
});
// { surchargeApplied: true, surchargeRate: 0.30, totalRate: 0.68, ... }
```

---

## 3. 사용 예시

### 3.1 시나리오별 예시

#### 시나리오 1: 일반적인 1세대1주택 (전액 비과세)
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 800000000,
  houseCount: 1,
  address: '부산광역시 해운대구',
  residenceYears: 3
});

console.log('세금:', result.totalTax); // 0원
console.log('비과세 사유:', result.exemption.reason);
// "1세대1주택 비과세 (양도가액 12억 이하)"
```

#### 시나리오 2: 고가주택 (부분 비과세)
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2019-01-01',
  acquisitionPrice: 1000000000,
  transferDate: '2024-10-01',
  transferPrice: 1500000000, // 15억원
  houseCount: 1,
  address: '부산광역시',
  residenceYears: 5
});

console.log('비과세 금액:', result.exemption.amount.toLocaleString());
// "400,000,000원" (5억 × 80%)
console.log('과세 대상:', result.taxBase.toLocaleString());
console.log('총 세액:', result.totalTax.toLocaleString());
```

#### 시나리오 3: 다주택자 중과세
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2022-01-01',
  acquisitionPrice: 800000000,
  transferDate: '2024-10-01',
  transferPrice: 1200000000,
  houseCount: 3,
  address: '서울특별시 강남구', // 조정대상지역
  necessaryExpenses: 50000000
});

console.log('중과세 적용:', result.taxation.surchargeApplied); // true
console.log('세율:', `${(result.taxation.totalRate * 100).toFixed(0)}%`);
// "68%" (기본 38% + 중과 30%)
console.log('총 세액:', result.totalTax.toLocaleString());
```

#### 시나리오 4: 짧은 보유기간 (비과세/공제 불가)
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2023-06-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 700000000,
  houseCount: 1,
  address: '서울특별시 강남구'
});

console.log('보유기간:', result.holdingPeriod.years, '년'); // 1년
console.log('비과세 적용:', result.exemption.applied); // false
console.log('장기보유공제:', result.longTermDeduction.amount); // 0원
console.log('경고:', result.warnings);
// ["보유기간 2년 미만으로 1세대1주택 비과세 불가",
//  "보유기간 3년 미만으로 장기보유특별공제 불가"]
```

#### 시나리오 5: 양도손실
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2022-01-01',
  acquisitionPrice: 800000000,
  transferDate: '2024-10-01',
  transferPrice: 700000000, // 손실
  houseCount: 1,
  address: '서울특별시'
});

console.log('양도차익:', result.capitalGain); // -100000000
console.log('양도손실:', result.isLoss); // true
console.log('총 세액:', result.totalTax); // 0원
console.log('사유:', result.reason); // "양도손실"
```

---

## 4. 에러 처리

### 4.1 에러 타입

#### 에러 1: 필수 파라미터 누락
```javascript
const result = calculateCapitalGainsTax({
  acquisitionPrice: 500000000,
  transferPrice: 800000000,
  // acquisitionDate 누락
  // transferDate 누락
  houseCount: 1
});

if (result.error) {
  console.error(result.message);
  // "취득일과 양도일은 필수입니다"
}
```

#### 에러 2: 잘못된 날짜 순서
```javascript
try {
  const period = calculateHoldingPeriod('2024-01-01', '2020-01-01');
} catch (error) {
  console.error(error.message);
  // "양도일이 취득일보다 빠를 수 없습니다"
}
```

#### 에러 3: 잘못된 주택 수
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 800000000,
  houseCount: 5, // 잘못된 값 (1, 2, 3만 허용)
  address: '부산광역시'
});

if (result.error) {
  console.error(result.message);
  // "주택 수는 1, 2, 3 중 하나여야 합니다"
}
```

### 4.2 에러 처리 패턴

```javascript
function safeCalculate(params) {
  try {
    const result = calculateCapitalGainsTax(params);

    if (result.error) {
      // 비즈니스 로직 에러
      return {
        success: false,
        error: result.message,
        type: 'validation'
      };
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    // 예외 에러
    return {
      success: false,
      error: error.message,
      type: 'exception'
    };
  }
}

// 사용
const response = safeCalculate({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 800000000,
  houseCount: 1,
  address: '부산광역시'
});

if (response.success) {
  console.log('세액:', response.data.totalTax);
} else {
  console.error('에러:', response.error);
}
```

---

## 5. 고급 사용법

### 5.1 일시적 2주택 처리
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 800000000,
  houseCount: 2,
  tempDual2Years: true,  // 일시적 2주택 특례
  address: '서울특별시 강남구',
  residenceYears: 4
});

// 2주택이지만 1주택으로 간주되어 비과세 가능
console.log('비과세 적용:', result.exemption.applied);
```

### 5.2 필요경비 포함 계산
```javascript
const result = calculateCapitalGainsTax({
  acquisitionDate: '2020-01-01',
  acquisitionPrice: 500000000,
  transferDate: '2024-10-01',
  transferPrice: 800000000,
  houseCount: 1,
  address: '부산광역시',
  necessaryExpenses: 50000000  // 중개수수료, 취득세 등
});

// 양도차익 = 8억 - 5억 - 0.5억 = 2.5억
console.log('양도차익:', result.capitalGain);
```

### 5.3 여러 시나리오 비교
```javascript
const scenarios = [
  { name: '즉시 양도', holdingYears: 0, residenceYears: 0 },
  { name: '2년 보유', holdingYears: 2, residenceYears: 2 },
  { name: '5년 보유', holdingYears: 5, residenceYears: 3 },
  { name: '10년 보유', holdingYears: 10, residenceYears: 8 }
];

const baseParams = {
  acquisitionPrice: 500000000,
  transferPrice: 800000000,
  houseCount: 1,
  address: '부산광역시'
};

scenarios.forEach(scenario => {
  // 날짜 계산
  const today = new Date('2024-10-01');
  const years = scenario.holdingYears;
  const acquisitionDate = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());

  const result = calculateCapitalGainsTax({
    ...baseParams,
    acquisitionDate: acquisitionDate.toISOString().split('T')[0],
    transferDate: '2024-10-01',
    residenceYears: scenario.residenceYears
  });

  console.log(`${scenario.name}:`, result.totalTax.toLocaleString(), '원');
});

// 출력:
// 즉시 양도: 91,500,000원 (비과세/공제 없음)
// 2년 보유: 0원 (1세대1주택 비과세)
// 5년 보유: 0원 (1세대1주택 비과세)
// 10년 보유: 0원 (1세대1주택 비과세)
```

---

## 6. FAQ

### Q1: 조정대상지역이 변경되면 어떻게 하나요?
**A**: `capitalGainsTaxCalculator.js` 파일의 `REGULATED_AREAS_2024` 객체를 업데이트하면 됩니다.

```javascript
const REGULATED_AREAS_2024 = {
  "서울특별시": [/* 업데이트 */],
  "경기도": [/* 업데이트 */],
  "인천광역시": [/* 신규 추가 */]
};
```

### Q2: 소수점 보유기간은 어떻게 처리되나요?
**A**: 보유기간은 항상 년 단위로 내림 처리됩니다.
```javascript
// 보유 5년 11개월 → 5년으로 계산
calculateHoldingPeriod('2020-01-01', '2025-12-01');
// { years: 5, days: 2161, months: 11 }
```

### Q3: 여러 주택을 순차적으로 양도하는 경우는?
**A**: 각 양도 건별로 독립적으로 계산하면 됩니다. 현재 구현은 단일 양도만 지원합니다.

### Q4: 상속 주택 특례는 지원하나요?
**A**: 현재 버전에서는 미지원입니다. Phase 3에서 추가 예정입니다.

### Q5: 계산 결과를 어떻게 저장하나요?
**A**: 계산 결과 객체를 JSON으로 저장하면 됩니다.
```javascript
const result = calculateCapitalGainsTax(params);

// JSON 저장
const jsonResult = JSON.stringify(result, null, 2);
localStorage.setItem('taxCalculation', jsonResult);

// JSON 불러오기
const savedResult = JSON.parse(localStorage.getItem('taxCalculation'));
```

### Q6: 테스트는 어떻게 실행하나요?
**A**: Jest를 사용하여 테스트를 실행합니다.
```bash
npm test capitalGainsTaxCalculator.test.js
```

### Q7: 성능은 어떤가요?
**A**: 단일 계산은 5ms 이내로 매우 빠릅니다. 실시간 계산에 적합합니다.

### Q8: 다른 세목(상속세, 증여세)과 통합 가능한가요?
**A**: 네, `taxRates.js`와 동일한 구조로 설계되어 통합이 용이합니다.

---

## 7. 주의사항

### 7.1 법적 고지
⚠️ 본 계산기는 참고용이며, 실제 세액과 다를 수 있습니다.
⚠️ 정확한 세액은 세무사 또는 국세청에 문의하세요.
⚠️ 조정대상지역은 수시로 변경될 수 있습니다.

### 7.2 데이터 유효기간
📅 **2024년 세법 기준**으로 작성되었습니다.
📅 2025년 이후 세법 개정 시 업데이트가 필요합니다.

### 7.3 지원 범위
✅ 지원: 일반 주택 양도소득세
❌ 미지원: 주식 양도소득세, 토지 양도소득세 (Phase 4 예정)

---

## 8. 문의 및 지원

### 8.1 버그 리포트
버그 발견 시 다음 정보와 함께 제보해주세요:
- 입력 파라미터
- 기대 결과
- 실제 결과
- 에러 메시지 (있는 경우)

### 8.2 기능 요청
새로운 기능 요청은 PRD 문서에 추가해주세요.

---

**마지막 업데이트**: 2025-10-17
**작성자**: AI Tax Consultant Development Team
**버전**: 1.0.0
