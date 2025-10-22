/**
 * Tax Calculator - Korean Tax Law
 * 한국 세법 기반 세금 계산 엔진
 *
 * @version 1.0.0
 * @date 2025-10-22
 * @reference 국세청 세법 (2024년 기준)
 */

// ============================================
// 증여세 계산
// ============================================

/**
 * 증여세 과세표준 및 세율 (2024년 기준)
 * 과세표준 구간별 누진세율
 */
const GIFT_TAX_RATES = [
  { min: 0, max: 100000000, rate: 0.10, deduction: 0 },              // 1억 이하: 10%
  { min: 100000000, max: 500000000, rate: 0.20, deduction: 10000000 }, // 1억~5억: 20% - 1천만
  { min: 500000000, max: 1000000000, rate: 0.30, deduction: 60000000 }, // 5억~10억: 30% - 6천만
  { min: 1000000000, max: 3000000000, rate: 0.40, deduction: 160000000 }, // 10억~30억: 40% - 1.6억
  { min: 3000000000, max: Infinity, rate: 0.50, deduction: 460000000 }   // 30억 초과: 50% - 4.6억
];

/**
 * 증여공제 한도 (직계존비속 간)
 * 10년간 합산
 */
const GIFT_DEDUCTIONS = {
  adult_child: 50000000,      // 성인 자녀: 5천만원
  minor_child: 20000000,      // 미성년 자녀: 2천만원
  spouse: 600000000,          // 배우자: 6억원
  lineal_ascendant: 50000000, // 직계존속: 5천만원
  other_relatives: 10000000,  // 기타 친족: 1천만원
  other: 0                    // 기타: 공제 없음
};

/**
 * 증여세 계산
 * @param {number} giftValue - 증여 재산가액
 * @param {string} relationship - 증여자와 수증자의 관계 ('adult_child', 'minor_child', 'spouse' 등)
 * @param {number} priorGifts - 10년 이내 이전 증여 금액 (합산 과세)
 * @param {number} donorAge - 증여자 나이 (60세 이상이면 세대생략 증여세 가산 없음)
 * @param {number} recipientAge - 수증자 나이 (미성년자 판단용)
 * @returns {Object} 증여세 계산 결과
 */
export function calculateGiftTax(
  giftValue,
  relationship = 'adult_child',
  priorGifts = 0,
  donorAge = 70,
  recipientAge = 40
) {
  // 1. 증여공제 결정
  let deduction = GIFT_DEDUCTIONS[relationship] || 0;

  // 미성년자 판단 (만 19세 미만)
  if (recipientAge < 19 && relationship === 'adult_child') {
    deduction = GIFT_DEDUCTIONS.minor_child;
  }

  // 2. 과세표준 계산 (이전 증여 합산)
  const totalGifts = giftValue + priorGifts;
  const taxBase = Math.max(0, totalGifts - deduction);

  // 3. 산출세액 계산 (누진세율 적용)
  const calculatedTax = calculateProgressiveTax(taxBase, GIFT_TAX_RATES);

  // 4. 이전 증여에 대한 세액 차감
  let priorTax = 0;
  if (priorGifts > 0) {
    const priorTaxBase = Math.max(0, priorGifts - deduction);
    priorTax = calculateProgressiveTax(priorTaxBase, GIFT_TAX_RATES);
  }

  const netTax = Math.max(0, calculatedTax - priorTax);

  // 5. 세대생략 증여세 할증 (30%) - 조부모→손자 등
  // 단, 증여자가 60세 미만이고 수증자가 미성년자인 경우
  let generationSkipSurcharge = 0;
  const isGenerationSkip = relationship === 'grandchild' && donorAge < 60 && recipientAge < 19;

  if (isGenerationSkip) {
    generationSkipSurcharge = netTax * 0.30;
  }

  // 6. 신고세액공제 (3%)
  const reportingDeduction = (netTax + generationSkipSurcharge) * 0.03;

  // 7. 최종 납부세액
  const finalTax = Math.floor(netTax + generationSkipSurcharge - reportingDeduction);

  return {
    giftValue,
    priorGifts,
    totalGifts,
    deduction,
    deductionType: relationship,
    taxBase,
    calculatedTax,
    priorTax,
    netTax,
    generationSkipSurcharge,
    reportingDeduction,
    finalTax,
    effectiveRate: giftValue > 0 ? (finalTax / giftValue * 100).toFixed(2) : 0,
    breakdown: {
      step1_총증여액: totalGifts.toLocaleString() + '원',
      step2_증여공제: deduction.toLocaleString() + '원',
      step3_과세표준: taxBase.toLocaleString() + '원',
      step4_산출세액: calculatedTax.toLocaleString() + '원',
      step5_이전증여세액공제: priorTax.toLocaleString() + '원',
      step6_세대생략할증: generationSkipSurcharge.toLocaleString() + '원',
      step7_신고세액공제: reportingDeduction.toLocaleString() + '원',
      step8_최종납부세액: finalTax.toLocaleString() + '원'
    }
  };
}

// ============================================
// 상속세 계산
// ============================================

/**
 * 상속세 과세표준 및 세율 (2024년 기준)
 */
const INHERITANCE_TAX_RATES = [
  { min: 0, max: 100000000, rate: 0.10, deduction: 0 },
  { min: 100000000, max: 500000000, rate: 0.20, deduction: 10000000 },
  { min: 500000000, max: 1000000000, rate: 0.30, deduction: 60000000 },
  { min: 1000000000, max: 3000000000, rate: 0.40, deduction: 160000000 },
  { min: 3000000000, max: Infinity, rate: 0.50, deduction: 460000000 }
];

/**
 * 상속공제
 */
const INHERITANCE_DEDUCTIONS = {
  basic: 200000000,           // 기초공제: 2억원
  spouse: 500000000,          // 배우자공제: 최소 5억원 (최대 30억원)
  minorChild: 10000000,       // 미성년자 자녀 1인당: 1천만원 × (19-나이)
  elderly: 50000000,          // 65세 이상 1인당: 5천만원
  disabled: 10000000,         // 장애인 1인당: 1천만원 × (기대여명-나이)
  familyDeduction: 500000000, // 일괄공제: 5억원 (기초+인적공제 대신 선택 가능)
  funeralExpense: 10000000,   // 장례비용: 1천만원 (최대 한도)
  debtDeduction: true         // 채무공제: 실제 채무액
};

/**
 * 상속세 계산
 * @param {number} inheritanceValue - 상속 재산가액
 * @param {Object} heirs - 상속인 정보
 * @param {number} debts - 채무액
 * @param {number} funeralExpense - 장례비용
 * @returns {Object} 상속세 계산 결과
 */
export function calculateInheritanceTax(
  inheritanceValue,
  heirs = {
    spouse: true,
    children: 2,
    minorChildren: 0,
    elderly: 0,
    disabled: 0
  },
  debts = 0,
  funeralExpense = 10000000
) {
  // 1. 기초공제
  const basicDeduction = INHERITANCE_DEDUCTIONS.basic;

  // 2. 인적공제
  let personalDeduction = 0;

  // 배우자 공제 (5억~30억, 법정상속분 고려)
  if (heirs.spouse) {
    personalDeduction += INHERITANCE_DEDUCTIONS.spouse;
  }

  // 자녀공제 (1인당 5천만원)
  if (heirs.children) {
    personalDeduction += heirs.children * 50000000;
  }

  // 미성년자 공제
  if (heirs.minorChildren) {
    // 평균 15세 미성년자 가정
    const avgAge = 15;
    personalDeduction += heirs.minorChildren * INHERITANCE_DEDUCTIONS.minorChild * (19 - avgAge);
  }

  // 65세 이상 공제
  if (heirs.elderly) {
    personalDeduction += heirs.elderly * INHERITANCE_DEDUCTIONS.elderly;
  }

  // 3. 일괄공제 vs 개별공제 중 유리한 것 선택
  const individualDeductions = basicDeduction + personalDeduction;
  const lumpSumDeduction = INHERITANCE_DEDUCTIONS.familyDeduction;
  const selectedDeduction = Math.max(individualDeductions, lumpSumDeduction);

  // 4. 장례비용 공제
  const funeralDeduction = Math.min(funeralExpense, INHERITANCE_DEDUCTIONS.funeralExpense);

  // 5. 채무공제
  const debtDeduction = debts;

  // 6. 과세표준 계산
  const totalDeductions = selectedDeduction + funeralDeduction + debtDeduction;
  const taxBase = Math.max(0, inheritanceValue - totalDeductions);

  // 7. 산출세액
  const calculatedTax = calculateProgressiveTax(taxBase, INHERITANCE_TAX_RATES);

  // 8. 신고세액공제 (3%)
  const reportingDeduction = calculatedTax * 0.03;

  // 9. 최종 납부세액
  const finalTax = Math.floor(calculatedTax - reportingDeduction);

  return {
    inheritanceValue,
    deductions: {
      selected: selectedDeduction === lumpSumDeduction ? '일괄공제' : '개별공제',
      basic: basicDeduction,
      personal: personalDeduction,
      funeral: funeralDeduction,
      debt: debtDeduction,
      total: totalDeductions
    },
    taxBase,
    calculatedTax,
    reportingDeduction,
    finalTax,
    effectiveRate: inheritanceValue > 0 ? (finalTax / inheritanceValue * 100).toFixed(2) : 0,
    breakdown: {
      step1_상속재산: inheritanceValue.toLocaleString() + '원',
      step2_공제합계: totalDeductions.toLocaleString() + '원',
      step3_과세표준: taxBase.toLocaleString() + '원',
      step4_산출세액: calculatedTax.toLocaleString() + '원',
      step5_신고세액공제: reportingDeduction.toLocaleString() + '원',
      step6_최종납부세액: finalTax.toLocaleString() + '원'
    }
  };
}

// ============================================
// 취득세 계산
// ============================================

/**
 * 취득세율 (부동산 종류 및 주택 수에 따라)
 */
const ACQUISITION_TAX_RATES = {
  first_home: 0.01,      // 1주택 (6억 이하): 1%
  first_home_mid: 0.013, // 1주택 (6억~9억): 1~3% 조정
  first_home_high: 0.03, // 1주택 (9억 초과): 3%
  second_home: 0.04,     // 2주택: 4% (조정대상지역 8%)
  third_home: 0.04,      // 3주택: 4% (조정대상지역 12%)
  corporate: 0.04,       // 법인: 4%

  // 지방교육세 (취득세의 10%)
  local_education: 0.10,

  // 농어촌특별세 (일정 금액 이상)
  rural_special: 0.002   // 0.2% (취득가액 기준)
};

/**
 * 취득세 계산
 * @param {number} propertyValue - 부동산 가액 (취득가액)
 * @param {string} propertyType - 부동산 종류 ('apartment', 'house', 'land', 'commercial')
 * @param {number} houseCount - 현재 보유 주택 수 (취득 후 기준)
 * @param {boolean} isAdjustmentArea - 조정대상지역 여부
 * @returns {Object} 취득세 계산 결과
 */
export function calculateAcquisitionTax(
  propertyValue,
  propertyType = 'apartment',
  houseCount = 1,
  isAdjustmentArea = false
) {
  let acquisitionTaxRate = 0;

  // 주택 취득세율 결정
  if (propertyType === 'apartment' || propertyType === 'house') {
    if (houseCount === 1) {
      // 1주택자
      if (propertyValue <= 600000000) {
        acquisitionTaxRate = 0.01; // 1%
      } else if (propertyValue <= 900000000) {
        // 6억~9억: 1%~3% 구간별 계산
        acquisitionTaxRate = 0.01 + ((propertyValue - 600000000) / 300000000) * 0.02;
      } else {
        acquisitionTaxRate = 0.03; // 3%
      }
    } else if (houseCount === 2) {
      // 2주택자
      acquisitionTaxRate = isAdjustmentArea ? 0.08 : 0.04;
    } else {
      // 3주택 이상
      acquisitionTaxRate = isAdjustmentArea ? 0.12 : 0.04;
    }
  } else if (propertyType === 'land') {
    acquisitionTaxRate = 0.04; // 토지: 4%
  } else if (propertyType === 'commercial') {
    acquisitionTaxRate = 0.04; // 상가/오피스텔: 4%
  }

  // 1. 취득세
  const acquisitionTax = Math.floor(propertyValue * acquisitionTaxRate);

  // 2. 지방교육세 (취득세의 10%)
  const localEducationTax = Math.floor(acquisitionTax * 0.10);

  // 3. 농어촌특별세 (일정 금액 초과 시)
  let ruralSpecialTax = 0;
  if (propertyValue > 600000000 && (propertyType === 'apartment' || propertyType === 'house')) {
    ruralSpecialTax = Math.floor((propertyValue - 600000000) * 0.002);
  }

  // 4. 총 취득세
  const totalTax = acquisitionTax + localEducationTax + ruralSpecialTax;

  return {
    propertyValue,
    propertyType,
    houseCount,
    isAdjustmentArea,
    acquisitionTaxRate: (acquisitionTaxRate * 100).toFixed(2) + '%',
    acquisitionTax,
    localEducationTax,
    ruralSpecialTax,
    totalTax,
    effectiveRate: (totalTax / propertyValue * 100).toFixed(2),
    breakdown: {
      취득세: acquisitionTax.toLocaleString() + '원',
      지방교육세: localEducationTax.toLocaleString() + '원',
      농어촌특별세: ruralSpecialTax.toLocaleString() + '원',
      총_취득세: totalTax.toLocaleString() + '원'
    }
  };
}

// ============================================
// 양도소득세 계산
// ============================================

/**
 * 양도소득세 계산
 * @param {number} sellingPrice - 양도가액
 * @param {number} acquisitionCost - 취득가액
 * @param {number} holdingPeriod - 보유기간 (년)
 * @param {number} houseCount - 주택 수
 * @param {boolean} isLongTermHolding - 장기보유특별공제 적용 여부
 * @returns {Object} 양도소득세 계산 결과
 */
export function calculateCapitalGainsTax(
  sellingPrice,
  acquisitionCost,
  holdingPeriod = 5,
  houseCount = 1,
  isLongTermHolding = true
) {
  // 1. 양도차익
  const capitalGain = sellingPrice - acquisitionCost;

  if (capitalGain <= 0) {
    return {
      sellingPrice,
      acquisitionCost,
      capitalGain: 0,
      finalTax: 0,
      message: '양도차익이 없어 양도소득세가 발생하지 않습니다.'
    };
  }

  // 2. 장기보유특별공제 (1주택자, 2년 이상 보유)
  let longTermDeduction = 0;
  if (houseCount === 1 && isLongTermHolding && holdingPeriod >= 2) {
    const deductionRate = Math.min(holdingPeriod * 0.08, 0.80); // 연 8%, 최대 80%
    longTermDeduction = Math.floor(capitalGain * deductionRate);
  }

  // 3. 양도소득 과세표준
  const taxBase = capitalGain - longTermDeduction;

  // 4. 기본공제 (연 250만원)
  const basicDeduction = 2500000;
  const adjustedTaxBase = Math.max(0, taxBase - basicDeduction);

  // 5. 양도소득세율 (다주택자 중과세 적용)
  let taxRate = 0;
  if (houseCount === 1) {
    // 1주택자: 6%~45% 누진세율
    taxRate = 0.06 + (adjustedTaxBase / 100000000) * 0.15; // 간이 계산
    taxRate = Math.min(taxRate, 0.45);
  } else if (houseCount === 2) {
    taxRate = 0.60; // 2주택: 기본세율 + 20%p
  } else {
    taxRate = 0.70; // 3주택 이상: 기본세율 + 30%p
  }

  // 6. 산출세액
  const calculatedTax = Math.floor(adjustedTaxBase * taxRate);

  // 7. 지방소득세 (10%)
  const localIncomeTax = Math.floor(calculatedTax * 0.10);

  // 8. 최종 납부세액
  const finalTax = calculatedTax + localIncomeTax;

  return {
    sellingPrice,
    acquisitionCost,
    capitalGain,
    holdingPeriod,
    houseCount,
    longTermDeduction,
    taxBase,
    basicDeduction,
    adjustedTaxBase,
    taxRate: (taxRate * 100).toFixed(0) + '%',
    calculatedTax,
    localIncomeTax,
    finalTax,
    effectiveRate: (finalTax / capitalGain * 100).toFixed(2),
    breakdown: {
      양도차익: capitalGain.toLocaleString() + '원',
      장기보유공제: longTermDeduction.toLocaleString() + '원',
      과세표준: adjustedTaxBase.toLocaleString() + '원',
      양도소득세: calculatedTax.toLocaleString() + '원',
      지방소득세: localIncomeTax.toLocaleString() + '원',
      총_납부세액: finalTax.toLocaleString() + '원'
    }
  };
}

// ============================================
// 부담부 증여 최적화
// ============================================

/**
 * 부담부 증여 최적화
 * 채무 승계를 통한 증여세 및 양도세 최소화
 *
 * @param {number} propertyValue - 부동산 시가
 * @param {number} acquisitionCost - 취득가액
 * @param {number} maxDebt - 최대 채무액 (실제 대출 한도)
 * @param {string} relationship - 증여자와 수증자 관계
 * @returns {Object} 최적 부담부 증여 전략
 */
export function optimizeBurdensomeGift(
  propertyValue,
  acquisitionCost,
  maxDebt = 0,
  relationship = 'adult_child'
) {
  const results = [];

  // 시나리오 1: 순수 증여 (채무 승계 없음)
  const pureGift = calculateGiftTax(propertyValue, relationship);
  const pureAcquisition = calculateAcquisitionTax(propertyValue, 'apartment', 1);

  results.push({
    scenario: '순수 증여',
    debtAmount: 0,
    giftAmount: propertyValue,
    giftTax: pureGift.finalTax,
    capitalGainsTax: 0,
    acquisitionTax: pureAcquisition.totalTax,
    totalTax: pureGift.finalTax + pureAcquisition.totalTax,
    totalCost: pureGift.finalTax + pureAcquisition.totalTax
  });

  // 시나리오 2~5: 부담부 증여 (채무 10%, 30%, 50%, 70%)
  const debtRatios = [0.1, 0.3, 0.5, 0.7];

  debtRatios.forEach(ratio => {
    const debtAmount = Math.min(propertyValue * ratio, maxDebt);
    const giftAmount = propertyValue - debtAmount;

    // 증여세 (순증여분)
    const gift = calculateGiftTax(giftAmount, relationship);

    // 양도소득세 (채무 승계분은 양도로 간주)
    const capitalGains = calculateCapitalGainsTax(
      debtAmount,
      acquisitionCost * (debtAmount / propertyValue),
      5, // 보유기간 5년 가정
      1,
      false
    );

    // 취득세
    const acquisition = calculateAcquisitionTax(propertyValue, 'apartment', 1);

    const totalTax = gift.finalTax + capitalGains.finalTax + acquisition.totalTax;

    results.push({
      scenario: `부담부 증여 (채무 ${(ratio * 100).toFixed(0)}%)`,
      debtAmount,
      giftAmount,
      giftTax: gift.finalTax,
      capitalGainsTax: capitalGains.finalTax,
      acquisitionTax: acquisition.totalTax,
      totalTax,
      totalCost: totalTax
    });
  });

  // 최적 시나리오 찾기
  results.sort((a, b) => a.totalTax - b.totalTax);
  const optimal = results[0];

  return {
    propertyValue,
    acquisitionCost,
    maxDebt,
    scenarios: results,
    optimal: {
      ...optimal,
      savings: results[results.length - 1].totalTax - optimal.totalTax,
      savingsRate: ((1 - optimal.totalTax / results[results.length - 1].totalTax) * 100).toFixed(2) + '%'
    },
    recommendation: `${optimal.scenario} 전략이 ${optimal.savings.toLocaleString()}원 절세 효과가 있습니다.`
  };
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 누진세율 계산 공통 함수
 */
function calculateProgressiveTax(taxBase, taxRates) {
  if (taxBase <= 0) return 0;

  for (const bracket of taxRates) {
    if (taxBase > bracket.min && taxBase <= bracket.max) {
      return Math.floor(taxBase * bracket.rate - bracket.deduction);
    }
  }

  return 0;
}

/**
 * 세금 절감액 계산
 */
export function calculateTaxSavings(scenario1Tax, scenario2Tax) {
  const savings = Math.abs(scenario1Tax - scenario2Tax);
  const better = scenario1Tax < scenario2Tax ? 'scenario1' : 'scenario2';
  const savingsRate = scenario1Tax > 0
    ? ((savings / Math.max(scenario1Tax, scenario2Tax)) * 100).toFixed(2)
    : 0;

  return {
    savings,
    savingsRate: savingsRate + '%',
    better,
    message: `${better === 'scenario1' ? '첫 번째' : '두 번째'} 전략이 ${savings.toLocaleString()}원 유리합니다.`
  };
}
