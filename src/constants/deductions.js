/**
 * 세법 공제 데이터 (Tax Deductions Database)
 *
 * 2024년 과세기간 기준 공제 정보
 * - 상속세 공제: 기초, 배우자, 자녀, 연로자, 장애인, 일괄, 금융재산, 재해손실
 * - 증여세 공제: 관계별 공제 (6개) + 10년 합산 규정
 * - 양도소득세 공제: 장기보유특별공제 + 기본공제 + 필요경비
 *
 * @version 1.0.0
 * @date 2025-10-17
 * @source
 *   - 상속세: 상속세 및 증여세법 제18조~제24조
 *   - 증여세: 상속세 및 증여세법 제53조, 제54조
 *   - 양도소득세: 소득세법 제95조, 제97조, 제98조
 */

const TAX_DEDUCTIONS_2024 = {
  // 메타데이터
  metadata: {
    fiscalYear: 2024,
    version: '1.0.0',
    lastUpdated: '2025-10-17',
    sources: {
      inheritance: '상속세 및 증여세법 제18조~제24조',
      gift: '상속세 및 증여세법 제53조, 제54조',
      capitalGains: '소득세법 제95조, 제97조, 제98조'
    }
  },

  // ==========================================
  // 상속세 공제 (Inheritance Tax Deductions)
  // ==========================================
  inheritance: {
    // 기초공제
    basic: {
      name: '기초공제',
      amount: 200000000, // 2억원
      mandatory: true,
      description: '모든 상속인에게 적용'
    },

    // 배우자상속공제
    spouse: {
      name: '배우자상속공제',
      minAmount: 500000000, // 최소 5억원
      maxAmount: 3000000000, // 최대 30억원

      /**
       * 배우자공제 계산
       * @param {number} inheritanceAmount - 상속재산 총액
       * @param {number} spouseActualInheritance - 배우자가 실제로 상속받은 금액
       * @returns {number} 배우자공제액
       */
      calculate: function(inheritanceAmount, spouseActualInheritance) {
        // 상속재산의 30% (최대 30억)
        const calculated = Math.min(inheritanceAmount * 0.30, this.maxAmount)

        // 실제 상속액과 법정공제액 중 큰 금액
        const largerAmount = Math.max(spouseActualInheritance, calculated)

        // 최소 5억원 보장
        return Math.max(largerAmount, this.minAmount)
      }
    },

    // 자녀공제
    child: {
      name: '자녀공제',
      amountPerChild: 50000000, // 1인당 5천만원

      /**
       * 자녀공제 계산
       * @param {number} numberOfChildren - 자녀 수
       * @returns {number} 자녀공제액
       */
      calculate: function(numberOfChildren) {
        return numberOfChildren * this.amountPerChild
      }
    },

    // 연로자공제
    elderly: {
      name: '연로자공제',
      amount: 50000000, // 1인당 5천만원
      ageRequirement: 65, // 만 65세 이상

      /**
       * 연로자공제 계산
       * @param {number} numberOfElderly - 연로자 수 (만 65세 이상)
       * @returns {number} 연로자공제액
       */
      calculate: function(numberOfElderly) {
        return numberOfElderly * this.amount
      }
    },

    // 장애인공제
    disability: {
      name: '장애인공제',
      amountPerYear: 10000000, // 연간 1천만원

      /**
       * 장애인공제 계산
       * @param {number} age - 현재 나이
       * @param {number} lifeExpectancy - 기대여명
       * @returns {number} 장애인공제액
       */
      calculate: function(age, lifeExpectancy) {
        const yearsRemaining = lifeExpectancy - age
        return yearsRemaining * this.amountPerYear
      }
    },

    // 일괄공제
    bulk: {
      name: '일괄공제',
      amount: 500000000, // 5억원
      excludes: ['basic', 'child', 'elderly', 'disability'],
      description: '기초공제 + 인적공제를 일괄 5억원으로 대체',
      notes: '배우자공제는 별도 적용 가능'
    },

    // 금융재산상속공제
    financialAsset: {
      name: '금융재산상속공제',
      rates: [
        {
          max: 20000000, // 2천만원 이하
          rate: 1.0, // 100% 공제
          description: '2천만원 이하 100% 공제'
        },
        {
          min: 20000001, // 2천만원 초과
          max: 100000000, // 1억원 이하
          rate: 0.8, // 80% 공제
          description: '2천만원 초과 1억원 이하 80% 공제'
        },
        {
          min: 100000001, // 1억원 초과
          max: null,
          rate: 0.8, // 80% 공제
          maxDeduction: 2000000000, // 최대 20억원
          description: '1억원 초과 80% 공제, 최대 20억원'
        }
      ],

      /**
       * 금융재산공제 계산
       * @param {number} financialAssets - 금융재산 가액
       * @returns {number} 금융재산공제액
       */
      calculate: function(financialAssets) {
        if (financialAssets <= 0) return 0

        const applicableRate = this.rates.find(r =>
          (r.min === undefined || financialAssets >= r.min) &&
          (r.max === null || financialAssets <= r.max)
        )

        if (!applicableRate) return 0

        let deduction = financialAssets * applicableRate.rate

        // 최대 공제 한도 적용
        if (applicableRate.maxDeduction) {
          deduction = Math.min(deduction, applicableRate.maxDeduction)
        }

        return Math.floor(deduction)
      }
    },

    // 재해손실공제
    disaster: {
      name: '재해손실공제',
      description: '상속재산이 재해로 멸실/훼손된 경우',

      /**
       * 재해손실공제 계산
       * @param {number} lossAmount - 손실액
       * @param {number} insuranceReceived - 보험금 수령액
       * @returns {number} 재해손실공제액
       */
      calculate: function(lossAmount, insuranceReceived = 0) {
        return Math.max(lossAmount - insuranceReceived, 0)
      }
    },

    /**
     * 상속세 총 공제액 계산
     * @param {object} params - 공제 계산 파라미터
     * @returns {object} 공제 계산 결과
     */
    calculateTotal: function(params) {
      const {
        inheritanceAmount,
        spouse,
        children = 0,
        elderly = 0,
        disabled,
        financialAssets = 0,
        disaster
      } = params

      // 1. 배우자공제 계산
      const spouseDeduction = spouse
        ? this.spouse.calculate(inheritanceAmount, spouse.actualInheritance)
        : 0

      // 2. 개별공제 계산
      const basicDeduction = this.basic.amount
      const childDeduction = this.child.calculate(children)
      const elderlyDeduction = this.elderly.calculate(elderly)
      const disabilityDeduction = disabled
        ? this.disability.calculate(disabled.age, disabled.lifeExpectancy)
        : 0

      const individualDeductions =
        basicDeduction + childDeduction + elderlyDeduction + disabilityDeduction

      // 3. 일괄공제와 비교
      const bulkDeduction = this.bulk.amount
      const isIndividualBetter = individualDeductions > bulkDeduction

      // 4. 선택한 공제 (개별 vs 일괄)
      const selectedDeduction = isIndividualBetter ? individualDeductions : bulkDeduction

      // 5. 금융재산공제 계산
      const financialDeduction = this.financialAsset.calculate(financialAssets)

      // 6. 재해손실공제 계산
      const disasterDeduction = disaster
        ? this.disaster.calculate(disaster.lossAmount, disaster.insuranceReceived)
        : 0

      // 7. 총 공제액
      const totalDeduction =
        spouseDeduction + selectedDeduction + financialDeduction + disasterDeduction

      return {
        spouseDeduction,
        basicDeduction,
        childDeduction,
        elderlyDeduction,
        disabilityDeduction,
        individualDeductions,
        bulkDeduction,
        selectedDeduction: isIndividualBetter ? 'individual' : 'bulk',
        selectedDeductionAmount: selectedDeduction,
        financialDeduction,
        disasterDeduction,
        totalDeduction,
        recommendation: isIndividualBetter
          ? `개별공제 선택 (${(individualDeductions / 100000000).toFixed(1)}억 > ${(bulkDeduction / 100000000).toFixed(1)}억)`
          : `일괄공제 선택 (${(bulkDeduction / 100000000).toFixed(1)}억 > ${(individualDeductions / 100000000).toFixed(1)}억)`
      }
    }
  },

  // ==========================================
  // 증여세 공제 (Gift Tax Deductions)
  // ==========================================
  gift: {
    // 관계별 공제액
    byRelationship: {
      spouse: {
        name: '배우자',
        amount: 600000000, // 6억원
        period: 10, // 10년 합산
        description: '배우자로부터 받은 증여'
      },
      lineal_ascendant_adult: {
        name: '직계존속 (성년)',
        amount: 50000000, // 5천만원
        period: 10,
        ageRequirement: 19,
        description: '부모→자녀 (자녀가 성년)'
      },
      lineal_ascendant_minor: {
        name: '직계존속 (미성년)',
        amount: 20000000, // 2천만원
        period: 10,
        ageRequirement: 19,
        description: '부모→자녀 (자녀가 미성년)'
      },
      lineal_descendant: {
        name: '직계비속',
        amount: 50000000, // 5천만원
        period: 10,
        description: '자녀→부모'
      },
      other_relative: {
        name: '기타친족',
        amount: 10000000, // 1천만원
        period: 10,
        description: '6촌 이내 혈족, 4촌 이내 인척'
      },
      non_relative: {
        name: '타인',
        amount: 0,
        period: 10,
        description: '공제 없음'
      }
    },

    /**
     * 관계별 공제액 조회
     * @param {string} relationship - 관계 ('spouse'|'lineal_ascendant'|'lineal_descendant'|'other_relative'|'non_relative')
     * @param {number} recipientAge - 수증자 나이 (직계존속인 경우만)
     * @returns {number} 공제액
     */
    getDeductionByRelationship: function(relationship, recipientAge) {
      if (relationship === 'lineal_ascendant') {
        return recipientAge >= 19
          ? this.byRelationship.lineal_ascendant_adult.amount
          : this.byRelationship.lineal_ascendant_minor.amount
      }

      const rel = this.byRelationship[relationship]
      return rel ? rel.amount : 0
    },

    /**
     * 10년 합산 증여세 계산
     * @param {number} currentGift - 현재 증여액
     * @param {Array} previousGifts - 이전 증여 이력 [{ date, amount, taxPaid }]
     * @param {string} relationship - 관계
     * @param {number} recipientAge - 수증자 나이
     * @returns {object} 계산 결과
     */
    calculateWithTenYearCumulation: function(currentGift, previousGifts = [], relationship, recipientAge) {
      // 10년 이내 증여 필터링
      const now = new Date()
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)

      const validGifts = previousGifts.filter(g => {
        const giftDate = new Date(g.date)
        return giftDate >= tenYearsAgo && giftDate <= now
      })

      // 총 증여액 계산
      const previousGiftTotal = validGifts.reduce((sum, g) => sum + g.amount, 0)
      const totalGifts = currentGift + previousGiftTotal

      // 관계별 공제액
      const deduction = this.getDeductionByRelationship(relationship, recipientAge)

      // 과세표준
      const taxBase = Math.max(totalGifts - deduction, 0)

      // 기납부세액 합산
      const previousTaxPaid = validGifts.reduce((sum, g) => sum + (g.taxPaid || 0), 0)

      return {
        currentGift,
        previousGiftTotal,
        totalGifts,
        tenYearGiftsCount: validGifts.length,
        relationship,
        deduction,
        taxBase,
        previousTaxPaid,
        description: this.byRelationship[relationship]?.name || '타인'
      }
    }
  },

  // ==========================================
  // 양도소득세 공제 (Capital Gains Tax Deductions)
  // ==========================================
  capitalGains: {
    // 장기보유특별공제
    longTermHolding: {
      // 1세대1주택
      oneHouseOneHousehold: {
        name: '1세대1주택 장기보유특별공제',
        maxRate: 0.80,
        description: '보유기간 + 거주기간 합산',
        rates: [
          { years: 3, rate: 0.12, description: '3년 이상 4년 미만: 12%' },
          { years: 4, rate: 0.16, description: '4년 이상 5년 미만: 16%' },
          { years: 5, rate: 0.20, description: '5년 이상 6년 미만: 20%' },
          { years: 6, rate: 0.24, description: '6년 이상 7년 미만: 24%' },
          { years: 7, rate: 0.28, description: '7년 이상 8년 미만: 28%' },
          { years: 8, rate: 0.32, description: '8년 이상 9년 미만: 32%' },
          { years: 9, rate: 0.36, description: '9년 이상 10년 미만: 36%' },
          { years: 10, rate: 0.40, description: '10년 이상 11년 미만: 40%' },
          { years: 11, rate: 0.48, description: '11년 이상 12년 미만: 48%' },
          { years: 12, rate: 0.56, description: '12년 이상 13년 미만: 56%' },
          { years: 13, rate: 0.64, description: '13년 이상 14년 미만: 64%' },
          { years: 14, rate: 0.72, description: '14년 이상 15년 미만: 72%' },
          { years: 15, rate: 0.80, description: '15년 이상: 80% (최대)' }
        ],

        /**
         * 1세대1주택 장기보유특별공제 계산
         * @param {number} capitalGain - 양도차익
         * @param {number} holdingYears - 보유기간 (년)
         * @param {number} residenceYears - 거주기간 (년)
         * @returns {object} { deduction, rate, totalYears }
         */
        calculate: function(capitalGain, holdingYears, residenceYears = 0) {
          const totalYears = holdingYears + residenceYears

          if (totalYears < 3) {
            return { deduction: 0, rate: 0, totalYears }
          }

          // 해당하는 공제율 찾기 (역순으로 검색하여 가장 높은 공제율 적용)
          let applicableRate = 0
          for (let i = this.rates.length - 1; i >= 0; i--) {
            if (totalYears >= this.rates[i].years) {
              applicableRate = this.rates[i].rate
              break
            }
          }

          const deduction = Math.floor(capitalGain * applicableRate)

          return {
            deduction,
            rate: applicableRate,
            totalYears,
            holdingYears,
            residenceYears
          }
        }
      },

      // 일반 부동산
      generalRealEstate: {
        name: '일반 부동산 장기보유특별공제',
        maxRate: 0.40,
        description: '보유기간만 적용',
        rates: [
          { years: 3, rate: 0.06, description: '3년 이상 4년 미만: 6%' },
          { years: 4, rate: 0.08, description: '4년 이상 5년 미만: 8%' },
          { years: 5, rate: 0.10, description: '5년 이상 6년 미만: 10%' },
          { years: 6, rate: 0.12, description: '6년 이상 7년 미만: 12%' },
          { years: 7, rate: 0.14, description: '7년 이상 8년 미만: 14%' },
          { years: 8, rate: 0.16, description: '8년 이상 9년 미만: 16%' },
          { years: 9, rate: 0.18, description: '9년 이상 10년 미만: 18%' },
          { years: 10, rate: 0.20, description: '10년 이상 11년 미만: 20%' },
          { years: 11, rate: 0.24, description: '11년 이상 12년 미만: 24%' },
          { years: 12, rate: 0.28, description: '12년 이상 13년 미만: 28%' },
          { years: 13, rate: 0.32, description: '13년 이상 14년 미만: 32%' },
          { years: 14, rate: 0.36, description: '14년 이상 15년 미만: 36%' },
          { years: 15, rate: 0.40, description: '15년 이상: 40% (최대)' }
        ],

        /**
         * 일반 부동산 장기보유특별공제 계산
         * @param {number} capitalGain - 양도차익
         * @param {number} holdingYears - 보유기간 (년)
         * @returns {object} { deduction, rate, holdingYears }
         */
        calculate: function(capitalGain, holdingYears) {
          if (holdingYears < 3) {
            return { deduction: 0, rate: 0, holdingYears }
          }

          // 해당하는 공제율 찾기
          let applicableRate = 0
          for (let i = this.rates.length - 1; i >= 0; i--) {
            if (holdingYears >= this.rates[i].years) {
              applicableRate = this.rates[i].rate
              break
            }
          }

          const deduction = Math.floor(capitalGain * applicableRate)

          return {
            deduction,
            rate: applicableRate,
            holdingYears
          }
        }
      }
    },

    // 기본공제
    basic: {
      amount: 2500000, // 250만원
      applicability: '연 1회',
      description: '1년에 1번만 적용'
    },

    // 필요경비
    necessaryExpenses: {
      acquisition: {
        name: '취득 시 필요경비',
        items: ['취득세', '등록세', '중개수수료', '법무사수수료', '인지대']
      },
      improvement: {
        name: '자본적 지출',
        items: ['증축', '개축', '대수선', '설비증설'],
        minAmount: 3000000, // 3년 내 300만원 이상
        notes: '가치 증가를 위한 지출만 인정'
      },
      transfer: {
        name: '양도 시 필요경비',
        items: ['중개수수료', '법무사수수료', '인지대']
      },

      /**
       * 총 필요경비 계산
       * @param {object} expenses - { acquisition, improvement, transfer }
       * @returns {number} 총 필요경비
       */
      calculate: function(expenses = {}) {
        const acquisition = expenses.acquisition || 0
        const improvement = expenses.improvement || 0
        const transfer = expenses.transfer || 0

        return acquisition + improvement + transfer
      }
    },

    /**
     * 양도소득세 공제 총 계산
     * @param {object} params - 계산 파라미터
     * @returns {object} 계산 결과
     */
    calculateTotal: function(params) {
      const {
        transferPrice,
        acquisitionPrice,
        holdingYears,
        residenceYears = 0,
        isOneHouse = false,
        necessaryExpenses = {}
      } = params

      // 1. 필요경비 계산
      const totalExpenses = this.necessaryExpenses.calculate(necessaryExpenses)

      // 2. 양도차익 계산
      const capitalGain = transferPrice - acquisitionPrice - totalExpenses

      if (capitalGain <= 0) {
        return {
          transferPrice,
          acquisitionPrice,
          totalExpenses,
          capitalGain: 0,
          longTermDeduction: 0,
          longTermDeductionRate: 0,
          basicDeduction: 0,
          taxBase: 0
        }
      }

      // 3. 장기보유특별공제 계산
      let longTermResult
      if (isOneHouse) {
        longTermResult = this.longTermHolding.oneHouseOneHousehold.calculate(
          capitalGain,
          holdingYears,
          residenceYears
        )
      } else {
        longTermResult = this.longTermHolding.generalRealEstate.calculate(
          capitalGain,
          holdingYears
        )
      }

      // 4. 기본공제
      const basicDeduction = this.basic.amount

      // 5. 과세표준 계산
      const taxBase = Math.max(
        capitalGain - longTermResult.deduction - basicDeduction,
        0
      )

      return {
        transferPrice,
        acquisitionPrice,
        totalExpenses,
        capitalGain,
        longTermDeduction: longTermResult.deduction,
        longTermDeductionRate: longTermResult.rate,
        totalYears: longTermResult.totalYears || longTermResult.holdingYears,
        basicDeduction,
        taxBase
      }
    }
  },

  // ==========================================
  // 공통 유틸리티 함수
  // ==========================================

  /**
   * 공제액 포맷팅 (억원 단위)
   * @param {number} amount - 금액
   * @returns {string} 포맷팅된 문자열
   */
  formatDeduction(amount) {
    const billion = Math.floor(amount / 100000000)
    const million = Math.floor((amount % 100000000) / 10000)

    if (billion > 0 && million > 0) {
      return `${billion}억 ${million}만원`
    } else if (billion > 0) {
      return `${billion}억원`
    } else if (million > 0) {
      return `${million}만원`
    } else {
      return `${amount.toLocaleString()}원`
    }
  },

  /**
   * 공제 비율 포맷팅
   * @param {number} rate - 공제율 (0~1)
   * @returns {string} 퍼센트 문자열
   */
  formatRate(rate) {
    return `${(rate * 100).toFixed(0)}%`
  }
}

// ==========================================
// Export
// ==========================================

// ES6 모듈 export
export default TAX_DEDUCTIONS_2024

// CommonJS export (Node.js 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TAX_DEDUCTIONS_2024
}
