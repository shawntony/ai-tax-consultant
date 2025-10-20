# Capital Gains Tax (양도소득세) Requirements Analysis
**Task**: M2.2.1 - FR-3.5 요구사항 분석
**Date**: 2025-10-18
**Version**: 1.0
**Status**: Complete

---

## 📋 Executive Summary

This document provides a comprehensive analysis of Korean Capital Gains Tax (양도소득세) requirements for the AI Tax Consultant application. It covers the three critical calculation components:

1. **1세대1주택 비과세** (One Household One Home Tax Exemption)
2. **장기보유특별공제** (Long-term Holding Special Deduction)
3. **다주택자 중과세율** (Multiple Homeowner Heavy Tax Rate)

The analysis is based on 2024 Korean tax law and National Tax Service (국세청) regulations.

---

## 🎯 1. One Household One Home Tax Exemption (1세대1주택 비과세)

### 1.1 Basic Requirements

| Requirement | Condition | Impact |
|-------------|-----------|--------|
| **Ownership** | 1 home owned nationally | Mandatory |
| **Holding Period** | 2+ years at time of sale | Mandatory |
| **Property Value** | ≤ 12억 KRW | Full exemption |
| **Property Value** | > 12억 KRW | Proportional exemption |

### 1.2 Tax Exemption Rules

#### Rule 1: Standard Exemption (실거래가 ≤ 12억원)
```
IF:
  - One household owns exactly 1 home in Korea
  - Holding period ≥ 2 years
  - Sale price ≤ 1,200,000,000 KRW
THEN:
  - Capital gains tax = 0 (100% exemption)
```

#### Rule 2: Proportional Exemption (실거래가 > 12억원)
```
IF:
  - One household owns exactly 1 home in Korea
  - Holding period ≥ 2 years
  - Sale price > 1,200,000,000 KRW
THEN:
  - Taxable amount = (Sale price - 1,200,000,000) / Sale price × Capital gains
  - Exempted amount = 1,200,000,000 / Sale price × Capital gains
```

**Example**:
- Sale price: 15억 KRW (1.5 billion)
- Capital gains: 5억 KRW (500 million)
- Exempted portion: (12억 / 15억) × 5억 = 4억 KRW
- Taxable portion: (3억 / 15억) × 5억 = 1억 KRW

### 1.3 Residence Requirement (조정대상지역 거주요건)

**Applicable to**: Homes in **Adjustment Target Areas (조정대상지역)** acquired **after August 2, 2017**

#### Current Adjustment Target Areas (2024):
1. 서울특별시 서초구 (Seoul Seocho-gu)
2. 서울특별시 강남구 (Seoul Gangnam-gu)
3. 서울특별시 송파구 (Seoul Songpa-gu)
4. 서울특별시 용산구 (Seoul Yongsan-gu)

#### Residence Requirement Logic:
```
IF:
  - Property in adjustment target area
  AND Property acquired after 2017-08-02
THEN:
  - Actual residence required (거주요건 적용)
  - Specific residence period varies by acquisition date
ELSE:
  - No residence requirement (거주요건 없음)
```

### 1.4 Edge Cases and Exceptions

| Scenario | Exemption Status | Notes |
|----------|------------------|-------|
| Temporary 2-home ownership | ✅ Possible | Old home sold within 3 years, other conditions met |
| Inherited home | ⚠️ Complex | Separate rules apply, may need legal review |
| Overseas residence | ⚠️ Complex | Different rules for overseas Koreans |
| Farm/rural home | ✅ Possible | May qualify under rural development law |

---

## 🎯 2. Long-term Holding Special Deduction (장기보유특별공제)

### 2.1 Purpose
Reduce tax burden for long-term property owners by deducting a percentage of capital gains based on holding/residence period.

### 2.2 Calculation Formula
```
Deduction Amount = Capital Gains × Deduction Rate
Capital Gains = Sale Price - Purchase Price - Necessary Expenses
```

### 2.3 Deduction Rates

#### A. General Real Estate (일반 부동산)

| Holding Period | Deduction Rate | Calculation |
|----------------|----------------|-------------|
| < 3 years | 0% | No deduction |
| 3 years | 6% | Base rate |
| 4 years | 8% | +2% per year |
| 5 years | 10% | +2% per year |
| 6 years | 12% | +2% per year |
| ... | ... | ... |
| 14 years | 28% | +2% per year |
| ≥ 15 years | **30%** | Maximum cap |

**Formula**:
```javascript
if (holdingYears < 3) {
  deductionRate = 0
} else if (holdingYears >= 15) {
  deductionRate = 0.30
} else {
  deductionRate = 0.06 + ((holdingYears - 3) * 0.02)
}
```

#### B. One Household One Home (1세대1주택, 실거래가 > 12억원)

For high-value homes (>12억 KRW), deduction is based on **both holding period and residence period**.

**Maximum Deduction**: 80% (40% holding + 40% residence)

##### Holding Period Deduction:

| Holding Period | Deduction Rate | Calculation |
|----------------|----------------|-------------|
| < 3 years | 0% | No deduction |
| 3 years | 12% | Base rate |
| 4 years | 16% | +4% per year |
| 5 years | 20% | +4% per year |
| ... | ... | ... |
| 9 years | 36% | +4% per year |
| ≥ 10 years | **40%** | Maximum cap |

**Formula**:
```javascript
if (holdingYears < 3) {
  holdingDeduction = 0
} else if (holdingYears >= 10) {
  holdingDeduction = 0.40
} else {
  holdingDeduction = 0.12 + ((holdingYears - 3) * 0.04)
}
```

##### Residence Period Deduction:

| Residence Period | Deduction Rate | Calculation |
|------------------|----------------|-------------|
| < 2 years | 0% | No deduction |
| 2 years | 8% | Base rate |
| 3 years | 12% | +4% per year |
| 4 years | 16% | +4% per year |
| ... | ... | ... |
| 9 years | 36% | +4% per year |
| ≥ 10 years | **40%** | Maximum cap |

**Formula**:
```javascript
if (residenceYears < 2) {
  residenceDeduction = 0
} else if (residenceYears >= 10) {
  residenceDeduction = 0.40
} else {
  residenceDeduction = 0.08 + ((residenceYears - 2) * 0.04)
}
```

**Total Deduction Rate**:
```javascript
totalDeductionRate = holdingDeduction + residenceDeduction // Max: 0.80 (80%)
```

### 2.4 Application Logic

```
IF (Property is 1세대1주택 AND Sale price > 1,200,000,000):
  Use holding + residence deduction (max 80%)
ELSE:
  Use general holding deduction only (max 30%)
```

### 2.5 Special Provisions (2024)

**Multiple Homeowner Deduction Exemption Suspension**:
- Period: 2022-05-09 to 2024-05-09 (Suspended)
- Meaning: Multiple homeowners in adjustment areas can still claim long-term holding deduction
- After 2024-05-09: Review updated regulations

---

## 🎯 3. Multiple Homeowner Heavy Tax Rate (다주택자 중과세율)

### 3.1 Heavy Taxation Suspension (한시 배제)

**CRITICAL**: Heavy taxation is **SUSPENDED** from 2022-05-10 to 2025-05-09

```
Current Status (2024):
- Heavy tax rates are NOT applied
- Basic progressive rates apply (6% ~ 45%)
- Suspension applies to adjustment target areas
```

### 3.2 Basic Tax Rate Structure (현재 적용 중)

During suspension period, standard progressive rates apply:

| Taxable Capital Gains | Tax Rate | Cumulative Deduction |
|-----------------------|----------|----------------------|
| ≤ 14,000,000 | 6% | 0 |
| ≤ 50,000,000 | 15% | 1,260,000 |
| ≤ 88,000,000 | 24% | 5,760,000 |
| ≤ 150,000,000 | 35% | 15,440,000 |
| ≤ 300,000,000 | 38% | 19,940,000 |
| ≤ 500,000,000 | 40% | 25,940,000 |
| > 500,000,000 | 45% | 50,940,000 |

**Formula**:
```javascript
function calculateBasicTax(taxableGains) {
  if (taxableGains <= 14000000) return taxableGains * 0.06
  if (taxableGains <= 50000000) return taxableGains * 0.15 - 1260000
  if (taxableGains <= 88000000) return taxableGains * 0.24 - 5760000
  if (taxableGains <= 150000000) return taxableGains * 0.35 - 15440000
  if (taxableGains <= 300000000) return taxableGains * 0.38 - 19940000
  if (taxableGains <= 500000000) return taxableGains * 0.40 - 25940000
  return taxableGains * 0.45 - 50940000
}
```

### 3.3 Heavy Tax Rate Structure (중과세율, 2025-05-10 이후 적용 예정)

**WARNING**: These rates will apply AFTER the suspension ends (2025-05-10)

#### Rates by Number of Homes:

| Home Count | Additional Tax | Effective Range |
|------------|----------------|-----------------|
| 2 homes | +20%p | 26% ~ 65% |
| 3+ homes | +30%p | 36% ~ 75% |

**Example (2 homes, 중과세 적용 시)**:
- Basic rate: 35%
- Heavy tax surcharge: +20%p
- Effective rate: 55%

#### Short-term Holding Penalty:

| Holding Period | Tax Rate | Application |
|----------------|----------|-------------|
| < 1 year | 70% | Flat rate |
| 1 ~ 2 years | 60% | Flat rate |
| ≥ 2 years | Heavy rates apply | As above |

### 3.4 Adjustment Target Areas (조정대상지역)

**Current (2024)**:
1. 서울특별시 강남구 (Seoul Gangnam-gu)
2. 서울특별시 서초구 (Seoul Seocho-gu)
3. 서울특별시 송파구 (Seoul Songpa-gu)
4. 서울특별시 용산구 (Seoul Yongsan-gu)

**Previous (before recent deregulation)**:
- More areas were designated
- Monitor government policy for changes

### 3.5 Exemptions from Heavy Taxation

#### New Exemptions (2024-01-10 ~ 2025-12-31):

1. **Small New Homes (소형 신축주택)**:
   - Newly built homes
   - Size restrictions apply
   - Not counted as additional home for heavy tax

2. **Unsold New Homes (준공 후 미분양 주택)**:
   - New homes unsold after completion
   - Purchase during exemption period
   - Not counted as additional home for heavy tax

---

## 🔧 4. Implementation Requirements

### 4.1 Data Requirements

#### User Input Data:
```javascript
{
  // Property Information
  propertyType: 'residential', // 주택
  salePrice: 1500000000, // 양도가액 (Sale price)
  purchasePrice: 800000000, // 취득가액 (Purchase price)
  necessaryExpenses: 50000000, // 필요경비 (Necessary expenses)

  // Ownership Information
  homeCount: 1, // 보유 주택 수 (Number of homes owned)
  householdHomeCount: 1, // 1세대 보유 주택 수

  // Period Information
  purchaseDate: '2015-03-15', // 취득일
  saleDate: '2024-10-18', // 양도일
  residenceStartDate: '2015-06-01', // 거주 시작일 (for 1세대1주택)
  residenceEndDate: '2024-10-01', // 거주 종료일

  // Location Information
  isAdjustmentArea: false, // 조정대상지역 여부
  location: {
    city: '서울특별시',
    district: '강남구',
    acquisitionDate: '2015-03-15'
  },

  // Special Circumstances
  isTemporaryTwoHome: false, // 일시적2주택 여부
  isInherited: false, // 상속 여부
  isRuralHome: false // 농어촌주택 여부
}
```

#### Calculated Data:
```javascript
{
  // Period Calculations
  holdingYears: 9.6, // 보유기간 (years)
  residenceYears: 9.3, // 거주기간 (years)

  // Capital Gains
  capitalGains: 650000000, // 양도차익 = 양도가액 - 취득가액 - 필요경비

  // Deductions
  longTermDeduction: 520000000, // 장기보유특별공제액
  oneHomeExemption: 650000000, // 1세대1주택 비과세액

  // Taxable Amount
  taxableGains: 0, // 과세표준

  // Tax Amount
  capitalGainsTax: 0, // 양도소득세
  localIncomeTax: 0 // 지방소득세 (10% of capital gains tax)
}
```

### 4.2 Calculation Flow

```
Step 1: Calculate Capital Gains
  → capitalGains = salePrice - purchasePrice - necessaryExpenses

Step 2: Check 1세대1주택 Exemption
  IF (householdHomeCount === 1 AND holdingYears >= 2):
    IF (salePrice <= 1,200,000,000):
      → Tax = 0 (Full exemption)
      → STOP
    ELSE:
      → Calculate proportional exemption
      → exemptedGains = capitalGains × (1,200,000,000 / salePrice)
      → taxableGains = capitalGains - exemptedGains

Step 3: Calculate Long-term Holding Deduction
  IF (1세대1주택 AND salePrice > 1,200,000,000):
    → Use holding + residence deduction (max 80%)
  ELSE:
    → Use general holding deduction (max 30%)

  → deductionAmount = taxableGains × deductionRate
  → taxableGains = taxableGains - deductionAmount

Step 4: Determine Tax Rate
  Current (2024):
    → Use basic progressive rates (6% ~ 45%)

  Future (after 2025-05-10):
    IF (homeCount >= 2 AND isAdjustmentArea):
      IF (holdingYears < 1):
        → rate = 70%
      ELSE IF (holdingYears < 2):
        → rate = 60%
      ELSE:
        → Apply heavy tax surcharge (+20%p or +30%p)

Step 5: Calculate Tax
  → capitalGainsTax = taxableGains × effectiveRate - cumulativeDeduction
  → localIncomeTax = capitalGainsTax × 0.10
  → totalTax = capitalGainsTax + localIncomeTax
```

### 4.3 Validation Rules

```javascript
const validationRules = {
  // Price validations
  salePrice: {
    required: true,
    min: 0,
    type: 'number'
  },
  purchasePrice: {
    required: true,
    min: 0,
    type: 'number',
    custom: (value, data) => value <= data.salePrice // Purchase ≤ Sale
  },
  necessaryExpenses: {
    required: true,
    min: 0,
    type: 'number'
  },

  // Ownership validations
  homeCount: {
    required: true,
    min: 1,
    max: 99,
    type: 'integer'
  },

  // Date validations
  purchaseDate: {
    required: true,
    type: 'date',
    max: 'today'
  },
  saleDate: {
    required: true,
    type: 'date',
    min: 'purchaseDate', // Sale date must be after purchase
    max: 'today'
  },
  residenceStartDate: {
    required: false, // Only for 1세대1주택
    type: 'date',
    min: 'purchaseDate',
    max: 'saleDate'
  },
  residenceEndDate: {
    required: false,
    type: 'date',
    min: 'residenceStartDate',
    max: 'saleDate'
  },

  // Location validations
  isAdjustmentArea: {
    required: true,
    type: 'boolean',
    autoCalculate: true // Calculate from location data
  }
}
```

---

## 🧪 5. Test Cases

### 5.1 Test Case 1: Standard 1세대1주택 Exemption (Full)

**Scenario**: One home, 3 years holding, sale price 10억 KRW

**Input**:
```javascript
{
  salePrice: 1000000000,
  purchasePrice: 600000000,
  necessaryExpenses: 50000000,
  homeCount: 1,
  householdHomeCount: 1,
  holdingYears: 3,
  residenceYears: 3,
  isAdjustmentArea: false
}
```

**Expected Output**:
```javascript
{
  capitalGains: 350000000,
  oneHomeExemption: 350000000, // Full exemption
  taxableGains: 0,
  capitalGainsTax: 0,
  localIncomeTax: 0,
  totalTax: 0
}
```

### 5.2 Test Case 2: High-value 1세대1주택 (Proportional)

**Scenario**: One home, 10 years holding/residence, sale price 15억 KRW

**Input**:
```javascript
{
  salePrice: 1500000000,
  purchasePrice: 800000000,
  necessaryExpenses: 50000000,
  homeCount: 1,
  householdHomeCount: 1,
  holdingYears: 10,
  residenceYears: 10,
  isAdjustmentArea: false
}
```

**Expected Calculation**:
```javascript
capitalGains = 1500000000 - 800000000 - 50000000 = 650000000

// Proportional exemption
exemptedPortion = 1200000000 / 1500000000 = 0.8 (80%)
exemptedGains = 650000000 × 0.8 = 520000000
taxableGains = 650000000 - 520000000 = 130000000

// Long-term deduction (80%: 40% holding + 40% residence)
longTermDeduction = 130000000 × 0.80 = 104000000
finalTaxableGains = 130000000 - 104000000 = 26000000

// Tax calculation (basic progressive rate)
// 26,000,000 falls in 15% bracket
capitalGainsTax = 26000000 × 0.15 - 1260000 = 2640000
localIncomeTax = 2640000 × 0.10 = 264000
totalTax = 2640000 + 264000 = 2904000
```

**Expected Output**:
```javascript
{
  capitalGains: 650000000,
  oneHomeExemption: 520000000,
  taxableGainsAfterExemption: 130000000,
  longTermDeductionRate: 0.80,
  longTermDeduction: 104000000,
  finalTaxableGains: 26000000,
  capitalGainsTax: 2640000,
  localIncomeTax: 264000,
  totalTax: 2904000
}
```

### 5.3 Test Case 3: Multiple Homes (Current Suspension)

**Scenario**: 2 homes, 3 years holding, sale in adjustment area (2024)

**Input**:
```javascript
{
  salePrice: 1000000000,
  purchasePrice: 700000000,
  necessaryExpenses: 30000000,
  homeCount: 2,
  householdHomeCount: 2,
  holdingYears: 3,
  residenceYears: 0,
  isAdjustmentArea: true,
  saleDate: '2024-10-18' // Within suspension period
}
```

**Expected Calculation**:
```javascript
capitalGains = 1000000000 - 700000000 - 30000000 = 270000000

// NO 1세대1주택 exemption (owns 2 homes)
// Long-term deduction: General rate (3 years = 6%)
longTermDeduction = 270000000 × 0.06 = 16200000
taxableGains = 270000000 - 16200000 = 253800000

// Current (2024): Heavy tax SUSPENDED → Use basic rates
// 253,800,000 falls in 35% bracket
capitalGainsTax = 253800000 × 0.35 - 15440000 = 73390000
localIncomeTax = 73390000 × 0.10 = 7339000
totalTax = 73390000 + 7339000 = 80729000
```

**Expected Output**:
```javascript
{
  capitalGains: 270000000,
  oneHomeExemption: 0, // Not applicable
  longTermDeductionRate: 0.06,
  longTermDeduction: 16200000,
  taxableGains: 253800000,
  heavyTaxApplied: false, // Suspended until 2025-05-09
  taxRate: 0.35,
  capitalGainsTax: 73390000,
  localIncomeTax: 7339000,
  totalTax: 80729000
}
```

### 5.4 Test Case 4: Short-term Holding (< 1 year)

**Scenario**: 1 home, 6 months holding, speculative sale

**Input**:
```javascript
{
  salePrice: 800000000,
  purchasePrice: 600000000,
  necessaryExpenses: 20000000,
  homeCount: 1,
  householdHomeCount: 1,
  holdingYears: 0.5,
  residenceYears: 0.5,
  isAdjustmentArea: false
}
```

**Expected Calculation**:
```javascript
capitalGains = 800000000 - 600000000 - 20000000 = 180000000

// NO 1세대1주택 exemption (holding < 2 years)
// NO long-term deduction (holding < 3 years)

// Short-term holding penalty (< 1 year)
// In adjustment area with multiple homes: Would be 70%
// But this is 1 home, non-adjustment area: Use basic progressive rates
taxableGains = 180000000

// 180,000,000 falls in 38% bracket
capitalGainsTax = 180000000 × 0.38 - 19940000 = 48460000
localIncomeTax = 48460000 × 0.10 = 4846000
totalTax = 48460000 + 4846000 = 53306000
```

**Expected Output**:
```javascript
{
  capitalGains: 180000000,
  oneHomeExemption: 0, // Holding < 2 years
  longTermDeduction: 0, // Holding < 3 years
  taxableGains: 180000000,
  shortTermHoldingPenalty: false, // Only 1 home, non-adjustment
  taxRate: 0.38,
  capitalGainsTax: 48460000,
  localIncomeTax: 4846000,
  totalTax: 53306000,
  warnings: ['보유기간 2년 미만으로 1세대1주택 비과세 미적용']
}
```

---

## 📊 6. Risk Assessment

### 6.1 Implementation Complexity

| Component | Complexity | Risk Level | Mitigation |
|-----------|------------|------------|------------|
| 1세대1주택 비과세 | High | 🟡 Medium | Clear decision tree, comprehensive tests |
| 장기보유특별공제 | Very High | 🔴 High | Dual deduction logic requires careful implementation |
| 다주택자 중과세율 | Medium | 🟡 Medium | Currently suspended, but must plan for 2025 |
| Adjustment area detection | Low | 🟢 Low | Hardcoded list, easy to update |
| Date calculations | Medium | 🟡 Medium | Use proven date library (date-fns) |

### 6.2 Legal Compliance Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Tax law changes | High | Critical | Implement version-based tax rules, update monitoring system |
| Calculation errors | Medium | Critical | Extensive unit tests, expert validation, TDD approach |
| Adjustment area changes | Medium | High | Automated monitoring from NTS website |
| Suspension period end | Certain (2025-05) | High | Implement feature flag for heavy tax activation |
| Edge case mishandling | Medium | High | Comprehensive test coverage, user warnings for complex cases |

### 6.3 User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| User doesn't know residence period | High | Provide helper text, examples, optional field with conservative default |
| User unsure about adjustment area | Medium | Auto-detect from address, provide clear explanation |
| Complex calculations confusing | High | Step-by-step breakdown, visual charts, clear explanations |
| Date input errors | Medium | Date picker UI, validation, clear format guidance |

---

## 🚀 7. Recommended Implementation Approach

### 7.1 Phase 1: Core Calculation Engine (M2.2.5)

**Priority**: 🔴 CRITICAL

**Components**:
1. `calculateCapitalGains()` - Basic capital gains calculation
2. `checkOneHomeExemption()` - 1세대1주택 비과세 logic
3. `calculateLongTermDeduction()` - 장기보유특별공제 logic
4. `determineTaxRate()` - Tax rate determination (basic + heavy)
5. `calculateFinalTax()` - Final tax calculation with local income tax

**Approach**: Test-Driven Development (TDD)
- Write tests FIRST based on test cases in Section 5
- Implement functions to pass tests
- Refactor for clarity and performance

### 7.2 Phase 2: Business Rules (M2.2.2, M2.2.3, M2.2.4)

**M2.2.2: 1세대1주택 비과세 로직** (8h)
- Implement proportional exemption
- Handle residence requirement for adjustment areas
- Edge case handling (temporary 2-home, inherited, etc.)

**M2.2.3: 장기보유특별공제 로직** (10h)
- Dual deduction system (general vs. 1세대1주택)
- Holding + residence period calculations
- Maximum cap enforcement (30% or 80%)

**M2.2.4: 다주택자 중과세율 로직** (12h)
- Feature flag for suspension period
- Heavy tax rate calculation
- Short-term holding penalty
- Adjustment area detection

### 7.3 Phase 3: UI Components (M2.2.6)

**Input Components**:
- Property value input (sale price, purchase price, expenses)
- Date pickers (purchase date, sale date, residence period)
- Home count selector
- Address input with adjustment area detection

**Output Components**:
- Tax calculation breakdown table
- Visual charts (tax components, deductions, final tax)
- Step-by-step explanation of calculation
- Warning messages for edge cases

### 7.4 Phase 4: Testing & Validation (M2.2.7)

**Test Coverage Requirements**:
- Unit tests: >90% coverage for all calculation functions
- Integration tests: End-to-end calculation flows
- Edge case tests: All scenarios in Section 5.5
- Validation tests: All input validation rules

---

## 📚 8. References

### 8.1 Legal References

1. **소득세법** (Income Tax Act)
   - Article 89: Capital Gains Tax (양도소득세)
   - Article 154: Long-term Holding Special Deduction (장기보유특별공제)

2. **조세특례제한법** (Restriction of Special Taxation Act)
   - Article 98: One Household One Home Exemption (1세대1주택 비과세)

3. **국세청 고시** (National Tax Service Notice)
   - 조정대상지역 지정 고시
   - 양도소득세 과세표준 확정신고 안내

### 8.2 Online Resources

1. National Tax Service (국세청): https://www.nts.go.kr
   - 양도소득세 개요: https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7707&mi=2308
   - 장기보유특별공제율: https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2311&cntntsId=7710

2. Hometax (홈택스): https://www.hometax.go.kr
   - 1세대1주택 비과세 확인: https://mob.tbht.hometax.go.kr/jsonAction.do?actionId=UTBRNAAU01F001

3. Easy Law (찾기쉬운 생활법령정보): https://www.easylaw.go.kr
   - 1세대 1주택 양도소득세 감면

### 8.3 Tax Planning Resources

1. Samjungsamjung (삼쩜삼): https://help.3o3.co.kr
   - 양도세 비과세 조건 정리

2. Haeon Tax Accounting (세무회계사무소 해온): https://www.haeontax.com
   - 조정대상지역 1세대 1주택 양도소득 장기보유특별공제 정리

---

## ✅ 9. Acceptance Criteria

### 9.1 Requirements Analysis Complete When:

- [x] All three major components researched (1세대1주택, 장기보유, 다주택 중과세)
- [x] Calculation formulas documented with examples
- [x] Test cases defined covering all major scenarios
- [x] Edge cases and exceptions identified
- [x] Implementation approach recommended
- [x] Risk assessment completed
- [x] Legal references compiled

### 9.2 Ready for Implementation When:

- [ ] Development team reviews and approves requirements
- [ ] Tax expert validates calculation logic
- [ ] Test cases approved by QA team
- [ ] UI/UX team reviews input/output requirements
- [ ] Product owner approves scope and approach

---

## 📝 10. Next Steps

### Immediate (M2.2.2-M2.2.4):

1. **M2.2.2**: Implement 1세대1주택 비과세 로직 (8h)
   - Build proportional exemption calculator
   - Implement residence requirement checker
   - Handle edge cases

2. **M2.2.3**: Implement 장기보유특별공제 로직 (10h)
   - Build dual deduction system
   - Implement period calculators
   - Add maximum cap logic

3. **M2.2.4**: Implement 다주택자 중과세율 로직 (12h)
   - Build feature flag system
   - Implement heavy tax calculator
   - Add adjustment area detection

### Follow-up (M2.2.5-M2.2.7):

4. **M2.2.5**: Integrate all components into unified calculation engine (24h)
5. **M2.2.6**: Build UI components for input and output (20h)
6. **M2.2.7**: Write comprehensive test suite (16h)

---

## 📋 Appendix A: Glossary (용어 정리)

| Korean Term | English Translation | Definition |
|-------------|---------------------|------------|
| 양도소득세 | Capital Gains Tax | Tax on profit from property sale |
| 1세대1주택 | One Household One Home | Single home ownership status |
| 비과세 | Tax Exemption | No tax liability |
| 장기보유특별공제 | Long-term Holding Special Deduction | Deduction for long-term property ownership |
| 조정대상지역 | Adjustment Target Area | Regions with strict real estate regulations |
| 중과세율 | Heavy Tax Rate | Increased tax rate for multiple homeowners |
| 보유기간 | Holding Period | Duration of property ownership |
| 거주기간 | Residence Period | Duration of actual residence |
| 양도차익 | Capital Gains | Sale price - Purchase price - Expenses |
| 과세표준 | Taxable Base | Amount subject to taxation |
| 누진세율 | Progressive Tax Rate | Increasing rate by income bracket |
| 필요경비 | Necessary Expenses | Allowable deductions from capital gains |
| 지방소득세 | Local Income Tax | 10% of capital gains tax |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Author**: AI Tax Consultant Development Team
**Status**: ✅ Complete - Ready for Review
