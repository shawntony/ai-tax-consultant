/**
 * Capital Gains Tax Calculation Engine
 * 양도소득세 계산 엔진 (Main Integration)
 * @module services/cgt
 * @version 1.0.0
 */

import { calculateHoldingPeriod, calculateResidencePeriod, parseDate } from './dateUtils.js'
import { sanitizeInput } from './validation.js'
import { checkOneHomeEligibility, calculateOneHomeExemption } from './oneHomeExemption.js'
import { calculateHoldingDeductionRate, applyLongTermDeduction } from './longTermDeduction.js'
import {
  determineHeavyTaxStatus,
  calculateEffectiveTaxRate,
  calculateCapitalGainsTax as calculateTax,
  isAdjustmentArea
} from './heavyTaxRate.js'

/**
 * Calculate Capital Gains Tax
 * Main orchestration function that integrates all modules
 *
 * @param {Object} userInput - User input data
 * @param {number} userInput.salePrice - Sale price (양도가액)
 * @param {number} userInput.purchasePrice - Purchase price (취득가액)
 * @param {number} userInput.necessaryExpenses - Necessary expenses (필요경비)
 * @param {number} userInput.homeCount - Number of homes owned
 * @param {number} userInput.householdHomeCount - Number of homes owned by household
 * @param {string|Date} userInput.purchaseDate - Property purchase date
 * @param {string|Date} userInput.saleDate - Property sale date
 * @param {string|Date} [userInput.residenceStartDate] - Residence start date (optional)
 * @param {string|Date} [userInput.residenceEndDate] - Residence end date (optional)
 * @param {Object} [userInput.location] - Property location (optional)
 * @param {string} [userInput.location.city] - City name
 * @param {string} [userInput.location.district] - District name
 * @returns {Object} Complete capital gains tax calculation result
 */
export async function calculateCapitalGainsTax(userInput) {
  try {
    // Step 1: Validate and sanitize input
    const input = sanitizeInput(userInput)

    // Step 2: Calculate periods
    const holdingYears = calculateHoldingPeriod(input.purchaseDate, input.saleDate)
    const residenceYears = input.residenceStartDate && input.residenceEndDate
      ? calculateResidencePeriod(input.residenceStartDate, input.residenceEndDate)
      : 0

    // Determine if property is in adjustment area
    const isInAdjustmentArea = input.location
      ? isAdjustmentArea(input.location)
      : Boolean(input.isAdjustmentArea)

    // Step 3: Calculate base capital gains
    const capitalGains = input.salePrice - input.purchasePrice - input.necessaryExpenses

    // Validate capital gains is non-negative
    if (capitalGains < 0) {
      return {
        capitalGains,
        hasLoss: true,
        message: '양도 손실이 발생했습니다. 양도소득세가 부과되지 않습니다.',
        exemption: { exemptionType: 'LOSS', exemptionAmount: 0, taxableAmount: 0 },
        deduction: { deductionAmount: 0, remainingTaxable: 0 },
        tax: { capitalGainsTax: 0, localIncomeTax: 0, totalTax: 0 },
        summary: {
          totalCapitalGains: capitalGains,
          totalExemption: 0,
          totalDeduction: 0,
          finalTaxable: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0,
          totalTax: 0
        }
      }
    }

    // Step 4: Check one-home exemption (Module 1)
    const eligibility = checkOneHomeEligibility({
      householdHomeCount: input.householdHomeCount,
      holdingYears,
      isAdjustmentArea: isInAdjustmentArea,
      acquisitionDate: input.purchaseDate,
      residenceYears
    })

    const exemption = calculateOneHomeExemption({
      salePrice: input.salePrice,
      capitalGains,
      eligibility
    })

    // If full exemption applies, tax is zero
    if (exemption.exemptionType === 'FULL') {
      return {
        capitalGains,
        holdingYears,
        residenceYears,
        eligibility,
        exemption,
        deduction: { deductionAmount: 0, remainingTaxable: 0 },
        heavyTaxStatus: { heavyTaxApplied: false, reason: 'FULL_EXEMPTION' },
        tax: { capitalGainsTax: 0, localIncomeTax: 0, totalTax: 0 },
        summary: {
          totalCapitalGains: capitalGains,
          totalExemption: exemption.exemptionAmount,
          totalDeduction: 0,
          finalTaxable: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0,
          totalTax: 0
        }
      }
    }

    // Step 5: Apply long-term deduction (Module 2)
    const isOneHomeHighValue = eligibility.eligible && input.salePrice > 1200000000

    const deductionRate = calculateHoldingDeductionRate({
      holdingYears,
      residenceYears,
      isOneHomeHighValue
    })

    const deduction = applyLongTermDeduction({
      taxableGains: exemption.taxableAmount,
      deductionRate
    })

    // Step 6: Determine tax rate (Module 3)
    const heavyTaxStatus = determineHeavyTaxStatus({
      homeCount: input.homeCount,
      isAdjustmentArea: isInAdjustmentArea,
      holdingYears,
      saleDate: input.saleDate
    })

    const effectiveRate = calculateEffectiveTaxRate({
      taxableGains: deduction.remainingTaxable,
      heavyTaxStatus
    })

    // Step 7: Calculate final tax
    const tax = calculateTax({
      taxableGains: deduction.remainingTaxable,
      effectiveRate
    })

    // Return complete calculation result
    return {
      // Input summary
      input: {
        salePrice: input.salePrice,
        purchasePrice: input.purchasePrice,
        necessaryExpenses: input.necessaryExpenses,
        homeCount: input.homeCount,
        householdHomeCount: input.householdHomeCount,
        holdingYears: holdingYears.toFixed(2),
        residenceYears: residenceYears.toFixed(2),
        isAdjustmentArea: isInAdjustmentArea,
        location: input.location
      },

      // Calculation steps
      capitalGains,
      holdingYears,
      residenceYears,
      eligibility,
      exemption,
      deduction,
      heavyTaxStatus,
      effectiveRate,
      tax,

      // Summary
      summary: {
        totalCapitalGains: capitalGains,
        totalExemption: exemption.exemptionAmount,
        totalDeduction: deduction.deductionAmount,
        finalTaxable: tax.taxableGains,
        capitalGainsTax: tax.capitalGainsTax,
        localIncomeTax: tax.localIncomeTax,
        totalTax: tax.totalTax,
        effectiveTaxRate: capitalGains > 0 ? (tax.totalTax / capitalGains * 100).toFixed(2) : 0
      },

      // Warnings and recommendations
      warnings: generateWarnings({
        eligibility,
        exemption,
        deduction,
        heavyTaxStatus,
        holdingYears,
        residenceYears,
        isAdjustmentArea
      }),

      // Metadata
      metadata: {
        calculationDate: new Date().toISOString(),
        version: '1.0.0',
        modules: {
          oneHomeExemption: '1.0.0',
          longTermDeduction: '1.0.0',
          heavyTaxRate: '1.0.0'
        }
      }
    }
  } catch (error) {
    throw new Error(`양도소득세 계산 중 오류 발생: ${error.message}`)
  }
}

/**
 * Generate warnings and recommendations based on calculation results
 * @param {Object} params - Calculation parameters
 * @returns {Array} Array of warning objects
 */
function generateWarnings(params) {
  const {
    eligibility,
    exemption,
    deduction,
    heavyTaxStatus,
    holdingYears,
    residenceYears,
    isAdjustmentArea
  } = params

  const warnings = []

  // One-home exemption warnings
  if (!eligibility.eligible) {
    if (eligibility.reason === 'INSUFFICIENT_HOLDING_PERIOD') {
      const remainingMonths = Math.ceil((2 - holdingYears) * 12)
      warnings.push({
        type: 'info',
        category: 'ONE_HOME_EXEMPTION',
        message: `보유기간 ${remainingMonths}개월 더 보유하면 1세대1주택 비과세 요건 충족 가능`,
        impact: 'HIGH'
      })
    }

    if (eligibility.reason === 'INSUFFICIENT_RESIDENCE_PERIOD') {
      const remainingMonths = Math.ceil((2 - residenceYears) * 12)
      warnings.push({
        type: 'warning',
        category: 'RESIDENCE_REQUIREMENT',
        message: `조정대상지역 주택으로 거주요건 미충족 (${remainingMonths}개월 더 거주 필요)`,
        impact: 'HIGH'
      })
    }
  }

  // Proportional exemption notification
  if (exemption.exemptionType === 'PROPORTIONAL') {
    warnings.push({
      type: 'info',
      category: 'PROPORTIONAL_EXEMPTION',
      message: `실거래가 12억 초과로 비례 비과세 적용 (${(exemption.exemptionRate * 100).toFixed(1)}% 면세)`,
      impact: 'MEDIUM'
    })
  }

  // Long-term deduction warnings
  if (deduction.deductionRate < 0.3 && holdingYears >= 3 && holdingYears < 15) {
    const yearsToMax = 15 - Math.floor(holdingYears)
    warnings.push({
      type: 'info',
      category: 'LONG_TERM_DEDUCTION',
      message: `${yearsToMax}년 더 보유 시 장기보유특별공제 최대 30% 적용 가능`,
      impact: 'LOW'
    })
  }

  // Heavy tax warnings
  if (heavyTaxStatus.heavyTaxApplied && heavyTaxStatus.isFlat) {
    warnings.push({
      type: 'critical',
      category: 'SHORT_TERM_PENALTY',
      message: heavyTaxStatus.message,
      impact: 'CRITICAL'
    })
  }

  if (heavyTaxStatus.reason === 'SUSPENDED') {
    warnings.push({
      type: 'info',
      category: 'HEAVY_TAX_SUSPENSION',
      message: '현재 중과세 한시 배제 기간 (2025-05-09까지). 이후 판매 시 중과세 적용될 수 있음',
      impact: 'MEDIUM'
    })
  }

  // Adjustment area warnings
  if (isAdjustmentArea) {
    warnings.push({
      type: 'info',
      category: 'ADJUSTMENT_AREA',
      message: '조정대상지역 소재 주택으로 규제가 적용됩니다',
      impact: 'MEDIUM'
    })
  }

  return warnings
}

/**
 * Calculate tax scenarios for planning purposes
 * Compare different holding periods to optimize tax burden
 *
 * @param {Object} baseInput - Base input parameters
 * @param {Array<number>} holdingYearsOptions - Array of holding years to compare
 * @returns {Array} Array of calculation results for each scenario
 */
export async function calculateTaxScenarios(baseInput, holdingYearsOptions = [2, 3, 5, 10, 15]) {
  const scenarios = []

  for (const years of holdingYearsOptions) {
    const futureSaleDate = new Date(baseInput.purchaseDate)
    futureSaleDate.setFullYear(futureSaleDate.getFullYear() + years)

    const scenarioInput = {
      ...baseInput,
      saleDate: futureSaleDate,
      residenceEndDate: baseInput.residenceStartDate
        ? new Date(futureSaleDate)
        : null
    }

    try {
      const result = await calculateCapitalGainsTax(scenarioInput)
      scenarios.push({
        holdingYears: years,
        saleDate: futureSaleDate,
        totalTax: result.summary.totalTax,
        effectiveTaxRate: result.summary.effectiveTaxRate,
        exemption: result.exemption.exemptionAmount,
        deduction: result.deduction.deductionAmount,
        summary: result.summary
      })
    } catch (error) {
      scenarios.push({
        holdingYears: years,
        error: error.message
      })
    }
  }

  return scenarios
}

// Export individual modules for direct access if needed
export {
  checkOneHomeEligibility,
  calculateOneHomeExemption
} from './oneHomeExemption.js'

export {
  calculateHoldingDeductionRate,
  applyLongTermDeduction
} from './longTermDeduction.js'

export {
  determineHeavyTaxStatus,
  calculateEffectiveTaxRate,
  getProgressiveTaxBracket,
  isAdjustmentArea,
  getAdjustmentAreas
} from './heavyTaxRate.js'

export {
  calculateHoldingPeriod,
  calculateResidencePeriod,
  parseDate,
  formatDate
} from './dateUtils.js'

export {
  validateCalculationInput,
  sanitizeInput
} from './validation.js'
