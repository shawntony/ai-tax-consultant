/**
 * Unit Tests for Validators
 *
 * TAX_VALIDATORS의 모든 검증 함수 테스트
 *
 * @file validators.test.js
 * @version 1.0.0
 * @date 2024-10-18
 */

import TAX_VALIDATORS from './validators';

describe('TAX_VALIDATORS - 기본 입력 검증', () => {
  describe('validateAmount()', () => {
    test('정상 금액 검증', () => {
      const result = TAX_VALIDATORS.validateAmount(1000000, '금액');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('null 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount(null, '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수');
    });

    test('undefined 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount(undefined, '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수');
    });

    test('문자열 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount('1000', '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('숫자여야 합니다');
    });

    test('NaN 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount(NaN, '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효한 숫자');
    });

    test('음수 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount(-1000, '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('0 이상');
    });

    test('소수점 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateAmount(1000.5, '금액');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('정수여야 합니다');
    });

    test('0원 입력 → 통과', () => {
      const result = TAX_VALIDATORS.validateAmount(0, '금액');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDate()', () => {
    test('정상 Date 객체', () => {
      const result = TAX_VALIDATORS.validateDate(new Date('2024-01-01'), '날짜');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.date).toBeInstanceOf(Date);
    });

    test('정상 문자열 날짜', () => {
      const result = TAX_VALIDATORS.validateDate('2024-01-01', '날짜');
      expect(result.valid).toBe(true);
      expect(result.date).toBeInstanceOf(Date);
    });

    test('null 입력 → 에러', () => {
      const result = TAX_VALIDATORS.validateDate(null, '날짜');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수');
    });

    test('잘못된 형식 → 에러', () => {
      const result = TAX_VALIDATORS.validateDate(12345, '날짜');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효한 날짜 형식');
    });

    test('잘못된 날짜 문자열 → 에러', () => {
      const result = TAX_VALIDATORS.validateDate('invalid-date', '날짜');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효한 날짜가 아닙니다');
    });
  });

  describe('validateRelationship()', () => {
    test('배우자 관계 → 통과', () => {
      const result = TAX_VALIDATORS.validateRelationship('spouse');
      expect(result.valid).toBe(true);
    });

    test('직계존속 → 통과', () => {
      const result = TAX_VALIDATORS.validateRelationship('lineal_ascendant');
      expect(result.valid).toBe(true);
    });

    test('직계비속 → 통과', () => {
      const result = TAX_VALIDATORS.validateRelationship('lineal_descendant');
      expect(result.valid).toBe(true);
    });

    test('기타 친족 → 통과', () => {
      const result = TAX_VALIDATORS.validateRelationship('other_relative');
      expect(result.valid).toBe(true);
    });

    test('비친족 → 통과', () => {
      const result = TAX_VALIDATORS.validateRelationship('non_relative');
      expect(result.valid).toBe(true);
    });

    test('잘못된 관계 → 에러', () => {
      const result = TAX_VALIDATORS.validateRelationship('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효하지 않은 관계');
    });

    test('빈 문자열 → 에러', () => {
      const result = TAX_VALIDATORS.validateRelationship('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수');
    });
  });

  describe('validateAge()', () => {
    test('정상 나이 (25세)', () => {
      const result = TAX_VALIDATORS.validateAge(25);
      expect(result.valid).toBe(true);
    });

    test('0세 → 통과', () => {
      const result = TAX_VALIDATORS.validateAge(0);
      expect(result.valid).toBe(true);
    });

    test('150세 → 통과', () => {
      const result = TAX_VALIDATORS.validateAge(150);
      expect(result.valid).toBe(true);
    });

    test('음수 나이 → 에러', () => {
      const result = TAX_VALIDATORS.validateAge(-5);
      expect(result.valid).toBe(false);
    });

    test('151세 → 에러', () => {
      const result = TAX_VALIDATORS.validateAge(151);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('0~150');
    });
  });
});

describe('TAX_VALIDATORS - 상속세 검증', () => {
  describe('validateInheritanceTaxInput()', () => {
    test('정상 입력 - 기본 케이스', () => {
      const params = {
        inheritanceAmount: 1000000000,
        children: 2,
        elderly: 0
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('정상 입력 - 배우자 포함', () => {
      const params = {
        inheritanceAmount: 1000000000,
        spouse: {
          actualInheritance: 500000000
        },
        children: 2
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(true);
    });

    test('정상 입력 - 장애인 포함', () => {
      const params = {
        inheritanceAmount: 1000000000,
        disabled: {
          age: 30,
          lifeExpectancy: 75
        }
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(true);
    });

    test('상속재산 누락 → 에러', () => {
      const params = {
        children: 2
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('배우자 실제 상속액 음수 → 에러', () => {
      const params = {
        inheritanceAmount: 1000000000,
        spouse: {
          actualInheritance: -100000000
        }
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('장애인 나이 > 기대여명 → 에러', () => {
      const params = {
        inheritanceAmount: 1000000000,
        disabled: {
          age: 80,
          lifeExpectancy: 75
        }
      };
      const result = TAX_VALIDATORS.validateInheritanceTaxInput(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('기대여명은 현재 나이보다 커야 합니다');
    });
  });
});

describe('TAX_VALIDATORS - 증여세 검증', () => {
  describe('validateGiftTaxInput()', () => {
    test('정상 입력 - 배우자 증여', () => {
      const params = {
        currentGift: 200000000,
        relationship: 'spouse'
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('정상 입력 - 직계존속 증여', () => {
      const params = {
        currentGift: 100000000,
        relationship: 'lineal_ascendant',
        recipientAge: 25
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(true);
    });

    test('정상 입력 - 이전 증여 이력 포함', () => {
      const params = {
        currentGift: 100000000,
        relationship: 'lineal_descendant',
        previousGifts: [
          {
            date: '2020-01-01',
            amount: 50000000,
            taxPaid: 5000000
          },
          {
            date: '2021-06-01',
            amount: 30000000,
            taxPaid: 3000000
          }
        ]
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(true);
    });

    test('증여액 누락 → 에러', () => {
      const params = {
        relationship: 'spouse'
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('관계 누락 → 에러', () => {
      const params = {
        currentGift: 200000000
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('이전 증여 날짜 누락 → 에러', () => {
      const params = {
        currentGift: 100000000,
        relationship: 'spouse',
        previousGifts: [
          {
            amount: 50000000
          }
        ]
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('이전 증여 금액 음수 → 에러', () => {
      const params = {
        currentGift: 100000000,
        relationship: 'spouse',
        previousGifts: [
          {
            date: '2020-01-01',
            amount: -50000000
          }
        ]
      };
      const result = TAX_VALIDATORS.validateGiftTaxInput(params);
      expect(result.valid).toBe(false);
    });
  });
});

describe('TAX_VALIDATORS - 양도소득세 검증', () => {
  describe('validateCapitalGainsTaxInput()', () => {
    test('정상 입력 - 기본 케이스', () => {
      const params = {
        transferPrice: 800000000,
        acquisitionPrice: 500000000,
        holdingYears: 5,
        residenceYears: 3,
        houseCount: 1
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('정상 입력 - 필요경비 포함', () => {
      const params = {
        transferPrice: 800000000,
        acquisitionPrice: 500000000,
        necessaryExpenses: {
          acquisition: 10000000,
          improvement: 20000000,
          transfer: 5000000
        }
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(true);
    });

    test('양도가액 누락 → 에러', () => {
      const params = {
        acquisitionPrice: 500000000
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('취득가액 누락 → 에러', () => {
      const params = {
        transferPrice: 800000000
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(false);
    });

    test('거주기간 > 보유기간 → 에러', () => {
      const params = {
        transferPrice: 800000000,
        acquisitionPrice: 500000000,
        holdingYears: 3,
        residenceYears: 5
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('거주기간은 보유기간을 초과할 수 없습니다');
    });

    test('필요경비 음수 → 에러', () => {
      const params = {
        transferPrice: 800000000,
        acquisitionPrice: 500000000,
        necessaryExpenses: {
          acquisition: -10000000
        }
      };
      const result = TAX_VALIDATORS.validateCapitalGainsTaxInput(params);
      expect(result.valid).toBe(false);
    });
  });
});

describe('TAX_VALIDATORS - 계산 결과 검증', () => {
  describe('validateTaxCalculationResult()', () => {
    test('정상 계산 결과', () => {
      const result = {
        taxAmount: 100000000,
        effectiveRate: 0.25,
        deduction: 10000000
      };
      const validation = TAX_VALIDATORS.validateTaxCalculationResult(result, 400000000);
      expect(validation.valid).toBe(true);
    });

    test('산출세액 누락 → 에러', () => {
      const result = {
        effectiveRate: 0.25
      };
      const validation = TAX_VALIDATORS.validateTaxCalculationResult(result, 400000000);
      expect(validation.valid).toBe(false);
    });

    test('산출세액 음수 → 에러', () => {
      const result = {
        taxAmount: -10000000
      };
      const validation = TAX_VALIDATORS.validateTaxCalculationResult(result, 400000000);
      expect(validation.valid).toBe(false);
    });

    test('실효세율 > 1 → 에러', () => {
      const result = {
        taxAmount: 100000000,
        effectiveRate: 1.5
      };
      const validation = TAX_VALIDATORS.validateTaxCalculationResult(result, 400000000);
      expect(validation.valid).toBe(false);
    });

    test('세액 > 과세표준 → 에러', () => {
      const result = {
        taxAmount: 500000000
      };
      const validation = TAX_VALIDATORS.validateTaxCalculationResult(result, 400000000);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('산출세액이 과세표준보다 클 수 없습니다');
    });
  });

  describe('validateDeductionResult()', () => {
    test('정상 공제 결과', () => {
      const deductionResult = {
        totalDeduction: 500000000,
        spouseDeduction: 500000000,
        basicDeduction: 200000000,
        childDeduction: 150000000
      };
      const validation = TAX_VALIDATORS.validateDeductionResult(deductionResult);
      expect(validation.valid).toBe(true);
    });

    test('총 공제액 누락 → 에러', () => {
      const deductionResult = {
        spouseDeduction: 500000000
      };
      const validation = TAX_VALIDATORS.validateDeductionResult(deductionResult);
      expect(validation.valid).toBe(false);
    });

    test('총 공제액 음수 → 에러', () => {
      const deductionResult = {
        totalDeduction: -100000000
      };
      const validation = TAX_VALIDATORS.validateDeductionResult(deductionResult);
      expect(validation.valid).toBe(false);
    });

    test('개별 공제액 음수 → 에러', () => {
      const deductionResult = {
        totalDeduction: 500000000,
        spouseDeduction: -100000000
      };
      const validation = TAX_VALIDATORS.validateDeductionResult(deductionResult);
      expect(validation.valid).toBe(false);
    });
  });
});

describe('TAX_VALIDATORS - 10년 합산 규정', () => {
  describe('isWithinTenYears()', () => {
    test('10년 이내 증여 (3년 전)', () => {
      const giftDate = new Date();
      giftDate.setFullYear(giftDate.getFullYear() - 3);
      const result = TAX_VALIDATORS.isWithinTenYears(giftDate);
      expect(result).toBe(true);
    });

    test('10년 경계 (정확히 10년)', () => {
      // 정확히 3650일 전 (setFullYear는 윤년 포함하여 3653일이 되므로 밀리초로 계산)
      const now = new Date();
      const giftDate = new Date(now.getTime() - (3650 * 24 * 60 * 60 * 1000));
      const result = TAX_VALIDATORS.isWithinTenYears(giftDate);
      expect(result).toBe(true);
    });

    test('10년 초과 (11년 전)', () => {
      const giftDate = new Date();
      giftDate.setFullYear(giftDate.getFullYear() - 11);
      const result = TAX_VALIDATORS.isWithinTenYears(giftDate);
      expect(result).toBe(false);
    });

    test('미래 날짜 → false', () => {
      const giftDate = new Date();
      giftDate.setFullYear(giftDate.getFullYear() + 1);
      const result = TAX_VALIDATORS.isWithinTenYears(giftDate);
      expect(result).toBe(false);
    });
  });
});

describe('TAX_VALIDATORS - 종합 검증', () => {
  describe('validateByTaxType()', () => {
    test('상속세 검증', () => {
      const params = {
        inheritanceAmount: 1000000000,
        children: 2
      };
      const result = TAX_VALIDATORS.validateByTaxType('inheritance', params);
      expect(result.valid).toBe(true);
    });

    test('증여세 검증', () => {
      const params = {
        currentGift: 200000000,
        relationship: 'spouse'
      };
      const result = TAX_VALIDATORS.validateByTaxType('gift', params);
      expect(result.valid).toBe(true);
    });

    test('양도소득세 검증', () => {
      const params = {
        transferPrice: 800000000,
        acquisitionPrice: 500000000
      };
      const result = TAX_VALIDATORS.validateByTaxType('capitalGains', params);
      expect(result.valid).toBe(true);
    });

    test('잘못된 세목 → 에러', () => {
      const params = {};
      const result = TAX_VALIDATORS.validateByTaxType('invalidTax', params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('지원하지 않는 세목입니다: invalidTax');
    });
  });

  describe('formatErrors()', () => {
    test('오류 배열 포맷팅', () => {
      const errors = ['오류 1', '오류 2', '오류 3'];
      const formatted = TAX_VALIDATORS.formatErrors(errors);
      expect(formatted).toContain('1. 오류 1');
      expect(formatted).toContain('2. 오류 2');
      expect(formatted).toContain('3. 오류 3');
    });

    test('빈 배열 → 빈 문자열', () => {
      const formatted = TAX_VALIDATORS.formatErrors([]);
      expect(formatted).toBe('');
    });

    test('null 입력 → 빈 문자열', () => {
      const formatted = TAX_VALIDATORS.formatErrors(null);
      expect(formatted).toBe('');
    });
  });

  describe('getSummary()', () => {
    test('검증 통과 요약', () => {
      const validation = {
        valid: true,
        errors: []
      };
      const summary = TAX_VALIDATORS.getSummary(validation);
      expect(summary).toContain('✅');
      expect(summary).toContain('모든 검증을 통과');
    });

    test('검증 실패 요약', () => {
      const validation = {
        valid: false,
        errors: ['오류 1', '오류 2']
      };
      const summary = TAX_VALIDATORS.getSummary(validation);
      expect(summary).toContain('❌');
      expect(summary).toContain('2개의 오류');
    });
  });
});
