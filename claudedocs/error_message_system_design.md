# 에러 메시지 시스템 설계
# Error Message System Design

**작성일**: 2025-10-18
**버전**: 1.0.0
**작성자**: AI Tax Consultant Development Team
**관련 작업**: M2.4.3

---

## 📋 목차 (Table of Contents)

1. [개요 (Overview)](#개요-overview)
2. [시스템 아키텍처 (System Architecture)](#시스템-아키텍처-system-architecture)
3. [에러 코드 체계 (Error Code Taxonomy)](#에러-코드-체계-error-code-taxonomy)
4. [UI 컴포넌트 설계 (UI Component Design)](#ui-컴포넌트-설계-ui-component-design)
5. [국제화 (Internationalization)](#국제화-internationalization)
6. [사용 예시 (Usage Examples)](#사용-예시-usage-examples)
7. [구현 계획 (Implementation Plan)](#구현-계획-implementation-plan)

---

## 개요 (Overview)

### 목적 (Purpose)
사용자 친화적이고 일관성 있는 에러 메시지 시스템을 구축하여 사용자 경험을 향상시키고, 에러 추적 및 디버깅을 용이하게 함

### 핵심 요구사항 (Key Requirements)
1. **사용자 친화성**: 전문 용어 최소화, 명확한 원인 및 해결 방법 제시
2. **일관성**: 모든 에러 메시지가 동일한 형식과 톤으로 제공
3. **국제화**: 한국어/영어 지원, 향후 다국어 확장 가능
4. **접근성**: 스크린 리더 지원, WCAG 2.1 AA 준수
5. **추적 가능성**: 고유 에러 코드로 로깅 및 분석 가능

### 에러 메시지 원칙

```yaml
principles:
  clarity:
    - 전문 용어 대신 일상 언어 사용
    - "무엇이 잘못되었는지" 명확히 설명
    - "어떻게 해결하는지" 구체적으로 안내

  tone:
    - 공감적이고 도움이 되는 톤
    - 비난하지 않음 ("잘못 입력하셨습니다" ❌ → "입력값을 확인해주세요" ✅)
    - 긍정적 표현 ("실패했습니다" ❌ → "다시 시도해주세요" ✅)

  actionability:
    - 구체적인 해결 방법 제시
    - 다음 단계 명확히 안내
    - 필요시 관련 문서/도움말 링크 제공

  consistency:
    - 동일한 에러는 항상 동일한 메시지
    - 통일된 형식 및 구조
    - 일관된 용어 사용
```

---

## 시스템 아키텍처 (System Architecture)

### 전체 구조도

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Components, Pages, Business Logic)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ throw new AppError(code, context)
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Error Handling Middleware                  │
│  - Global Error Boundary (React)                        │
│  - API Error Interceptor (Axios)                        │
│  - Form Validation Error Handler                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ processError(error)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Error Message Manager                     │
│  - Error Code Lookup                                    │
│  - i18n Translation                                     │
│  - Context Interpolation                                │
│  - Severity Classification                              │
└────────────────────┬────────────────────────────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
┌──────────────┐           ┌─────────────┐
│ Toast (Info, │           │   Modal     │
│  Warning,    │           │  (Error,    │
│  Success)    │           │   Critical) │
└──────────────┘           └─────────────┘
       │                           │
       │                           │
       └───────────┬───────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Error Logger   │
         │  - Console      │
         │  - Sentry/API   │
         └─────────────────┘
```

### 컴포넌트 계층

```javascript
// 1. Error Definition
class AppError extends Error {
  constructor(code, context = {}, originalError = null) {
    super(code)
    this.code = code
    this.context = context
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

// 2. Error Manager
class ErrorManager {
  constructor(i18n, errorConfig) {
    this.i18n = i18n
    this.errorConfig = errorConfig
  }

  process(error) {
    const config = this.errorConfig[error.code] || this.errorConfig.UNKNOWN

    return {
      code: error.code,
      severity: config.severity,
      title: this.i18n.t(`errors.${error.code}.title`, error.context),
      message: this.i18n.t(`errors.${error.code}.message`, error.context),
      action: this.i18n.t(`errors.${error.code}.action`, error.context),
      displayType: config.displayType, // 'toast' | 'modal'
      timestamp: error.timestamp
    }
  }
}

// 3. Display Components
function ErrorDisplay({ error, onClose }) {
  const processedError = ErrorManager.process(error)

  if (processedError.displayType === 'toast') {
    return <Toast severity={processedError.severity} {...processedError} />
  }

  return <ErrorModal {...processedError} onClose={onClose} />
}
```

---

## 에러 코드 체계 (Error Code Taxonomy)

### 코드 구조

```
[CATEGORY]_[SUBCATEGORY]_[SPECIFIC]

예시:
- CALC_TAX_INVALID_AMOUNT: 계산 > 세금 > 잘못된 금액
- AUTH_LOGIN_EXPIRED: 인증 > 로그인 > 만료
- NET_API_TIMEOUT: 네트워크 > API > 타임아웃
```

### 카테고리별 에러 코드

#### 1. 계산 에러 (CALC_*)

```javascript
const CALCULATION_ERRORS = {
  // 입력값 검증 에러
  CALC_TAX_INVALID_AMOUNT: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '금액 입력 오류',
      en: 'Invalid Amount'
    },
    message: {
      ko: '{{field}} 금액이 유효하지 않습니다. 0원 이상의 숫자를 입력해주세요.',
      en: 'The {{field}} amount is invalid. Please enter a number greater than or equal to 0.'
    },
    action: {
      ko: '금액을 다시 확인하고 입력해주세요.',
      en: 'Please verify and re-enter the amount.'
    }
  },

  CALC_TAX_NEGATIVE_VALUE: {
    severity: 'error',
    displayType: 'toast',
    title: {
      ko: '음수 입력 불가',
      en: 'Negative Value Not Allowed'
    },
    message: {
      ko: '세금 계산에는 음수를 입력할 수 없습니다.',
      en: 'Tax calculations cannot accept negative values.'
    },
    action: {
      ko: '0 이상의 금액을 입력해주세요.',
      en: 'Please enter an amount of 0 or greater.'
    }
  },

  CALC_TAX_EXCEEDS_LIMIT: {
    severity: 'warning',
    displayType: 'modal',
    title: {
      ko: '최대 금액 초과',
      en: 'Maximum Amount Exceeded'
    },
    message: {
      ko: '입력하신 금액({{amount}})이 최대 계산 가능 금액({{limit}})을 초과합니다.',
      en: 'The entered amount ({{amount}}) exceeds the maximum calculable amount ({{limit}}).'
    },
    action: {
      ko: '{{limit}} 이하의 금액을 입력하시거나, 전문가 상담을 이용해주세요.',
      en: 'Please enter an amount below {{limit}} or consult with an expert.'
    }
  },

  // 계산 실패 에러
  CALC_TAX_COMPUTATION_FAILED: {
    severity: 'error',
    displayType: 'modal',
    title: {
      ko: '계산 실패',
      en: 'Calculation Failed'
    },
    message: {
      ko: '세금 계산 중 오류가 발생했습니다.',
      en: 'An error occurred during tax calculation.'
    },
    action: {
      ko: '입력값을 확인하고 다시 시도해주세요. 문제가 지속되면 고객센터로 문의해주세요.',
      en: 'Please verify your input and try again. If the problem persists, contact customer support.'
    }
  },

  CALC_DEDUCTION_NOT_APPLICABLE: {
    severity: 'info',
    displayType: 'toast',
    title: {
      ko: '공제 적용 불가',
      en: 'Deduction Not Applicable'
    },
    message: {
      ko: '선택하신 {{deductionType}} 공제는 현재 상황에 적용할 수 없습니다.',
      en: 'The selected {{deductionType}} deduction cannot be applied to your current situation.'
    },
    action: {
      ko: '공제 조건을 확인하시거나 다른 공제를 선택해주세요.',
      en: 'Please verify deduction requirements or select another deduction.'
    }
  }
}
```

#### 2. 네트워크 에러 (NET_*)

```javascript
const NETWORK_ERRORS = {
  NET_API_TIMEOUT: {
    severity: 'error',
    displayType: 'toast',
    title: {
      ko: '요청 시간 초과',
      en: 'Request Timeout'
    },
    message: {
      ko: '서버 응답이 지연되고 있습니다.',
      en: 'The server is taking longer than expected to respond.'
    },
    action: {
      ko: '잠시 후 다시 시도해주세요.',
      en: 'Please try again in a moment.'
    }
  },

  NET_API_SERVER_ERROR: {
    severity: 'critical',
    displayType: 'modal',
    title: {
      ko: '서버 오류',
      en: 'Server Error'
    },
    message: {
      ko: '서버에서 오류가 발생했습니다. (오류 코드: {{statusCode}})',
      en: 'A server error occurred. (Error code: {{statusCode}})'
    },
    action: {
      ko: '잠시 후 다시 시도해주시고, 문제가 지속되면 고객센터로 문의해주세요.',
      en: 'Please try again later. If the problem persists, contact customer support.'
    }
  },

  NET_NO_INTERNET: {
    severity: 'error',
    displayType: 'toast',
    title: {
      ko: '인터넷 연결 없음',
      en: 'No Internet Connection'
    },
    message: {
      ko: '인터넷 연결을 확인할 수 없습니다.',
      en: 'Unable to detect an internet connection.'
    },
    action: {
      ko: '네트워크 연결을 확인하고 다시 시도해주세요.',
      en: 'Please check your network connection and try again.'
    }
  }
}
```

#### 3. 인증 에러 (AUTH_*)

```javascript
const AUTH_ERRORS = {
  AUTH_LOGIN_FAILED: {
    severity: 'error',
    displayType: 'toast',
    title: {
      ko: '로그인 실패',
      en: 'Login Failed'
    },
    message: {
      ko: '이메일 또는 비밀번호가 올바르지 않습니다.',
      en: 'Incorrect email or password.'
    },
    action: {
      ko: '입력 정보를 확인하고 다시 시도해주세요.',
      en: 'Please verify your credentials and try again.'
    }
  },

  AUTH_SESSION_EXPIRED: {
    severity: 'warning',
    displayType: 'modal',
    title: {
      ko: '세션 만료',
      en: 'Session Expired'
    },
    message: {
      ko: '로그인 세션이 만료되었습니다.',
      en: 'Your login session has expired.'
    },
    action: {
      ko: '다시 로그인해주세요.',
      en: 'Please log in again.'
    },
    autoRedirect: '/login',
    redirectDelay: 3000
  },

  AUTH_PERMISSION_DENIED: {
    severity: 'error',
    displayType: 'modal',
    title: {
      ko: '권한 없음',
      en: 'Permission Denied'
    },
    message: {
      ko: '이 기능에 접근할 권한이 없습니다.',
      en: 'You do not have permission to access this feature.'
    },
    action: {
      ko: '관리자에게 문의하시거나 다른 계정으로 로그인해주세요.',
      en: 'Please contact an administrator or log in with a different account.'
    }
  }
}
```

#### 4. 데이터 에러 (DATA_*)

```javascript
const DATA_ERRORS = {
  DATA_NOT_FOUND: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '데이터 없음',
      en: 'Data Not Found'
    },
    message: {
      ko: '요청하신 {{resourceType}} 데이터를 찾을 수 없습니다.',
      en: 'The requested {{resourceType}} data could not be found.'
    },
    action: {
      ko: '검색 조건을 변경하거나 다시 시도해주세요.',
      en: 'Please modify your search criteria or try again.'
    }
  },

  DATA_VALIDATION_FAILED: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '입력값 검증 실패',
      en: 'Validation Failed'
    },
    message: {
      ko: '입력하신 정보가 올바르지 않습니다: {{fieldErrors}}',
      en: 'The information you entered is invalid: {{fieldErrors}}'
    },
    action: {
      ko: '표시된 필드를 확인하고 수정해주세요.',
      en: 'Please review and correct the highlighted fields.'
    }
  },

  DATA_DUPLICATE: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '중복 데이터',
      en: 'Duplicate Data'
    },
    message: {
      ko: '이미 동일한 {{resourceType}}이(가) 존재합니다.',
      en: 'A {{resourceType}} with the same information already exists.'
    },
    action: {
      ko: '다른 정보를 입력하시거나 기존 데이터를 수정해주세요.',
      en: 'Please enter different information or modify the existing data.'
    }
  }
}
```

#### 5. 파일 에러 (FILE_*)

```javascript
const FILE_ERRORS = {
  FILE_SIZE_EXCEEDED: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '파일 크기 초과',
      en: 'File Size Exceeded'
    },
    message: {
      ko: '파일 크기({{actualSize}})가 최대 허용 크기({{maxSize}})를 초과합니다.',
      en: 'File size ({{actualSize}}) exceeds the maximum allowed size ({{maxSize}}).'
    },
    action: {
      ko: '{{maxSize}} 이하의 파일을 선택해주세요.',
      en: 'Please select a file smaller than {{maxSize}}.'
    }
  },

  FILE_TYPE_INVALID: {
    severity: 'warning',
    displayType: 'toast',
    title: {
      ko: '지원하지 않는 파일 형식',
      en: 'Unsupported File Type'
    },
    message: {
      ko: '{{fileType}} 형식은 지원하지 않습니다.',
      en: 'The {{fileType}} format is not supported.'
    },
    action: {
      ko: '지원되는 형식: {{allowedTypes}}',
      en: 'Supported formats: {{allowedTypes}}'
    }
  },

  FILE_UPLOAD_FAILED: {
    severity: 'error',
    displayType: 'toast',
    title: {
      ko: '파일 업로드 실패',
      en: 'File Upload Failed'
    },
    message: {
      ko: '파일 업로드 중 오류가 발생했습니다.',
      en: 'An error occurred while uploading the file.'
    },
    action: {
      ko: '다시 시도해주시고, 문제가 지속되면 고객센터로 문의해주세요.',
      en: 'Please try again. If the problem persists, contact customer support.'
    }
  }
}
```

#### 6. 기타 에러 (MISC_*)

```javascript
const MISC_ERRORS = {
  UNKNOWN: {
    severity: 'error',
    displayType: 'modal',
    title: {
      ko: '예상치 못한 오류',
      en: 'Unexpected Error'
    },
    message: {
      ko: '예상치 못한 오류가 발생했습니다.',
      en: 'An unexpected error occurred.'
    },
    action: {
      ko: '페이지를 새로고침하거나 고객센터로 문의해주세요.',
      en: 'Please refresh the page or contact customer support.'
    }
  },

  FEATURE_NOT_AVAILABLE: {
    severity: 'info',
    displayType: 'toast',
    title: {
      ko: '기능 준비 중',
      en: 'Feature Coming Soon'
    },
    message: {
      ko: '이 기능은 현재 준비 중입니다.',
      en: 'This feature is currently under development.'
    },
    action: {
      ko: '곧 이용 가능할 예정입니다. 조금만 기다려주세요!',
      en: 'It will be available soon. Thank you for your patience!'
    }
  },

  MAINTENANCE_MODE: {
    severity: 'warning',
    displayType: 'modal',
    title: {
      ko: '시스템 점검 중',
      en: 'System Maintenance'
    },
    message: {
      ko: '현재 시스템 점검이 진행 중입니다. 점검 종료 시간: {{endTime}}',
      en: 'System maintenance is currently in progress. Expected completion: {{endTime}}'
    },
    action: {
      ko: '점검 종료 후 다시 이용해주세요.',
      en: 'Please try again after maintenance is complete.'
    }
  }
}
```

### 에러 코드 통합

```javascript
// src/constants/errorCodes.js
export const ERROR_CODES = {
  ...CALCULATION_ERRORS,
  ...NETWORK_ERRORS,
  ...AUTH_ERRORS,
  ...DATA_ERRORS,
  ...FILE_ERRORS,
  ...MISC_ERRORS
}

export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
}

export const ERROR_DISPLAY_TYPE = {
  TOAST: 'toast',
  MODAL: 'modal'
}
```

---

## UI 컴포넌트 설계 (UI Component Design)

### 1. Toast 컴포넌트

#### 디자인 사양

```
┌──────────────────────────────────────────┐
│  [Icon] Title                      [×]   │  ← Header (severity color)
├──────────────────────────────────────────┤
│  Message text (2-3 lines max)            │  ← Body
│  Action text if applicable               │
└──────────────────────────────────────────┘

위치: 화면 우측 상단
크기: 최대 400px 너비, 자동 높이
애니메이션: Slide in from right (300ms)
자동 닫힘: 5초 (info), 7초 (warning), 10초 (error)
다중 표시: 최대 3개, 스택 형식
```

#### React 컴포넌트 구현

```javascript
// src/components/ui/Toast.jsx
import React, { useEffect, useState } from 'react'
import { Alert, AlertTitle, AlertDescription, IconButton } from '@/components/ui'
import { Info, Warning, AlertCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-400',
    duration: 5000
  },
  warning: {
    icon: Warning,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    duration: 7000
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-400',
    duration: 10000
  },
  critical: {
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-red-950 dark:text-red-50',
    iconColor: 'text-red-700 dark:text-red-300',
    duration: null // Manual close only
  }
}

export function Toast({
  severity = 'info',
  title,
  message,
  action,
  onClose,
  autoClose = true
}) {
  const [isVisible, setIsVisible] = useState(false)
  const config = SEVERITY_CONFIG[severity]
  const Icon = config.icon

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!autoClose || !config.duration) return

    const timer = setTimeout(() => {
      handleClose()
    }, config.duration)

    return () => clearTimeout(timer)
  }, [autoClose, config.duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300) // Wait for animation
  }

  return (
    <Alert
      className={cn(
        'fixed right-4 top-20 z-50 w-full max-w-md',
        'shadow-lg border-2 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        config.textColor,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5', config.iconColor)} />

        <div className="flex-1 space-y-1">
          <AlertTitle className="font-semibold text-sm">
            {title}
          </AlertTitle>

          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>

          {action && (
            <AlertDescription className="text-sm font-medium mt-2">
              {action}
            </AlertDescription>
          )}
        </div>

        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className={cn('h-6 w-6 p-0', config.textColor)}
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    </Alert>
  )
}
```

#### Toast 컨테이너 (다중 Toast 관리)

```javascript
// src/components/ui/ToastContainer.jsx
import React from 'react'
import { Toast } from './Toast'
import { useToastStore } from '@/stores/toastStore'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed right-4 top-20 z-50 space-y-2 pointer-events-none">
      {toasts.slice(0, 3).map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 4}px)`,
            opacity: 1 - index * 0.1
          }}
          className="pointer-events-auto"
        >
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}
```

### 2. Error Modal 컴포넌트

#### 디자인 사양

```
┌────────────────────────────────────────┐
│                                    [×] │  ← Close button
│         [Icon]                         │  ← Large severity icon
│                                        │
│         Error Title                    │  ← Title (centered)
│                                        │
│  Detailed error message explaining     │  ← Message (2-5 lines)
│  what went wrong and how to fix it.    │
│                                        │
│  Specific action steps if needed.      │  ← Action (optional)
│                                        │
│  ┌──────────────┐  ┌──────────────┐  │  ← Action buttons
│  │   Cancel     │  │     Retry    │  │
│  └──────────────┘  └──────────────┘  │
│                                        │
└────────────────────────────────────────┘

크기: 최대 500px 너비, 자동 높이
위치: 화면 중앙
배경: 반투명 오버레이 (backdrop)
애니메이션: Scale + Fade in (200ms)
접근성: Focus trap, ESC 키로 닫기
```

#### React 컴포넌트 구현

```javascript
// src/components/ui/ErrorModal.jsx
import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button
} from '@/components/ui'
import { AlertCircle, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODAL_CONFIG = {
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  critical: {
    icon: XCircle,
    iconColor: 'text-red-700 dark:text-red-300',
    iconBgColor: 'bg-red-200 dark:bg-red-800/30'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  }
}

export function ErrorModal({
  isOpen,
  severity = 'error',
  code,
  title,
  message,
  action,
  onClose,
  onRetry,
  autoRedirect,
  redirectDelay = 3000
}) {
  const config = MODAL_CONFIG[severity] || MODAL_CONFIG.error
  const Icon = config.icon

  useEffect(() => {
    if (!isOpen || !autoRedirect) return

    const timer = setTimeout(() => {
      window.location.href = autoRedirect
    }, redirectDelay)

    return () => clearTimeout(timer)
  }, [isOpen, autoRedirect, redirectDelay])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto">
            <div className={cn(
              'rounded-full p-3',
              config.iconBgColor
            )}>
              <Icon className={cn('h-8 w-8', config.iconColor)} />
            </div>
          </div>

          <DialogTitle className="text-center text-xl">
            {title}
          </DialogTitle>

          {code && (
            <p className="text-center text-xs text-muted-foreground font-mono">
              Error Code: {code}
            </p>
          )}
        </DialogHeader>

        <DialogDescription className="text-center space-y-3">
          <p className="text-base">
            {message}
          </p>

          {action && (
            <p className="text-sm font-medium text-foreground">
              {action}
            </p>
          )}

          {autoRedirect && (
            <p className="text-sm text-muted-foreground">
              {redirectDelay / 1000}초 후 자동으로 이동합니다...
            </p>
          )}
        </DialogDescription>

        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            닫기
          </Button>

          {onRetry && (
            <Button
              onClick={() => {
                onClose()
                onRetry()
              }}
            >
              다시 시도
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 국제화 (Internationalization)

### i18n 설정

```javascript
// src/i18n/config.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import koErrors from './locales/ko/errors.json'
import enErrors from './locales/en/errors.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { errors: koErrors },
      en: { errors: enErrors }
    },
    fallbackLng: 'ko',
    defaultNS: 'errors',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

### 한국어 에러 메시지

```json
// src/i18n/locales/ko/errors.json
{
  "CALC_TAX_INVALID_AMOUNT": {
    "title": "금액 입력 오류",
    "message": "{{field}} 금액이 유효하지 않습니다. 0원 이상의 숫자를 입력해주세요.",
    "action": "금액을 다시 확인하고 입력해주세요."
  },
  "CALC_TAX_EXCEEDS_LIMIT": {
    "title": "최대 금액 초과",
    "message": "입력하신 금액({{amount}})이 최대 계산 가능 금액({{limit}})을 초과합니다.",
    "action": "{{limit}} 이하의 금액을 입력하시거나, 전문가 상담을 이용해주세요."
  },
  "NET_API_TIMEOUT": {
    "title": "요청 시간 초과",
    "message": "서버 응답이 지연되고 있습니다.",
    "action": "잠시 후 다시 시도해주세요."
  },
  "AUTH_SESSION_EXPIRED": {
    "title": "세션 만료",
    "message": "로그인 세션이 만료되었습니다.",
    "action": "다시 로그인해주세요."
  }
}
```

### 영어 에러 메시지

```json
// src/i18n/locales/en/errors.json
{
  "CALC_TAX_INVALID_AMOUNT": {
    "title": "Invalid Amount",
    "message": "The {{field}} amount is invalid. Please enter a number greater than or equal to 0.",
    "action": "Please verify and re-enter the amount."
  },
  "CALC_TAX_EXCEEDS_LIMIT": {
    "title": "Maximum Amount Exceeded",
    "message": "The entered amount ({{amount}}) exceeds the maximum calculable amount ({{limit}}).",
    "action": "Please enter an amount below {{limit}} or consult with an expert."
  },
  "NET_API_TIMEOUT": {
    "title": "Request Timeout",
    "message": "The server is taking longer than expected to respond.",
    "action": "Please try again in a moment."
  },
  "AUTH_SESSION_EXPIRED": {
    "title": "Session Expired",
    "message": "Your login session has expired.",
    "action": "Please log in again."
  }
}
```

---

## 사용 예시 (Usage Examples)

### 1. 계산 에러 처리

```javascript
// src/services/taxCalculator.js
import { AppError } from '@/lib/errors'
import { useToastStore } from '@/stores/toastStore'

export async function calculateInheritanceTax(amount) {
  // Validation
  if (amount < 0) {
    throw new AppError('CALC_TAX_NEGATIVE_VALUE')
  }

  if (amount > 100000000000) { // 1000억 초과
    throw new AppError('CALC_TAX_EXCEEDS_LIMIT', {
      amount: formatCurrency(amount),
      limit: formatCurrency(100000000000)
    })
  }

  try {
    const result = performCalculation(amount)
    return result
  } catch (error) {
    throw new AppError('CALC_TAX_COMPUTATION_FAILED', {}, error)
  }
}

// Usage in component
function TaxCalculator() {
  const { addToast } = useToastStore()
  const [amount, setAmount] = useState('')

  const handleCalculate = async () => {
    try {
      const result = await calculateInheritanceTax(parseFloat(amount))
      // Success handling...
    } catch (error) {
      if (error instanceof AppError) {
        addToast({
          severity: ERROR_CODES[error.code].severity,
          ...processError(error)
        })
      }
    }
  }

  return (
    <div>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button onClick={handleCalculate}>계산하기</Button>
    </div>
  )
}
```

### 2. API 에러 처리

```javascript
// src/lib/api/client.js
import axios from 'axios'
import { AppError } from '@/lib/errors'

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new AppError('NET_API_TIMEOUT')
    }

    if (!error.response) {
      throw new AppError('NET_NO_INTERNET')
    }

    const { status } = error.response

    if (status === 401) {
      throw new AppError('AUTH_SESSION_EXPIRED')
    }

    if (status === 403) {
      throw new AppError('AUTH_PERMISSION_DENIED')
    }

    if (status >= 500) {
      throw new AppError('NET_API_SERVER_ERROR', { statusCode: status })
    }

    throw new AppError('UNKNOWN', {}, error)
  }
)

export default apiClient
```

### 3. Form Validation 에러

```javascript
// src/components/forms/TaxForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AppError } from '@/lib/errors'

const taxFormSchema = z.object({
  amount: z.number().min(0, '0원 이상을 입력해주세요'),
  deductionType: z.string().min(1, '공제 유형을 선택해주세요')
})

function TaxForm() {
  const form = useForm({
    resolver: zodResolver(taxFormSchema)
  })

  const onSubmit = async (data) => {
    try {
      const result = await submitTaxCalculation(data)
      // Success...
    } catch (error) {
      if (error.code === 'DATA_VALIDATION_FAILED') {
        // Show field-specific errors
        Object.entries(error.context.fieldErrors).forEach(([field, message]) => {
          form.setError(field, { message })
        })
      }
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

---

## 구현 계획 (Implementation Plan)

### Phase 1: 핵심 인프라 구축 (3h)

**작업 항목:**
1. ✅ 에러 코드 정의 (`src/constants/errorCodes.js`)
2. ✅ AppError 클래스 구현 (`src/lib/errors.js`)
3. ✅ ErrorManager 구현 (`src/lib/errorManager.js`)
4. ✅ Toast Store (Zustand) 구현 (`src/stores/toastStore.js`)

### Phase 2: UI 컴포넌트 구현 (4h)

**작업 항목:**
1. Toast 컴포넌트 (`src/components/ui/Toast.jsx`)
2. ToastContainer 컴포넌트 (`src/components/ui/ToastContainer.jsx`)
3. ErrorModal 컴포넌트 (`src/components/ui/ErrorModal.jsx`)
4. 스타일링 및 애니메이션

### Phase 3: 국제화 통합 (2h)

**작업 항목:**
1. i18n 설정 (`src/i18n/config.js`)
2. 한국어 번역 파일 (`src/i18n/locales/ko/errors.json`)
3. 영어 번역 파일 (`src/i18n/locales/en/errors.json`)
4. 번역 컨텍스트 통합

### Phase 4: 통합 및 테스트 (1h)

**작업 항목:**
1. Global Error Boundary 구현
2. API 인터셉터 통합
3. 단위 테스트 작성
4. 접근성 테스트 (스크린 리더, 키보드 네비게이션)

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-10-18
**다음 검토 예정일**: 2025-11-18
**담당자**: AI Tax Consultant Development Team
