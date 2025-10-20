/**
 * Capital Gains Tax Integration Tests
 * @jest-environment node
 */

import { calculateCapitalGainsTax, calculateTaxScenarios } from '../index.js'

describe('Capital Gains Tax Integration Tests', () => {
  // Test Scenario 1: Standard One-Home Full Exemption
  describe('Scenario 1: Standard One-Home Full Exemption', () => {
    const input = {
      salePrice: 800000000, // 8억
      purchasePrice: 500000000, // 5억
      necessaryExpenses: 30000000, // 3천만
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2019-01-01',
      saleDate: '2024-01-01',
      residenceStartDate: '2019-03-01',
      residenceEndDate: '2023-12-01',
      location: {
        city: '서울특별시',
        district: '마포구'
      }
    }

    test('Should result in zero tax (full exemption)', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 800M - 500M - 30M = 270M
      expect(result.capitalGains).toBe(270000000)

      // Should qualify for one-home exemption
      expect(result.eligibility.eligible).toBe(true)

      // Sale price < 12억, should be full exemption
      expect(result.exemption.exemptionType).toBe('FULL')
      expect(result.exemption.exemptionAmount).toBe(270000000)

      // Final tax should be zero
      expect(result.summary.totalTax).toBe(0)
      expect(result.summary.capitalGainsTax).toBe(0)
      expect(result.summary.localIncomeTax).toBe(0)
    })
  })

  // Test Scenario 2: High-Value One-Home with Proportional Exemption and Deductions
  describe('Scenario 2: High-Value One-Home (15억) with Max Deductions', () => {
    const input = {
      salePrice: 1500000000, // 15억
      purchasePrice: 800000000, // 8억
      necessaryExpenses: 50000000, // 5천만
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2014-01-01',
      saleDate: '2024-01-01',
      residenceStartDate: '2014-03-01',
      residenceEndDate: '2023-12-01',
      location: {
        city: '경기도',
        district: '성남시'
      }
    }

    test('Should apply proportional exemption + 80% long-term deduction', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 1500M - 800M - 50M = 650M
      expect(result.capitalGains).toBe(650000000)

      // Should qualify
      expect(result.eligibility.eligible).toBe(true)

      // Proportional exemption: 12억/15억 = 80%
      expect(result.exemption.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemption.exemptionRate).toBeCloseTo(0.8, 2)
      expect(result.exemption.exemptionAmount).toBeCloseTo(520000000, -5)

      // Remaining after exemption: 130M
      expect(result.exemption.taxableAmount).toBeCloseTo(130000000, -5)

      // Long-term deduction: 10 years holding + 9.75 years residence = 76% (40% holding + 36% residence)
      expect(result.deduction.deductionRate).toBeCloseTo(0.76, 2)
      expect(result.deduction.deductionAmount).toBeCloseTo(98800000, -5)

      // Final taxable: 31.2M
      expect(result.deduction.remainingTaxable).toBeCloseTo(31200000, -5)

      // Tax should be relatively low
      expect(result.summary.totalTax).toBeLessThan(5000000)
    })
  })

  // Test Scenario 3: Multiple Homes During Heavy Tax Suspension
  describe('Scenario 3: Multiple Homes (2) During Suspension Period', () => {
    const input = {
      salePrice: 1000000000,
      purchasePrice: 700000000,
      necessaryExpenses: 30000000,
      homeCount: 2,
      householdHomeCount: 2,
      purchaseDate: '2021-01-01',
      saleDate: '2024-01-01',
      location: {
        city: '서울특별시',
        district: '강남구'
      }
    }

    test('Should use basic progressive rate (no heavy tax)', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 1000M - 700M - 30M = 270M
      expect(result.capitalGains).toBe(270000000)

      // Should NOT qualify for one-home exemption
      expect(result.eligibility.eligible).toBe(false)
      expect(result.eligibility.reason).toBe('NOT_ONE_HOME')
      expect(result.exemption.exemptionAmount).toBe(0)

      // Long-term deduction: 3 years = 6%
      expect(result.deduction.deductionRate).toBeCloseTo(0.06, 2)
      expect(result.deduction.deductionAmount).toBeCloseTo(16200000, -5)

      // Taxable: 270M - 16.2M = 253.8M
      expect(result.deduction.remainingTaxable).toBeCloseTo(253800000, -5)

      // Heavy tax should NOT be applied (suspension period)
      expect(result.heavyTaxStatus.heavyTaxApplied).toBe(false)
      expect(result.heavyTaxStatus.reason).toBe('SUSPENDED')

      // Should use basic progressive rate
      expect(result.effectiveRate.rateType).toBe('PROGRESSIVE_BASIC')

      // Tax calculation: 253.8M × 38% - 19,940,000 = 76.504M (38% bracket for 150M-300M)
      expect(result.summary.capitalGainsTax).toBeCloseTo(76504000, -5)
      expect(result.summary.localIncomeTax).toBeCloseTo(7650400, -5)
      expect(result.summary.totalTax).toBeCloseTo(84154400, -5)
    })
  })

  // Test Scenario 4: Short-term Holding Penalty
  describe('Scenario 4: Short-term Holding (< 1 year) Penalty', () => {
    const input = {
      salePrice: 800000000,
      purchasePrice: 600000000,
      necessaryExpenses: 20000000,
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2023-07-01',
      saleDate: '2024-01-01',
      location: {
        city: '서울특별시',
        district: '마포구'
      }
    }

    test('Should apply high penalties for short-term holding', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 800M - 600M - 20M = 180M
      expect(result.capitalGains).toBe(180000000)

      // Should NOT qualify for one-home exemption (< 2 years)
      expect(result.eligibility.eligible).toBe(false)
      expect(result.eligibility.reason).toBe('INSUFFICIENT_HOLDING_PERIOD')

      // NO long-term deduction (< 3 years)
      expect(result.deduction.deductionRate).toBe(0)
      expect(result.deduction.deductionAmount).toBe(0)

      // Taxable = full 180M
      expect(result.tax.taxableGains).toBe(180000000)

      // Should use progressive rate (not adjustment area, only 1 home)
      // 180M × 38% - 19,940,000 = 48.46M
      expect(result.summary.capitalGainsTax).toBeCloseTo(48460000, -5)
      expect(result.summary.totalTax).toBeCloseTo(53306000, -5)

      // Should have warnings
      expect(result.warnings.length).toBeGreaterThan(0)
      const holdingWarning = result.warnings.find(w => w.category === 'ONE_HOME_EXEMPTION')
      expect(holdingWarning).toBeDefined()
    })
  })

  // Test Scenario 5: Capital Loss (No Tax)
  describe('Scenario 5: Capital Loss (Negative Gains)', () => {
    const input = {
      salePrice: 600000000,
      purchasePrice: 700000000,
      necessaryExpenses: 30000000,
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2020-01-01',
      saleDate: '2024-01-01'
    }

    test('Should result in zero tax for capital loss', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital loss: 600M - 700M - 30M = -130M
      expect(result.capitalGains).toBe(-130000000)
      expect(result.hasLoss).toBe(true)

      // All tax should be zero
      expect(result.summary.totalTax).toBe(0)
      expect(result.summary.capitalGainsTax).toBe(0)
      expect(result.summary.localIncomeTax).toBe(0)
    })
  })

  // Test Scenario 6: Adjustment Area with Residence Requirement
  describe('Scenario 6: Adjustment Area (Gangnam) with Residence Requirement', () => {
    const input = {
      salePrice: 1300000000,
      purchasePrice: 900000000,
      necessaryExpenses: 50000000,
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2018-01-01', // After 2017-08-02
      saleDate: '2024-01-01',
      residenceStartDate: '2018-03-01',
      residenceEndDate: '2023-12-01',
      location: {
        city: '서울특별시',
        district: '강남구' // Adjustment area
      }
    }

    test('Should pass residence requirement and apply proportional exemption', async () => {
      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 1300M - 900M - 50M = 350M
      expect(result.capitalGains).toBe(350000000)

      // Should require residence
      expect(result.eligibility.requiresResidence).toBe(true)

      // Should qualify (residence ~ 5.75 years > 2 years)
      expect(result.eligibility.eligible).toBe(true)

      // Proportional exemption: 12억/13억 ≈ 92.3%
      expect(result.exemption.exemptionType).toBe('PROPORTIONAL')
      expect(result.exemption.exemptionRate).toBeCloseTo(0.923, 2)

      // Tax should be relatively low due to high exemption rate
      expect(result.summary.totalTax).toBeLessThan(10000000)
    })
  })

  // Test Scenario 7: Tax Planning Scenarios
  describe('Scenario 7: Tax Planning - Multiple Holding Periods', () => {
    const baseInput = {
      salePrice: 1000000000,
      purchasePrice: 600000000,
      necessaryExpenses: 40000000,
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2020-01-01',
      residenceStartDate: '2020-03-01'
    }

    test('Should calculate scenarios for different holding periods', async () => {
      const scenarios = await calculateTaxScenarios(baseInput, [2, 3, 5, 10, 15])

      expect(scenarios).toHaveLength(5)

      // Tax should generally decrease with longer holding periods
      const tax2yr = scenarios.find(s => s.holdingYears === 2)
      const tax10yr = scenarios.find(s => s.holdingYears === 10)

      expect(tax2yr).toBeDefined()
      expect(tax10yr).toBeDefined()

      // 2-year: Full exemption (sale < 12억, holding ≥ 2yr)
      expect(tax2yr.totalTax).toBe(0)

      // 10-year: Full exemption with max deductions
      expect(tax10yr.totalTax).toBe(0)
    })
  })

  // Test Scenario 8: Input Validation
  describe('Scenario 8: Input Validation', () => {
    test('Should throw error for invalid sale price', async () => {
      const input = {
        salePrice: -100000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }

      await expect(calculateCapitalGainsTax(input)).rejects.toThrow()
    })

    test('Should allow capital loss (purchase price > sale price)', async () => {
      const input = {
        salePrice: 500000000,
        purchasePrice: 800000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }

      const result = await calculateCapitalGainsTax(input)
      expect(result.capitalGains).toBe(-330000000) // Loss
      expect(result.hasLoss).toBe(true)
      expect(result.summary.totalTax).toBe(0)
    })

    test('Should throw error for invalid dates', async () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2024-01-01',
        saleDate: '2020-01-01' // Sale before purchase
      }

      await expect(calculateCapitalGainsTax(input)).rejects.toThrow()
    })
  })

  // Test Scenario 9: Edge Cases
  describe('Scenario 9: Edge Cases', () => {
    test('Should handle exact 12억 threshold', async () => {
      const input = {
        salePrice: 1200000000, // Exactly 12억
        purchasePrice: 800000000,
        necessaryExpenses: 50000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }

      const result = await calculateCapitalGainsTax(input)

      // Should be full exemption (≤ 12억)
      expect(result.exemption.exemptionType).toBe('FULL')
      expect(result.summary.totalTax).toBe(0)
    })

    test('Should handle exact 3-year holding period', async () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 600000000,
        necessaryExpenses: 30000000,
        homeCount: 2,
        householdHomeCount: 2,
        purchaseDate: '2021-01-01',
        saleDate: '2024-01-01' // Exactly 3 years
      }

      const result = await calculateCapitalGainsTax(input)

      // Should get 6% long-term deduction (base rate)
      expect(result.deduction.deductionRate).toBeCloseTo(0.06, 2)
    })
  })

  // Test Scenario 10: Real-world Complex Case
  describe('Scenario 10: Complex Real-World Case', () => {
    test('3-home owner in Gangnam during suspension period', async () => {
      const input = {
        salePrice: 2000000000, // 20억
        purchasePrice: 1200000000, // 12억
        necessaryExpenses: 100000000, // 1억
        homeCount: 3,
        householdHomeCount: 3,
        purchaseDate: '2020-01-01',
        saleDate: '2024-10-01',
        location: {
          city: '서울특별시',
          district: '강남구'
        }
      }

      const result = await calculateCapitalGainsTax(input)

      // Capital gains = 20억 - 12억 - 1억 = 7억
      expect(result.capitalGains).toBe(700000000)

      // NOT eligible for one-home exemption (3 homes)
      expect(result.eligibility.eligible).toBe(false)
      expect(result.exemption.exemptionAmount).toBe(0)

      // Long-term deduction: ~4.75 years = 8% (6% + 1×2%)
      expect(result.deduction.deductionRate).toBeCloseTo(0.08, 2)

      // Heavy tax suspended
      expect(result.heavyTaxStatus.heavyTaxApplied).toBe(false)
      expect(result.heavyTaxStatus.reason).toBe('SUSPENDED')

      // Should use progressive basic rate
      // Taxable: 700M × 0.92 = 644M
      // Tax: 644M × 45% - 50,940,000 ≈ 238.86M
      expect(result.summary.totalTax).toBeGreaterThan(200000000)

      // Should have suspension warning
      const suspensionWarning = result.warnings.find(w => w.category === 'HEAVY_TAX_SUSPENSION')
      expect(suspensionWarning).toBeDefined()
    })
  })
})
