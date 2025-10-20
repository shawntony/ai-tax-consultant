/**
 * Input Validation for Capital Gains Tax Calculations
 * @module services/cgt/validation
 * @version 1.0.0
 */

import { parseDate } from './dateUtils.js'

/**
 * Validate capital gains tax calculation input
 * @param {Object} input - User input data
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
export function validateCalculationInput(input) {
  const errors = []

  // Price validations
  if (typeof input.salePrice !== 'number' || input.salePrice <= 0) {
    errors.push({
      field: 'salePrice',
      code: 'CALC_TAX_INVALID_AMOUNT',
      message: '양도가액은 0보다 큰 숫자여야 합니다.'
    })
  }

  if (typeof input.purchasePrice !== 'number' || input.purchasePrice <= 0) {
    errors.push({
      field: 'purchasePrice',
      code: 'CALC_TAX_INVALID_AMOUNT',
      message: '취득가액은 0보다 큰 숫자여야 합니다.'
    })
  }

  // Capital loss is allowed (purchase price can be > sale price)
  // This will result in negative capital gains, which is handled in the calculation engine

  if (typeof input.necessaryExpenses !== 'number' || input.necessaryExpenses < 0) {
    errors.push({
      field: 'necessaryExpenses',
      code: 'CALC_TAX_INVALID_AMOUNT',
      message: '필요경비는 0 이상의 숫자여야 합니다.'
    })
  }

  // Home count validation
  if (!Number.isInteger(input.homeCount) || input.homeCount < 1) {
    errors.push({
      field: 'homeCount',
      code: 'CALC_TAX_INVALID_COUNT',
      message: '보유 주택 수는 1 이상의 정수여야 합니다.'
    })
  }

  if (!Number.isInteger(input.householdHomeCount) || input.householdHomeCount < 1) {
    errors.push({
      field: 'householdHomeCount',
      code: 'CALC_TAX_INVALID_COUNT',
      message: '1세대 보유 주택 수는 1 이상의 정수여야 합니다.'
    })
  }

  // Date validations
  try {
    const purchaseDate = parseDate(input.purchaseDate)
    const saleDate = parseDate(input.saleDate)

    if (purchaseDate >= saleDate) {
      errors.push({
        field: 'saleDate',
        code: 'CALC_TAX_LOGIC_ERROR',
        message: '양도일은 취득일 이후여야 합니다.'
      })
    }

    // Validate residence dates if provided
    if (input.residenceStartDate && input.residenceEndDate) {
      const residenceStart = parseDate(input.residenceStartDate)
      const residenceEnd = parseDate(input.residenceEndDate)

      if (residenceStart >= residenceEnd) {
        errors.push({
          field: 'residenceEndDate',
          code: 'CALC_TAX_LOGIC_ERROR',
          message: '거주 종료일은 거주 시작일 이후여야 합니다.'
        })
      }

      if (residenceStart < purchaseDate) {
        errors.push({
          field: 'residenceStartDate',
          code: 'CALC_TAX_LOGIC_ERROR',
          message: '거주 시작일은 취득일 이후여야 합니다.'
        })
      }

      if (residenceEnd > saleDate) {
        errors.push({
          field: 'residenceEndDate',
          code: 'CALC_TAX_LOGIC_ERROR',
          message: '거주 종료일은 양도일 이전이어야 합니다.'
        })
      }
    }
  } catch (error) {
    errors.push({
      field: 'dates',
      code: 'CALC_TAX_INVALID_DATE',
      message: error.message
    })
  }

  // Location validation
  if (input.isAdjustmentArea !== undefined && typeof input.isAdjustmentArea !== 'boolean') {
    errors.push({
      field: 'isAdjustmentArea',
      code: 'CALC_TAX_INVALID_TYPE',
      message: '조정대상지역 여부는 boolean 타입이어야 합니다.'
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate and sanitize input
 * @param {Object} input - Raw input
 * @returns {Object} Sanitized input
 * @throws {Error} If validation fails
 */
export function sanitizeInput(input) {
  const validation = validateCalculationInput(input)

  if (!validation.valid) {
    const errorMessages = validation.errors.map(e => e.message).join(', ')
    throw new Error(`입력 검증 실패: ${errorMessages}`)
  }

  return {
    salePrice: Number(input.salePrice),
    purchasePrice: Number(input.purchasePrice),
    necessaryExpenses: Number(input.necessaryExpenses),
    homeCount: parseInt(input.homeCount, 10),
    householdHomeCount: parseInt(input.householdHomeCount, 10),
    purchaseDate: parseDate(input.purchaseDate),
    saleDate: parseDate(input.saleDate),
    residenceStartDate: input.residenceStartDate ? parseDate(input.residenceStartDate) : null,
    residenceEndDate: input.residenceEndDate ? parseDate(input.residenceEndDate) : null,
    isAdjustmentArea: Boolean(input.isAdjustmentArea),
    location: input.location || null
  }
}
