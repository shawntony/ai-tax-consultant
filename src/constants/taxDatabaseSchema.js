/**
 * 세법 데이터베이스 스키마 (Tax Database Schema)
 *
 * 2024년 한국 세법 데이터 구조 정의
 * - 상속세, 증여세, 양도소득세의 세율 및 공제 데이터 통합
 * - 일관된 데이터 구조와 접근 방법 제공
 * - 버전 관리 및 메타데이터 표준화
 *
 * @version 1.0.0
 * @date 2025-10-18
 * @task M2.1.7 - 세법 DB 스키마 설계
 */

// ==========================================
// 메타데이터 스키마
// ==========================================

/**
 * 데이터 메타정보 구조
 * @typedef {Object} MetadataSchema
 * @property {string} dataType - 데이터 타입 (예: 'inheritanceTaxRates')
 * @property {string} taxCategory - 세목 (예: '상속세')
 * @property {number} fiscalYear - 과세연도
 * @property {string} collectedDate - 수집일 (YYYY-MM-DD)
 * @property {string} source - 법률 출처
 * @property {Object} legalReference - 법률 참조 정보
 * @property {string} legalReference.law - 법률명
 * @property {string|string[]} legalReference.article - 조항
 * @property {string} legalReference.lastRevision - 최종 개정일
 * @property {string} legalReference.url - 법률 URL
 * @property {Object} validPeriod - 유효기간
 * @property {string} validPeriod.startDate - 시작일
 * @property {string} validPeriod.endDate - 종료일
 * @property {string} validPeriod.notes - 비고
 * @property {string} collectedBy - 수집자/팀
 * @property {string} version - 버전 (semantic versioning)
 */
const METADATA_SCHEMA = {
  dataType: 'string',
  taxCategory: 'string',
  fiscalYear: 'number',
  collectedDate: 'string (YYYY-MM-DD)',
  source: 'string',
  legalReference: {
    law: 'string',
    article: 'string | string[]',
    lastRevision: 'string (YYYY-MM-DD)',
    url: 'string (URL)'
  },
  validPeriod: {
    startDate: 'string (YYYY-MM-DD)',
    endDate: 'string (YYYY-MM-DD)',
    notes: 'string'
  },
  collectedBy: 'string',
  version: 'string (semver)'
}

// ==========================================
// 세율 데이터 스키마
// ==========================================

/**
 * 세율 구간 구조
 * @typedef {Object} TaxBracketSchema
 * @property {number} bracketNumber - 구간 번호 (1부터 시작)
 * @property {number} min - 최소 과세표준 (포함)
 * @property {number|null} max - 최대 과세표준 (포함, 최상위는 null)
 * @property {string} description - 구간 설명
 * @property {number} rate - 세율 (0~1 사이 소수)
 * @property {number} deduction - 누진공제액
 * @property {string} formula - 계산 공식
 */
const TAX_BRACKET_SCHEMA = {
  bracketNumber: 'number (1부터)',
  min: 'number (원)',
  max: 'number | null (원)',
  description: 'string',
  rate: 'number (0~1)',
  deduction: 'number (원)',
  formula: 'string'
}

/**
 * 세율 구조 스키마
 * @typedef {Object} TaxRateStructureSchema
 * @property {string} type - 세율 타입 ('progressive' | 'flat')
 * @property {string} description - 세율 구조 설명
 * @property {string} currency - 통화 코드
 * @property {TaxBracketSchema[]} brackets - 세율 구간 배열
 * @property {Function} calculate - 세액 계산 함수
 */
const TAX_RATE_STRUCTURE_SCHEMA = {
  type: 'string (progressive | flat)',
  description: 'string',
  currency: 'string (KRW)',
  brackets: '[TaxBracket]',
  calculate: 'function(taxBase: number, options?: object): object'
}

// ==========================================
// 공제 데이터 스키마
// ==========================================

/**
 * 공제 항목 구조
 * @typedef {Object} DeductionItemSchema
 * @property {string} name - 공제 명칭
 * @property {number|Object} amount - 공제액 (고정액 또는 계산 구조)
 * @property {string} description - 공제 설명
 * @property {string} legalBasis - 법적 근거
 * @property {boolean} [mandatory] - 필수 여부
 * @property {string[]} [requirements] - 요건 목록
 * @property {string[]} [notes] - 주의사항
 * @property {Function} [calculate] - 계산 함수 (변동액인 경우)
 */
const DEDUCTION_ITEM_SCHEMA = {
  name: 'string',
  amount: 'number | object',
  description: 'string',
  legalBasis: 'string',
  mandatory: 'boolean (optional)',
  requirements: 'string[] (optional)',
  notes: 'string[] (optional)',
  calculate: 'function(params: object): number (optional)'
}

// ==========================================
// 데이터베이스 전체 구조
// ==========================================

/**
 * 세법 데이터베이스 전체 스키마
 */
const TAX_DATABASE_SCHEMA = {
  // 메타데이터
  metadata: METADATA_SCHEMA,

  // 세율 데이터 (Rates)
  rates: {
    inheritance: TAX_RATE_STRUCTURE_SCHEMA,
    gift: TAX_RATE_STRUCTURE_SCHEMA,
    capitalGains: {
      ...TAX_RATE_STRUCTURE_SCHEMA,
      multipleHomeSurcharge: {
        twoHomes: 'object',
        threeOrMoreHomes: 'object'
      },
      oneHouseOneHouseholdExemption: 'object',
      calculateLocalIncomeTax: 'function(capitalGainsTax: number): number'
    }
  },

  // 공제 데이터 (Deductions)
  deductions: {
    inheritance: {
      basic: DEDUCTION_ITEM_SCHEMA,
      spouse: DEDUCTION_ITEM_SCHEMA,
      child: DEDUCTION_ITEM_SCHEMA,
      elderly: DEDUCTION_ITEM_SCHEMA,
      disability: DEDUCTION_ITEM_SCHEMA,
      bulk: DEDUCTION_ITEM_SCHEMA,
      financialAsset: DEDUCTION_ITEM_SCHEMA,
      disaster: DEDUCTION_ITEM_SCHEMA,
      calculateTotal: 'function(params: object): object'
    },
    gift: {
      byRelationship: {
        spouse: DEDUCTION_ITEM_SCHEMA,
        lineal_ascendant_adult: DEDUCTION_ITEM_SCHEMA,
        lineal_ascendant_minor: DEDUCTION_ITEM_SCHEMA,
        lineal_descendant: DEDUCTION_ITEM_SCHEMA,
        other_relative: DEDUCTION_ITEM_SCHEMA,
        non_relative: DEDUCTION_ITEM_SCHEMA
      },
      getDeductionByRelationship: 'function(relationship: string, recipientAge: number): number',
      calculateWithTenYearCumulation: 'function(...): object'
    },
    capitalGains: {
      longTermHolding: {
        oneHouseOneHousehold: 'object',
        generalRealEstate: 'object'
      },
      basic: DEDUCTION_ITEM_SCHEMA,
      necessaryExpenses: 'object',
      calculateTotal: 'function(params: object): object'
    }
  },

  // 유틸리티 함수
  utilities: {
    findBracket: 'function(taxBase: number, taxType: string): object',
    calculateTax: 'function(taxBase: number, taxType: string, options?: object): object',
    calculateEffectiveRate: 'function(taxAmount: number, taxBase: number): number',
    getMaxRate: 'function(taxType: string): number',
    getMinRate: 'function(taxType: string): number',
    formatDeduction: 'function(amount: number): string',
    formatRate: 'function(rate: number): string'
  }
}

// ==========================================
// 데이터 검증 스키마
// ==========================================

/**
 * 데이터 검증 규칙
 */
const VALIDATION_SCHEMA = {
  // 메타데이터 검증
  metadata: {
    fiscalYear: {
      type: 'number',
      min: 2020,
      max: 2030,
      required: true
    },
    version: {
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
      required: true
    },
    collectedDate: {
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      required: true
    }
  },

  // 세율 검증
  taxRate: {
    rate: {
      type: 'number',
      min: 0,
      max: 1,
      required: true
    },
    deduction: {
      type: 'number',
      min: 0,
      required: true
    },
    min: {
      type: 'number',
      min: 0,
      required: true
    }
  },

  // 공제액 검증
  deduction: {
    amount: {
      type: 'number',
      min: 0,
      required: true
    },
    name: {
      type: 'string',
      minLength: 2,
      required: true
    }
  }
}

// ==========================================
// 데이터 버전 관리 스키마
// ==========================================

/**
 * 버전 관리 구조
 * @typedef {Object} VersionManagementSchema
 * @property {string} currentVersion - 현재 버전
 * @property {Object[]} versionHistory - 버전 이력
 * @property {string} versionHistory[].version - 버전 번호
 * @property {string} versionHistory[].date - 변경일
 * @property {string[]} versionHistory[].changes - 변경 사항
 * @property {string} versionHistory[].author - 작성자
 */
const VERSION_MANAGEMENT_SCHEMA = {
  currentVersion: '1.0.0',
  versionHistory: [
    {
      version: '1.0.0',
      date: '2025-10-17',
      changes: [
        '초기 데이터 수집 완료',
        '상속세/증여세/양도소득세 세율 및 공제 데이터 구축',
        '계산 함수 구현 완료'
      ],
      author: 'AI Tax Consultant Team'
    }
  ],
  updatePolicy: {
    frequency: 'quarterly', // 분기별 업데이트
    triggers: [
      '세법 개정',
      '세율 변경',
      '공제 한도 조정',
      '버그 수정',
      '기능 개선'
    ],
    reviewProcess: [
      '법률 조항 확인',
      '데이터 정확성 검증',
      '계산 로직 테스트',
      'QA 승인',
      '배포'
    ]
  }
}

// ==========================================
// 파일 구조 표준
// ==========================================

/**
 * 파일 명명 규칙 및 구조
 */
const FILE_STRUCTURE_STANDARD = {
  // JSON 데이터 파일 (루트 또는 src/data/)
  dataFiles: {
    naming: 'data_{taxType}_{dataCategory}_{year}.json',
    examples: [
      'data_inheritance_tax_rates_2024.json',
      'data_gift_tax_deductions_2024.json',
      'data_capital_gains_tax_rates_2024.json'
    ],
    location: 'project_root/ 또는 src/data/',
    structure: {
      metadata: 'required',
      mainData: 'required (rates or deductions)',
      examples: 'recommended',
      notes: 'optional'
    }
  },

  // JavaScript 구현 파일 (src/constants/)
  implementationFiles: {
    naming: '{dataCategory}.js',
    examples: [
      'taxRates.js',
      'deductions.js',
      'validators.js'
    ],
    location: 'src/constants/',
    structure: {
      imports: 'optional',
      mainObject: 'required',
      functions: 'required',
      exports: 'required (ES6 + CommonJS)'
    }
  },

  // 스키마 파일 (src/constants/)
  schemaFiles: {
    naming: '{dataCategory}Schema.js',
    examples: [
      'taxDatabaseSchema.js'
    ],
    location: 'src/constants/',
    purpose: '데이터 구조 정의 및 표준화'
  }
}

// ==========================================
// API 인터페이스 스키마
// ==========================================

/**
 * 세법 계산 API 인터페이스
 */
const API_INTERFACE_SCHEMA = {
  // 상속세 계산
  calculateInheritanceTax: {
    input: {
      inheritanceAmount: 'number (상속재산 총액)',
      deductions: {
        spouse: 'object (배우자 정보)',
        children: 'number (자녀 수)',
        elderly: 'number (연로자 수)',
        disabled: 'object (장애인 정보)',
        financialAssets: 'number (금융재산)',
        disaster: 'object (재해손실)'
      }
    },
    output: {
      totalInheritance: 'number',
      totalDeductions: 'number',
      taxBase: 'number',
      taxAmount: 'number',
      effectiveRate: 'number',
      breakdown: 'object (상세 내역)'
    }
  },

  // 증여세 계산
  calculateGiftTax: {
    input: {
      currentGift: 'number (현재 증여액)',
      previousGifts: 'array (이전 증여 이력)',
      relationship: 'string (증여자와의 관계)',
      recipientAge: 'number (수증자 나이)'
    },
    output: {
      totalGifts: 'number',
      deduction: 'number',
      taxBase: 'number',
      taxAmount: 'number',
      previousTaxPaid: 'number',
      netTaxDue: 'number'
    }
  },

  // 양도소득세 계산
  calculateCapitalGainsTax: {
    input: {
      transferPrice: 'number (양도가액)',
      acquisitionPrice: 'number (취득가액)',
      necessaryExpenses: 'object (필요경비)',
      holdingYears: 'number (보유기간)',
      residenceYears: 'number (거주기간)',
      houseCount: 'number (주택 수)',
      isRegulatedArea: 'boolean (조정대상지역)',
      isOneHouse: 'boolean (1세대1주택)'
    },
    output: {
      capitalGain: 'number',
      longTermDeduction: 'number',
      basicDeduction: 'number',
      taxBase: 'number',
      taxAmount: 'number',
      localIncomeTax: 'number',
      totalTax: 'number'
    }
  }
}

// ==========================================
// 에러 처리 스키마
// ==========================================

/**
 * 에러 타입 및 처리 규칙
 */
const ERROR_HANDLING_SCHEMA = {
  errorTypes: {
    VALIDATION_ERROR: {
      code: 'VAL_001',
      message: '입력값 검증 실패',
      httpStatus: 400
    },
    CALCULATION_ERROR: {
      code: 'CALC_001',
      message: '세액 계산 오류',
      httpStatus: 500
    },
    DATA_NOT_FOUND: {
      code: 'DATA_001',
      message: '해당 데이터를 찾을 수 없음',
      httpStatus: 404
    },
    BRACKET_NOT_FOUND: {
      code: 'CALC_002',
      message: '해당 세율 구간을 찾을 수 없음',
      httpStatus: 500
    },
    INVALID_TAX_TYPE: {
      code: 'VAL_002',
      message: '지원하지 않는 세목',
      httpStatus: 400
    }
  },

  errorHandling: {
    validation: 'throw Error with detailed message',
    calculation: 'throw Error with context',
    logging: 'console.error with stack trace',
    userFacing: 'friendly error message in Korean'
  }
}

// ==========================================
// Export
// ==========================================

const TAX_DATABASE_FULL_SCHEMA = {
  metadata: METADATA_SCHEMA,
  taxBracket: TAX_BRACKET_SCHEMA,
  taxRateStructure: TAX_RATE_STRUCTURE_SCHEMA,
  deductionItem: DEDUCTION_ITEM_SCHEMA,
  database: TAX_DATABASE_SCHEMA,
  validation: VALIDATION_SCHEMA,
  versionManagement: VERSION_MANAGEMENT_SCHEMA,
  fileStructure: FILE_STRUCTURE_STANDARD,
  apiInterface: API_INTERFACE_SCHEMA,
  errorHandling: ERROR_HANDLING_SCHEMA
}

export default TAX_DATABASE_FULL_SCHEMA

// CommonJS export (Node.js 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TAX_DATABASE_FULL_SCHEMA
}

/**
 * 스키마 사용 예시
 *
 * // 1. 데이터 검증
 * import TAX_DATABASE_FULL_SCHEMA from './taxDatabaseSchema.js'
 *
 * function validateMetadata(data) {
 *   const schema = TAX_DATABASE_FULL_SCHEMA.validation.metadata
 *   // 검증 로직
 * }
 *
 * // 2. API 응답 구조화
 * function calculateTax(input) {
 *   // TAX_DATABASE_FULL_SCHEMA.apiInterface 참조
 *   return {
 *     taxBase: ...,
 *     taxAmount: ...,
 *     // 스키마에 따른 응답
 *   }
 * }
 *
 * // 3. 에러 처리
 * function handleError(errorType) {
 *   const error = TAX_DATABASE_FULL_SCHEMA.errorHandling.errorTypes[errorType]
 *   throw new Error(`[${error.code}] ${error.message}`)
 * }
 */
