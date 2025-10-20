/**
 * Heavy Tax Rate Module Unit Tests
 * @jest-environment node
 */

import {
  checkHeavyTaxSuspension,
  isAdjustmentArea,
  getAdjustmentAreas,
  determineHeavyTaxStatus,
  getProgressiveTaxBracket,
  calculateEffectiveTaxRate,
  calculateCapitalGainsTax
} from '../heavyTaxRate.js'

describe('Heavy Tax Rate Module', () => {
  describe('checkHeavyTaxSuspension', () => {
    test('Should return false for dates before suspension period', () => {
      const dates = [
        new Date('2020-01-01'),
        new Date('2022-05-09'),
        new Date('2022-05-09T23:59:59')
      ]

      dates.forEach(date => {
        expect(checkHeavyTaxSuspension(date)).toBe(false)
      })
    })

    test('Should return true for dates during suspension period', () => {
      const dates = [
        new Date('2022-05-10'),
        new Date('2023-01-01'),
        new Date('2024-12-31'),
        new Date('2025-05-09')
      ]

      dates.forEach(date => {
        expect(checkHeavyTaxSuspension(date)).toBe(true)
      })
    })

    test('Should return false for dates after suspension period', () => {
      const dates = [
        new Date('2025-05-10'),
        new Date('2026-01-01'),
        new Date('2030-01-01')
      ]

      dates.forEach(date => {
        expect(checkHeavyTaxSuspension(date)).toBe(false)
      })
    })

    test('Should handle suspension period boundaries correctly', () => {
      const startDate = new Date('2022-05-10')
      const endDate = new Date('2025-05-09')
      const afterEnd = new Date('2025-05-10')

      expect(checkHeavyTaxSuspension(startDate)).toBe(true)
      expect(checkHeavyTaxSuspension(endDate)).toBe(true)
      expect(checkHeavyTaxSuspension(afterEnd)).toBe(false)
    })
  })

  describe('isAdjustmentArea', () => {
    test('Should return false for null location', () => {
      expect(isAdjustmentArea(null)).toBe(false)
    })

    test('Should return false for undefined location', () => {
      expect(isAdjustmentArea(undefined)).toBe(false)
    })

    test('Should return false for missing city', () => {
      expect(isAdjustmentArea({ district: '강남구' })).toBe(false)
    })

    test('Should return false for missing district', () => {
      expect(isAdjustmentArea({ city: '서울특별시' })).toBe(false)
    })

    test('Should return true for 강남구', () => {
      const location = { city: '서울특별시', district: '강남구' }
      expect(isAdjustmentArea(location)).toBe(true)
    })

    test('Should return true for 서초구', () => {
      const location = { city: '서울특별시', district: '서초구' }
      expect(isAdjustmentArea(location)).toBe(true)
    })

    test('Should return true for 송파구', () => {
      const location = { city: '서울특별시', district: '송파구' }
      expect(isAdjustmentArea(location)).toBe(true)
    })

    test('Should return true for 용산구', () => {
      const location = { city: '서울특별시', district: '용산구' }
      expect(isAdjustmentArea(location)).toBe(true)
    })

    test('Should return false for non-adjustment Seoul districts', () => {
      const locations = [
        { city: '서울특별시', district: '종로구' },
        { city: '서울특별시', district: '중구' },
        { city: '서울특별시', district: '마포구' }
      ]

      locations.forEach(location => {
        expect(isAdjustmentArea(location)).toBe(false)
      })
    })

    test('Should return false for other cities', () => {
      const locations = [
        { city: '부산광역시', district: '해운대구' },
        { city: '경기도', district: '성남시' },
        { city: '인천광역시', district: '연수구' }
      ]

      locations.forEach(location => {
        expect(isAdjustmentArea(location)).toBe(false)
      })
    })
  })

  describe('getAdjustmentAreas', () => {
    test('Should return array of adjustment areas', () => {
      const areas = getAdjustmentAreas()

      expect(Array.isArray(areas)).toBe(true)
      expect(areas.length).toBe(4)
    })

    test('Should include all 4 designated areas', () => {
      const areas = getAdjustmentAreas()
      const districts = areas.map(a => a.district)

      expect(districts).toContain('강남구')
      expect(districts).toContain('서초구')
      expect(districts).toContain('송파구')
      expect(districts).toContain('용산구')
    })

    test('Should include designation dates', () => {
      const areas = getAdjustmentAreas()

      areas.forEach(area => {
        expect(area).toHaveProperty('city')
        expect(area).toHaveProperty('district')
        expect(area).toHaveProperty('designation')
        expect(area.city).toBe('서울특별시')
      })
    })
  })

  describe('determineHeavyTaxStatus', () => {
    const baseInput = {
      homeCount: 2,
      isAdjustmentArea: true,
      holdingYears: 3,
      saleDate: new Date('2026-01-01') // After suspension
    }

    test('Should not apply heavy tax during suspension period', () => {
      const input = {
        ...baseInput,
        saleDate: new Date('2023-01-01') // During suspension
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(false)
      expect(result.reason).toBe('SUSPENDED')
      expect(result.message).toContain('한시 배제')
      expect(result.fallbackToBasicRate).toBe(true)
    })

    test('Should not apply heavy tax for non-adjustment areas', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: false
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(false)
      expect(result.reason).toBe('NOT_ADJUSTMENT_AREA')
      expect(result.message).toContain('조정대상지역이 아니므로')
      expect(result.fallbackToBasicRate).toBe(true)
    })

    test('Should not apply heavy tax for single home', () => {
      const input = {
        ...baseInput,
        homeCount: 1
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(false)
      expect(result.reason).toBe('SINGLE_HOME')
      expect(result.message).toContain('1주택자')
      expect(result.fallbackToBasicRate).toBe(true)
    })

    test('Should apply 70% flat rate for holding less than 1 year', () => {
      const input = {
        ...baseInput,
        holdingYears: 0.8
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(true)
      expect(result.heavyTaxType).toBe('SHORT_TERM_SEVERE')
      expect(result.reason).toBe('HOLDING_LESS_THAN_1_YEAR')
      expect(result.taxRate).toBe(0.70)
      expect(result.isFlat).toBe(true)
      expect(result.message).toContain('70%')
    })

    test('Should apply 60% flat rate for holding 1 to 2 years', () => {
      const input = {
        ...baseInput,
        holdingYears: 1.5
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(true)
      expect(result.heavyTaxType).toBe('SHORT_TERM_MODERATE')
      expect(result.reason).toBe('HOLDING_1_TO_2_YEARS')
      expect(result.taxRate).toBe(0.60)
      expect(result.isFlat).toBe(true)
      expect(result.message).toContain('60%')
    })

    test('Should apply 20%p surcharge for 2 homes', () => {
      const input = {
        ...baseInput,
        homeCount: 2,
        holdingYears: 3
      }
      const result = determineHeavyTaxStatus(input)

      expect(result.heavyTaxApplied).toBe(true)
      expect(result.heavyTaxType).toBe('REGULAR')
      expect(result.reason).toBe('MULTIPLE_HOMES_ADJUSTMENT_AREA')
      expect(result.surcharge).toBe(0.20)
      expect(result.isFlat).toBe(false)
      expect(result.message).toContain('2주택자')
      expect(result.message).toContain('20%p')
    })

    test('Should apply 30%p surcharge for 3+ homes', () => {
      const testCases = [3, 4, 5, 10]

      testCases.forEach(homeCount => {
        const input = {
          ...baseInput,
          homeCount,
          holdingYears: 3
        }
        const result = determineHeavyTaxStatus(input)

        expect(result.heavyTaxApplied).toBe(true)
        expect(result.heavyTaxType).toBe('REGULAR')
        expect(result.surcharge).toBe(0.30)
        expect(result.isFlat).toBe(false)
        expect(result.message).toContain(`${homeCount}주택자`)
        expect(result.message).toContain('30%p')
      })
    })

    test('Should handle boundary at exactly 1 year', () => {
      const lessThan1 = determineHeavyTaxStatus({ ...baseInput, holdingYears: 0.99 })
      const exactly1 = determineHeavyTaxStatus({ ...baseInput, holdingYears: 1.0 })

      expect(lessThan1.taxRate).toBe(0.70)
      expect(exactly1.taxRate).toBe(0.60)
    })

    test('Should handle boundary at exactly 2 years', () => {
      const lessThan2 = determineHeavyTaxStatus({ ...baseInput, holdingYears: 1.99 })
      const exactly2 = determineHeavyTaxStatus({ ...baseInput, holdingYears: 2.0 })

      expect(lessThan2.taxRate).toBe(0.60)
      expect(exactly2.heavyTaxType).toBe('REGULAR')
      expect(exactly2.surcharge).toBe(0.20)
    })
  })

  describe('getProgressiveTaxBracket', () => {
    test('Should return 6% bracket for amounts up to 14M', () => {
      const amounts = [1000000, 10000000, 14000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.06)
        expect(bracket.deduction).toBe(0)
        expect(bracket.max).toBe(14000000)
      })
    })

    test('Should return 15% bracket for amounts 14M-50M', () => {
      const amounts = [14000001, 30000000, 50000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.15)
        expect(bracket.deduction).toBe(1260000)
        expect(bracket.max).toBe(50000000)
      })
    })

    test('Should return 24% bracket for amounts 50M-88M', () => {
      const amounts = [50000001, 70000000, 88000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.24)
        expect(bracket.deduction).toBe(5760000)
        expect(bracket.max).toBe(88000000)
      })
    })

    test('Should return 35% bracket for amounts 88M-150M', () => {
      const amounts = [88000001, 100000000, 150000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.35)
        expect(bracket.deduction).toBe(15440000)
        expect(bracket.max).toBe(150000000)
      })
    })

    test('Should return 38% bracket for amounts 150M-300M', () => {
      const amounts = [150000001, 200000000, 300000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.38)
        expect(bracket.deduction).toBe(19940000)
        expect(bracket.max).toBe(300000000)
      })
    })

    test('Should return 40% bracket for amounts 300M-500M', () => {
      const amounts = [300000001, 400000000, 500000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.40)
        expect(bracket.deduction).toBe(25940000)
        expect(bracket.max).toBe(500000000)
      })
    })

    test('Should return 45% bracket for amounts over 500M', () => {
      const amounts = [500000001, 1000000000, 5000000000]

      amounts.forEach(amount => {
        const bracket = getProgressiveTaxBracket(amount)
        expect(bracket.rate).toBe(0.45)
        expect(bracket.deduction).toBe(50940000)
        expect(bracket.max).toBe(Infinity)
      })
    })

    test('Should include min and max values in bracket', () => {
      const bracket = getProgressiveTaxBracket(100000000)
      expect(bracket).toHaveProperty('min')
      expect(bracket).toHaveProperty('max')
      expect(bracket.min).toBeLessThan(bracket.max)
    })
  })

  describe('calculateEffectiveTaxRate', () => {
    test('Should return flat rate for short-term severe penalty', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: true,
        isFlat: true,
        taxRate: 0.70,
        message: '1년 미만 보유로 70% 세율 적용'
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 100000000,
        heavyTaxStatus
      })

      expect(result.rateType).toBe('FLAT')
      expect(result.effectiveRate).toBe(0.70)
      expect(result.baseRate).toBe(0.70)
      expect(result.surcharge).toBe(0)
      expect(result.bracket).toBeNull()
    })

    test('Should return flat rate for short-term moderate penalty', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: true,
        isFlat: true,
        taxRate: 0.60,
        message: '1년 이상 2년 미만 보유로 60% 세율 적용'
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 100000000,
        heavyTaxStatus
      })

      expect(result.rateType).toBe('FLAT')
      expect(result.effectiveRate).toBe(0.60)
    })

    test('Should return basic progressive rate when heavy tax not applied', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: false,
        fallbackToBasicRate: true
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 100000000,
        heavyTaxStatus
      })

      expect(result.rateType).toBe('PROGRESSIVE_BASIC')
      expect(result.effectiveRate).toBe(0.35) // 100M falls in 35% bracket
      expect(result.baseRate).toBe(0.35)
      expect(result.surcharge).toBe(0)
      expect(result.bracket).toBeDefined()
    })

    test('Should apply heavy tax surcharge to progressive rate', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: true,
        isFlat: false,
        surcharge: 0.20,
        fallbackToBasicRate: false
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 100000000, // 35% base rate
        heavyTaxStatus
      })

      expect(result.rateType).toBe('PROGRESSIVE_HEAVY')
      expect(result.baseRate).toBe(0.35)
      expect(result.surcharge).toBe(0.20)
      expect(result.effectiveRate).toBe(0.55) // 35% + 20%p
    })

    test('Should cap effective rate at 75%', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: true,
        isFlat: false,
        surcharge: 0.30,
        fallbackToBasicRate: false
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 500000001, // 45% base rate + 30%p = 75%
        heavyTaxStatus
      })

      expect(result.effectiveRate).toBe(0.75)
      expect(result.baseRate).toBe(0.45)
      expect(result.surcharge).toBe(0.30)
    })

    test('Should not exceed 75% cap even with higher base rate', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: true,
        isFlat: false,
        surcharge: 0.30,
        fallbackToBasicRate: false
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 600000000, // Would be 45% + 30% = 75%
        heavyTaxStatus
      })

      expect(result.effectiveRate).toBeLessThanOrEqual(0.75)
    })

    test('Should include correct bracket information', () => {
      const heavyTaxStatus = {
        heavyTaxApplied: false,
        fallbackToBasicRate: true
      }
      const result = calculateEffectiveTaxRate({
        taxableGains: 100000000,
        heavyTaxStatus
      })

      expect(result.bracket.rate).toBe(0.35)
      expect(result.bracket.deduction).toBe(15440000)
    })
  })

  describe('calculateCapitalGainsTax', () => {
    test('Should calculate tax correctly with flat rate', () => {
      const effectiveRate = {
        rateType: 'FLAT',
        effectiveRate: 0.70,
        baseRate: 0.70,
        surcharge: 0,
        bracket: null
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 100000000,
        effectiveRate
      })

      expect(result.capitalGainsTax).toBe(70000000) // 100M * 70%
      expect(result.localIncomeTax).toBe(7000000) // 70M * 10%
      expect(result.totalTax).toBe(77000000)
    })

    test('Should calculate tax correctly with progressive rate', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_BASIC',
        effectiveRate: 0.35,
        baseRate: 0.35,
        surcharge: 0,
        bracket: {
          rate: 0.35,
          deduction: 15440000
        }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 100000000,
        effectiveRate
      })

      const expectedCGT = (100000000 * 0.35) - 15440000 // 19560000
      const expectedLocal = expectedCGT * 0.10 // 1956000
      const expectedTotal = expectedCGT + expectedLocal // 21516000

      expect(result.capitalGainsTax).toBeCloseTo(expectedCGT, 0)
      expect(result.localIncomeTax).toBeCloseTo(expectedLocal, 0)
      expect(result.totalTax).toBeCloseTo(expectedTotal, 0)
    })

    test('Should calculate tax with heavy tax surcharge', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_HEAVY',
        effectiveRate: 0.55, // 35% + 20%p
        baseRate: 0.35,
        surcharge: 0.20,
        bracket: {
          rate: 0.35,
          deduction: 15440000
        }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 100000000,
        effectiveRate
      })

      const expectedCGT = (100000000 * 0.55) - 15440000 // 39560000
      const expectedLocal = expectedCGT * 0.10
      const expectedTotal = expectedCGT + expectedLocal

      expect(result.capitalGainsTax).toBeCloseTo(expectedCGT, 0)
      expect(result.totalTax).toBeCloseTo(expectedTotal, 0)
    })

    test('Should ensure non-negative tax amounts', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_BASIC',
        effectiveRate: 0.06,
        baseRate: 0.06,
        surcharge: 0,
        bracket: {
          rate: 0.06,
          deduction: 0
        }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 1000000, // Small amount
        effectiveRate
      })

      expect(result.capitalGainsTax).toBeGreaterThanOrEqual(0)
      expect(result.localIncomeTax).toBeGreaterThanOrEqual(0)
      expect(result.totalTax).toBeGreaterThanOrEqual(0)
    })

    test('Should include breakdown information', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_BASIC',
        effectiveRate: 0.35,
        baseRate: 0.35,
        surcharge: 0,
        bracket: { rate: 0.35, deduction: 15440000 }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 100000000,
        effectiveRate
      })

      expect(result.breakdown).toBeDefined()
      expect(result.breakdown.rateType).toBe('PROGRESSIVE_BASIC')
      expect(result.breakdown.baseRate).toBe(0.35)
      expect(result.breakdown.surcharge).toBe(0)
    })

    test('Should include calculation formulas', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_BASIC',
        effectiveRate: 0.35,
        baseRate: 0.35,
        surcharge: 0,
        bracket: { rate: 0.35, deduction: 15440000 }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 100000000,
        effectiveRate
      })

      expect(result.calculation).toBeDefined()
      expect(result.calculation.formula).toContain('누진공제')
      expect(result.calculation.capitalGainsFormula).toBeDefined()
      expect(result.calculation.localIncomeFormula).toContain('10%')
    })

    test('Should calculate correctly for various tax amounts', () => {
      const testCases = [
        { gains: 10000000, rate: 0.06, deduction: 0 },
        { gains: 100000000, rate: 0.35, deduction: 15440000 },
        { gains: 500000000, rate: 0.40, deduction: 25940000 },
        { gains: 1000000000, rate: 0.45, deduction: 50940000 }
      ]

      testCases.forEach(({ gains, rate, deduction }) => {
        const effectiveRate = {
          rateType: 'PROGRESSIVE_BASIC',
          effectiveRate: rate,
          baseRate: rate,
          surcharge: 0,
          bracket: { rate, deduction }
        }
        const result = calculateCapitalGainsTax({
          taxableGains: gains,
          effectiveRate
        })

        const expectedCGT = Math.max(0, (gains * rate) - deduction)
        const expectedLocal = expectedCGT * 0.10
        const expectedTotal = expectedCGT + expectedLocal

        expect(result.capitalGainsTax).toBeCloseTo(expectedCGT, 0)
        expect(result.localIncomeTax).toBeCloseTo(expectedLocal, 0)
        expect(result.totalTax).toBeCloseTo(expectedTotal, 0)
      })
    })

    test('Should maintain consistent sum of components', () => {
      const effectiveRate = {
        rateType: 'PROGRESSIVE_BASIC',
        effectiveRate: 0.35,
        baseRate: 0.35,
        surcharge: 0,
        bracket: { rate: 0.35, deduction: 15440000 }
      }
      const result = calculateCapitalGainsTax({
        taxableGains: 200000000,
        effectiveRate
      })

      const sum = result.capitalGainsTax + result.localIncomeTax
      expect(sum).toBeCloseTo(result.totalTax, 0)
    })
  })
})
