/**
 * Question Templates for Tax Strategy Cases
 * 세무 전략 케이스별 질문 템플릿
 *
 * @version 1.0.0
 * @date 2025-10-21
 */

// 질문 타입 정의
export const QuestionType = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  SELECT: 'select'
};

// 증여/상속 케이스 질문 템플릿
export const giftInheritanceQuestions = {
  // 기본 정보 (필수)
  basicInfo: {
    category: '기본 정보',
    required: true,
    questions: [
      {
        id: 'caseType',
        question: '상담 유형을 선택해주세요',
        type: QuestionType.RADIO,
        options: [
          { value: 'gift', label: '증여 (생전 이전)' },
          { value: 'inheritance', label: '상속 (사후 이전)' },
          { value: 'comparison', label: '증여 vs 상속 비교' }
        ],
        required: true
      },
      {
        id: 'propertyType',
        question: '이전 대상 부동산의 종류는?',
        type: QuestionType.RADIO,
        options: [
          { value: 'apartment', label: '아파트' },
          { value: 'house', label: '단독주택' },
          { value: 'officetel', label: '오피스텔' },
          { value: 'land', label: '토지' },
          { value: 'commercial', label: '상가/사무실' },
          { value: 'multiple', label: '여러 부동산' }
        ],
        required: true
      },
      {
        id: 'propertyValue',
        question: '부동산의 시장 가치 (시가)는 얼마인가요?',
        type: QuestionType.CURRENCY,
        placeholder: '예: 10억원',
        required: true,
        helpText: '공인중개사 또는 감정평가 기준 시가를 입력하세요'
      },
      {
        id: 'officialValue',
        question: '공시가격 (또는 기준시가)은 얼마인가요?',
        type: QuestionType.CURRENCY,
        placeholder: '예: 7억원',
        required: false,
        helpText: '국토교통부 실거래가 공개시스템에서 확인 가능'
      }
    ]
  },

  // 부동산 현황
  propertyStatus: {
    category: '부동산 현황',
    required: true,
    questions: [
      {
        id: 'currentUsage',
        question: '현재 부동산 사용 현황은?',
        type: QuestionType.RADIO,
        options: [
          { value: 'owner_residence', label: '소유자(부모) 거주 중' },
          { value: 'heir_residence', label: '자녀가 거주 중' },
          { value: 'rental', label: '임대 중 (전월세)' },
          { value: 'empty', label: '공실 (비어있음)' },
          { value: 'other', label: '기타' }
        ],
        required: true,
        conditional: true // 다음 질문에 영향
      },
      {
        id: 'rentalDetails',
        question: '임대차 상세 정보',
        type: QuestionType.TEXT,
        conditional: { dependsOn: 'currentUsage', values: ['rental'] },
        subQuestions: [
          {
            id: 'depositAmount',
            question: '보증금은 얼마인가요?',
            type: QuestionType.CURRENCY,
            required: true
          },
          {
            id: 'monthlyRent',
            question: '월세는 얼마인가요?',
            type: QuestionType.CURRENCY,
            required: false,
            placeholder: '전세인 경우 0원'
          },
          {
            id: 'contractEndDate',
            question: '임대차 계약 만료일은?',
            type: QuestionType.DATE,
            required: true
          },
          {
            id: 'tenantRelation',
            question: '임차인과의 관계는?',
            type: QuestionType.RADIO,
            options: [
              { value: 'none', label: '무관' },
              { value: 'family', label: '가족/친척' },
              { value: 'acquaintance', label: '지인' }
            ],
            required: false
          }
        ]
      },
      {
        id: 'hasLoan',
        question: '주택담보대출이 있나요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'yes', label: '예' },
          { value: 'no', label: '아니오' }
        ],
        required: true,
        conditional: true
      },
      {
        id: 'loanDetails',
        question: '대출 상세 정보',
        type: QuestionType.TEXT,
        conditional: { dependsOn: 'hasLoan', values: ['yes'] },
        subQuestions: [
          {
            id: 'loanAmount',
            question: '현재 대출 잔액은?',
            type: QuestionType.CURRENCY,
            required: true
          },
          {
            id: 'loanInterestRate',
            question: '대출 이자율은?',
            type: QuestionType.NUMBER,
            placeholder: '예: 3.5 (%)',
            required: false
          }
        ]
      },
      {
        id: 'acquisitionDate',
        question: '부동산 취득 시기는?',
        type: QuestionType.DATE,
        required: true,
        helpText: '보유기간 계산에 사용됩니다'
      },
      {
        id: 'acquisitionCost',
        question: '취득 당시 가격은?',
        type: QuestionType.CURRENCY,
        required: true,
        helpText: '양도소득세 계산 시 필요합니다'
      }
    ]
  },

  // 가족 관계 및 현황
  familyInfo: {
    category: '가족 관계 및 현황',
    required: true,
    questions: [
      {
        id: 'donorAge',
        question: '증여자(부모)의 나이는?',
        type: QuestionType.NUMBER,
        placeholder: '예: 75세',
        required: true,
        helpText: '상속세 공제 한도에 영향을 줄 수 있습니다'
      },
      {
        id: 'spouseStatus',
        question: '배우자 생존 여부는?',
        type: QuestionType.RADIO,
        options: [
          { value: 'alive', label: '생존' },
          { value: 'deceased', label: '사망' }
        ],
        required: true,
        conditional: true
      },
      {
        id: 'numberOfChildren',
        question: '자녀는 몇 명인가요?',
        type: QuestionType.NUMBER,
        required: true,
        helpText: '상속 지분 계산에 필요합니다'
      },
      {
        id: 'heirIndex',
        question: '이번에 증여/상속받는 자녀는 몇 번째인가요?',
        type: QuestionType.NUMBER,
        required: false,
        helpText: '1이면 첫째, 2면 둘째'
      },
      {
        id: 'heirHousingStatus',
        question: '자녀의 현재 주택 보유 현황은?',
        type: QuestionType.RADIO,
        options: [
          { value: '0', label: '무주택자 (주택 없음)' },
          { value: '1', label: '1주택 보유' },
          { value: '2+', label: '2주택 이상 보유' }
        ],
        required: true,
        helpText: '취득세율과 양도세율에 영향을 줍니다'
      },
      {
        id: 'heirIncomeLevel',
        question: '자녀의 연간 소득 수준은?',
        type: QuestionType.RADIO,
        options: [
          { value: 'low', label: '5천만원 미만' },
          { value: 'medium', label: '5천만원 ~ 1억원' },
          { value: 'high', label: '1억원 이상' }
        ],
        required: false,
        helpText: '채무 승계 능력 판단에 참고합니다'
      },
      {
        id: 'heirResidencePlan',
        question: '자녀가 해당 부동산에 거주할 계획인가요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'yes', label: '예, 거주할 예정' },
          { value: 'no', label: '아니오, 거주하지 않음' },
          { value: 'unsure', label: '미정' }
        ],
        required: false
      }
    ]
  },

  // 부모(증여자) 추가 자산
  donorAssets: {
    category: '부모(증여자) 자산 현황',
    required: false,
    questions: [
      {
        id: 'otherProperties',
        question: '다른 부동산도 소유하고 있나요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'yes', label: '예' },
          { value: 'no', label: '아니오' }
        ],
        required: false,
        conditional: true
      },
      {
        id: 'otherPropertiesValue',
        question: '다른 부동산의 총 가치는?',
        type: QuestionType.CURRENCY,
        conditional: { dependsOn: 'otherProperties', values: ['yes'] },
        required: false,
        helpText: '상속세 계산에 필요할 수 있습니다'
      },
      {
        id: 'financialAssets',
        question: '금융자산 (예금, 주식 등)은 대략 얼마나 되나요?',
        type: QuestionType.CURRENCY,
        required: false,
        placeholder: '대략적인 금액'
      },
      {
        id: 'hasDebts',
        question: '부채가 있나요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'yes', label: '예' },
          { value: 'no', label: '아니오' }
        ],
        required: false
      }
    ]
  },

  // 목적 및 제약사항
  objectivesConstraints: {
    category: '목적 및 제약사항',
    required: true,
    questions: [
      {
        id: 'primaryGoal',
        question: '가장 중요한 목표는 무엇인가요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'minimize_tax', label: '세금 최소화' },
          { value: 'quick_transfer', label: '빠른 이전' },
          { value: 'maintain_income', label: '부모님 수입 유지' },
          { value: 'family_harmony', label: '가족 간 분쟁 예방' },
          { value: 'balanced', label: '균형있는 접근' }
        ],
        required: true
      },
      {
        id: 'timeConstraint',
        question: '시간 제약이 있나요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'urgent', label: '급함 (3개월 이내)' },
          { value: 'moderate', label: '보통 (1년 이내)' },
          { value: 'flexible', label: '여유 있음 (시간 충분)' }
        ],
        required: false
      },
      {
        id: 'budgetForTaxes',
        question: '세금 및 비용 지불 예산은?',
        type: QuestionType.CURRENCY,
        required: false,
        helpText: '증여세, 취득세 등 납부 가능한 금액'
      },
      {
        id: 'priorGifts',
        question: '지난 10년간 증여받은 내역이 있나요?',
        type: QuestionType.RADIO,
        options: [
          { value: 'yes', label: '예' },
          { value: 'no', label: '아니오' }
        ],
        required: true,
        conditional: true,
        helpText: '증여세 누진과세 합산에 영향'
      },
      {
        id: 'priorGiftsAmount',
        question: '이전 증여 금액은?',
        type: QuestionType.CURRENCY,
        conditional: { dependsOn: 'priorGifts', values: ['yes'] },
        required: true,
        helpText: '10년 이내 증여 합산액'
      },
      {
        id: 'additionalConcerns',
        question: '기타 고려사항이나 특이사항이 있나요?',
        type: QuestionType.TEXT,
        multiline: true,
        placeholder: '예: 건강 상태, 가족 관계, 법적 분쟁 등',
        required: false
      }
    ]
  }
};

// 질문 카테고리 순서
export const questionCategoryOrder = [
  'basicInfo',
  'propertyStatus',
  'familyInfo',
  'donorAssets',
  'objectivesConstraints'
];

// 질문 카테고리 메타데이터
export const categoryMetadata = {
  basicInfo: {
    title: '기본 정보',
    icon: '📋',
    description: '부동산과 케이스 타입에 대한 기본 정보',
    estimatedTime: '2분'
  },
  propertyStatus: {
    title: '부동산 현황',
    icon: '🏠',
    description: '부동산의 사용 현황과 대출 정보',
    estimatedTime: '3분'
  },
  familyInfo: {
    title: '가족 관계',
    icon: '👨‍👩‍👧‍👦',
    description: '증여자와 수증자의 가족 관계 및 현황',
    estimatedTime: '2분'
  },
  donorAssets: {
    title: '자산 현황',
    icon: '💰',
    description: '증여자의 기타 자산 및 부채 (선택)',
    estimatedTime: '2분'
  },
  objectivesConstraints: {
    title: '목적 및 제약',
    icon: '🎯',
    description: '상담 목적과 제약사항',
    estimatedTime: '2분'
  }
};

/**
 * 조건부 질문 평가 함수
 * @param {Object} question - 질문 객체
 * @param {Object} answers - 현재까지의 답변
 * @returns {boolean} - 질문을 표시할지 여부
 */
export function shouldShowQuestion(question, answers) {
  if (!question.conditional) {
    return true;
  }

  const { dependsOn, values } = question.conditional;
  const dependentAnswer = answers[dependsOn];

  return values.includes(dependentAnswer);
}

/**
 * 필수 질문 완성도 계산
 * @param {Object} answers - 답변 객체
 * @param {Object} questionTemplate - 질문 템플릿
 * @returns {Object} - { completeness: number, missing: string[] }
 */
export function calculateCompleteness(answers, questionTemplate = giftInheritanceQuestions) {
  let totalRequired = 0;
  let answered = 0;
  const missing = [];

  Object.values(questionTemplate).forEach(category => {
    if (!category.required && category.category !== '기본 정보') {
      return; // 선택 카테고리는 건너뜀
    }

    category.questions.forEach(question => {
      if (!question.required) return;

      if (!shouldShowQuestion(question, answers)) {
        return; // 조건에 맞지 않는 질문은 건너뜀
      }

      totalRequired++;

      if (answers[question.id]) {
        answered++;
      } else {
        missing.push(question.question);
      }

      // 하위 질문도 체크
      if (question.subQuestions && shouldShowQuestion(question, answers)) {
        question.subQuestions.forEach(subQ => {
          if (subQ.required) {
            totalRequired++;
            if (answers[subQ.id]) {
              answered++;
            } else {
              missing.push(subQ.question);
            }
          }
        });
      }
    });
  });

  return {
    completeness: totalRequired > 0 ? (answered / totalRequired) * 100 : 0,
    totalRequired,
    answered,
    missing
  };
}

/**
 * 답변 데이터를 AI 프롬프트용 텍스트로 변환
 * @param {Object} answers - 답변 객체
 * @returns {string} - 포맷된 텍스트
 */
export function formatAnswersForAI(answers) {
  let formatted = '=== 고객 정보 ===\n\n';

  Object.entries(giftInheritanceQuestions).forEach(([categoryKey, category]) => {
    formatted += `## ${category.category}\n`;

    category.questions.forEach(question => {
      if (!shouldShowQuestion(question, answers)) return;

      const answer = answers[question.id];
      if (answer !== undefined && answer !== null && answer !== '') {
        formatted += `- ${question.question}: ${formatAnswer(answer, question)}\n`;

        // 하위 질문 답변도 포함
        if (question.subQuestions) {
          question.subQuestions.forEach(subQ => {
            const subAnswer = answers[subQ.id];
            if (subAnswer !== undefined && subAnswer !== null && subAnswer !== '') {
              formatted += `  * ${subQ.question}: ${formatAnswer(subAnswer, subQ)}\n`;
            }
          });
        }
      }
    });

    formatted += '\n';
  });

  return formatted;
}

/**
 * 답변 값을 읽기 쉬운 형태로 포맷
 */
function formatAnswer(answer, question) {
  if (question.type === QuestionType.CURRENCY) {
    return `${Number(answer).toLocaleString()}원`;
  }
  if (question.type === QuestionType.DATE) {
    return new Date(answer).toLocaleDateString('ko-KR');
  }
  if (question.type === QuestionType.RADIO || question.type === QuestionType.SELECT) {
    const option = question.options?.find(opt => opt.value === answer);
    return option ? option.label : answer;
  }
  return answer;
}
