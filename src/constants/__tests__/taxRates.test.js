/**
 * taxRates.js Unit Tests
 *
 * 세율 계산 함수 검증
 * - 상속세, 증여세, 양도소득세 계산 함수
 * - 엣지 케이스 처리
 * - 공통 유틸리티 함수
 *
 * Target Coverage: >90%
 *
 * @version 1.0.0
 * @date 2025-10-18
 * @task M2.1.8 - taxRates.js 검증
 */

import TAX_RATES_2024 from '../taxRates.js'

describe('TAX_RATES_2024 - Metadata', () => {
  test('should have correct metadata structure', () => {
    expect(TAX_RATES_2024.metadata).toBeDefined()
    expect(TAX_RATES_2024.metadata.fiscalYear).toBe(2024)
    expect(TAX_RATES_2024.metadata.version).toBe('1.0.0')
    expect(TAX_RATES_2024.metadata.lastUpdated).toBe('2025-10-17')
  })

  test('should have valid period', () => {
    expect(TAX_RATES_2024.metadata.validPeriod.start).toBe('2024-01-01')
    expect(TAX_RATES_2024.metadata.validPeriod.end).toBe('2024-12-31')
  })

  test('should have legal sources', () => {
    expect(TAX_RATES_2024.metadata.sources.inheritance).toContain('상속세 및 증여세법')
    expect(TAX_RATES_2024.metadata.sources.gift).toContain('상속세 및 증여세법')
    expect(TAX_RATES_2024.metadata.sources.capitalGains).toContain('소득세법')
  })
})

// ==========================================
// 상속세 계산 테스트
// ==========================================
describe('Inheritance Tax Calculation', () => {
  const { inheritance } = TAX_RATES_2024

  test('should have 5 brackets', () => {
    expect(inheritance.brackets).toHaveLength(5)
  })

  test('should calculate 0 tax for 0 tax base', () => {
    const result = inheritance.calculate(0)
    expect(result.taxAmount).toBe(0)
    expect(result.bracket).toBe(1)
    expect(result.rate).toBe(0.10)
    expect(result.effectiveRate).toBe(0)
  })

  test('should throw error for negative tax base', () => {
    expect(() => inheritance.calculate(-100)).toThrow('과세표준은 0 이상이어야 합니다')
  })

  // Bracket 1: 1억원 이하 (10%)
  test('should calculate bracket 1: 50,000,000원', () => {
    const result = inheritance.calculate(50000000)
    expect(result.bracket).toBe(1)
    expect(result.rate).toBe(0.10)
    expect(result.taxAmount).toBe(5000000) // 50M × 10%
  })

  test('should calculate bracket 1 boundary: 100,000,000원', () => {
    const result = inheritance.calculate(100000000)
    expect(result.bracket).toBe(1)
    expect(result.rate).toBe(0.10)
    expect(result.taxAmount).toBe(10000000) // 100M × 10%
  })

  // Bracket 2: 1억 초과 5억 이하 (20% - 1천만)
  test('should calculate bracket 2: 100,000,001원', () => {
    const result = inheritance.calculate(100000001)
    expect(result.bracket).toBe(2)
    expect(result.rate).toBe(0.20)
    expect(result.deduction).toBe(10000000)
    expect(result.taxAmount).toBe(10000000) // 100M × 20% - 10M
  })

  test('should calculate bracket 2: 300,000,000원', () => {
    const result = inheritance.calculate(300000000)
    expect(result.bracket).toBe(2)
    expect(result.taxAmount).toBe(50000000) // 300M × 20% - 10M
  })

  test('should calculate bracket 2 boundary: 500,000,000원', () => {
    const result = inheritance.calculate(500000000)
    expect(result.bracket).toBe(2)
    expect(result.taxAmount).toBe(90000000) // 500M × 20% - 10M
  })

  // Bracket 3: 5억 초과 10억 이하 (30% - 6천만)
  test('should calculate bracket 3: 500,000,001원', () => {
    const result = inheritance.calculate(500000001)
    expect(result.bracket).toBe(3)
    expect(result.rate).toBe(0.30)
    expect(result.deduction).toBe(60000000)
  })

  test('should calculate bracket 3: 750,000,000원', () => {
    const result = inheritance.calculate(750000000)
    expect(result.bracket).toBe(3)
    expect(result.taxAmount).toBe(165000000) // 750M × 30% - 60M
  })

  test('should calculate bracket 3 boundary: 1,000,000,000원', () => {
    const result = inheritance.calculate(1000000000)
    expect(result.bracket).toBe(3)
    expect(result.taxAmount).toBe(240000000) // 1B × 30% - 60M
  })

  // Bracket 4: 10억 초과 30억 이하 (40% - 1.6억)
  test('should calculate bracket 4: 1,000,000,001원', () => {
    const result = inheritance.calculate(1000000001)
    expect(result.bracket).toBe(4)
    expect(result.rate).toBe(0.40)
    expect(result.deduction).toBe(160000000)
  })

  test('should calculate bracket 4: 2,000,000,000원', () => {
    const result = inheritance.calculate(2000000000)
    expect(result.bracket).toBe(4)
    expect(result.taxAmount).toBe(640000000) // 2B × 40% - 160M
  })

  test('should calculate bracket 4 boundary: 3,000,000,000원', () => {
    const result = inheritance.calculate(3000000000)
    expect(result.bracket).toBe(4)
    expect(result.taxAmount).toBe(1040000000) // 3B × 40% - 160M
  })

  // Bracket 5: 30억 초과 (50% - 4.6억)
  test('should calculate bracket 5: 3,000,000,001원', () => {
    const result = inheritance.calculate(3000000001)
    expect(result.bracket).toBe(5)
    expect(result.rate).toBe(0.50)
    expect(result.deduction).toBe(460000000)
  })

  test('should calculate bracket 5: 5,000,000,000원', () => {
    const result = inheritance.calculate(5000000000)
    expect(result.bracket).toBe(5)
    expect(result.taxAmount).toBe(2040000000) // 5B × 50% - 460M
  })

  test('should calculate bracket 5: 10,000,000,000원', () => {
    const result = inheritance.calculate(10000000000)
    expect(result.bracket).toBe(5)
    expect(result.taxAmount).toBe(4540000000) // 10B × 50% - 460M
  })

  // Effective rate test
  test('should calculate effective rate correctly', () => {
    const result = inheritance.calculate(1000000000) // 1B
    expect(result.effectiveRate).toBe(0.24) // 240M / 1B = 24%
  })

  test('should handle very large tax base', () => {
    const result = inheritance.calculate(100000000000) // 100B
    expect(result.bracket).toBe(5)
    expect(result.taxAmount).toBe(49540000000) // 100B × 50% - 460M
  })
})

// ==========================================
// 증여세 계산 테스트
// ==========================================
describe('Gift Tax Calculation', () => {
  const { gift } = TAX_RATES_2024

  test('should have same brackets as inheritance tax', () => {
    expect(gift.sameAsInheritance).toBe(true)
    expect(gift.brackets).toHaveLength(5)
  })

  test('should have special rules', () => {
    expect(gift.specialRules.tenYearCumulation.enabled).toBe(true)
    expect(gift.specialRules.tenYearCumulation.period).toBe(10)
    expect(gift.specialRules.relationshipBasedDeduction.enabled).toBe(true)
  })

  test('should calculate 0 tax for 0 tax base', () => {
    const result = gift.calculate(0)
    expect(result.taxAmount).toBe(0)
    expect(result.bracket).toBe(1)
  })

  test('should throw error for negative tax base', () => {
    expect(() => gift.calculate(-100)).toThrow('과세표준은 0 이상이어야 합니다')
  })

  // Same calculation logic as inheritance tax
  test('should calculate same as inheritance tax: 300,000,000원', () => {
    const giftResult = gift.calculate(300000000)
    const inheritanceResult = TAX_RATES_2024.inheritance.calculate(300000000)

    expect(giftResult.bracket).toBe(inheritanceResult.bracket)
    expect(giftResult.rate).toBe(inheritanceResult.rate)
    expect(giftResult.taxAmount).toBe(inheritanceResult.taxAmount)
  })

  test('should calculate bracket 5: 5,000,000,000원', () => {
    const result = gift.calculate(5000000000)
    expect(result.bracket).toBe(5)
    expect(result.taxAmount).toBe(2040000000)
  })
})

// ==========================================
// 양도소득세 계산 테스트
// ==========================================
describe('Capital Gains Tax Calculation', () => {
  const { capitalGains } = TAX_RATES_2024

  test('should have 8 brackets', () => {
    expect(capitalGains.brackets).toHaveLength(8)
  })

  test('should have multiple home surcharge rules', () => {
    expect(capitalGains.multipleHomeSurcharge.twoHomes.surcharge).toBe(0.20)
    expect(capitalGains.multipleHomeSurcharge.threeOrMoreHomes.surcharge).toBe(0.30)
  })

  test('should have one house exemption rules', () => {
    const exemption = capitalGains.oneHouseOneHouseholdExemption
    expect(exemption.enabled).toBe(true)
    expect(exemption.priceThreshold).toBe(1200000000)
    expect(exemption.holdingPeriod).toBe(2)
    expect(exemption.residencePeriod).toBe(2)
  })

  test('should calculate 0 tax for 0 tax base', () => {
    const result = capitalGains.calculate(0)
    expect(result.taxAmount).toBe(0)
    expect(result.bracket).toBe(1)
    expect(result.basicRate).toBe(0.06)
  })

  test('should throw error for negative tax base', () => {
    expect(() => capitalGains.calculate(-100)).toThrow('과세표준은 0 이상이어야 합니다')
  })

  // Bracket 1: 1,400만원 이하 (6%)
  test('should calculate bracket 1: 10,000,000원', () => {
    const result = capitalGains.calculate(10000000)
    expect(result.bracket).toBe(1)
    expect(result.basicRate).toBe(0.06)
    expect(result.taxAmount).toBe(600000) // 10M × 6%
  })

  test('should calculate bracket 1 boundary: 14,000,000원', () => {
    const result = capitalGains.calculate(14000000)
    expect(result.bracket).toBe(1)
    expect(result.taxAmount).toBe(840000) // 14M × 6%
  })

  // Bracket 2: 1,400만 초과 5,000만 이하 (15% - 126만)
  test('should calculate bracket 2: 30,000,000원', () => {
    const result = capitalGains.calculate(30000000)
    expect(result.bracket).toBe(2)
    expect(result.basicRate).toBe(0.15)
    expect(result.taxAmount).toBe(3240000) // 30M × 15% - 1.26M
  })

  // Bracket 8: 10억 초과 (45% - 6,594만)
  test('should calculate bracket 8: 2,000,000,000원', () => {
    const result = capitalGains.calculate(2000000000)
    expect(result.bracket).toBe(8)
    expect(result.basicRate).toBe(0.45)
    expect(result.taxAmount).toBe(834060000) // 2B × 45% - 65.94M
  })

  // 1주택 (중과 없음)
  test('should calculate 1 house (no surcharge): 100,000,000원', () => {
    const result = capitalGains.calculate(100000000, { houseCount: 1, isRegulatedArea: true })
    expect(result.isSurcharged).toBe(false)
    expect(result.surchargeRate).toBe(0)
    expect(result.totalRate).toBe(result.basicRate)
  })

  // 2주택 조정대상지역 (중과 +20%p)
  test('should apply 2-home surcharge: 100,000,000원', () => {
    const result = capitalGains.calculate(100000000, { houseCount: 2, isRegulatedArea: true })
    expect(result.isSurcharged).toBe(true)
    expect(result.surchargeRate).toBe(0.20)
    expect(result.totalRate).toBe(result.basicRate + 0.20)
  })

  test('should apply 2-home surcharge: 500,000,000원 (bracket 6)', () => {
    const result = capitalGains.calculate(500000000, { houseCount: 2, isRegulatedArea: true })
    expect(result.bracket).toBe(6)
    expect(result.basicRate).toBe(0.40)
    expect(result.surchargeRate).toBe(0.20)
    expect(result.totalRate).toBeCloseTo(0.60, 10) // 40% + 20%p (floating point precision)
  })

  // 3주택 이상 조정대상지역 (중과 +30%p)
  test('should apply 3-home surcharge: 100,000,000원', () => {
    const result = capitalGains.calculate(100000000, { houseCount: 3, isRegulatedArea: true })
    expect(result.isSurcharged).toBe(true)
    expect(result.surchargeRate).toBe(0.30)
    expect(result.totalRate).toBe(result.basicRate + 0.30)
  })

  test('should apply 3-home surcharge: 1,000,000,000원 (bracket 7)', () => {
    const result = capitalGains.calculate(1000000000, { houseCount: 4, isRegulatedArea: true })
    expect(result.bracket).toBe(7)
    expect(result.basicRate).toBe(0.42)
    expect(result.surchargeRate).toBe(0.30)
    expect(result.totalRate).toBe(0.72) // 42% + 30%p
  })

  // 비조정대상지역 (중과 없음)
  test('should not apply surcharge in non-regulated area: 2 homes', () => {
    const result = capitalGains.calculate(100000000, { houseCount: 2, isRegulatedArea: false })
    expect(result.isSurcharged).toBe(false)
    expect(result.surchargeRate).toBe(0)
  })

  test('should not apply surcharge in non-regulated area: 3 homes', () => {
    const result = capitalGains.calculate(100000000, { houseCount: 3, isRegulatedArea: false })
    expect(result.isSurcharged).toBe(false)
    expect(result.surchargeRate).toBe(0)
  })

  // Default options (1 house, non-regulated)
  test('should use default options: 1 house, non-regulated', () => {
    const result = capitalGains.calculate(100000000)
    expect(result.isSurcharged).toBe(false)
    expect(result.surchargeRate).toBe(0)
  })

  // Effective rate
  test('should calculate effective rate: 2,000,000,000원', () => {
    const result = capitalGains.calculate(2000000000)
    expect(result.effectiveRate).toBeCloseTo(0.4170, 4) // 834.06M / 2B
  })

  // 지방소득세 계산
  test('should calculate local income tax: 10% of capital gains tax', () => {
    const capitalGainsTax = 100000000
    const localTax = capitalGains.calculateLocalIncomeTax(capitalGainsTax)
    expect(localTax).toBe(10000000) // 100M × 10%
  })

  test('should floor local income tax', () => {
    const capitalGainsTax = 12345678
    const localTax = capitalGains.calculateLocalIncomeTax(capitalGainsTax)
    expect(localTax).toBe(1234567) // floor(12,345,678 × 10%)
  })

  test('should calculate 0 local tax for 0 capital gains tax', () => {
    const localTax = capitalGains.calculateLocalIncomeTax(0)
    expect(localTax).toBe(0)
  })
})

// ==========================================
// 공통 유틸리티 함수 테스트
// ==========================================
describe('Common Utility Functions', () => {
  test('findBracket - inheritance tax', () => {
    const bracket = TAX_RATES_2024.findBracket(300000000, 'inheritance')
    expect(bracket.bracketNumber).toBe(2)
    expect(bracket.rate).toBe(0.20)
  })

  test('findBracket - gift tax', () => {
    const bracket = TAX_RATES_2024.findBracket(1500000000, 'gift')
    expect(bracket.bracketNumber).toBe(4)
    expect(bracket.rate).toBe(0.40)
  })

  test('findBracket - capital gains tax', () => {
    const bracket = TAX_RATES_2024.findBracket(100000000, 'capitalGains')
    expect(bracket.bracketNumber).toBe(4)
    expect(bracket.rate).toBe(0.35)
  })

  test('findBracket - should throw error for invalid tax type', () => {
    expect(() => TAX_RATES_2024.findBracket(100000000, 'invalid')).toThrow('지원하지 않는 세목입니다')
  })

  test('findBracket - should throw error for out of range tax base', () => {
    // This shouldn't throw because all ranges are covered
    expect(() => TAX_RATES_2024.findBracket(-100, 'inheritance')).toThrow()
  })

  test('calculateTax - inheritance', () => {
    const result = TAX_RATES_2024.calculateTax(500000000, 'inheritance')
    expect(result.bracket).toBe(2)
    expect(result.taxAmount).toBe(90000000)
  })

  test('calculateTax - gift', () => {
    const result = TAX_RATES_2024.calculateTax(1000000000, 'gift')
    expect(result.bracket).toBe(3)
    expect(result.taxAmount).toBe(240000000)
  })

  test('calculateTax - capital gains with options', () => {
    const result = TAX_RATES_2024.calculateTax(100000000, 'capitalGains', {
      houseCount: 2,
      isRegulatedArea: true
    })
    expect(result.isSurcharged).toBe(true)
    expect(result.surchargeRate).toBe(0.20)
  })

  test('calculateTax - should throw error for invalid tax type', () => {
    expect(() => TAX_RATES_2024.calculateTax(100000000, 'invalid')).toThrow('지원하지 않는 세목입니다')
  })

  test('calculateEffectiveRate - normal case', () => {
    const effectiveRate = TAX_RATES_2024.calculateEffectiveRate(240000000, 1000000000)
    expect(effectiveRate).toBe(0.24)
  })

  test('calculateEffectiveRate - 0 tax base', () => {
    const effectiveRate = TAX_RATES_2024.calculateEffectiveRate(0, 0)
    expect(effectiveRate).toBe(0)
  })

  test('calculateEffectiveRate - should round to 4 decimal places', () => {
    const effectiveRate = TAX_RATES_2024.calculateEffectiveRate(123456, 1000000)
    expect(effectiveRate).toBe(0.1235) // 12.3456% rounded
  })

  test('getMaxRate - inheritance', () => {
    const maxRate = TAX_RATES_2024.getMaxRate('inheritance')
    expect(maxRate).toBe(0.50)
  })

  test('getMaxRate - gift', () => {
    const maxRate = TAX_RATES_2024.getMaxRate('gift')
    expect(maxRate).toBe(0.50)
  })

  test('getMaxRate - capital gains', () => {
    const maxRate = TAX_RATES_2024.getMaxRate('capitalGains')
    expect(maxRate).toBe(0.45)
  })

  test('getMaxRate - should throw error for invalid tax type', () => {
    expect(() => TAX_RATES_2024.getMaxRate('invalid')).toThrow('지원하지 않는 세목입니다')
  })

  test('getMinRate - inheritance', () => {
    const minRate = TAX_RATES_2024.getMinRate('inheritance')
    expect(minRate).toBe(0.10)
  })

  test('getMinRate - gift', () => {
    const minRate = TAX_RATES_2024.getMinRate('gift')
    expect(minRate).toBe(0.10)
  })

  test('getMinRate - capital gains', () => {
    const minRate = TAX_RATES_2024.getMinRate('capitalGains')
    expect(minRate).toBe(0.06)
  })

  test('getMinRate - should throw error for invalid tax type', () => {
    expect(() => TAX_RATES_2024.getMinRate('invalid')).toThrow('지원하지 않는 세목입니다')
  })
})

// ==========================================
// 엣지 케이스 및 경계값 테스트
// ==========================================
describe('Edge Cases and Boundary Values', () => {
  // Boundary values for inheritance tax
  test('inheritance - boundary: 99,999,999원 (bracket 1)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(99999999)
    expect(result.bracket).toBe(1)
    expect(result.rate).toBe(0.10)
  })

  test('inheritance - boundary: 100,000,000원 (bracket 1 max)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(100000000)
    expect(result.bracket).toBe(1)
  })

  test('inheritance - boundary: 100,000,001원 (bracket 2)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(100000001)
    expect(result.bracket).toBe(2)
  })

  test('inheritance - boundary: 499,999,999원 (bracket 2)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(499999999)
    expect(result.bracket).toBe(2)
  })

  test('inheritance - boundary: 500,000,000원 (bracket 2 max)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(500000000)
    expect(result.bracket).toBe(2)
  })

  test('inheritance - boundary: 500,000,001원 (bracket 3)', () => {
    const result = TAX_RATES_2024.inheritance.calculate(500000001)
    expect(result.bracket).toBe(3)
  })

  // Boundary values for capital gains tax
  test('capital gains - boundary: 14,000,000원 (bracket 1 max)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(14000000)
    expect(result.bracket).toBe(1)
  })

  test('capital gains - boundary: 14,000,001원 (bracket 2)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(14000001)
    expect(result.bracket).toBe(2)
  })

  test('capital gains - boundary: 50,000,000원 (bracket 2 max)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(50000000)
    expect(result.bracket).toBe(2)
  })

  test('capital gains - boundary: 50,000,001원 (bracket 3)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(50000001)
    expect(result.bracket).toBe(3)
  })

  // Very large values
  test('inheritance - very large value: 1조원', () => {
    const result = TAX_RATES_2024.inheritance.calculate(1000000000000)
    expect(result.bracket).toBe(5)
    expect(result.taxAmount).toBe(499540000000) // 1T × 50% - 460M
  })

  test('capital gains - very large value: 1조원', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(1000000000000)
    expect(result.bracket).toBe(8)
    expect(result.taxAmount).toBe(449934060000) // 1T × 45% - 65.94M
  })

  // Decimal values (should be handled as floor)
  test('inheritance - decimal value: 123,456,789.99원', () => {
    const result = TAX_RATES_2024.inheritance.calculate(123456789.99)
    expect(result.bracket).toBe(2)
    expect(result.taxAmount).toBe(14691357) // floor(123456789.99 × 20% - 10M)
  })

  // Zero effective rate edge case
  test('inheritance - 0 tax base should have 0 effective rate', () => {
    const result = TAX_RATES_2024.inheritance.calculate(0)
    expect(result.effectiveRate).toBe(0)
  })

  // Surcharge combinations
  test('capital gains - 2 homes non-regulated area (no surcharge)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(100000000, {
      houseCount: 2,
      isRegulatedArea: false
    })
    expect(result.isSurcharged).toBe(false)
  })

  test('capital gains - 1 home regulated area (no surcharge)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(100000000, {
      houseCount: 1,
      isRegulatedArea: true
    })
    expect(result.isSurcharged).toBe(false)
  })

  test('capital gains - 5 homes regulated area (same as 3+)', () => {
    const result = TAX_RATES_2024.capitalGains.calculate(100000000, {
      houseCount: 5,
      isRegulatedArea: true
    })
    expect(result.surchargeRate).toBe(0.30)
  })
})

// ==========================================
// 데이터 구조 검증
// ==========================================
describe('Data Structure Validation', () => {
  test('all tax types should have brackets array', () => {
    expect(Array.isArray(TAX_RATES_2024.inheritance.brackets)).toBe(true)
    expect(Array.isArray(TAX_RATES_2024.gift.brackets)).toBe(true)
    expect(Array.isArray(TAX_RATES_2024.capitalGains.brackets)).toBe(true)
  })

  test('all brackets should have required fields', () => {
    const checkBracket = (bracket) => {
      expect(bracket).toHaveProperty('bracketNumber')
      expect(bracket).toHaveProperty('min')
      expect(bracket).toHaveProperty('rate')
      expect(bracket).toHaveProperty('deduction')
      expect(bracket).toHaveProperty('description')
    }

    TAX_RATES_2024.inheritance.brackets.forEach(checkBracket)
    TAX_RATES_2024.gift.brackets.forEach(checkBracket)
    TAX_RATES_2024.capitalGains.brackets.forEach(checkBracket)
  })

  test('brackets should be in ascending order', () => {
    const checkOrder = (brackets) => {
      for (let i = 0; i < brackets.length - 1; i++) {
        expect(brackets[i].min).toBeLessThan(brackets[i + 1].min)
      }
    }

    checkOrder(TAX_RATES_2024.inheritance.brackets)
    checkOrder(TAX_RATES_2024.gift.brackets)
    checkOrder(TAX_RATES_2024.capitalGains.brackets)
  })

  test('last bracket should have null max', () => {
    const inheritanceLastBracket = TAX_RATES_2024.inheritance.brackets[4]
    const giftLastBracket = TAX_RATES_2024.gift.brackets[4]
    const capitalGainsLastBracket = TAX_RATES_2024.capitalGains.brackets[7]

    expect(inheritanceLastBracket.max).toBeNull()
    expect(giftLastBracket.max).toBeNull()
    expect(capitalGainsLastBracket.max).toBeNull()
  })

  test('all rates should be between 0 and 1', () => {
    const checkRates = (brackets) => {
      brackets.forEach(bracket => {
        expect(bracket.rate).toBeGreaterThanOrEqual(0)
        expect(bracket.rate).toBeLessThanOrEqual(1)
      })
    }

    checkRates(TAX_RATES_2024.inheritance.brackets)
    checkRates(TAX_RATES_2024.gift.brackets)
    checkRates(TAX_RATES_2024.capitalGains.brackets)
  })

  test('deductions should be non-negative', () => {
    const checkDeductions = (brackets) => {
      brackets.forEach(bracket => {
        expect(bracket.deduction).toBeGreaterThanOrEqual(0)
      })
    }

    checkDeductions(TAX_RATES_2024.inheritance.brackets)
    checkDeductions(TAX_RATES_2024.gift.brackets)
    checkDeductions(TAX_RATES_2024.capitalGains.brackets)
  })
})
