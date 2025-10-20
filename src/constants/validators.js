/**
 * 세법 계산 검증 함수 (Tax Calculation Validators)
 *
 * 입력 데이터 및 계산 결과 검증
 * - 입력값 유효성 검사
 * - 계산 결과 무결성 검증
 * - 공제 요건 검증
 *
 * @version 1.0.0
 * @date 2025-10-17
 */

const TAX_VALIDATORS = {
  // ==========================================
  // 기본 입력 검증 (Basic Input Validation)
  // ==========================================

  /**
   * 금액 유효성 검증
   * @param {number} amount - 검증할 금액
   * @param {string} fieldName - 필드명 (에러 메시지용)
   * @returns {object} { valid: boolean, error: string }
   */
  validateAmount(amount, fieldName = '금액') {
    if (amount === null || amount === undefined) {
      return { valid: false, error: `${fieldName}은(는) 필수입니다` }
    }

    if (typeof amount !== 'number') {
      return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다` }
    }

    if (isNaN(amount)) {
      return { valid: false, error: `${fieldName}은(는) 유효한 숫자여야 합니다` }
    }

    if (amount < 0) {
      return { valid: false, error: `${fieldName}은(는) 0 이상이어야 합니다` }
    }

    if (!Number.isInteger(amount)) {
      return { valid: false, error: `${fieldName}은(는) 정수여야 합니다 (소수점 불가)` }
    }

    return { valid: true, error: null }
  },

  /**
   * 날짜 유효성 검증
   * @param {Date|string} date - 검증할 날짜
   * @param {string} fieldName - 필드명
   * @returns {object} { valid: boolean, error: string, date: Date }
   */
  validateDate(date, fieldName = '날짜') {
    if (!date) {
      return { valid: false, error: `${fieldName}은(는) 필수입니다`, date: null }
    }

    let dateObj
    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return { valid: false, error: `${fieldName}은(는) 유효한 날짜 형식이어야 합니다`, date: null }
    }

    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: `${fieldName}은(는) 유효한 날짜가 아닙니다`, date: null }
    }

    return { valid: true, error: null, date: dateObj }
  },

  /**
   * 관계 유효성 검증
   * @param {string} relationship - 증여자와 수증자 관계
   * @returns {object} { valid: boolean, error: string }
   */
  validateRelationship(relationship) {
    const validRelationships = [
      'spouse',
      'lineal_ascendant',
      'lineal_descendant',
      'other_relative',
      'non_relative'
    ]

    if (!relationship) {
      return { valid: false, error: '관계는 필수입니다' }
    }

    if (!validRelationships.includes(relationship)) {
      return {
        valid: false,
        error: `유효하지 않은 관계입니다. (${validRelationships.join(', ')})`
      }
    }

    return { valid: true, error: null }
  },

  /**
   * 나이 유효성 검증
   * @param {number} age - 나이
   * @returns {object} { valid: boolean, error: string }
   */
  validateAge(age) {
    const ageValidation = this.validateAmount(age, '나이')
    if (!ageValidation.valid) return ageValidation

    if (age < 0 || age > 150) {
      return { valid: false, error: '나이는 0~150 사이여야 합니다' }
    }

    return { valid: true, error: null }
  },

  // ==========================================
  // 상속세 검증 (Inheritance Tax Validation)
  // ==========================================

  /**
   * 상속세 입력 검증
   * @param {object} params - 상속세 계산 파라미터
   * @returns {object} { valid: boolean, errors: array }
   */
  validateInheritanceTaxInput(params) {
    const errors = []

    // 상속재산 검증
    const inheritanceValidation = this.validateAmount(params.inheritanceAmount, '상속재산')
    if (!inheritanceValidation.valid) {
      errors.push(inheritanceValidation.error)
    }

    // 배우자 정보 검증
    if (params.spouse) {
      const spouseValidation = this.validateAmount(
        params.spouse.actualInheritance,
        '배우자 실제 상속액'
      )
      if (!spouseValidation.valid) {
        errors.push(spouseValidation.error)
      }
    }

    // 자녀 수 검증
    if (params.children !== undefined) {
      const childrenValidation = this.validateAmount(params.children, '자녀 수')
      if (!childrenValidation.valid) {
        errors.push(childrenValidation.error)
      }
    }

    // 연로자 수 검증
    if (params.elderly !== undefined) {
      const elderlyValidation = this.validateAmount(params.elderly, '연로자 수')
      if (!elderlyValidation.valid) {
        errors.push(elderlyValidation.error)
      }
    }

    // 장애인 정보 검증
    if (params.disabled) {
      const ageValidation = this.validateAge(params.disabled.age)
      if (!ageValidation.valid) {
        errors.push(ageValidation.error)
      }

      const lifeExpectancyValidation = this.validateAmount(
        params.disabled.lifeExpectancy,
        '기대여명'
      )
      if (!lifeExpectancyValidation.valid) {
        errors.push(lifeExpectancyValidation.error)
      }

      if (params.disabled.age >= params.disabled.lifeExpectancy) {
        errors.push('기대여명은 현재 나이보다 커야 합니다')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // ==========================================
  // 증여세 검증 (Gift Tax Validation)
  // ==========================================

  /**
   * 증여세 입력 검증
   * @param {object} params - 증여세 계산 파라미터
   * @returns {object} { valid: boolean, errors: array }
   */
  validateGiftTaxInput(params) {
    const errors = []

    // 증여액 검증
    const giftValidation = this.validateAmount(params.currentGift, '증여액')
    if (!giftValidation.valid) {
      errors.push(giftValidation.error)
    }

    // 관계 검증
    const relationshipValidation = this.validateRelationship(params.relationship)
    if (!relationshipValidation.valid) {
      errors.push(relationshipValidation.error)
    }

    // 수증자 나이 검증 (직계존속인 경우)
    if (params.relationship === 'lineal_ascendant') {
      const ageValidation = this.validateAge(params.recipientAge)
      if (!ageValidation.valid) {
        errors.push(ageValidation.error)
      }
    }

    // 이전 증여 이력 검증
    if (params.previousGifts && Array.isArray(params.previousGifts)) {
      params.previousGifts.forEach((gift, index) => {
        const dateValidation = this.validateDate(gift.date, `이전 증여 ${index + 1} 날짜`)
        if (!dateValidation.valid) {
          errors.push(dateValidation.error)
        }

        const amountValidation = this.validateAmount(gift.amount, `이전 증여 ${index + 1} 금액`)
        if (!amountValidation.valid) {
          errors.push(amountValidation.error)
        }

        if (gift.taxPaid !== undefined) {
          const taxValidation = this.validateAmount(
            gift.taxPaid,
            `이전 증여 ${index + 1} 납부세액`
          )
          if (!taxValidation.valid) {
            errors.push(taxValidation.error)
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // ==========================================
  // 양도소득세 검증 (Capital Gains Tax Validation)
  // ==========================================

  /**
   * 양도소득세 입력 검증
   * @param {object} params - 양도소득세 계산 파라미터
   * @returns {object} { valid: boolean, errors: array }
   */
  validateCapitalGainsTaxInput(params) {
    const errors = []

    // 양도가액 검증
    const transferValidation = this.validateAmount(params.transferPrice, '양도가액')
    if (!transferValidation.valid) {
      errors.push(transferValidation.error)
    }

    // 취득가액 검증
    const acquisitionValidation = this.validateAmount(params.acquisitionPrice, '취득가액')
    if (!acquisitionValidation.valid) {
      errors.push(acquisitionValidation.error)
    }

    // 양도가액 > 취득가액 검증 (양도차익이 있어야 함)
    if (params.transferPrice && params.acquisitionPrice) {
      if (params.transferPrice <= params.acquisitionPrice) {
        // 양도차손은 경고만 (에러는 아님)
        // errors.push('양도가액이 취득가액보다 작거나 같습니다 (양도차손)')
      }
    }

    // 보유기간 검증
    if (params.holdingYears !== undefined) {
      const holdingValidation = this.validateAmount(params.holdingYears, '보유기간')
      if (!holdingValidation.valid) {
        errors.push(holdingValidation.error)
      }
    }

    // 거주기간 검증
    if (params.residenceYears !== undefined) {
      const residenceValidation = this.validateAmount(params.residenceYears, '거주기간')
      if (!residenceValidation.valid) {
        errors.push(residenceValidation.error)
      }
    }

    // 보유기간 >= 거주기간 검증
    if (params.holdingYears !== undefined && params.residenceYears !== undefined) {
      if (params.residenceYears > params.holdingYears) {
        errors.push('거주기간은 보유기간을 초과할 수 없습니다')
      }
    }

    // 필요경비 검증
    if (params.necessaryExpenses) {
      const { acquisition, improvement, transfer } = params.necessaryExpenses

      if (acquisition !== undefined) {
        const acqExpValidation = this.validateAmount(acquisition, '취득 필요경비')
        if (!acqExpValidation.valid) {
          errors.push(acqExpValidation.error)
        }
      }

      if (improvement !== undefined) {
        const impExpValidation = this.validateAmount(improvement, '자본적 지출')
        if (!impExpValidation.valid) {
          errors.push(impExpValidation.error)
        }
      }

      if (transfer !== undefined) {
        const trfExpValidation = this.validateAmount(transfer, '양도 필요경비')
        if (!trfExpValidation.valid) {
          errors.push(trfExpValidation.error)
        }
      }
    }

    // 주택 수 검증 (양도소득세 중과 판단용)
    if (params.houseCount !== undefined) {
      const houseCountValidation = this.validateAmount(params.houseCount, '주택 수')
      if (!houseCountValidation.valid) {
        errors.push(houseCountValidation.error)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // ==========================================
  // 계산 결과 검증 (Result Validation)
  // ==========================================

  /**
   * 세액 계산 결과 검증
   * @param {object} result - 계산 결과
   * @param {number} taxBase - 과세표준
   * @returns {object} { valid: boolean, errors: array }
   */
  validateTaxCalculationResult(result, taxBase) {
    const errors = []

    // 산출세액 검증
    if (result.taxAmount === undefined || result.taxAmount === null) {
      errors.push('산출세액이 계산되지 않았습니다')
    }

    if (result.taxAmount < 0) {
      errors.push('산출세액은 0 이상이어야 합니다')
    }

    // 실효세율 검증 (0~1 범위)
    if (result.effectiveRate !== undefined) {
      if (result.effectiveRate < 0 || result.effectiveRate > 1) {
        errors.push('실효세율은 0~1 범위여야 합니다')
      }
    }

    // 세액 > 과세표준 검증 (불가능)
    if (result.taxAmount > taxBase) {
      errors.push('산출세액이 과세표준보다 클 수 없습니다')
    }

    // 누진공제액 검증
    if (result.deduction !== undefined && result.deduction < 0) {
      errors.push('누진공제액은 0 이상이어야 합니다')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * 공제 계산 결과 검증
   * @param {object} deductionResult - 공제 계산 결과
   * @returns {object} { valid: boolean, errors: array }
   */
  validateDeductionResult(deductionResult) {
    const errors = []

    // 총 공제액 검증
    if (deductionResult.totalDeduction === undefined) {
      errors.push('총 공제액이 계산되지 않았습니다')
    }

    if (deductionResult.totalDeduction < 0) {
      errors.push('총 공제액은 0 이상이어야 합니다')
    }

    // 개별 공제액 검증
    const deductionFields = [
      'spouseDeduction',
      'basicDeduction',
      'childDeduction',
      'elderlyDeduction',
      'disabilityDeduction',
      'financialDeduction',
      'disasterDeduction'
    ]

    deductionFields.forEach(field => {
      if (deductionResult[field] !== undefined && deductionResult[field] < 0) {
        errors.push(`${field}는 0 이상이어야 합니다`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // ==========================================
  // 10년 합산 규정 검증 (10-Year Cumulation Validation)
  // ==========================================

  /**
   * 10년 이내 증여 여부 검증
   * @param {Date} giftDate - 증여일
   * @param {Date} referenceDate - 기준일 (기본값: 오늘)
   * @returns {boolean} 10년 이내 여부
   */
  isWithinTenYears(giftDate, referenceDate = new Date()) {
    const dateValidation = this.validateDate(giftDate, '증여일')
    if (!dateValidation.valid) return false

    const date = dateValidation.date
    const diffInMs = referenceDate - date
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    return diffInDays >= 0 && diffInDays <= 3650 // 정확히 10년 (365일 × 10)
  },

  // ==========================================
  // 종합 검증 (Comprehensive Validation)
  // ==========================================

  /**
   * 세목별 종합 검증
   * @param {string} taxType - 세목 ('inheritance'|'gift'|'capitalGains')
   * @param {object} params - 계산 파라미터
   * @returns {object} { valid: boolean, errors: array }
   */
  validateByTaxType(taxType, params) {
    switch (taxType) {
      case 'inheritance':
        return this.validateInheritanceTaxInput(params)
      case 'gift':
        return this.validateGiftTaxInput(params)
      case 'capitalGains':
        return this.validateCapitalGainsTaxInput(params)
      default:
        return {
          valid: false,
          errors: [`지원하지 않는 세목입니다: ${taxType}`]
        }
    }
  },

  /**
   * 모든 검증 오류 포맷팅
   * @param {array} errors - 오류 배열
   * @returns {string} 포맷팅된 오류 메시지
   */
  formatErrors(errors) {
    if (!errors || errors.length === 0) {
      return ''
    }

    return errors
      .map((error, index) => `${index + 1}. ${error}`)
      .join('\n')
  },

  /**
   * 검증 결과 요약
   * @param {object} validation - 검증 결과
   * @returns {string} 요약 메시지
   */
  getSummary(validation) {
    if (validation.valid) {
      return '✅ 모든 검증을 통과했습니다'
    }

    return `❌ ${validation.errors.length}개의 오류가 발견되었습니다:\n${this.formatErrors(validation.errors)}`
  }
}

// ==========================================
// Export
// ==========================================

// ES6 모듈 export
export default TAX_VALIDATORS

// CommonJS export (Node.js 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TAX_VALIDATORS
}
