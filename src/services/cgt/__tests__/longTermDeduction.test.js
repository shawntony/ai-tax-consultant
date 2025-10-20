/**
 * Long-term Holding Deduction Module Unit Tests
 * @jest-environment node
 */

import {
  calculateGeneralDeductionRate,
  calculateOneHomeDeductionRate,
  calculateHoldingDeductionRate,
  applyLongTermDeduction
} from '../longTermDeduction.js'

describe('Long-term Holding Deduction Module', () => {
  describe('calculateGeneralDeductionRate', () => {
    test('Should return 0% for holding less than 3 years', () => {
      const testCases = [0, 1, 2, 2.9]

      testCases.forEach(years => {
        const result = calculateGeneralDeductionRate(years)
        expect(result.type).toBe('GENERAL')
        expect(result.holdingRate).toBe(0)
        expect(result.residenceRate).toBe(0)
        expect(result.totalRate).toBe(0)
        expect(result.details.message).toContain('3년 미만')
      })
    })

    test('Should return 6% for exactly 3 years holding', () => {
      const result = calculateGeneralDeductionRate(3)

      expect(result.holdingRate).toBe(0.06)
      expect(result.totalRate).toBe(0.06)
      expect(result.details.holdingYears).toBe(3)
      expect(result.details.yearsOverThree).toBe(0)
    })

    test('Should return 8% for 4 years holding', () => {
      const result = calculateGeneralDeductionRate(4)

      expect(result.holdingRate).toBe(0.08) // 6% + 1*2%
      expect(result.totalRate).toBe(0.08)
      expect(result.details.yearsOverThree).toBe(1)
    })

    test('Should return 10% for 5 years holding', () => {
      const result = calculateGeneralDeductionRate(5)

      expect(result.holdingRate).toBe(0.10) // 6% + 2*2%
      expect(result.totalRate).toBe(0.10)
    })

    test('Should return 20% for 10 years holding', () => {
      const result = calculateGeneralDeductionRate(10)

      expect(result.holdingRate).toBe(0.20) // 6% + 7*2%
      expect(result.totalRate).toBe(0.20)
    })

    test('Should return 30% (max) for 15 years holding', () => {
      const result = calculateGeneralDeductionRate(15)

      expect(result.holdingRate).toBe(0.30) // 6% + 12*2% = 30% (max)
      expect(result.totalRate).toBe(0.30)
    })

    test('Should cap at 30% for holdings over 15 years', () => {
      const testCases = [16, 20, 30, 50]

      testCases.forEach(years => {
        const result = calculateGeneralDeductionRate(years)
        expect(result.holdingRate).toBe(0.30)
        expect(result.totalRate).toBe(0.30)
      })
    })

    test('Should handle partial years by flooring', () => {
      const result = calculateGeneralDeductionRate(5.9)

      // Should floor to 5 years
      expect(result.holdingRate).toBe(0.10) // 6% + 2*2%
      expect(result.details.yearsOverThree).toBe(2)
    })

    test('Should include correct calculation details', () => {
      const result = calculateGeneralDeductionRate(8)

      expect(result.details.calculation.formula).toBe('6% + (보유년수 - 3) × 2%')
      expect(result.details.calculation.baseRate).toBe(0.06)
      expect(result.details.calculation.incrementPerYear).toBe(0.02)
      expect(result.details.calculation.maxRate).toBe(0.30)
    })
  })

  describe('calculateOneHomeDeductionRate', () => {
    test('Should return 0% for holding < 3 years and residence < 2 years', () => {
      const result = calculateOneHomeDeductionRate(2, 1)

      expect(result.type).toBe('ONE_HOME_HIGH_VALUE')
      expect(result.holdingRate).toBe(0)
      expect(result.residenceRate).toBe(0)
      expect(result.totalRate).toBe(0)
    })

    test('Should return 12% holding deduction for exactly 3 years holding', () => {
      const result = calculateOneHomeDeductionRate(3, 0)

      expect(result.holdingRate).toBe(0.12)
      expect(result.residenceRate).toBe(0)
      expect(result.totalRate).toBe(0.12)
    })

    test('Should return 8% residence deduction for exactly 2 years residence', () => {
      const result = calculateOneHomeDeductionRate(0, 2)

      expect(result.holdingRate).toBe(0)
      expect(result.residenceRate).toBe(0.08)
      expect(result.totalRate).toBe(0.08)
    })

    test('Should combine holding and residence deductions', () => {
      const result = calculateOneHomeDeductionRate(3, 2)

      expect(result.holdingRate).toBe(0.12) // 3 years holding
      expect(result.residenceRate).toBe(0.08) // 2 years residence
      expect(result.totalRate).toBe(0.20) // 12% + 8%
    })

    test('Should calculate 20% holding for 5 years', () => {
      const result = calculateOneHomeDeductionRate(5, 0)

      expect(result.holdingRate).toBe(0.20) // 12% + 2*4%
      expect(result.residenceRate).toBe(0)
      expect(result.totalRate).toBe(0.20)
    })

    test('Should calculate 12% residence for 3 years', () => {
      const result = calculateOneHomeDeductionRate(0, 3)

      expect(result.holdingRate).toBe(0)
      expect(result.residenceRate).toBe(0.12) // 8% + 1*4%
      expect(result.totalRate).toBe(0.12)
    })

    test('Should calculate combined deduction for 5 years holding and 3 years residence', () => {
      const result = calculateOneHomeDeductionRate(5, 3)

      expect(result.holdingRate).toBe(0.20) // 12% + 2*4%
      expect(result.residenceRate).toBe(0.12) // 8% + 1*4%
      expect(result.totalRate).toBe(0.32) // 20% + 12%
    })

    test('Should cap holding deduction at 40% for 10 years', () => {
      const result = calculateOneHomeDeductionRate(10, 0)

      expect(result.holdingRate).toBe(0.40) // 12% + 7*4% = 40%
      expect(result.residenceRate).toBe(0)
      expect(result.totalRate).toBe(0.40)
    })

    test('Should cap residence deduction at 40% for 10 years', () => {
      const result = calculateOneHomeDeductionRate(0, 10)

      expect(result.holdingRate).toBe(0)
      expect(result.residenceRate).toBe(0.40) // 8% + 8*4% = 40%
      expect(result.totalRate).toBe(0.40)
    })

    test('Should cap combined deduction at 80% for 10 years holding and 10 years residence', () => {
      const result = calculateOneHomeDeductionRate(10, 10)

      expect(result.holdingRate).toBe(0.40) // max
      expect(result.residenceRate).toBe(0.40) // max
      expect(result.totalRate).toBe(0.80) // 40% + 40%
    })

    test('Should maintain 80% cap for very long periods', () => {
      const testCases = [
        [15, 15],
        [20, 20],
        [30, 30]
      ]

      testCases.forEach(([holding, residence]) => {
        const result = calculateOneHomeDeductionRate(holding, residence)
        expect(result.holdingRate).toBe(0.40)
        expect(result.residenceRate).toBe(0.40)
        expect(result.totalRate).toBe(0.80)
      })
    })

    test('Should handle partial years by flooring', () => {
      const result = calculateOneHomeDeductionRate(5.9, 3.9)

      // Should floor to 5 and 3 years
      expect(result.holdingRate).toBe(0.20) // 12% + 2*4%
      expect(result.residenceRate).toBe(0.12) // 8% + 1*4%
    })

    test('Should include correct calculation details', () => {
      const result = calculateOneHomeDeductionRate(5, 3)

      expect(result.details.holdingYears).toBe(5)
      expect(result.details.residenceYears).toBe(3)
      expect(result.details.holdingCalculation.formula).toBe('12% + (보유년수 - 3) × 4%')
      expect(result.details.holdingCalculation.baseRate).toBe(0.12)
      expect(result.details.holdingCalculation.maxRate).toBe(0.40)
      expect(result.details.residenceCalculation.formula).toBe('8% + (거주년수 - 2) × 4%')
      expect(result.details.residenceCalculation.baseRate).toBe(0.08)
      expect(result.details.residenceCalculation.maxRate).toBe(0.40)
    })

    test('Should asymmetric holding and residence periods', () => {
      // Long holding, short residence
      const result1 = calculateOneHomeDeductionRate(10, 2)
      expect(result1.holdingRate).toBe(0.40)
      expect(result1.residenceRate).toBe(0.08)
      expect(result1.totalRate).toBeCloseTo(0.48, 10)

      // Short holding, long residence (unusual but possible)
      const result2 = calculateOneHomeDeductionRate(3, 10)
      expect(result2.holdingRate).toBe(0.12)
      expect(result2.residenceRate).toBe(0.40)
      expect(result2.totalRate).toBeCloseTo(0.52, 10)
    })
  })

  describe('calculateHoldingDeductionRate', () => {
    test('Should call general deduction for non-one-home-high-value', () => {
      const input = {
        holdingYears: 5,
        residenceYears: 0,
        isOneHomeHighValue: false
      }
      const result = calculateHoldingDeductionRate(input)

      expect(result.type).toBe('GENERAL')
      expect(result.holdingRate).toBe(0.10) // 6% + 2*2%
      expect(result.residenceRate).toBe(0)
    })

    test('Should call one-home deduction for one-home-high-value', () => {
      const input = {
        holdingYears: 5,
        residenceYears: 3,
        isOneHomeHighValue: true
      }
      const result = calculateHoldingDeductionRate(input)

      expect(result.type).toBe('ONE_HOME_HIGH_VALUE')
      expect(result.holdingRate).toBe(0.20) // 12% + 2*4%
      expect(result.residenceRate).toBe(0.12) // 8% + 1*4%
      expect(result.totalRate).toBe(0.32)
    })

    test('Should use default values when optional params not provided', () => {
      const input = {
        holdingYears: 5
        // residenceYears and isOneHomeHighValue not provided
      }
      const result = calculateHoldingDeductionRate(input)

      expect(result.type).toBe('GENERAL')
      expect(result.totalRate).toBe(0.10)
    })

    test('Should ignore residence years for general deduction', () => {
      const input = {
        holdingYears: 5,
        residenceYears: 10, // Should be ignored
        isOneHomeHighValue: false
      }
      const result = calculateHoldingDeductionRate(input)

      expect(result.type).toBe('GENERAL')
      expect(result.residenceRate).toBe(0)
      expect(result.totalRate).toBe(0.10)
    })
  })

  describe('applyLongTermDeduction', () => {
    test('Should apply general deduction correctly', () => {
      const deductionRate = calculateGeneralDeductionRate(5) // 10%
      const input = {
        taxableGains: 100000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionType).toBe('GENERAL')
      expect(result.deductionRate).toBe(0.10)
      expect(result.deductionAmount).toBe(10000000) // 100M * 10%
      expect(result.remainingTaxable).toBe(90000000) // 100M - 10M
    })

    test('Should apply one-home deduction correctly', () => {
      const deductionRate = calculateOneHomeDeductionRate(5, 3) // 32%
      const input = {
        taxableGains: 200000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionType).toBe('ONE_HOME_HIGH_VALUE')
      expect(result.deductionRate).toBe(0.32)
      expect(result.deductionAmount).toBe(64000000) // 200M * 32%
      expect(result.remainingTaxable).toBe(136000000) // 200M - 64M
    })

    test('Should breakdown holding and residence deductions separately', () => {
      const deductionRate = calculateOneHomeDeductionRate(5, 3)
      const input = {
        taxableGains: 100000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.breakdown.originalTaxable).toBe(100000000)
      expect(result.breakdown.holdingDeduction.rate).toBe(0.20)
      expect(result.breakdown.holdingDeduction.amount).toBe(20000000) // 100M * 20%
      expect(result.breakdown.residenceDeduction.rate).toBe(0.12)
      expect(result.breakdown.residenceDeduction.amount).toBe(12000000) // 100M * 12%
    })

    test('Should handle zero deduction case', () => {
      const deductionRate = calculateGeneralDeductionRate(2) // 0%
      const input = {
        taxableGains: 100000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionAmount).toBe(0)
      expect(result.remainingTaxable).toBe(100000000)
    })

    test('Should handle maximum deduction case', () => {
      const deductionRate = calculateOneHomeDeductionRate(15, 15) // 80%
      const input = {
        taxableGains: 500000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionRate).toBe(0.80)
      expect(result.deductionAmount).toBe(400000000) // 500M * 80%
      expect(result.remainingTaxable).toBe(100000000) // 500M - 400M
    })

    test('Should maintain consistent sum of deduction and remaining', () => {
      const testCases = [
        { years: 5, taxable: 100000000 },
        { years: 10, taxable: 500000000 },
        { years: 15, taxable: 1000000000 }
      ]

      testCases.forEach(({ years, taxable }) => {
        const deductionRate = calculateGeneralDeductionRate(years)
        const result = applyLongTermDeduction({ taxableGains: taxable, deductionRate })

        const sum = result.deductionAmount + result.remainingTaxable
        expect(sum).toBeCloseTo(taxable, 0)
      })
    })

    test('Should include deduction rate details', () => {
      const deductionRate = calculateOneHomeDeductionRate(5, 3)
      const input = {
        taxableGains: 100000000,
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.details).toBeDefined()
      expect(result.details.holdingYears).toBe(5)
      expect(result.details.residenceYears).toBe(3)
    })

    test('Should handle large taxable amounts correctly', () => {
      const deductionRate = calculateGeneralDeductionRate(10) // 20%
      const input = {
        taxableGains: 5000000000, // 50억
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionAmount).toBe(1000000000) // 10억
      expect(result.remainingTaxable).toBe(4000000000) // 40억
    })

    test('Should handle small taxable amounts correctly', () => {
      const deductionRate = calculateGeneralDeductionRate(5) // 10%
      const input = {
        taxableGains: 10000000, // 1천만원
        deductionRate
      }
      const result = applyLongTermDeduction(input)

      expect(result.deductionAmount).toBe(1000000) // 100만원
      expect(result.remainingTaxable).toBe(9000000) // 900만원
    })
  })
})
