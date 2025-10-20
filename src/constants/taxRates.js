/**
 * 세법 세율 데이터 (Tax Rates Database)
 *
 * 2024년 과세기간 기준 세율 정보
 * - 상속세 (Inheritance Tax): 5단계 누진세율
 * - 증여세 (Gift Tax): 5단계 누진세율 (상속세와 동일)
 * - 양도소득세 (Capital Gains Tax): 8단계 누진세율
 *
 * @version 1.0.0
 * @date 2025-10-17
 * @source
 *   - 상속세: 상속세 및 증여세법 제26조, 제27조
 *   - 증여세: 상속세 및 증여세법 제53조, 제55조
 *   - 양도소득세: 소득세법 제104조, 제104조의2
 */

const TAX_RATES_2024 = {
  // 메타데이터
  metadata: {
    fiscalYear: 2024,
    version: '1.0.0',
    lastUpdated: '2025-10-17',
    sources: {
      inheritance: '상속세 및 증여세법 제26조, 제27조',
      gift: '상속세 및 증여세법 제53조, 제55조',
      capitalGains: '소득세법 제104조, 제104조의2'
    },
    validPeriod: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  },

  // ==========================================
  // 상속세 세율 (Inheritance Tax Rates)
  // ==========================================
  inheritance: {
    type: 'progressive',
    description: '5단계 누진세율 구조',
    currency: 'KRW',

    // 세율 구간
    brackets: [
      {
        bracketNumber: 1,
        min: 0,
        max: 100000000,
        description: '1억원 이하',
        rate: 0.10,
        deduction: 0,
        formula: '과세표준 × 10%'
      },
      {
        bracketNumber: 2,
        min: 100000001,
        max: 500000000,
        description: '1억원 초과 5억원 이하',
        rate: 0.20,
        deduction: 10000000,
        formula: '과세표준 × 20% - 1천만원'
      },
      {
        bracketNumber: 3,
        min: 500000001,
        max: 1000000000,
        description: '5억원 초과 10억원 이하',
        rate: 0.30,
        deduction: 60000000,
        formula: '과세표준 × 30% - 6천만원'
      },
      {
        bracketNumber: 4,
        min: 1000000001,
        max: 3000000000,
        description: '10억원 초과 30억원 이하',
        rate: 0.40,
        deduction: 160000000,
        formula: '과세표준 × 40% - 1억6천만원'
      },
      {
        bracketNumber: 5,
        min: 3000000001,
        max: null,
        description: '30억원 초과',
        rate: 0.50,
        deduction: 460000000,
        formula: '과세표준 × 50% - 4억6천만원'
      }
    ],

    /**
     * 상속세 계산
     * @param {number} taxBase - 과세표준 (상속재산 - 공제액)
     * @returns {object} { taxAmount, bracket, rate, deduction, effectiveRate }
     */
    calculate: function(taxBase) {
      if (taxBase < 0) {
        throw new Error('과세표준은 0 이상이어야 합니다')
      }

      if (taxBase === 0) {
        return {
          taxAmount: 0,
          bracket: 1,
          rate: 0.10,
          deduction: 0,
          effectiveRate: 0
        }
      }

      const bracket = this.brackets.find(b =>
        taxBase >= b.min && (b.max === null || taxBase <= b.max)
      )

      if (!bracket) {
        throw new Error('해당하는 세율 구간을 찾을 수 없습니다')
      }

      const taxAmount = Math.floor(taxBase * bracket.rate - bracket.deduction)
      const effectiveRate = taxBase > 0 ? taxAmount / taxBase : 0

      return {
        taxAmount,
        bracket: bracket.bracketNumber,
        rate: bracket.rate,
        deduction: bracket.deduction,
        effectiveRate: Math.round(effectiveRate * 10000) / 10000
      }
    }
  },

  // ==========================================
  // 증여세 세율 (Gift Tax Rates)
  // ==========================================
  gift: {
    type: 'progressive',
    description: '5단계 누진세율 구조 (상속세와 동일)',
    currency: 'KRW',
    sameAsInheritance: true,

    // 세율 구간 (상속세와 동일)
    brackets: [
      {
        bracketNumber: 1,
        min: 0,
        max: 100000000,
        description: '1억원 이하',
        rate: 0.10,
        deduction: 0,
        formula: '과세표준 × 10%'
      },
      {
        bracketNumber: 2,
        min: 100000001,
        max: 500000000,
        description: '1억원 초과 5억원 이하',
        rate: 0.20,
        deduction: 10000000,
        formula: '과세표준 × 20% - 1천만원'
      },
      {
        bracketNumber: 3,
        min: 500000001,
        max: 1000000000,
        description: '5억원 초과 10억원 이하',
        rate: 0.30,
        deduction: 60000000,
        formula: '과세표준 × 30% - 6천만원'
      },
      {
        bracketNumber: 4,
        min: 1000000001,
        max: 3000000000,
        description: '10억원 초과 30억원 이하',
        rate: 0.40,
        deduction: 160000000,
        formula: '과세표준 × 40% - 1억6천만원'
      },
      {
        bracketNumber: 5,
        min: 3000000001,
        max: null,
        description: '30억원 초과',
        rate: 0.50,
        deduction: 460000000,
        formula: '과세표준 × 50% - 4억6천만원'
      }
    ],

    // 특별 규정
    specialRules: {
      tenYearCumulation: {
        enabled: true,
        description: '10년 이내 동일인으로부터 받은 증여 합산',
        period: 10
      },
      relationshipBasedDeduction: {
        enabled: true,
        description: '증여자와 수증자의 관계에 따라 공제액 다름'
      }
    },

    /**
     * 증여세 계산
     * @param {number} taxBase - 과세표준 (합산 증여액 - 관계별 공제)
     * @returns {object} { taxAmount, bracket, rate, deduction, effectiveRate }
     */
    calculate: function(taxBase) {
      if (taxBase < 0) {
        throw new Error('과세표준은 0 이상이어야 합니다')
      }

      if (taxBase === 0) {
        return {
          taxAmount: 0,
          bracket: 1,
          rate: 0.10,
          deduction: 0,
          effectiveRate: 0
        }
      }

      const bracket = this.brackets.find(b =>
        taxBase >= b.min && (b.max === null || taxBase <= b.max)
      )

      if (!bracket) {
        throw new Error('해당하는 세율 구간을 찾을 수 없습니다')
      }

      const taxAmount = Math.floor(taxBase * bracket.rate - bracket.deduction)
      const effectiveRate = taxBase > 0 ? taxAmount / taxBase : 0

      return {
        taxAmount,
        bracket: bracket.bracketNumber,
        rate: bracket.rate,
        deduction: bracket.deduction,
        effectiveRate: Math.round(effectiveRate * 10000) / 10000
      }
    }
  },

  // ==========================================
  // 양도소득세 세율 (Capital Gains Tax Rates)
  // ==========================================
  capitalGains: {
    type: 'progressive',
    description: '8단계 누진세율 구조',
    currency: 'KRW',

    // 일반 세율 구간
    brackets: [
      {
        bracketNumber: 1,
        min: 0,
        max: 14000000,
        description: '1,400만원 이하',
        rate: 0.06,
        deduction: 0,
        formula: '과세표준 × 6%'
      },
      {
        bracketNumber: 2,
        min: 14000001,
        max: 50000000,
        description: '1,400만원 초과 5,000만원 이하',
        rate: 0.15,
        deduction: 1260000,
        formula: '과세표준 × 15% - 126만원'
      },
      {
        bracketNumber: 3,
        min: 50000001,
        max: 88000000,
        description: '5,000만원 초과 8,800만원 이하',
        rate: 0.24,
        deduction: 5760000,
        formula: '과세표준 × 24% - 576만원'
      },
      {
        bracketNumber: 4,
        min: 88000001,
        max: 150000000,
        description: '8,800만원 초과 1억5,000만원 이하',
        rate: 0.35,
        deduction: 15440000,
        formula: '과세표준 × 35% - 1,544만원'
      },
      {
        bracketNumber: 5,
        min: 150000001,
        max: 300000000,
        description: '1억5,000만원 초과 3억원 이하',
        rate: 0.38,
        deduction: 19940000,
        formula: '과세표준 × 38% - 1,994만원'
      },
      {
        bracketNumber: 6,
        min: 300000001,
        max: 500000000,
        description: '3억원 초과 5억원 이하',
        rate: 0.40,
        deduction: 25940000,
        formula: '과세표준 × 40% - 2,594만원'
      },
      {
        bracketNumber: 7,
        min: 500000001,
        max: 1000000000,
        description: '5억원 초과 10억원 이하',
        rate: 0.42,
        deduction: 35940000,
        formula: '과세표준 × 42% - 3,594만원'
      },
      {
        bracketNumber: 8,
        min: 1000000001,
        max: null,
        description: '10억원 초과',
        rate: 0.45,
        deduction: 65940000,
        formula: '과세표준 × 45% - 6,594만원'
      }
    ],

    // 다주택자 중과세율
    multipleHomeSurcharge: {
      twoHomes: {
        surcharge: 0.20,
        description: '기본세율 + 20%p',
        maxRate: 0.62,
        notes: '조정대상지역 내 2주택 보유 시'
      },
      threeOrMoreHomes: {
        surcharge: 0.30,
        description: '기본세율 + 30%p',
        maxRate: 0.72,
        notes: '조정대상지역 내 3주택 이상 보유 시'
      }
    },

    // 1세대1주택 비과세
    oneHouseOneHouseholdExemption: {
      enabled: true,
      priceThreshold: 1200000000, // 12억원
      holdingPeriod: 2, // 2년 이상
      residencePeriod: 2, // 2년 이상 (비조정대상지역)
      description: '12억원 이하, 보유 2년 이상, 거주 2년 이상',
      highValueFormula: '[(양도가액 - 12억) / 양도가액] × 양도차익 × 세율'
    },

    /**
     * 양도소득세 계산
     * @param {number} taxBase - 과세표준
     * @param {object} options - { houseCount, isRegulatedArea }
     * @returns {object} { taxAmount, bracket, basicRate, surchargeRate, totalRate, deduction, effectiveRate }
     */
    calculate: function(taxBase, options = {}) {
      if (taxBase < 0) {
        throw new Error('과세표준은 0 이상이어야 합니다')
      }

      if (taxBase === 0) {
        return {
          taxAmount: 0,
          bracket: 1,
          basicRate: 0.06,
          surchargeRate: 0,
          totalRate: 0.06,
          deduction: 0,
          effectiveRate: 0
        }
      }

      const { houseCount = 1, isRegulatedArea = false } = options

      // 기본 세율 구간 찾기
      const bracket = this.brackets.find(b =>
        taxBase >= b.min && (b.max === null || taxBase <= b.max)
      )

      if (!bracket) {
        throw new Error('해당하는 세율 구간을 찾을 수 없습니다')
      }

      let basicRate = bracket.rate
      let surchargeRate = 0
      let totalRate = basicRate

      // 다주택자 중과세율 적용 (조정대상지역만)
      if (isRegulatedArea) {
        if (houseCount === 2) {
          surchargeRate = this.multipleHomeSurcharge.twoHomes.surcharge
        } else if (houseCount >= 3) {
          surchargeRate = this.multipleHomeSurcharge.threeOrMoreHomes.surcharge
        }
        totalRate = basicRate + surchargeRate
      }

      // 세액 계산
      const taxAmount = Math.floor(taxBase * totalRate - bracket.deduction)
      const effectiveRate = taxBase > 0 ? taxAmount / taxBase : 0

      return {
        taxAmount,
        bracket: bracket.bracketNumber,
        basicRate,
        surchargeRate,
        totalRate,
        deduction: bracket.deduction,
        effectiveRate: Math.round(effectiveRate * 10000) / 10000,
        isSurcharged: surchargeRate > 0
      }
    },

    /**
     * 지방소득세 계산 (양도소득세의 10%)
     * @param {number} capitalGainsTax - 양도소득세액
     * @returns {number} 지방소득세액
     */
    calculateLocalIncomeTax: function(capitalGainsTax) {
      return Math.floor(capitalGainsTax * 0.10)
    }
  },

  // ==========================================
  // 공통 유틸리티 함수
  // ==========================================

  /**
   * 세율 구간 찾기
   * @param {number} taxBase - 과세표준
   * @param {string} taxType - 'inheritance' | 'gift' | 'capitalGains'
   * @returns {object} 해당 세율 구간 정보
   */
  findBracket(taxBase, taxType) {
    if (!this[taxType]) {
      throw new Error(`지원하지 않는 세목입니다: ${taxType}`)
    }

    const brackets = this[taxType].brackets
    const bracket = brackets.find(b =>
      taxBase >= b.min && (b.max === null || taxBase <= b.max)
    )

    if (!bracket) {
      throw new Error(`과세표준 ${taxBase}원에 해당하는 세율 구간을 찾을 수 없습니다`)
    }

    return bracket
  },

  /**
   * 세액 계산 (통합 인터페이스)
   * @param {number} taxBase - 과세표준
   * @param {string} taxType - 'inheritance' | 'gift' | 'capitalGains'
   * @param {object} options - 추가 옵션 (양도소득세용)
   * @returns {object} 세액 계산 결과
   */
  calculateTax(taxBase, taxType, options = {}) {
    if (!this[taxType]) {
      throw new Error(`지원하지 않는 세목입니다: ${taxType}`)
    }

    return this[taxType].calculate.call(this[taxType], taxBase, options)
  },

  /**
   * 실효세율 계산
   * @param {number} taxAmount - 산출세액
   * @param {number} taxBase - 과세표준
   * @returns {number} 실효세율 (0~1)
   */
  calculateEffectiveRate(taxAmount, taxBase) {
    if (taxBase === 0) return 0
    return Math.round((taxAmount / taxBase) * 10000) / 10000
  },

  /**
   * 세목별 최고세율 조회
   * @param {string} taxType - 'inheritance' | 'gift' | 'capitalGains'
   * @returns {number} 최고세율
   */
  getMaxRate(taxType) {
    if (!this[taxType]) {
      throw new Error(`지원하지 않는 세목입니다: ${taxType}`)
    }

    const brackets = this[taxType].brackets
    return brackets[brackets.length - 1].rate
  },

  /**
   * 세목별 최저세율 조회
   * @param {string} taxType - 'inheritance' | 'gift' | 'capitalGains'
   * @returns {number} 최저세율
   */
  getMinRate(taxType) {
    if (!this[taxType]) {
      throw new Error(`지원하지 않는 세목입니다: ${taxType}`)
    }

    return this[taxType].brackets[0].rate
  }
}

// ==========================================
// Export
// ==========================================

// ES6 모듈 export
export default TAX_RATES_2024

// CommonJS export (Node.js 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TAX_RATES_2024
}
