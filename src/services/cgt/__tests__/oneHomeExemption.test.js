/**
 * One-Home Exemption Module Unit Tests
 * @jest-environment node
 */

import {
  checkResidenceRequirement,
  checkOneHomeEligibility,
  calculateOneHomeExemption
} from '../oneHomeExemption.js'

describe('One-Home Exemption Module', () => {
  describe('checkResidenceRequirement', () => {
    test('Should not require residence for non-adjustment areas', () => {
      const acquisitionDate = new Date('2020-01-01')
      expect(checkResidenceRequirement(false, acquisitionDate)).toBe(false)
    })

    test('Should not require residence for adjustment area acquired before 2017-08-02', () => {
      const acquisitionDate = new Date('2017-08-01')
      expect(checkResidenceRequirement(true, acquisitionDate)).toBe(false)
    })

    test('Should require residence for adjustment area acquired on 2017-08-02', () => {
      const acquisitionDate = new Date('2017-08-02')
      expect(checkResidenceRequirement(true, acquisitionDate)).toBe(true)
    })

    test('Should require residence for adjustment area acquired after 2017-08-02', () => {
      const acquisitionDate = new Date('2020-01-01')
      expect(checkResidenceRequirement(true, acquisitionDate)).toBe(true)
    })

    test('Should handle boundary date correctly', () => {
      const beforeBoundary = new Date('2017-08-01')
      const onBoundary = new Date('2017-08-02')
      const afterBoundary = new Date('2017-08-03')

      expect(checkResidenceRequirement(true, beforeBoundary)).toBe(false)
      expect(checkResidenceRequirement(true, onBoundary)).toBe(true)
      expect(checkResidenceRequirement(true, afterBoundary)).toBe(true)
    })
  })

  describe('checkOneHomeEligibility', () => {
    const baseInput = {
      householdHomeCount: 1,
      holdingYears: 3,
      isAdjustmentArea: false,
      acquisitionDate: new Date('2020-01-01'),
      residenceYears: 3
    }

    test('Should reject multiple home ownership', () => {
      const input = { ...baseInput, householdHomeCount: 2 }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('NOT_ONE_HOME')
      expect(result.message).toContain('1세대1주택이 아닙니다')
      expect(result.message).toContain('2개')
    })

    test('Should reject zero homes', () => {
      const input = { ...baseInput, householdHomeCount: 0 }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('NOT_ONE_HOME')
    })

    test('Should reject insufficient holding period', () => {
      const input = { ...baseInput, holdingYears: 1.5 }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('INSUFFICIENT_HOLDING_PERIOD')
      expect(result.message).toContain('2년 미만')
      expect(result.message).toContain('1.5년')
    })

    test('Should accept exactly 2 years holding period', () => {
      const input = { ...baseInput, holdingYears: 2.0 }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(true)
      expect(result.reason).toBe('QUALIFIED')
    })

    test('Should qualify for non-adjustment area without residence requirement', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: false,
        holdingYears: 2,
        residenceYears: 0
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(true)
      expect(result.reason).toBe('QUALIFIED')
      expect(result.requiresResidence).toBe(false)
    })

    test('Should qualify for adjustment area acquired before 2017-08-02 without residence', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2017-08-01'),
        holdingYears: 2,
        residenceYears: 0
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(true)
      expect(result.requiresResidence).toBe(false)
    })

    test('Should reject adjustment area acquired after 2017-08-02 with no residence', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2020-01-01'),
        holdingYears: 3,
        residenceYears: 0
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('INSUFFICIENT_RESIDENCE_PERIOD')
      expect(result.message).toContain('조정대상지역')
      expect(result.message).toContain('거주요건')
      expect(result.requiresResidence).toBe(true)
    })

    test('Should reject adjustment area with insufficient residence period', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2020-01-01'),
        holdingYears: 3,
        residenceYears: 1.5
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('INSUFFICIENT_RESIDENCE_PERIOD')
      expect(result.requiredResidenceYears).toBe(2)
      expect(result.actualResidenceYears).toBe(1.5)
    })

    test('Should qualify for adjustment area with sufficient residence period', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2020-01-01'),
        holdingYears: 3,
        residenceYears: 2
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(true)
      expect(result.reason).toBe('QUALIFIED')
      expect(result.requiresResidence).toBe(true)
      expect(result.residenceYears).toBe(2)
    })

    test('Should handle edge case: exactly 2 years holding and residence', () => {
      const input = {
        ...baseInput,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2020-01-01'),
        holdingYears: 2.0,
        residenceYears: 2.0
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(true)
    })

    test('Should use default residenceYears of 0 when not provided', () => {
      const input = {
        householdHomeCount: 1,
        holdingYears: 3,
        isAdjustmentArea: true,
        acquisitionDate: new Date('2020-01-01')
        // residenceYears not provided
      }
      const result = checkOneHomeEligibility(input)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('INSUFFICIENT_RESIDENCE_PERIOD')
    })
  })

  describe('calculateOneHomeExemption', () => {
    const eligibleEligibility = {
      eligible: true,
      reason: 'QUALIFIED',
      message: '1세대1주택 비과세 요건을 충족합니다.'
    }

    const notEligibleEligibility = {
      eligible: false,
      reason: 'NOT_ONE_HOME',
      message: '1세대1주택이 아닙니다.'
    }

    test('Should return no exemption for non-eligible case', () => {
      const input = {
        salePrice: 800000000,
        capitalGains: 300000000,
        eligibility: notEligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      expect(result.exemptionType).toBe('NONE')
      expect(result.exemptionAmount).toBe(0)
      expect(result.taxableAmount).toBe(300000000)
      expect(result.exemptionRate).toBe(0)
      expect(result.details.reason).toBe('NOT_ONE_HOME')
    })

    test('Should apply full exemption for sale price below 12억', () => {
      const input = {
        salePrice: 800000000,
        capitalGains: 300000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      expect(result.exemptionType).toBe('FULL')
      expect(result.exemptionAmount).toBe(300000000)
      expect(result.taxableAmount).toBe(0)
      expect(result.exemptionRate).toBe(1.0)
      expect(result.details.message).toContain('전액 비과세')
    })

    test('Should apply full exemption for sale price exactly 12억', () => {
      const input = {
        salePrice: 1200000000,
        capitalGains: 400000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      expect(result.exemptionType).toBe('FULL')
      expect(result.exemptionAmount).toBe(400000000)
      expect(result.taxableAmount).toBe(0)
      expect(result.exemptionRate).toBe(1.0)
    })

    test('Should apply proportional exemption for sale price above 12억', () => {
      const input = {
        salePrice: 1600000000, // 16억
        capitalGains: 600000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      expect(result.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemptionRate).toBe(1200000000 / 1600000000) // 0.75
      expect(result.exemptionAmount).toBe(600000000 * 0.75) // 450000000
      expect(result.taxableAmount).toBe(600000000 * 0.25) // 150000000
      expect(result.details.message).toContain('비례 비과세')
      expect(result.details.message).toContain('16.0억')
    })

    test('Should calculate proportional exemption correctly for 15억 sale price', () => {
      const input = {
        salePrice: 1500000000,
        capitalGains: 500000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      const expectedRate = 1200000000 / 1500000000 // 0.8
      const expectedExemption = 500000000 * expectedRate // 400000000
      const expectedTaxable = 500000000 - expectedExemption // 100000000

      expect(result.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemptionRate).toBeCloseTo(expectedRate, 10)
      expect(result.exemptionAmount).toBeCloseTo(expectedExemption, 0)
      expect(result.taxableAmount).toBeCloseTo(expectedTaxable, 0)
    })

    test('Should calculate proportional exemption correctly for 20억 sale price', () => {
      const input = {
        salePrice: 2000000000,
        capitalGains: 800000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      const expectedRate = 1200000000 / 2000000000 // 0.6
      const expectedExemption = 800000000 * expectedRate // 480000000
      const expectedTaxable = 800000000 - expectedExemption // 320000000

      expect(result.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemptionRate).toBeCloseTo(expectedRate, 10)
      expect(result.exemptionAmount).toBeCloseTo(expectedExemption, 0)
      expect(result.taxableAmount).toBeCloseTo(expectedTaxable, 0)
    })

    test('Should include correct details for proportional exemption', () => {
      const input = {
        salePrice: 1800000000,
        capitalGains: 600000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      expect(result.details.threshold).toBe(1200000000)
      expect(result.details.salePrice).toBe(1800000000)
      expect(result.details.calculation.formula).toBe('(12억 / 양도가액) × 양도차익')
      expect(result.details.calculation.exemptedPortion).toBeCloseTo(1200000000 / 1800000000, 10)
      expect(result.details.calculation.taxablePortion).toBeCloseTo(1 - (1200000000 / 1800000000), 10)
    })

    test('Should handle very high sale prices correctly', () => {
      const input = {
        salePrice: 5000000000, // 50억
        capitalGains: 3000000000,
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      const expectedRate = 1200000000 / 5000000000 // 0.24
      const expectedExemption = 3000000000 * expectedRate // 720000000
      const expectedTaxable = 3000000000 - expectedExemption // 2280000000

      expect(result.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemptionRate).toBeCloseTo(expectedRate, 10)
      expect(result.exemptionAmount).toBeCloseTo(expectedExemption, 0)
      expect(result.taxableAmount).toBeCloseTo(expectedTaxable, 0)
    })

    test('Should handle small capital gains with proportional exemption', () => {
      const input = {
        salePrice: 1500000000,
        capitalGains: 100000000, // Small gains
        eligibility: eligibleEligibility
      }
      const result = calculateOneHomeExemption(input)

      const expectedRate = 1200000000 / 1500000000 // 0.8
      const expectedExemption = 100000000 * expectedRate // 80000000
      const expectedTaxable = 100000000 - expectedExemption // 20000000

      expect(result.exemptionAmount).toBeCloseTo(expectedExemption, 0)
      expect(result.taxableAmount).toBeCloseTo(expectedTaxable, 0)
    })

    test('Should return consistent sum of exemption and taxable amounts', () => {
      const testCases = [
        { salePrice: 1300000000, capitalGains: 400000000 },
        { salePrice: 1600000000, capitalGains: 500000000 },
        { salePrice: 2500000000, capitalGains: 1000000000 }
      ]

      testCases.forEach(({ salePrice, capitalGains }) => {
        const input = { salePrice, capitalGains, eligibility: eligibleEligibility }
        const result = calculateOneHomeExemption(input)

        // Sum should equal original capital gains (within floating point tolerance)
        const sum = result.exemptionAmount + result.taxableAmount
        expect(sum).toBeCloseTo(capitalGains, 0)
      })
    })
  })
})
