/**
 * Long-term Holding Special Deduction Module
 * 장기보유특별공제 로직
 * @module services/cgt/longTermDeduction
 * @version 1.0.0
 */

/**
 * Calculate general property deduction rate (max 30%)
 * @param {number} holdingYears - Years of ownership
 * @returns {Object} Deduction rate details
 */
export function calculateGeneralDeductionRate(holdingYears) {
  // No deduction for holding < 3 years
  if (holdingYears < 3) {
    return {
      type: 'GENERAL',
      holdingRate: 0,
      residenceRate: 0,
      totalRate: 0,
      details: {
        holdingYears,
        message: '보유기간 3년 미만으로 장기보유특별공제 미적용'
      }
    }
  }

  // Formula: 6% base + 2% per year after 3 years, max 30%
  const baseRate = 0.06
  const incrementPerYear = 0.02
  const maxRate = 0.30
  const yearsOverThree = Math.floor(holdingYears) - 3

  const holdingRate = Math.min(
    baseRate + (yearsOverThree * incrementPerYear),
    maxRate
  )

  return {
    type: 'GENERAL',
    holdingRate,
    residenceRate: 0,
    totalRate: holdingRate,
    details: {
      holdingYears,
      yearsOverThree,
      calculation: {
        formula: '6% + (보유년수 - 3) × 2%',
        baseRate,
        incrementPerYear,
        maxRate
      },
      message: `보유기간 ${Math.floor(holdingYears)}년으로 ${(holdingRate * 100).toFixed(0)}% 공제 적용`
    }
  }
}

/**
 * Calculate one-home high-value deduction rate (max 80%)
 * @param {number} holdingYears - Years of ownership
 * @param {number} residenceYears - Years of residence
 * @returns {Object} Deduction rate details
 */
export function calculateOneHomeDeductionRate(holdingYears, residenceYears) {
  // Holding deduction: 12% base (3yr) + 4% per year, max 40%
  let holdingRate = 0
  if (holdingYears >= 3) {
    const baseHoldingRate = 0.12
    const holdingIncrementPerYear = 0.04
    const maxHoldingRate = 0.40
    const yearsOverThree = Math.floor(holdingYears) - 3

    holdingRate = Math.min(
      baseHoldingRate + (yearsOverThree * holdingIncrementPerYear),
      maxHoldingRate
    )
  }

  // Residence deduction: 8% base (2yr) + 4% per year, max 40%
  let residenceRate = 0
  if (residenceYears >= 2) {
    const baseResidenceRate = 0.08
    const residenceIncrementPerYear = 0.04
    const maxResidenceRate = 0.40
    const yearsOverTwo = Math.floor(residenceYears) - 2

    residenceRate = Math.min(
      baseResidenceRate + (yearsOverTwo * residenceIncrementPerYear),
      maxResidenceRate
    )
  }

  const totalRate = holdingRate + residenceRate

  return {
    type: 'ONE_HOME_HIGH_VALUE',
    holdingRate,
    residenceRate,
    totalRate,
    details: {
      holdingYears,
      residenceYears,
      holdingCalculation: {
        formula: '12% + (보유년수 - 3) × 4%',
        baseRate: 0.12,
        maxRate: 0.40
      },
      residenceCalculation: {
        formula: '8% + (거주년수 - 2) × 4%',
        baseRate: 0.08,
        maxRate: 0.40
      },
      message: `보유 ${(holdingRate * 100).toFixed(0)}% + 거주 ${(residenceRate * 100).toFixed(0)}% = 총 ${(totalRate * 100).toFixed(0)}% 공제`
    }
  }
}

/**
 * Calculate long-term holding deduction rate
 * @param {Object} input - Deduction parameters
 * @param {number} input.holdingYears - Years of ownership
 * @param {number} [input.residenceYears=0] - Years of residence (for one-home)
 * @param {boolean} [input.isOneHomeHighValue=false] - Is 1세대1주택 with price > 12억
 * @returns {Object} Deduction rate calculation
 */
export function calculateHoldingDeductionRate(input) {
  const {
    holdingYears,
    residenceYears = 0,
    isOneHomeHighValue = false
  } = input

  if (isOneHomeHighValue) {
    // One-home high-value: Dual deduction (holding + residence)
    return calculateOneHomeDeductionRate(holdingYears, residenceYears)
  } else {
    // General property: Single deduction (holding only)
    return calculateGeneralDeductionRate(holdingYears)
  }
}

/**
 * Apply long-term holding deduction to capital gains
 * @param {Object} input - Deduction parameters
 * @param {number} input.taxableGains - Amount subject to deduction
 * @param {Object} input.deductionRate - Result from calculateHoldingDeductionRate()
 * @returns {Object} Deduction result
 */
export function applyLongTermDeduction(input) {
  const { taxableGains, deductionRate } = input

  const deductionAmount = taxableGains * deductionRate.totalRate
  const remainingTaxable = taxableGains - deductionAmount

  return {
    deductionType: deductionRate.type,
    deductionRate: deductionRate.totalRate,
    deductionAmount,
    remainingTaxable,
    breakdown: {
      originalTaxable: taxableGains,
      holdingDeduction: {
        rate: deductionRate.holdingRate,
        amount: taxableGains * deductionRate.holdingRate
      },
      residenceDeduction: {
        rate: deductionRate.residenceRate,
        amount: taxableGains * deductionRate.residenceRate
      }
    },
    details: deductionRate.details
  }
}
