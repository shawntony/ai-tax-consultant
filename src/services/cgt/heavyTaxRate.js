/**
 * Heavy Tax Rate Module
 * 다주택자 중과세율 로직
 * @module services/cgt/heavyTaxRate
 * @version 1.0.0
 */

import { isDateInRange } from './dateUtils.js'

/**
 * Check if heavy tax suspension is active
 * @param {Date} saleDate - Date of property sale
 * @returns {boolean} Is heavy tax suspended
 */
export function checkHeavyTaxSuspension(saleDate) {
  const suspensionStart = new Date('2022-05-10')
  const suspensionEnd = new Date('2025-05-09')

  return isDateInRange(saleDate, suspensionStart, suspensionEnd)
}

/**
 * Check if property is in adjustment target area
 * @param {Object} location - Property location
 * @param {string} location.city - City name
 * @param {string} location.district - District name
 * @returns {boolean} Is in adjustment area
 */
export function isAdjustmentArea(location) {
  if (!location || !location.city || !location.district) {
    return false
  }

  const { city, district } = location

  // Current adjustment areas (as of 2024)
  const adjustmentAreas = [
    { city: '서울특별시', districts: ['강남구', '서초구', '송파구', '용산구'] }
  ]

  return adjustmentAreas.some(area =>
    area.city === city && area.districts.includes(district)
  )
}

/**
 * Get current adjustment areas list
 * @returns {Array} List of adjustment areas
 */
export function getAdjustmentAreas() {
  return [
    { city: '서울특별시', district: '강남구', designation: '2017-08-02' },
    { city: '서울특별시', district: '서초구', designation: '2017-08-02' },
    { city: '서울특별시', district: '송파구', designation: '2017-08-02' },
    { city: '서울특별시', district: '용산구', designation: '2020-12-18' }
  ]
}

/**
 * Determine if heavy tax applies to property sale
 * @param {Object} input - Tax status parameters
 * @param {number} input.homeCount - Number of homes owned
 * @param {boolean} input.isAdjustmentArea - Is property in adjustment area
 * @param {number} input.holdingYears - Years of ownership
 * @param {Date} input.saleDate - Date of sale
 * @returns {Object} Heavy tax determination
 */
export function determineHeavyTaxStatus(input) {
  const {
    homeCount,
    isAdjustmentArea,
    holdingYears,
    saleDate
  } = input

  // Check if heavy tax is currently suspended
  const isSuspended = checkHeavyTaxSuspension(saleDate)

  if (isSuspended) {
    return {
      heavyTaxApplied: false,
      reason: 'SUSPENDED',
      message: '다주택자 중과세가 2025-05-09까지 한시 배제되어 기본세율 적용',
      suspensionPeriod: {
        start: new Date('2022-05-10'),
        end: new Date('2025-05-09')
      },
      fallbackToBasicRate: true
    }
  }

  // Heavy tax only applies to adjustment areas
  if (!isAdjustmentArea) {
    return {
      heavyTaxApplied: false,
      reason: 'NOT_ADJUSTMENT_AREA',
      message: '조정대상지역이 아니므로 기본세율 적용',
      fallbackToBasicRate: true
    }
  }

  // Heavy tax only applies to multiple homeowners
  if (homeCount < 2) {
    return {
      heavyTaxApplied: false,
      reason: 'SINGLE_HOME',
      message: '1주택자이므로 기본세율 적용',
      fallbackToBasicRate: true
    }
  }

  // Check for short-term holding penalty
  if (holdingYears < 1) {
    return {
      heavyTaxApplied: true,
      heavyTaxType: 'SHORT_TERM_SEVERE',
      reason: 'HOLDING_LESS_THAN_1_YEAR',
      taxRate: 0.70,
      message: '1년 미만 보유로 70% 세율 적용',
      isFlat: true
    }
  }

  if (holdingYears < 2) {
    return {
      heavyTaxApplied: true,
      heavyTaxType: 'SHORT_TERM_MODERATE',
      reason: 'HOLDING_1_TO_2_YEARS',
      taxRate: 0.60,
      message: '1년 이상 2년 미만 보유로 60% 세율 적용',
      isFlat: true
    }
  }

  // Regular heavy tax (2+ years holding, 2+ homes, adjustment area)
  const surcharge = homeCount === 2 ? 0.20 : 0.30

  return {
    heavyTaxApplied: true,
    heavyTaxType: 'REGULAR',
    reason: 'MULTIPLE_HOMES_ADJUSTMENT_AREA',
    homeCount,
    surcharge,
    message: `${homeCount}주택자 조정대상지역 중과 (기본세율 + ${surcharge * 100}%p)`,
    isFlat: false
  }
}

/**
 * Get the progressive tax bracket for a given amount
 * @param {number} amount - Taxable amount
 * @returns {Object} Tax bracket information
 */
export function getProgressiveTaxBracket(amount) {
  const brackets = [
    { max: 14000000, rate: 0.06, deduction: 0 },
    { max: 50000000, rate: 0.15, deduction: 1260000 },
    { max: 88000000, rate: 0.24, deduction: 5760000 },
    { max: 150000000, rate: 0.35, deduction: 15440000 },
    { max: 300000000, rate: 0.38, deduction: 19940000 },
    { max: 500000000, rate: 0.40, deduction: 25940000 },
    { max: Infinity, rate: 0.45, deduction: 50940000 }
  ]

  const bracket = brackets.find(b => amount <= b.max)

  return {
    min: bracket === brackets[0] ? 0 : brackets[brackets.indexOf(bracket) - 1].max + 1,
    max: bracket.max,
    rate: bracket.rate,
    deduction: bracket.deduction
  }
}

/**
 * Calculate effective tax rate for capital gains
 * @param {Object} input - Tax rate parameters
 * @param {number} input.taxableGains - Taxable capital gains amount
 * @param {Object} input.heavyTaxStatus - Result from determineHeavyTaxStatus()
 * @returns {Object} Tax rate calculation
 */
export function calculateEffectiveTaxRate(input) {
  const { taxableGains, heavyTaxStatus } = input

  // Case 1: Flat rate (short-term holding penalties)
  if (heavyTaxStatus.heavyTaxApplied && heavyTaxStatus.isFlat) {
    return {
      rateType: 'FLAT',
      effectiveRate: heavyTaxStatus.taxRate,
      baseRate: heavyTaxStatus.taxRate,
      surcharge: 0,
      bracket: null,
      message: heavyTaxStatus.message
    }
  }

  // Case 2: Progressive rate (basic or with heavy tax surcharge)
  const basicBracket = getProgressiveTaxBracket(taxableGains)

  if (heavyTaxStatus.heavyTaxApplied && !heavyTaxStatus.fallbackToBasicRate) {
    // Apply heavy tax surcharge
    const effectiveRate = Math.min(
      basicBracket.rate + heavyTaxStatus.surcharge,
      0.75 // Maximum 75% cap
    )

    return {
      rateType: 'PROGRESSIVE_HEAVY',
      effectiveRate,
      baseRate: basicBracket.rate,
      surcharge: heavyTaxStatus.surcharge,
      bracket: basicBracket,
      message: `기본 ${(basicBracket.rate * 100).toFixed(0)}% + 중과 ${(heavyTaxStatus.surcharge * 100).toFixed(0)}%p = ${(effectiveRate * 100).toFixed(0)}%`
    }
  }

  // Case 3: Basic progressive rate
  return {
    rateType: 'PROGRESSIVE_BASIC',
    effectiveRate: basicBracket.rate,
    baseRate: basicBracket.rate,
    surcharge: 0,
    bracket: basicBracket,
    message: `과세표준 ${(taxableGains / 100000000).toFixed(1)}억원, 기본세율 ${(basicBracket.rate * 100).toFixed(0)}%`
  }
}

/**
 * Calculate capital gains tax amount
 * @param {Object} input - Tax calculation parameters
 * @param {number} input.taxableGains - Final taxable capital gains
 * @param {Object} input.effectiveRate - Result from calculateEffectiveTaxRate()
 * @returns {Object} Tax calculation result
 */
export function calculateCapitalGainsTax(input) {
  const { taxableGains, effectiveRate } = input

  let capitalGainsTax

  if (effectiveRate.rateType === 'FLAT') {
    // Flat rate calculation
    capitalGainsTax = taxableGains * effectiveRate.effectiveRate
  } else {
    // Progressive rate calculation with deduction
    capitalGainsTax = (taxableGains * effectiveRate.effectiveRate) - effectiveRate.bracket.deduction
  }

  // Ensure non-negative
  capitalGainsTax = Math.max(0, capitalGainsTax)

  // Local income tax is 10% of capital gains tax
  const localIncomeTax = capitalGainsTax * 0.10

  const totalTax = capitalGainsTax + localIncomeTax

  return {
    taxableGains,
    effectiveRate: effectiveRate.effectiveRate,
    capitalGainsTax,
    localIncomeTax,
    totalTax,
    breakdown: {
      rateType: effectiveRate.rateType,
      baseRate: effectiveRate.baseRate,
      surcharge: effectiveRate.surcharge,
      bracket: effectiveRate.bracket
    },
    calculation: {
      formula: effectiveRate.rateType === 'FLAT'
        ? '과세표준 × 세율'
        : '(과세표준 × 세율) - 누진공제',
      capitalGainsFormula: effectiveRate.rateType === 'FLAT'
        ? `${taxableGains.toLocaleString()} × ${(effectiveRate.effectiveRate * 100).toFixed(0)}%`
        : `${taxableGains.toLocaleString()} × ${(effectiveRate.effectiveRate * 100).toFixed(0)}% - ${effectiveRate.bracket.deduction.toLocaleString()}`,
      localIncomeFormula: `양도소득세 × 10%`
    }
  }
}
