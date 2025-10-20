/**
 * deductions.js Unit Tests
 *
 * 공제 계산 함수 검증
 * - 상속세, 증여세, 양도소득세 공제
 * - 엣지 케이스 처리
 * - 공통 유틸리티 함수
 *
 * Target Coverage: >90%
 *
 * @version 1.0.0
 * @date 2025-10-18
 * @task M2.1.9 - deductions.js 검증
 */

import TAX_DEDUCTIONS_2024 from '../deductions.js'

describe('TAX_DEDUCTIONS_2024 - Metadata', () => {
  test('should have correct metadata structure', () => {
    expect(TAX_DEDUCTIONS_2024.metadata).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.metadata.fiscalYear).toBe(2024)
    expect(TAX_DEDUCTIONS_2024.metadata.version).toBe('1.0.0')
    expect(TAX_DEDUCTIONS_2024.metadata.lastUpdated).toBe('2025-10-17')
  })

  test('should have legal sources', () => {
    expect(TAX_DEDUCTIONS_2024.metadata.sources.inheritance).toContain('상속세 및 증여세법')
    expect(TAX_DEDUCTIONS_2024.metadata.sources.gift).toContain('상속세 및 증여세법')
    expect(TAX_DEDUCTIONS_2024.metadata.sources.capitalGains).toContain('소득세법')
  })
})

// ==========================================
// 상속세 공제 테스트
// ==========================================
describe('Inheritance Tax Deductions', () => {
  const { inheritance } = TAX_DEDUCTIONS_2024

  // 기초공제
  describe('Basic Deduction', () => {
    test('should have correct amount', () => {
      expect(inheritance.basic.amount).toBe(200000000) // 2억원
      expect(inheritance.basic.mandatory).toBe(true)
    })
  })

  // 배우자공제
  describe('Spouse Deduction', () => {
    test('should calculate spouse deduction: actual inheritance is largest', () => {
      const result = inheritance.spouse.calculate(1000000000, 800000000)
      expect(result).toBe(800000000) // 실제 상속액 8억 > 법정공제액 3억
    })

    test('should calculate spouse deduction: legal deduction is largest', () => {
      const result = inheritance.spouse.calculate(5000000000, 1000000000)
      expect(result).toBe(1500000000) // 법정공제액 15억 (5B × 30%) > 실제 10억
    })

    test('should calculate spouse deduction: max 30억 limit', () => {
      const result = inheritance.spouse.calculate(20000000000, 1000000000)
      expect(result).toBe(3000000000) // 최대 30억
    })

    test('should guarantee minimum 5억', () => {
      const result = inheritance.spouse.calculate(100000000, 50000000)
      expect(result).toBe(500000000) // 최소 5억 보장
    })

    test('should calculate 0 inheritance correctly', () => {
      const result = inheritance.spouse.calculate(0, 0)
      expect(result).toBe(500000000) // 최소 5억
    })
  })

  // 자녀공제
  describe('Child Deduction', () => {
    test('should calculate 0 children', () => {
      const result = inheritance.child.calculate(0)
      expect(result).toBe(0)
    })

    test('should calculate 1 child', () => {
      const result = inheritance.child.calculate(1)
      expect(result).toBe(50000000) // 5천만원
    })

    test('should calculate 3 children', () => {
      const result = inheritance.child.calculate(3)
      expect(result).toBe(150000000) // 1.5억원
    })

    test('should calculate 10 children', () => {
      const result = inheritance.child.calculate(10)
      expect(result).toBe(500000000) // 5억원
    })
  })

  // 연로자공제
  describe('Elderly Deduction', () => {
    test('should calculate 0 elderly', () => {
      const result = inheritance.elderly.calculate(0)
      expect(result).toBe(0)
    })

    test('should calculate 1 elderly', () => {
      const result = inheritance.elderly.calculate(1)
      expect(result).toBe(50000000) // 5천만원
    })

    test('should calculate 2 elderly', () => {
      const result = inheritance.elderly.calculate(2)
      expect(result).toBe(100000000) // 1억원
    })

    test('should have age requirement 65', () => {
      expect(inheritance.elderly.ageRequirement).toBe(65)
    })
  })

  // 장애인공제
  describe('Disability Deduction', () => {
    test('should calculate with life expectancy', () => {
      const result = inheritance.disability.calculate(40, 75)
      expect(result).toBe(350000000) // (75-40) × 1천만원 = 3.5억
    })

    test('should calculate with 10 years remaining', () => {
      const result = inheritance.disability.calculate(65, 75)
      expect(result).toBe(100000000) // 10 × 1천만원
    })

    test('should calculate with 30 years remaining', () => {
      const result = inheritance.disability.calculate(20, 50)
      expect(result).toBe(300000000) // 30 × 1천만원
    })

    test('should calculate 0 for equal age and life expectancy', () => {
      const result = inheritance.disability.calculate(75, 75)
      expect(result).toBe(0)
    })
  })

  // 일괄공제
  describe('Bulk Deduction', () => {
    test('should have correct amount', () => {
      expect(inheritance.bulk.amount).toBe(500000000) // 5억원
    })

    test('should exclude specific deductions', () => {
      expect(inheritance.bulk.excludes).toContain('basic')
      expect(inheritance.bulk.excludes).toContain('child')
      expect(inheritance.bulk.excludes).toContain('elderly')
      expect(inheritance.bulk.excludes).toContain('disability')
    })
  })

  // 금융재산공제
  describe('Financial Asset Deduction', () => {
    test('should return 0 for 0 assets', () => {
      const result = inheritance.financialAsset.calculate(0)
      expect(result).toBe(0)
    })

    test('should return 0 for negative assets', () => {
      const result = inheritance.financialAsset.calculate(-1000000)
      expect(result).toBe(0)
    })

    test('should calculate 100% for ≤2천만원', () => {
      const result = inheritance.financialAsset.calculate(10000000)
      expect(result).toBe(10000000) // 100% 공제
    })

    test('should calculate 100% for exactly 2천만원', () => {
      const result = inheritance.financialAsset.calculate(20000000)
      expect(result).toBe(20000000) // 100% 공제
    })

    test('should calculate 80% for 2천만원 초과', () => {
      const result = inheritance.financialAsset.calculate(50000000)
      expect(result).toBe(40000000) // 80% 공제
    })

    test('should calculate 80% for 1억원', () => {
      const result = inheritance.financialAsset.calculate(100000000)
      expect(result).toBe(80000000) // 80% 공제
    })

    test('should apply max limit 20억 for large assets', () => {
      const result = inheritance.financialAsset.calculate(5000000000)
      expect(result).toBe(2000000000) // 최대 20억
    })

    test('should apply max limit 20억 for very large assets', () => {
      const result = inheritance.financialAsset.calculate(10000000000)
      expect(result).toBe(2000000000) // 최대 20억
    })
  })

  // 재해손실공제
  describe('Disaster Deduction', () => {
    test('should calculate full loss without insurance', () => {
      const result = inheritance.disaster.calculate(100000000, 0)
      expect(result).toBe(100000000)
    })

    test('should calculate loss minus insurance', () => {
      const result = inheritance.disaster.calculate(100000000, 30000000)
      expect(result).toBe(70000000)
    })

    test('should return 0 if insurance covers all', () => {
      const result = inheritance.disaster.calculate(100000000, 100000000)
      expect(result).toBe(0)
    })

    test('should return 0 if insurance exceeds loss', () => {
      const result = inheritance.disaster.calculate(100000000, 150000000)
      expect(result).toBe(0)
    })

    test('should default to 0 insurance if not provided', () => {
      const result = inheritance.disaster.calculate(50000000)
      expect(result).toBe(50000000)
    })
  })

  // 총 공제액 계산
  describe('Total Deductions Calculation', () => {
    test('should calculate individual deductions > bulk', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 1000000000,
        spouse: { actualInheritance: 400000000 },
        children: 3,
        elderly: 2,
        disabled: { age: 40, lifeExpectancy: 75 },
        financialAssets: 0,
        disaster: null
      })

      expect(result.spouseDeduction).toBe(500000000) // 최소 5억
      expect(result.basicDeduction).toBe(200000000) // 2억
      expect(result.childDeduction).toBe(150000000) // 1.5억
      expect(result.elderlyDeduction).toBe(100000000) // 1억
      expect(result.disabilityDeduction).toBe(350000000) // 3.5억
      expect(result.individualDeductions).toBe(800000000) // 8억
      expect(result.bulkDeduction).toBe(500000000) // 5억
      expect(result.selectedDeduction).toBe('individual') // 개별 선택
      expect(result.selectedDeductionAmount).toBe(800000000)
      expect(result.totalDeduction).toBe(1300000000) // 13억 (배우자 5억 + 개별 8억)
    })

    test('should calculate bulk > individual deductions', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 1000000000,
        spouse: { actualInheritance: 300000000 },
        children: 1,
        elderly: 0,
        financialAssets: 0
      })

      expect(result.individualDeductions).toBe(250000000) // 2.5억 (기초 2억 + 자녀 0.5억)
      expect(result.bulkDeduction).toBe(500000000) // 5억
      expect(result.selectedDeduction).toBe('bulk') // 일괄 선택
      expect(result.selectedDeductionAmount).toBe(500000000)
    })

    test('should include financial asset deduction', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 500000000,
        financialAssets: 100000000
      })

      expect(result.financialDeduction).toBe(80000000) // 1억 × 80%
      expect(result.totalDeduction).toBeGreaterThan(500000000)
    })

    test('should include disaster deduction', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 500000000,
        disaster: { lossAmount: 50000000, insuranceReceived: 10000000 }
      })

      expect(result.disasterDeduction).toBe(40000000)
    })

    test('should calculate with no spouse', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 500000000,
        children: 2
      })

      expect(result.spouseDeduction).toBe(0)
      expect(result.childDeduction).toBe(100000000)
    })

    test('should have recommendation text', () => {
      const result = inheritance.calculateTotal({
        inheritanceAmount: 1000000000,
        children: 3,
        elderly: 2
      })

      expect(result.recommendation).toContain('공제 선택')
    })
  })
})

// ==========================================
// 증여세 공제 테스트
// ==========================================
describe('Gift Tax Deductions', () => {
  const { gift } = TAX_DEDUCTIONS_2024

  describe('Relationship-based Deductions', () => {
    test('should have correct amounts for each relationship', () => {
      expect(gift.byRelationship.spouse.amount).toBe(600000000) // 6억
      expect(gift.byRelationship.lineal_ascendant_adult.amount).toBe(50000000) // 5천만
      expect(gift.byRelationship.lineal_ascendant_minor.amount).toBe(20000000) // 2천만
      expect(gift.byRelationship.lineal_descendant.amount).toBe(50000000) // 5천만
      expect(gift.byRelationship.other_relative.amount).toBe(10000000) // 1천만
      expect(gift.byRelationship.non_relative.amount).toBe(0) // 0
    })

    test('should all have 10-year period', () => {
      expect(gift.byRelationship.spouse.period).toBe(10)
      expect(gift.byRelationship.lineal_ascendant_adult.period).toBe(10)
      expect(gift.byRelationship.other_relative.period).toBe(10)
    })
  })

  describe('Get Deduction by Relationship', () => {
    test('should return spouse deduction', () => {
      const result = gift.getDeductionByRelationship('spouse', 30)
      expect(result).toBe(600000000)
    })

    test('should return adult lineal ascendant deduction', () => {
      const result = gift.getDeductionByRelationship('lineal_ascendant', 25)
      expect(result).toBe(50000000)
    })

    test('should return minor lineal ascendant deduction', () => {
      const result = gift.getDeductionByRelationship('lineal_ascendant', 15)
      expect(result).toBe(20000000)
    })

    test('should return exactly at age 19', () => {
      const result = gift.getDeductionByRelationship('lineal_ascendant', 19)
      expect(result).toBe(50000000) // 19세는 성년
    })

    test('should return lineal descendant deduction', () => {
      const result = gift.getDeductionByRelationship('lineal_descendant', 50)
      expect(result).toBe(50000000)
    })

    test('should return other relative deduction', () => {
      const result = gift.getDeductionByRelationship('other_relative', 30)
      expect(result).toBe(10000000)
    })

    test('should return non-relative deduction (0)', () => {
      const result = gift.getDeductionByRelationship('non_relative', 30)
      expect(result).toBe(0)
    })

    test('should return 0 for invalid relationship', () => {
      const result = gift.getDeductionByRelationship('invalid', 30)
      expect(result).toBe(0)
    })
  })

  describe('Ten-Year Cumulation Calculation', () => {
    test('should calculate with no previous gifts', () => {
      const result = gift.calculateWithTenYearCumulation(
        100000000,
        [],
        'spouse',
        30
      )

      expect(result.currentGift).toBe(100000000)
      expect(result.previousGiftTotal).toBe(0)
      expect(result.totalGifts).toBe(100000000)
      expect(result.tenYearGiftsCount).toBe(0)
      expect(result.deduction).toBe(600000000)
      expect(result.taxBase).toBe(0) // 1억 - 6억 = 0
      expect(result.previousTaxPaid).toBe(0)
    })

    test('should calculate with previous gifts within 10 years', () => {
      const previousGifts = [
        { date: '2020-01-01', amount: 200000000, taxPaid: 10000000 },
        { date: '2022-06-15', amount: 150000000, taxPaid: 5000000 }
      ]

      const result = gift.calculateWithTenYearCumulation(
        300000000,
        previousGifts,
        'spouse',
        30
      )

      expect(result.currentGift).toBe(300000000)
      expect(result.previousGiftTotal).toBe(350000000)
      expect(result.totalGifts).toBe(650000000) // 3억 + 3.5억
      expect(result.tenYearGiftsCount).toBe(2)
      expect(result.deduction).toBe(600000000)
      expect(result.taxBase).toBe(50000000) // 6.5억 - 6억
      expect(result.previousTaxPaid).toBe(15000000)
    })

    test('should filter out gifts older than 10 years', () => {
      const previousGifts = [
        { date: '2010-01-01', amount: 100000000, taxPaid: 5000000 }, // 10년 이상 전
        { date: '2023-01-01', amount: 50000000, taxPaid: 2000000 }
      ]

      const result = gift.calculateWithTenYearCumulation(
        100000000,
        previousGifts,
        'lineal_ascendant',
        25
      )

      expect(result.previousGiftTotal).toBe(50000000) // 2010년 증여 제외
      expect(result.totalGifts).toBe(150000000)
      expect(result.tenYearGiftsCount).toBe(1)
    })

    test('should calculate for lineal ascendant adult', () => {
      const result = gift.calculateWithTenYearCumulation(
        80000000,
        [],
        'lineal_ascendant',
        20
      )

      expect(result.deduction).toBe(50000000)
      expect(result.taxBase).toBe(30000000) // 8천만 - 5천만
    })

    test('should calculate for lineal ascendant minor', () => {
      const result = gift.calculateWithTenYearCumulation(
        50000000,
        [],
        'lineal_ascendant',
        15
      )

      expect(result.deduction).toBe(20000000)
      expect(result.taxBase).toBe(30000000) // 5천만 - 2천만
    })

    test('should handle gifts with no taxPaid field', () => {
      const previousGifts = [
        { date: '2023-01-01', amount: 100000000 } // taxPaid 없음
      ]

      const result = gift.calculateWithTenYearCumulation(
        100000000,
        previousGifts,
        'spouse',
        30
      )

      expect(result.previousTaxPaid).toBe(0)
    })
  })
})

// ==========================================
// 양도소득세 공제 테스트
// ==========================================
describe('Capital Gains Tax Deductions', () => {
  const { capitalGains } = TAX_DEDUCTIONS_2024

  describe('Long-term Holding - One House One Household', () => {
    const oneHouse = capitalGains.longTermHolding.oneHouseOneHousehold

    test('should return 0 for holding < 3 years', () => {
      const result = oneHouse.calculate(100000000, 2, 0)
      expect(result.deduction).toBe(0)
      expect(result.rate).toBe(0)
      expect(result.totalYears).toBe(2)
    })

    test('should calculate 12% for 3 years', () => {
      const result = oneHouse.calculate(100000000, 3, 0)
      expect(result.deduction).toBe(12000000)
      expect(result.rate).toBe(0.12)
      expect(result.totalYears).toBe(3)
    })

    test('should calculate with holding + residence years', () => {
      const result = oneHouse.calculate(100000000, 3, 2)
      expect(result.totalYears).toBe(5)
      expect(result.rate).toBe(0.20) // 5년 → 20%
      expect(result.deduction).toBe(20000000)
      expect(result.holdingYears).toBe(3)
      expect(result.residenceYears).toBe(2)
    })

    test('should calculate 40% for 10 years', () => {
      const result = oneHouse.calculate(100000000, 5, 5)
      expect(result.totalYears).toBe(10)
      expect(result.rate).toBe(0.40)
      expect(result.deduction).toBe(40000000)
    })

    test('should calculate max 80% for 15 years', () => {
      const result = oneHouse.calculate(100000000, 10, 5)
      expect(result.totalYears).toBe(15)
      expect(result.rate).toBe(0.80)
      expect(result.deduction).toBe(80000000)
    })

    test('should calculate max 80% for >15 years', () => {
      const result = oneHouse.calculate(100000000, 15, 5)
      expect(result.totalYears).toBe(20)
      expect(result.rate).toBe(0.80) // 최대 80%
      expect(result.deduction).toBe(80000000)
    })

    test('should floor the deduction', () => {
      const result = oneHouse.calculate(123456789, 5, 0)
      expect(result.deduction).toBe(24691357) // floor(123456789 × 0.20)
    })
  })

  describe('Long-term Holding - General Real Estate', () => {
    const general = capitalGains.longTermHolding.generalRealEstate

    test('should return 0 for holding < 3 years', () => {
      const result = general.calculate(100000000, 2)
      expect(result.deduction).toBe(0)
      expect(result.rate).toBe(0)
    })

    test('should calculate 6% for 3 years', () => {
      const result = general.calculate(100000000, 3)
      expect(result.deduction).toBe(6000000)
      expect(result.rate).toBe(0.06)
    })

    test('should calculate 20% for 10 years', () => {
      const result = general.calculate(100000000, 10)
      expect(result.deduction).toBe(20000000)
      expect(result.rate).toBe(0.20)
    })

    test('should calculate max 40% for 15 years', () => {
      const result = general.calculate(100000000, 15)
      expect(result.deduction).toBe(40000000)
      expect(result.rate).toBe(0.40)
    })

    test('should calculate max 40% for >15 years', () => {
      const result = general.calculate(100000000, 20)
      expect(result.deduction).toBe(40000000)
      expect(result.rate).toBe(0.40)
    })

    test('should have 13 rate brackets', () => {
      expect(general.rates).toHaveLength(13)
    })
  })

  describe('Basic Deduction', () => {
    test('should have correct amount', () => {
      expect(capitalGains.basic.amount).toBe(2500000) // 250만원
    })

    test('should be applicable once per year', () => {
      expect(capitalGains.basic.applicability).toBe('연 1회')
    })
  })

  describe('Necessary Expenses', () => {
    test('should calculate total expenses', () => {
      const result = capitalGains.necessaryExpenses.calculate({
        acquisition: 10000000,
        improvement: 5000000,
        transfer: 3000000
      })

      expect(result).toBe(18000000)
    })

    test('should default to 0 for missing expenses', () => {
      const result = capitalGains.necessaryExpenses.calculate({})
      expect(result).toBe(0)
    })

    test('should handle partial expenses', () => {
      const result = capitalGains.necessaryExpenses.calculate({
        acquisition: 10000000,
        transfer: 2000000
      })

      expect(result).toBe(12000000)
    })
  })

  describe('Total Deductions Calculation', () => {
    test('should calculate full flow for one house', () => {
      const result = capitalGains.calculateTotal({
        transferPrice: 500000000,
        acquisitionPrice: 300000000,
        holdingYears: 5,
        residenceYears: 3,
        isOneHouse: true,
        necessaryExpenses: {
          acquisition: 10000000,
          transfer: 5000000
        }
      })

      const expectedGain = 500000000 - 300000000 - 15000000 // 1.85억
      expect(result.capitalGain).toBe(expectedGain)
      expect(result.totalExpenses).toBe(15000000)
      expect(result.longTermDeductionRate).toBe(0.32) // 8년 → 32%
      expect(result.longTermDeduction).toBe(Math.floor(expectedGain * 0.32))
      expect(result.basicDeduction).toBe(2500000)
      expect(result.taxBase).toBeGreaterThan(0)
    })

    test('should calculate full flow for general real estate', () => {
      const result = capitalGains.calculateTotal({
        transferPrice: 500000000,
        acquisitionPrice: 300000000,
        holdingYears: 10,
        isOneHouse: false,
        necessaryExpenses: {
          acquisition: 5000000
        }
      })

      const expectedGain = 500000000 - 300000000 - 5000000 // 1.95억
      expect(result.capitalGain).toBe(expectedGain)
      expect(result.longTermDeductionRate).toBe(0.20) // 10년 → 20%
      expect(result.longTermDeduction).toBe(Math.floor(expectedGain * 0.20))
    })

    test('should return 0 for capital loss', () => {
      const result = capitalGains.calculateTotal({
        transferPrice: 300000000,
        acquisitionPrice: 500000000,
        holdingYears: 5,
        isOneHouse: true
      })

      expect(result.capitalGain).toBe(0)
      expect(result.longTermDeduction).toBe(0)
      expect(result.taxBase).toBe(0)
    })

    test('should handle 0 holding years', () => {
      const result = capitalGains.calculateTotal({
        transferPrice: 400000000,
        acquisitionPrice: 300000000,
        holdingYears: 0,
        isOneHouse: false
      })

      expect(result.capitalGain).toBe(100000000)
      expect(result.longTermDeduction).toBe(0) // < 3년
      expect(result.taxBase).toBe(97500000) // 1억 - 250만 (기본공제)
    })

    test('should not apply negative tax base', () => {
      const result = capitalGains.calculateTotal({
        transferPrice: 110000000,
        acquisitionPrice: 100000000,
        holdingYears: 15,
        residenceYears: 5,
        isOneHouse: true
      })

      const expectedGain = 10000000
      const longTermDeduction = Math.floor(expectedGain * 0.80) // 8,000,000
      const basicDeduction = 2500000

      expect(result.taxBase).toBe(0) // 1천만 - 800만 - 250만 = 음수 → 0
    })
  })
})

// ==========================================
// 공통 유틸리티 함수 테스트
// ==========================================
describe('Common Utility Functions', () => {
  describe('Format Deduction', () => {
    test('should format amount in 억 and 만원', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(350000000)
      expect(result).toBe('3억 5000만원')
    })

    test('should format amount in 억원 only', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(500000000)
      expect(result).toBe('5억원')
    })

    test('should format amount in 만원 only', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(50000000)
      expect(result).toBe('5000만원')
    })

    test('should format small amount in 만원', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(1234567)
      expect(result).toBe('123만원')
    })

    test('should format 0', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(0)
      expect(result).toBe('0원')
    })

    test('should format large amount', () => {
      const result = TAX_DEDUCTIONS_2024.formatDeduction(1234567890)
      expect(result).toBe('12억 3456만원')
    })
  })

  describe('Format Rate', () => {
    test('should format 0.12 as 12%', () => {
      const result = TAX_DEDUCTIONS_2024.formatRate(0.12)
      expect(result).toBe('12%')
    })

    test('should format 0.80 as 80%', () => {
      const result = TAX_DEDUCTIONS_2024.formatRate(0.80)
      expect(result).toBe('80%')
    })

    test('should format 1.0 as 100%', () => {
      const result = TAX_DEDUCTIONS_2024.formatRate(1.0)
      expect(result).toBe('100%')
    })

    test('should format 0 as 0%', () => {
      const result = TAX_DEDUCTIONS_2024.formatRate(0)
      expect(result).toBe('0%')
    })

    test('should format 0.065 as 7%', () => {
      const result = TAX_DEDUCTIONS_2024.formatRate(0.065)
      expect(result).toBe('7%') // rounds to 7%
    })
  })
})

// ==========================================
// 엣지 케이스 및 경계값 테스트
// ==========================================
describe('Edge Cases and Boundary Values', () => {
  // 상속세 공제 경계값
  describe('Inheritance Tax Edge Cases', () => {
    test('spouse deduction: boundary at 5억', () => {
      const result = TAX_DEDUCTIONS_2024.inheritance.spouse.calculate(1000000000, 499999999)
      expect(result).toBe(500000000) // 최소 5억 보장
    })

    test('spouse deduction: boundary at 30억', () => {
      const result = TAX_DEDUCTIONS_2024.inheritance.spouse.calculate(15000000000, 2000000000)
      expect(result).toBe(3000000000) // 최대 30억
    })

    test('financial asset: boundary at 2천만원', () => {
      const below = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(19999999)
      const exact = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(20000000)
      const above = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(20000001)

      expect(below).toBe(19999999) // 100%
      expect(exact).toBe(20000000) // 100%
      expect(above).toBe(16000000) // 80%
    })

    test('financial asset: boundary at 1억원', () => {
      const below = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(99999999)
      const exact = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(100000000)
      const above = TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate(100000001)

      expect(below).toBe(79999999) // 80%
      expect(exact).toBe(80000000) // 80%
      expect(above).toBe(80000000) // 80%
    })
  })

  // 증여세 공제 경계값
  describe('Gift Tax Edge Cases', () => {
    test('lineal ascendant: boundary at age 19', () => {
      const age18 = TAX_DEDUCTIONS_2024.gift.getDeductionByRelationship('lineal_ascendant', 18)
      const age19 = TAX_DEDUCTIONS_2024.gift.getDeductionByRelationship('lineal_ascendant', 19)
      const age20 = TAX_DEDUCTIONS_2024.gift.getDeductionByRelationship('lineal_ascendant', 20)

      expect(age18).toBe(20000000) // 미성년
      expect(age19).toBe(50000000) // 성년
      expect(age20).toBe(50000000) // 성년
    })
  })

  // 양도소득세 공제 경계값
  describe('Capital Gains Tax Edge Cases', () => {
    test('one house: boundary at 3 years', () => {
      const oneHouse = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.oneHouseOneHousehold

      const year2 = oneHouse.calculate(100000000, 2, 0)
      const year3 = oneHouse.calculate(100000000, 3, 0)

      expect(year2.rate).toBe(0)
      expect(year3.rate).toBe(0.12)
    })

    test('one house: boundary at 15 years', () => {
      const oneHouse = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.oneHouseOneHousehold

      const year14 = oneHouse.calculate(100000000, 14, 0)
      const year15 = oneHouse.calculate(100000000, 15, 0)
      const year20 = oneHouse.calculate(100000000, 20, 0)

      expect(year14.rate).toBe(0.72)
      expect(year15.rate).toBe(0.80)
      expect(year20.rate).toBe(0.80) // 최대
    })

    test('general: boundary at 15 years', () => {
      const general = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.generalRealEstate

      const year14 = general.calculate(100000000, 14)
      const year15 = general.calculate(100000000, 15)
      const year20 = general.calculate(100000000, 20)

      expect(year14.rate).toBe(0.36)
      expect(year15.rate).toBe(0.40)
      expect(year20.rate).toBe(0.40) // 최대
    })

    test('capital gain exactly equals deductions', () => {
      const result = TAX_DEDUCTIONS_2024.capitalGains.calculateTotal({
        transferPrice: 110000000,
        acquisitionPrice: 100000000,
        holdingYears: 5,
        residenceYears: 0,
        isOneHouse: true
      })

      // 양도차익 1천만원
      // 장기보유특별공제: 1천만 × 20% = 2백만
      // 기본공제: 250만
      // 과세표준: 1천만 - 2백만 - 250만 = 550만

      expect(result.capitalGain).toBe(10000000)
      expect(result.taxBase).toBe(5500000)
    })
  })

  // 매우 큰 값 처리
  describe('Very Large Values', () => {
    test('spouse deduction: very large inheritance', () => {
      const result = TAX_DEDUCTIONS_2024.inheritance.spouse.calculate(100000000000, 50000000000)
      expect(result).toBe(50000000000) // 실제 상속액이 최대
    })

    test('capital gains: very large gain', () => {
      const result = TAX_DEDUCTIONS_2024.capitalGains.calculateTotal({
        transferPrice: 100000000000,
        acquisitionPrice: 50000000000,
        holdingYears: 15,
        isOneHouse: true
      })

      expect(result.capitalGain).toBe(50000000000)
      expect(result.longTermDeduction).toBe(40000000000) // 500억 × 80%
    })
  })
})

// ==========================================
// 데이터 구조 검증
// ==========================================
describe('Data Structure Validation', () => {
  test('all deduction types should exist', () => {
    expect(TAX_DEDUCTIONS_2024.inheritance).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.gift).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.capitalGains).toBeDefined()
  })

  test('all inheritance deduction types should have calculate function', () => {
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.spouse.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.child.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.elderly.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.disability.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.financialAsset.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.disaster.calculate).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.inheritance.calculateTotal).toBe('function')
  })

  test('gift tax should have required functions', () => {
    expect(typeof TAX_DEDUCTIONS_2024.gift.getDeductionByRelationship).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.gift.calculateWithTenYearCumulation).toBe('function')
  })

  test('capital gains should have required structures', () => {
    expect(TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.oneHouseOneHousehold).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.generalRealEstate).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.capitalGains.basic).toBeDefined()
    expect(TAX_DEDUCTIONS_2024.capitalGains.necessaryExpenses).toBeDefined()
    expect(typeof TAX_DEDUCTIONS_2024.capitalGains.calculateTotal).toBe('function')
  })

  test('utility functions should exist', () => {
    expect(typeof TAX_DEDUCTIONS_2024.formatDeduction).toBe('function')
    expect(typeof TAX_DEDUCTIONS_2024.formatRate).toBe('function')
  })

  test('long-term holding rates should be in ascending order', () => {
    const oneHouseRates = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.oneHouseOneHousehold.rates
    for (let i = 0; i < oneHouseRates.length - 1; i++) {
      expect(oneHouseRates[i].years).toBeLessThan(oneHouseRates[i + 1].years)
      expect(oneHouseRates[i].rate).toBeLessThanOrEqual(oneHouseRates[i + 1].rate)
    }

    const generalRates = TAX_DEDUCTIONS_2024.capitalGains.longTermHolding.generalRealEstate.rates
    for (let i = 0; i < generalRates.length - 1; i++) {
      expect(generalRates[i].years).toBeLessThan(generalRates[i + 1].years)
      expect(generalRates[i].rate).toBeLessThanOrEqual(generalRates[i + 1].rate)
    }
  })
})
