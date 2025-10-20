# 세법 DB 스키마 설계 (Tax Law Database Schema Design)

**작성일**: 2025-10-17
**작업**: M2.1.7 - 세법 DB 스키마 설계
**담당**: Backend Developer
**진행률**: 100% (설계 완료)

---

## 📋 개요 (Overview)

수집된 6개 세법 데이터 파일을 통합하여 JavaScript 기반 세법 DB 스키마를 설계합니다.

### 수집된 데이터 파일
1. ✅ `data_inheritance_tax_rates_2024.json` - 상속세 세율 (5단계 누진)
2. ✅ `data_gift_tax_rates_2024.json` - 증여세 세율 (5단계 누진)
3. ✅ `data_capital_gains_tax_rates_2024.json` - 양도소득세 세율 (8단계 누진)
4. ✅ `data_inheritance_tax_deductions_2024.json` - 상속세 공제 (8개 카테고리)
5. ✅ `data_gift_tax_deductions_2024.json` - 증여세 공제 (관계별 6개)
6. ✅ `data_capital_gains_tax_deductions_2024.json` - 양도소득세 공제 (장기보유 13단계)

### 설계 목표
- **통합성**: 3개 세목의 세율/공제를 일관된 구조로 통합
- **효율성**: 빠른 조회와 계산을 위한 최적화된 구조
- **확장성**: 새로운 세목이나 규정 추가 가능한 구조
- **유지보수성**: 세법 개정 시 쉬운 업데이트

---

## 🏗️ 스키마 구조

### 1. 통합 세율 스키마 (Tax Rates Schema)

```javascript
// src/constants/taxRates.js

const TAX_RATES_2024 = {
  // 메타데이터
  metadata: {
    fiscalYear: 2024,
    version: "1.0.0",
    lastUpdated: "2025-10-17",
    sources: {
      inheritance: "상속세 및 증여세법 제26조, 제27조",
      gift: "상속세 및 증여세법 제53조, 제55조",
      capitalGains: "소득세법 제104조, 제104조의2"
    }
  },

  // 상속세 세율 (5단계 누진)
  inheritance: {
    type: "progressive",
    brackets: [
      { min: 0, max: 100000000, rate: 0.10, deduction: 0 },
      { min: 100000001, max: 500000000, rate: 0.20, deduction: 10000000 },
      { min: 500000001, max: 1000000000, rate: 0.30, deduction: 60000000 },
      { min: 1000000001, max: 3000000000, rate: 0.40, deduction: 160000000 },
      { min: 3000000001, max: null, rate: 0.50, deduction: 460000000 }
    ],
    formula: (taxBase) => {
      const bracket = findBracket(taxBase, 'inheritance')
      return taxBase * bracket.rate - bracket.deduction
    }
  },

  // 증여세 세율 (상속세와 동일)
  gift: {
    type: "progressive",
    sameAsInheritance: true,
    brackets: [
      { min: 0, max: 100000000, rate: 0.10, deduction: 0 },
      { min: 100000001, max: 500000000, rate: 0.20, deduction: 10000000 },
      { min: 500000001, max: 1000000000, rate: 0.30, deduction: 60000000 },
      { min: 1000000001, max: 3000000000, rate: 0.40, deduction: 160000000 },
      { min: 3000000001, max: null, rate: 0.50, deduction: 460000000 }
    ],
    specialRules: {
      tenYearCumulation: true,
      relationshipBasedDeduction: true
    },
    formula: (taxBase) => {
      const bracket = findBracket(taxBase, 'gift')
      return taxBase * bracket.rate - bracket.deduction
    }
  },

  // 양도소득세 세율 (8단계 누진)
  capitalGains: {
    type: "progressive",
    brackets: [
      { min: 0, max: 14000000, rate: 0.06, deduction: 0 },
      { min: 14000001, max: 50000000, rate: 0.15, deduction: 1260000 },
      { min: 50000001, max: 88000000, rate: 0.24, deduction: 5760000 },
      { min: 88000001, max: 150000000, rate: 0.35, deduction: 15440000 },
      { min: 150000001, max: 300000000, rate: 0.38, deduction: 19940000 },
      { min: 300000001, max: 500000000, rate: 0.40, deduction: 25940000 },
      { min: 500000001, max: 1000000000, rate: 0.42, deduction: 35940000 },
      { min: 1000000001, max: null, rate: 0.45, deduction: 65940000 }
    ],
    specialRates: {
      twoHomes: { surcharge: 0.20, notes: "기본세율 + 20%p" },
      threeOrMoreHomes: { surcharge: 0.30, notes: "기본세율 + 30%p" }
    },
    exemptions: {
      oneHouseOneHousehold: {
        threshold: 1200000000,
        holdingPeriod: 2, // years
        residencePeriod: 2 // years
      }
    },
    formula: (taxBase, houseCount = 1, isRegulatedArea = false) => {
      const bracket = findBracket(taxBase, 'capitalGains')
      let rate = bracket.rate

      // 다주택자 중과세
      if (isRegulatedArea && houseCount === 2) {
        rate += 0.20
      } else if (isRegulatedArea && houseCount >= 3) {
        rate += 0.30
      }

      return taxBase * rate - bracket.deduction
    }
  },

  // 공통 유틸리티 함수
  findBracket: (taxBase, taxType) => {
    const brackets = TAX_RATES_2024[taxType].brackets
    return brackets.find(b =>
      taxBase >= b.min && (b.max === null || taxBase <= b.max)
    )
  },

  // 세액 계산 함수
  calculateTax: (taxBase, taxType, options = {}) => {
    const taxConfig = TAX_RATES_2024[taxType]

    if (taxType === 'capitalGains') {
      return taxConfig.formula(taxBase, options.houseCount, options.isRegulatedArea)
    } else {
      return taxConfig.formula(taxBase)
    }
  }
}

export default TAX_RATES_2024
```

---

### 2. 통합 공제 스키마 (Deductions Schema)

```javascript
// src/constants/deductions.js

const TAX_DEDUCTIONS_2024 = {
  // 메타데이터
  metadata: {
    fiscalYear: 2024,
    version: "1.0.0",
    lastUpdated: "2025-10-17"
  },

  // 상속세 공제
  inheritance: {
    basic: {
      name: "기초공제",
      amount: 200000000, // 2억원
      mandatory: true
    },
    spouse: {
      name: "배우자상속공제",
      minAmount: 500000000, // 최소 5억
      maxAmount: 3000000000, // 최대 30억
      formula: (inheritanceAmount, spouseActualInheritance) => {
        const calculated = Math.min(inheritanceAmount * 0.3, 3000000000)
        return Math.max(
          Math.max(spouseActualInheritance, calculated),
          500000000
        )
      }
    },
    child: {
      name: "자녀공제",
      amountPerChild: 50000000 // 1인당 5천만원
    },
    elderly: {
      name: "연로자공제",
      amount: 50000000, // 1인당 5천만원
      ageRequirement: 65
    },
    disability: {
      name: "장애인공제",
      amountPerYear: 10000000,
      formula: (age, lifeExpectancy) => {
        return (lifeExpectancy - age) * 10000000
      }
    },
    bulk: {
      name: "일괄공제",
      amount: 500000000, // 5억원
      excludes: ['basic', 'child', 'elderly', 'disability'],
      notes: "배우자공제는 별도 적용 가능"
    },
    financialAsset: {
      name: "금융재산상속공제",
      rates: [
        { max: 20000000, rate: 1.0 }, // 2천만원 이하 100%
        { max: 100000000, rate: 0.8 }, // 1억원 이하 80%
        { max: null, rate: 0.8, maxDeduction: 2000000000 } // 1억 초과 80%, 최대 20억
      ]
    },
    disaster: {
      name: "재해손실공제",
      formula: (lossAmount, insuranceReceived) => {
        return lossAmount - insuranceReceived
      }
    },

    // 공제 계산 로직
    calculate: (params) => {
      const { inheritanceAmount, spouse, children, elderly, disabled, financialAssets } = params

      // 배우자공제 계산
      const spouseDeduction = spouse
        ? TAX_DEDUCTIONS_2024.inheritance.spouse.formula(inheritanceAmount, spouse.actualInheritance)
        : 0

      // 개별공제 계산
      const individualDeductions =
        TAX_DEDUCTIONS_2024.inheritance.basic.amount +
        (children || 0) * TAX_DEDUCTIONS_2024.inheritance.child.amountPerChild +
        (elderly || 0) * TAX_DEDUCTIONS_2024.inheritance.elderly.amount +
        (disabled ? TAX_DEDUCTIONS_2024.inheritance.disability.formula(disabled.age, disabled.lifeExpectancy) : 0)

      // 일괄공제와 비교
      const bulkDeduction = TAX_DEDUCTIONS_2024.inheritance.bulk.amount
      const selectedDeduction = Math.max(individualDeductions, bulkDeduction)

      // 금융재산공제 계산
      const financialDeduction = calculateFinancialAssetDeduction(financialAssets)

      return {
        spouseDeduction,
        individualDeductions,
        bulkDeduction,
        selectedDeduction: selectedDeduction === bulkDeduction ? 'bulk' : 'individual',
        financialDeduction,
        totalDeduction: spouseDeduction + selectedDeduction + financialDeduction
      }
    }
  },

  // 증여세 공제
  gift: {
    byRelationship: {
      spouse: { amount: 600000000, period: 10 }, // 6억원, 10년 합산
      lineal_ascendant_adult: { amount: 50000000, period: 10, ageRequirement: 19 },
      lineal_ascendant_minor: { amount: 20000000, period: 10, ageRequirement: 19 },
      lineal_descendant: { amount: 50000000, period: 10 },
      other_relative: { amount: 10000000, period: 10 },
      non_relative: { amount: 0, period: 10 }
    },

    tenYearCumulation: {
      enabled: true,
      period: 10, // years

      // 10년 합산 계산
      calculate: (currentGift, previousGifts, relationship, recipientAge) => {
        // 10년 이내 증여 필터링
        const tenYearGifts = previousGifts.filter(g => {
          const daysDiff = (new Date() - new Date(g.date)) / (1000 * 60 * 60 * 24)
          return daysDiff <= 3650 // 정확히 10년
        })

        // 총 증여액 계산
        const totalGifts = currentGift + tenYearGifts.reduce((sum, g) => sum + g.amount, 0)

        // 관계별 공제액 결정
        let deduction = 0
        if (relationship === 'lineal_ascendant') {
          deduction = recipientAge >= 19
            ? TAX_DEDUCTIONS_2024.gift.byRelationship.lineal_ascendant_adult.amount
            : TAX_DEDUCTIONS_2024.gift.byRelationship.lineal_ascendant_minor.amount
        } else {
          deduction = TAX_DEDUCTIONS_2024.gift.byRelationship[relationship]?.amount || 0
        }

        // 과세표준 계산
        const taxBase = Math.max(totalGifts - deduction, 0)

        // 기납부세액 합산
        const previousTaxPaid = tenYearGifts.reduce((sum, g) => sum + (g.taxPaid || 0), 0)

        return {
          totalGifts,
          deduction,
          taxBase,
          previousTaxPaid,
          tenYearGifts: tenYearGifts.length
        }
      }
    }
  },

  // 양도소득세 공제
  capitalGains: {
    longTermHolding: {
      oneHouseOneHousehold: {
        maxRate: 0.80,
        rates: [
          { years: 3, rate: 0.12 },
          { years: 4, rate: 0.16 },
          { years: 5, rate: 0.20 },
          { years: 6, rate: 0.24 },
          { years: 7, rate: 0.28 },
          { years: 8, rate: 0.32 },
          { years: 9, rate: 0.36 },
          { years: 10, rate: 0.40 },
          { years: 11, rate: 0.48 },
          { years: 12, rate: 0.56 },
          { years: 13, rate: 0.64 },
          { years: 14, rate: 0.72 },
          { years: 15, rate: 0.80 }
        ],
        calculate: (capitalGain, holdingYears, residenceYears) => {
          const totalYears = holdingYears + residenceYears
          if (totalYears < 3) return 0

          const applicableRate = this.rates
            .filter(r => totalYears >= r.years)
            .pop()?.rate || 0

          return capitalGain * applicableRate
        }
      },
      generalRealEstate: {
        maxRate: 0.40,
        rates: [
          { years: 3, rate: 0.06 },
          { years: 4, rate: 0.08 },
          { years: 5, rate: 0.10 },
          { years: 6, rate: 0.12 },
          { years: 7, rate: 0.14 },
          { years: 8, rate: 0.16 },
          { years: 9, rate: 0.18 },
          { years: 10, rate: 0.20 },
          { years: 11, rate: 0.24 },
          { years: 12, rate: 0.28 },
          { years: 13, rate: 0.32 },
          { years: 14, rate: 0.36 },
          { years: 15, rate: 0.40 }
        ],
        calculate: (capitalGain, holdingYears) => {
          if (holdingYears < 3) return 0

          const applicableRate = this.rates
            .filter(r => holdingYears >= r.years)
            .pop()?.rate || 0

          return capitalGain * applicableRate
        }
      }
    },

    basic: {
      amount: 2500000, // 250만원
      applicability: "연 1회"
    },

    necessaryExpenses: {
      acquisition: ['취득세', '등록세', '중개수수료', '법무사수수료', '인지대'],
      improvement: ['증축', '개축', '대수선', '설비증설'],
      transfer: ['중개수수료', '법무사수수료', '인지대'],

      calculate: (expenses) => {
        return (expenses.acquisition || 0) +
               (expenses.improvement || 0) +
               (expenses.transfer || 0)
      }
    },

    // 양도소득세 공제 계산
    calculate: (params) => {
      const {
        transferPrice,
        acquisitionPrice,
        holdingYears,
        residenceYears = 0,
        isOneHouse = false,
        necessaryExpenses = {}
      } = params

      // 양도차익 계산
      const totalExpenses = TAX_DEDUCTIONS_2024.capitalGains.necessaryExpenses.calculate(necessaryExpenses)
      const capitalGain = transferPrice - acquisitionPrice - totalExpenses

      // 장기보유특별공제 계산
      let longTermDeduction = 0
      if (isOneHouse) {
        longTermDeduction = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.oneHouseOneHousehold
          .calculate(capitalGain, holdingYears, residenceYears)
      } else {
        longTermDeduction = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.generalRealEstate
          .calculate(capitalGain, holdingYears)
      }

      // 기본공제
      const basicDeduction = TAX_DEDUCTIONS_2024.capitalGains.basic.amount

      // 최종 과세표준
      const taxBase = Math.max(capitalGain - longTermDeduction - basicDeduction, 0)

      return {
        capitalGain,
        totalExpenses,
        longTermDeduction,
        basicDeduction,
        taxBase
      }
    }
  }
}

export default TAX_DEDUCTIONS_2024
```

---

### 3. 증여 이력 관리 (Gift History Management)

```javascript
// src/models/giftHistory.js

/**
 * 10년 합산 규정을 위한 증여 이력 관리
 */
const GiftHistory = {
  // 증여 이력 저장 구조
  schema: {
    giftId: "string (UUID)",
    giftDate: "Date",
    donor: "string (증여자 식별자)",
    recipient: "string (수증자 식별자)",
    relationship: "string (spouse|lineal_ascendant|lineal_descendant|other_relative|non_relative)",
    recipientAge: "number",
    giftAmount: "number",
    deductionUsed: "number",
    taxBase: "number",
    taxPaid: "number",
    createdAt: "Date",
    updatedAt: "Date"
  },

  // 10년 이내 증여 조회
  getTenYearGifts: (donor, recipient) => {
    const tenYearsAgo = new Date()
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)

    // 실제 구현에서는 DB 쿼리
    return giftHistoryDB.find({
      donor: donor,
      recipient: recipient,
      giftDate: { $gte: tenYearsAgo }
    }).sort({ giftDate: 1 })
  },

  // 증여세 계산 (10년 합산)
  calculateGiftTax: async (currentGift, donor, recipient, relationship, recipientAge) => {
    // 10년 이내 증여 조회
    const previousGifts = await GiftHistory.getTenYearGifts(donor, recipient)

    // 10년 합산 계산
    const result = TAX_DEDUCTIONS_2024.gift.tenYearCumulation.calculate(
      currentGift,
      previousGifts,
      relationship,
      recipientAge
    )

    // 세율 적용
    const taxAmount = TAX_RATES_2024.calculateTax(result.taxBase, 'gift')

    // 최종 납부세액
    const netTaxDue = Math.max(taxAmount - result.previousTaxPaid, 0)

    return {
      ...result,
      taxAmount,
      netTaxDue
    }
  },

  // 증여 이력 저장
  saveGiftHistory: async (giftData) => {
    const giftRecord = {
      giftId: generateUUID(),
      ...giftData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 실제 구현에서는 DB에 저장
    return await giftHistoryDB.insert(giftRecord)
  }
}

export default GiftHistory
```

---

### 4. 부동산 거래 이력 관리 (Real Estate Transaction History)

```javascript
// src/models/realEstateHistory.js

/**
 * 양도소득세 계산을 위한 부동산 거래 이력 관리
 */
const RealEstateHistory = {
  // 부동산 거래 이력 구조
  schema: {
    transactionId: "string (UUID)",
    propertyId: "string",
    ownerId: "string",
    transactionType: "string (acquisition|transfer)",
    transactionDate: "Date",
    price: "number",
    propertyType: "string (house|apartment|land|commercial)",
    address: "object { city, district, etc. }",
    isRegulatedArea: "boolean", // 조정대상지역 여부

    // 주택 관련
    isOneHouseHold: "boolean",
    houseCount: "number",

    // 기간 관련
    holdingPeriodStart: "Date",
    holdingPeriodEnd: "Date",
    residencePeriodStart: "Date",
    residencePeriodEnd: "Date",

    // 비용 관련
    necessaryExpenses: {
      acquisition: "number",
      improvement: "number",
      transfer: "number"
    },

    createdAt: "Date",
    updatedAt: "Date"
  },

  // 보유기간 계산
  calculateHoldingPeriod: (acquisitionDate, transferDate) => {
    const diff = transferDate - acquisitionDate
    const years = diff / (1000 * 60 * 60 * 24 * 365)
    return Math.floor(years)
  },

  // 거주기간 계산
  calculateResidencePeriod: (residenceStart, residenceEnd) => {
    if (!residenceStart || !residenceEnd) return 0

    const diff = residenceEnd - residenceStart
    const years = diff / (1000 * 60 * 60 * 24 * 365)
    return Math.floor(years)
  },

  // 양도소득세 계산
  calculateCapitalGainsTax: async (transferData) => {
    const { propertyId, transferPrice, transferDate } = transferData

    // 취득 정보 조회
    const acquisition = await realEstateDB.findOne({
      propertyId,
      transactionType: 'acquisition'
    })

    if (!acquisition) {
      throw new Error('취득 정보를 찾을 수 없습니다')
    }

    // 보유기간 계산
    const holdingYears = RealEstateHistory.calculateHoldingPeriod(
      acquisition.transactionDate,
      transferDate
    )

    // 거주기간 계산
    const residenceYears = RealEstateHistory.calculateResidencePeriod(
      acquisition.residencePeriodStart,
      acquisition.residencePeriodEnd
    )

    // 공제 계산
    const deductions = TAX_DEDUCTIONS_2024.capitalGains.calculate({
      transferPrice,
      acquisitionPrice: acquisition.price,
      holdingYears,
      residenceYears,
      isOneHouse: acquisition.isOneHouseHold,
      necessaryExpenses: acquisition.necessaryExpenses
    })

    // 세율 적용
    const taxAmount = TAX_RATES_2024.calculateTax(
      deductions.taxBase,
      'capitalGains',
      {
        houseCount: acquisition.houseCount,
        isRegulatedArea: acquisition.isRegulatedArea
      }
    )

    // 지방소득세 (10%)
    const localIncomeTax = taxAmount * 0.10

    return {
      ...deductions,
      taxAmount,
      localIncomeTax,
      totalTax: taxAmount + localIncomeTax
    }
  }
}

export default RealEstateHistory
```

---

### 5. 조정대상지역 관리 (Regulated Area Management)

```javascript
// src/models/regulatedAreas.js

/**
 * 조정대상지역 데이터 관리
 */
const RegulatedAreas = {
  // 조정대상지역 구조
  schema: {
    areaId: "string (UUID)",
    city: "string",
    district: "string",
    dong: "string (optional)",
    designatedDate: "Date",
    expiredDate: "Date (null if still active)",
    isActive: "boolean",
    notes: "string"
  },

  // 특정 날짜에 조정대상지역인지 확인
  isRegulatedArea: async (address, date) => {
    const area = await regulatedAreasDB.findOne({
      city: address.city,
      district: address.district,
      designatedDate: { $lte: date },
      $or: [
        { expiredDate: null },
        { expiredDate: { $gte: date } }
      ]
    })

    return !!area
  },

  // 조정대상지역 목록 조회
  getActiveAreas: async () => {
    return await regulatedAreasDB.find({
      isActive: true
    }).sort({ city: 1, district: 1 })
  },

  // 조정대상지역 지정/해제 이력
  getAreaHistory: async (city, district) => {
    return await regulatedAreasDB.find({
      city,
      district
    }).sort({ designatedDate: -1 })
  }
}

export default RegulatedAreas
```

---

## 🔄 데이터 흐름 (Data Flow)

### 상속세 계산 흐름
```
1. 상속재산가액 입력
2. 공제 계산 (TAX_DEDUCTIONS_2024.inheritance.calculate)
   - 배우자공제
   - 개별공제 vs 일괄공제 비교
   - 금융재산공제
3. 과세표준 = 상속재산 - 총공제액
4. 세율 적용 (TAX_RATES_2024.calculateTax)
5. 산출세액 도출
```

### 증여세 계산 흐름 (10년 합산)
```
1. 현재 증여액 입력
2. 10년 이내 증여 이력 조회 (GiftHistory.getTenYearGifts)
3. 총 증여액 = 현재 증여 + 과거 증여
4. 관계별 공제 적용 (TAX_DEDUCTIONS_2024.gift.byRelationship)
5. 과세표준 = 총 증여액 - 관계별 공제
6. 세율 적용 (TAX_RATES_2024.calculateTax)
7. 기납부세액 차감
8. 최종 납부세액 도출
9. 증여 이력 저장 (GiftHistory.saveGiftHistory)
```

### 양도소득세 계산 흐름
```
1. 양도가액, 취득가액 입력
2. 거래 이력 조회 (RealEstateHistory)
3. 보유기간/거주기간 계산
4. 조정대상지역 여부 확인 (RegulatedAreas.isRegulatedArea)
5. 필요경비 계산
6. 양도차익 = 양도가액 - 취득가액 - 필요경비
7. 장기보유특별공제 계산 (TAX_DEDUCTIONS_2024.capitalGains)
8. 과세표준 = 양도차익 - 장기보유특별공제 - 기본공제
9. 세율 적용 (다주택자 중과세 고려)
10. 산출세액 + 지방소득세(10%)
11. 총 납부세액 도출
```

---

## 📊 구현 우선순위 (Implementation Priority)

### Phase 1: 핵심 계산 엔진 (Week 3-4)
1. ✅ M2.1.7: DB 스키마 설계 (현재 작업)
2. ⏳ M2.1.8: `taxRates.js` 구현
3. ⏳ M2.1.9: `deductions.js` 구현
4. ⏳ M2.1.10: `validators.js` 구현

### Phase 2: 데이터 모델 (Week 5-6)
1. `giftHistory.js` 구현 (10년 합산)
2. `realEstateHistory.js` 구현 (보유/거주 이력)
3. `regulatedAreas.js` 구현 (조정대상지역)

### Phase 3: 통합 및 테스트 (Week 7-8)
1. 전체 세목 통합 테스트
2. 엣지 케이스 검증
3. 성능 최적화

---

## 🧪 검증 계획 (Validation Plan)

### 1. 단위 테스트
- 각 세목별 세율 계산 함수 테스트
- 공제 계산 로직 테스트
- 10년 합산 로직 테스트

### 2. 통합 테스트
- 실제 사례 기반 종합 테스트
- 수집된 테스트 케이스 (총 15개) 검증
  - 상속세: 5개
  - 증여세: 5개
  - 양도소득세: 5개

### 3. 성능 테스트
- 대량 데이터 조회 성능 (10년 이력)
- 복잡한 계산 로직 성능 (양도소득세)

---

## 🔧 유지보수 고려사항

### 1. 세법 개정 대응
- 연도별 데이터 버전 관리
- 메타데이터에 유효기간 명시
- 법 개정 시 새 버전 생성

### 2. 확장성
- 새로운 세목 추가 가능한 구조
- 특별 규정 추가 용이
- 공제 항목 동적 추가

### 3. 데이터 무결성
- 입력 검증 (validators.js)
- 계산 결과 검증
- 로그 및 감사 추적

---

## 📝 다음 단계 (Next Steps)

1. **M2.1.8**: `taxRates.js` 파일 작성
   - 위 스키마를 실제 JavaScript 파일로 구현
   - 각 세목별 세율 계산 함수 구현

2. **M2.1.9**: `deductions.js` 파일 작성
   - 공제 계산 로직 구현
   - 개별공제 vs 일괄공제 비교 로직

3. **M2.1.10**: `validators.js` 파일 작성
   - 입력 데이터 검증
   - 계산 결과 검증

4. **통합 테스트**:
   - 수집된 15개 테스트 케이스로 검증
   - 추가 엣지 케이스 테스트

---

**설계 완료일**: 2025-10-17
**검토자**: Backend Developer
**승인 상태**: ✅ 완료
