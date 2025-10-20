/**
 * One-Home Exemption Module
 * 1세대1주택 비과세 로직
 * @module services/cgt/oneHomeExemption
 * @version 1.0.0
 */

/**
 * Check if residence requirement applies
 * @param {boolean} isAdjustmentArea - Is property in adjustment area
 * @param {Date} acquisitionDate - When property was acquired
 * @returns {boolean} Whether residence is required
 */
export function checkResidenceRequirement(isAdjustmentArea, acquisitionDate) {
  if (!isAdjustmentArea) {
    return false
  }

  // Residence requirement applies if acquired after 2017-08-02
  const residenceRequirementStartDate = new Date('2017-08-02')
  return acquisitionDate >= residenceRequirementStartDate
}

/**
 * Check if the property sale qualifies for one-home exemption
 * @param {Object} input - Sale information
 * @param {number} input.householdHomeCount - Number of homes owned by household
 * @param {number} input.holdingYears - Years of ownership
 * @param {boolean} input.isAdjustmentArea - Whether property is in adjustment area
 * @param {Date} input.acquisitionDate - Date property was acquired
 * @param {number} [input.residenceYears=0] - Years of actual residence (optional)
 * @returns {Object} Eligibility result
 */
export function checkOneHomeEligibility(input) {
  const {
    householdHomeCount,
    holdingYears,
    isAdjustmentArea,
    acquisitionDate,
    residenceYears = 0
  } = input

  // Rule 1: Must own exactly 1 home
  if (householdHomeCount !== 1) {
    return {
      eligible: false,
      reason: 'NOT_ONE_HOME',
      message: `1세대1주택이 아닙니다. (현재 보유 주택 수: ${householdHomeCount}개)`,
      requiresResidence: false
    }
  }

  // Rule 2: Must hold for at least 2 years
  if (holdingYears < 2) {
    return {
      eligible: false,
      reason: 'INSUFFICIENT_HOLDING_PERIOD',
      message: `보유기간이 2년 미만입니다. (현재: ${holdingYears.toFixed(1)}년)`,
      requiresResidence: false
    }
  }

  // Rule 3: Check residence requirement for adjustment areas
  const requiresResidence = checkResidenceRequirement(
    isAdjustmentArea,
    acquisitionDate
  )

  if (requiresResidence && residenceYears < 2) {
    return {
      eligible: false,
      reason: 'INSUFFICIENT_RESIDENCE_PERIOD',
      message: '조정대상지역 주택으로 거주요건(2년)을 충족하지 못했습니다.',
      requiresResidence: true,
      requiredResidenceYears: 2,
      actualResidenceYears: residenceYears
    }
  }

  return {
    eligible: true,
    reason: 'QUALIFIED',
    message: '1세대1주택 비과세 요건을 충족합니다.',
    requiresResidence,
    residenceYears
  }
}

/**
 * Calculate one-home tax exemption amount
 * @param {Object} input - Calculation parameters
 * @param {number} input.salePrice - Sale price (양도가액)
 * @param {number} input.capitalGains - Total capital gains (양도차익)
 * @param {Object} input.eligibility - Result from checkOneHomeEligibility()
 * @returns {Object} Exemption calculation result
 */
export function calculateOneHomeExemption(input) {
  const { salePrice, capitalGains, eligibility } = input

  // Not eligible for exemption
  if (!eligibility.eligible) {
    return {
      exemptionType: 'NONE',
      exemptionAmount: 0,
      taxableAmount: capitalGains,
      exemptionRate: 0,
      details: {
        reason: eligibility.reason,
        message: eligibility.message
      }
    }
  }

  const EXEMPTION_THRESHOLD = 1200000000 // 12억원

  // Case 1: Full exemption (sale price ≤ 12억)
  if (salePrice <= EXEMPTION_THRESHOLD) {
    return {
      exemptionType: 'FULL',
      exemptionAmount: capitalGains,
      taxableAmount: 0,
      exemptionRate: 1.0,
      details: {
        threshold: EXEMPTION_THRESHOLD,
        salePrice,
        message: '실거래가 12억원 이하로 전액 비과세 적용'
      }
    }
  }

  // Case 2: Proportional exemption (sale price > 12억)
  const exemptionRate = EXEMPTION_THRESHOLD / salePrice
  const exemptionAmount = capitalGains * exemptionRate
  const taxableAmount = capitalGains - exemptionAmount

  return {
    exemptionType: 'PROPORTIONAL',
    exemptionAmount,
    taxableAmount,
    exemptionRate,
    details: {
      threshold: EXEMPTION_THRESHOLD,
      salePrice,
      calculation: {
        formula: '(12억 / 양도가액) × 양도차익',
        exemptedPortion: exemptionRate,
        taxablePortion: 1 - exemptionRate
      },
      message: `실거래가 ${(salePrice / 100000000).toFixed(1)}억원으로 비례 비과세 적용 (${(exemptionRate * 100).toFixed(1)}%)`
    }
  }
}
