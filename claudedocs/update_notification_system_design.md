# 업데이트 알림 시스템 설계
# Update Notification System Design

**작성일**: 2025-10-18
**버전**: 1.0.0
**작성자**: AI Tax Consultant Development Team
**관련 작업**: M2.1.10.3

---

## 📋 목차 (Table of Contents)

1. [개요 (Overview)](#개요-overview)
2. [시스템 아키텍처 (System Architecture)](#시스템-아키텍처-system-architecture)
3. [변경 감지 로직 (Change Detection Logic)](#변경-감지-로직-change-detection-logic)
4. [알림 채널 (Notification Channels)](#알림-채널-notification-channels)
5. [모니터링 전략 (Monitoring Strategy)](#모니터링-전략-monitoring-strategy)
6. [에러 처리 (Error Handling)](#에러-처리-error-handling)
7. [구현 계획 (Implementation Plan)](#구현-계획-implementation-plan)
8. [비용 분석 (Cost Analysis)](#비용-분석-cost-analysis)

---

## 개요 (Overview)

### 목적 (Purpose)
국세청 웹사이트의 세율 정보 변경을 자동으로 감지하고, 개발자에게 알림을 전송하여 수동 업데이트를 신속하게 수행할 수 있도록 지원

### 배경 (Background)
- OpenAPI 부재: 국세청은 세율 정보에 대한 공식 API를 제공하지 않음
- 웹 크롤링 제약: 법적 리스크 및 높은 유지보수 비용으로 인해 비권장
- 수동 업데이트 필요: 연 1-2회 세법 개정 시 수동 업데이트 필수
- 변경 감지 필요: 세법 개정 시점을 놓치지 않기 위한 알림 시스템 필요

### 핵심 요구사항 (Key Requirements)
1. **비침습적**: 국세청 서버에 부담을 주지 않는 최소한의 모니터링
2. **법적 준수**: 저작권 정책 및 robots.txt 준수
3. **신뢰성**: 변경 사항을 놓치지 않는 안정적인 감지
4. **효율성**: 낮은 유지보수 비용 및 운영 비용
5. **확장성**: 향후 다른 법규 모니터링으로 확장 가능

---

## 시스템 아키텍처 (System Architecture)

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Scheduler)                │
│                   Weekly: Every Monday 09:00 KST             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Change Detection Script                    │
│                  (Node.js / Python / Bash)                   │
├─────────────────────────────────────────────────────────────┤
│  1. Fetch Target URLs (axios / fetch / curl)                │
│  2. Extract Tax Rate Content (cheerio / BeautifulSoup)      │
│  3. Generate Content Hash (MD5 / SHA-256)                   │
│  4. Compare with Previous Hash (Git / Storage)              │
│  5. Detect Changes (diff algorithm)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Change Detected?        │
              └─────────────┬─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼ YES                       ▼ NO
    ┌─────────────────┐         ┌───────────────┐
    │ Send Notification│         │ Exit Silently │
    └─────────────────┘         └───────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌────────────┐    ┌──────────────┐
│   Email    │    │    Slack     │
│ (SendGrid/ │    │ (Webhook API)│
│  Nodemailer)│    │              │
└────────────┘    └──────────────┘
```

### 구성 요소 (Components)

#### 1. 스케줄러 (Scheduler)
- **플랫폼**: GitHub Actions (무료)
- **실행 주기**: 주 1회 (월요일 09:00 KST)
- **Cron 표현식**: `0 0 * * 1` (UTC 기준: 일요일 15:00)
- **대안**: AWS EventBridge, Vercel Cron Jobs

#### 2. 변경 감지 스크립트 (Change Detection Script)
- **언어**: Node.js (프로젝트와 동일 스택)
- **주요 기능**:
  - URL 페칭 (Rate Limiting 준수)
  - HTML 파싱 및 세율 정보 추출
  - 컨텐츠 해시 생성 및 비교
  - 변경 사항 diff 생성

#### 3. 저장소 (Storage)
- **방식**: Git 기반 (무료, 버전 관리 자동)
- **저장 파일**: `claudedocs/monitoring/nts_snapshots/YYYY-MM-DD.json`
- **컨텐츠**:
  ```json
  {
    "timestamp": "2025-10-18T09:00:00Z",
    "urls": {
      "inheritance_tax": {
        "url": "https://www.nts.go.kr/...",
        "hash": "a1b2c3d4e5f6...",
        "content": "상속세율: 10% ~ 50%..."
      },
      "gift_tax": { ... },
      "capital_gains_tax": { ... }
    }
  }
  ```

#### 4. 알림 시스템 (Notification System)
- **채널 1**: Email (개발팀 전체)
- **채널 2**: Slack (실시간 알림)
- **채널 3**: GitHub Issue 자동 생성 (작업 추적)

---

## 변경 감지 로직 (Change Detection Logic)

### 모니터링 대상 URL

```javascript
const TARGET_URLS = {
  inheritance_tax: {
    url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2228&cntntsId=7703',
    name: '상속세',
    selectors: [
      '.table_col tbody tr', // 세율표
      '.txt_box p' // 설명 텍스트
    ]
  },
  gift_tax: {
    url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2230&cntntsId=7705',
    name: '증여세',
    selectors: [
      '.table_col tbody tr',
      '.txt_box p'
    ]
  },
  capital_gains_tax: {
    url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2296&cntntsId=7771',
    name: '양도소득세',
    selectors: [
      '.table_col tbody tr',
      '.txt_box p'
    ]
  },
  deductions: {
    url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2229&cntntsId=7704',
    name: '공제제도',
    selectors: [
      '.table_col tbody tr',
      '.txt_box p'
    ]
  }
}
```

### 해시 생성 알고리즘

```javascript
const crypto = require('crypto')
const cheerio = require('cheerio')

async function generateContentHash(url, selectors) {
  // 1. Fetch HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AI-Tax-Consultant-Monitor/1.0 (monitoring only, no scraping)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // 2. Extract relevant content only
  let extractedContent = ''
  selectors.forEach(selector => {
    $(selector).each((i, elem) => {
      const text = $(elem).text().trim()
      // Normalize whitespace
      const normalized = text.replace(/\s+/g, ' ')
      extractedContent += normalized + '\n'
    })
  })

  // 3. Generate hash
  const hash = crypto
    .createHash('sha256')
    .update(extractedContent, 'utf-8')
    .digest('hex')

  return {
    hash,
    content: extractedContent,
    timestamp: new Date().toISOString()
  }
}
```

### 변경 감지 로직

```javascript
async function detectChanges() {
  const results = []

  for (const [key, config] of Object.entries(TARGET_URLS)) {
    try {
      // Generate current hash
      const current = await generateContentHash(config.url, config.selectors)

      // Load previous hash
      const previous = await loadPreviousSnapshot(key)

      // Compare
      if (!previous) {
        // First run - save baseline
        await saveSnapshot(key, current)
        results.push({
          tax_type: config.name,
          status: 'baseline_created',
          message: '최초 스냅샷 생성'
        })
      } else if (current.hash !== previous.hash) {
        // Change detected
        const diff = generateDiff(previous.content, current.content)
        await saveSnapshot(key, current)
        results.push({
          tax_type: config.name,
          status: 'changed',
          message: '변경 감지',
          diff,
          previous_hash: previous.hash,
          current_hash: current.hash
        })
      } else {
        // No change
        results.push({
          tax_type: config.name,
          status: 'unchanged',
          message: '변경 없음'
        })
      }

      // Rate limiting: wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      results.push({
        tax_type: config.name,
        status: 'error',
        message: error.message
      })
    }
  }

  return results
}
```

### Diff 생성

```javascript
const diff = require('diff')

function generateDiff(oldContent, newContent) {
  const changes = diff.diffLines(oldContent, newContent)

  let diffText = ''
  changes.forEach(part => {
    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '
    const lines = part.value.split('\n').filter(line => line.trim())
    lines.forEach(line => {
      diffText += prefix + line + '\n'
    })
  })

  return diffText
}
```

---

## 알림 채널 (Notification Channels)

### 1. Email 알림 (Primary Channel)

#### 설정
- **서비스**: Nodemailer + Gmail SMTP (무료)
- **발신자**: noreply@aitaxconsultant.com
- **수신자**: dev-team@aitaxconsultant.com

#### 이메일 템플릿

```javascript
function generateEmailHTML(results) {
  const changes = results.filter(r => r.status === 'changed')
  const errors = results.filter(r => r.status === 'error')

  if (changes.length === 0 && errors.length === 0) {
    return null // No notification needed
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', sans-serif; }
    .header { background: #1976D2; color: white; padding: 20px; }
    .content { padding: 20px; }
    .change { background: #FFF9C4; padding: 15px; margin: 10px 0; border-left: 4px solid #FBC02D; }
    .error { background: #FFCDD2; padding: 15px; margin: 10px 0; border-left: 4px solid #D32F2F; }
    .diff { background: #F5F5F5; padding: 10px; font-family: monospace; white-space: pre-wrap; }
    .added { color: green; }
    .removed { color: red; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 국세청 세율 정보 변경 감지</h1>
    <p>탐지 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
  </div>

  <div class="content">
    <h2>📊 변경 감지 결과</h2>

    ${changes.length > 0 ? `
      <h3>⚠️ 변경된 세목 (${changes.length}개)</h3>
      ${changes.map(change => `
        <div class="change">
          <h4>${change.tax_type}</h4>
          <p><strong>이전 해시:</strong> <code>${change.previous_hash.slice(0, 16)}...</code></p>
          <p><strong>현재 해시:</strong> <code>${change.current_hash.slice(0, 16)}...</code></p>
          <p><strong>변경 내용:</strong></p>
          <div class="diff">${change.diff}</div>
          <p><strong>조치 필요:</strong></p>
          <ol>
            <li>변경 내용 확인</li>
            <li><code>src/constants/taxRates.js</code> 또는 <code>deductions.js</code> 업데이트</li>
            <li>단위 테스트 실행 및 검증</li>
            <li>Git commit & push</li>
          </ol>
        </div>
      `).join('')}
    ` : ''}

    ${errors.length > 0 ? `
      <h3>❌ 오류 발생 (${errors.length}개)</h3>
      ${errors.map(error => `
        <div class="error">
          <h4>${error.tax_type}</h4>
          <p>${error.message}</p>
        </div>
      `).join('')}
    ` : ''}

    <hr>
    <p style="color: #666;">
      이 알림은 AI Tax Consultant 업데이트 모니터링 시스템에서 자동으로 발송되었습니다.<br>
      GitHub Actions: <a href="https://github.com/your-org/aitaxconsultant/actions">확인하기</a>
    </p>
  </div>
</body>
</html>
  `
}

async function sendEmailNotification(results) {
  const nodemailer = require('nodemailer')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  const htmlContent = generateEmailHTML(results)

  if (!htmlContent) {
    console.log('No changes detected. Email not sent.')
    return
  }

  await transporter.sendMail({
    from: '"AI Tax Consultant Monitor" <noreply@aitaxconsultant.com>',
    to: 'dev-team@aitaxconsultant.com',
    subject: '🚨 [긴급] 국세청 세율 정보 변경 감지',
    html: htmlContent
  })

  console.log('Email notification sent successfully')
}
```

### 2. Slack 알림 (Secondary Channel)

#### 설정
- **Webhook URL**: Slack Incoming Webhook
- **채널**: `#tax-rate-updates`

#### Slack 메시지 템플릿

```javascript
async function sendSlackNotification(results) {
  const changes = results.filter(r => r.status === 'changed')
  const errors = results.filter(r => r.status === 'error')

  if (changes.length === 0 && errors.length === 0) {
    return
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 국세청 세율 정보 변경 감지',
        emoji: true
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*탐지 시각:*\n${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
        },
        {
          type: 'mrkdwn',
          text: `*변경 항목:*\n${changes.length}개`
        }
      ]
    },
    {
      type: 'divider'
    }
  ]

  // Add change details
  changes.forEach(change => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${change.tax_type}* 변경 감지\n\`\`\`${change.diff.slice(0, 500)}...\`\`\``
      }
    })
  })

  // Add action buttons
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'GitHub Actions 확인',
          emoji: true
        },
        url: 'https://github.com/your-org/aitaxconsultant/actions'
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '국세청 웹사이트',
          emoji: true
        },
        url: 'https://www.nts.go.kr'
      }
    ]
  })

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks })
  })

  console.log('Slack notification sent successfully')
}
```

### 3. GitHub Issue 자동 생성

```javascript
async function createGitHubIssue(results) {
  const changes = results.filter(r => r.status === 'changed')

  if (changes.length === 0) {
    return
  }

  const { Octokit } = require('@octokit/rest')
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  const issueBody = `
## 📊 변경 감지 요약

**탐지 시각**: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
**변경 항목**: ${changes.length}개

${changes.map(change => `
### ${change.tax_type}

**변경 내용:**
\`\`\`diff
${change.diff}
\`\`\`

**조치 체크리스트:**
- [ ] 변경 내용 확인 및 분석
- [ ] \`src/constants/taxRates.js\` 또는 \`deductions.js\` 업데이트
- [ ] 단위 테스트 실행 (\`npm test -- src/constants/__tests__/\`)
- [ ] 테스트 커버리지 확인 (>90%)
- [ ] Git commit & push
- [ ] 프로덕션 배포

`).join('\n---\n')}

## 🔗 참고 링크
- [GitHub Actions 실행 결과](https://github.com/your-org/aitaxconsultant/actions)
- [국세청 홈페이지](https://www.nts.go.kr)
  `

  await octokit.issues.create({
    owner: 'your-org',
    repo: 'aitaxconsultant',
    title: `🚨 국세청 세율 정보 변경 감지 (${new Date().toISOString().split('T')[0]})`,
    body: issueBody,
    labels: ['tax-update', 'urgent', 'automated']
  })

  console.log('GitHub issue created successfully')
}
```

---

## 모니터링 전략 (Monitoring Strategy)

### 실행 주기

#### 권장: 주 1회 (월요일 09:00 KST)
- **근거**:
  - 세법 개정은 연 1-2회 발생 (주로 1월, 7월)
  - 국세청 웹사이트 업데이트는 개정 후 1-2주 이내
  - 주 1회 모니터링으로 충분히 감지 가능
- **장점**:
  - 서버 부담 최소화
  - 법적 리스크 최소화
  - 운영 비용 최소화 (GitHub Actions 무료 한도 내)

#### 대안 1: 월 2회 (1일, 15일)
- **근거**: 세법 개정 시기(1월, 7월) 전후 집중 모니터링
- **장점**: 모니터링 빈도 감소로 더 낮은 부담

#### 대안 2: 세법 개정 시즌 집중 (12월, 6월)
- **근거**: 개정 예고 및 시행 시기에만 집중 모니터링
- **장점**: 최소한의 리소스로 최대 효과

### GitHub Actions Workflow

```yaml
# .github/workflows/tax-rate-monitor.yml
name: Tax Rate Monitor

on:
  schedule:
    # Every Monday at 00:00 UTC (09:00 KST)
    - cron: '0 0 * * 1'
  workflow_dispatch: # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for snapshot comparison

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd scripts/monitoring
          npm install

      - name: Run change detection
        id: detect
        run: |
          cd scripts/monitoring
          node detect-changes.js
        env:
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASSWORD: ${{ secrets.EMAIL_PASSWORD }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit snapshot updates
        if: steps.detect.outputs.changes_detected == 'true'
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add claudedocs/monitoring/nts_snapshots/
          git commit -m "chore: update NTS tax rate snapshots [skip ci]"
          git push

      - name: Upload monitoring logs
        uses: actions/upload-artifact@v4
        with:
          name: monitoring-logs
          path: scripts/monitoring/logs/
          retention-days: 30
```

### Rate Limiting 준수

```javascript
const RATE_LIMIT_CONFIG = {
  minDelay: 2000,        // 최소 2초 대기
  maxDelay: 3000,        // 최대 3초 대기
  maxRequestsPerHour: 4, // 시간당 최대 4회 (4개 URL)
  respectRobotsTxt: true,
  userAgent: 'AI-Tax-Consultant-Monitor/1.0 (monitoring only, no scraping)'
}

async function fetchWithRateLimit(url) {
  // Random delay between min and max
  const delay = RATE_LIMIT_CONFIG.minDelay +
                Math.random() * (RATE_LIMIT_CONFIG.maxDelay - RATE_LIMIT_CONFIG.minDelay)

  await new Promise(resolve => setTimeout(resolve, delay))

  return fetch(url, {
    headers: {
      'User-Agent': RATE_LIMIT_CONFIG.userAgent,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9'
    }
  })
}
```

---

## 에러 처리 (Error Handling)

### 에러 분류 및 대응

```javascript
class MonitoringError extends Error {
  constructor(type, message, details = {}) {
    super(message)
    this.type = type
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

async function handleError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: error.type || 'unknown',
    message: error.message,
    context,
    stack: error.stack
  }

  // Log to file
  await fs.appendFile(
    'scripts/monitoring/logs/errors.log',
    JSON.stringify(errorLog) + '\n'
  )

  // Send error notification
  if (isCriticalError(error)) {
    await sendErrorNotification(error, context)
  }

  return {
    status: 'error',
    message: error.message,
    recoverable: isRecoverableError(error)
  }
}

function isCriticalError(error) {
  const criticalTypes = [
    'AUTH_FAILURE',
    'ALL_URLS_FAILED',
    'STORAGE_FAILURE'
  ]
  return criticalTypes.includes(error.type)
}

function isRecoverableError(error) {
  const recoverableTypes = [
    'NETWORK_TIMEOUT',
    'HTTP_ERROR',
    'PARSE_ERROR'
  ]
  return recoverableTypes.includes(error.type)
}
```

### 재시도 로직

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithRateLimit(url)

      if (!response.ok) {
        throw new MonitoringError(
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          { url, status: response.status, attempt }
        )
      }

      return response

    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message)

      if (attempt === maxRetries) {
        throw error
      }

      // Exponential backoff: 2s, 4s, 8s
      const backoffDelay = 2000 * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }
}
```

### 폴백 전략

```javascript
async function monitorWithFallback() {
  try {
    // Primary: Full monitoring
    return await detectChanges()

  } catch (error) {
    console.error('Primary monitoring failed:', error)

    try {
      // Fallback: Partial monitoring (critical URLs only)
      return await detectChangesCriticalOnly()

    } catch (fallbackError) {
      console.error('Fallback monitoring failed:', fallbackError)

      // Last resort: Manual notification
      await sendManualCheckNotification([error, fallbackError])

      return {
        status: 'failed',
        errors: [error, fallbackError],
        recommendation: 'Manual check required'
      }
    }
  }
}
```

---

## 구현 계획 (Implementation Plan)

### Phase 1: 기본 인프라 구축 (2h)

**작업 항목:**
1. ✅ 프로젝트 디렉토리 구조 생성
   ```
   scripts/
   └── monitoring/
       ├── detect-changes.js
       ├── utils/
       │   ├── fetcher.js
       │   ├── hasher.js
       │   └── notifier.js
       ├── config/
       │   └── targets.js
       ├── logs/
       └── package.json

   claudedocs/
   └── monitoring/
       └── nts_snapshots/
   ```

2. ✅ 의존성 설치
   ```json
   {
     "dependencies": {
       "cheerio": "^1.0.0-rc.12",
       "nodemailer": "^6.9.7",
       "diff": "^5.1.0",
       "@octokit/rest": "^20.0.2"
     }
   }
   ```

3. ✅ 기본 설정 파일 작성

### Phase 2: 변경 감지 로직 구현 (1h)

**작업 항목:**
1. URL 페칭 및 해시 생성 함수
2. 스냅샷 저장/로드 함수
3. Diff 생성 함수
4. 메인 감지 로직

### Phase 3: 알림 시스템 구현 (0.5h)

**작업 항목:**
1. Email 알림 템플릿 및 전송 함수
2. Slack 알림 함수
3. GitHub Issue 생성 함수

### Phase 4: GitHub Actions 통합 (0.5h)

**작업 항목:**
1. Workflow YAML 파일 작성
2. Secrets 설정 (EMAIL, SLACK_WEBHOOK, GITHUB_TOKEN)
3. 수동 트리거 테스트

---

## 비용 분석 (Cost Analysis)

### 운영 비용

| 항목 | 비용 | 근거 |
|------|------|------|
| **GitHub Actions** | $0/월 | 무료 플랜 (월 2,000분) |
| **Email (Gmail SMTP)** | $0/월 | 무료 (일 500통 제한) |
| **Slack Webhook** | $0/월 | 무료 |
| **GitHub Storage** | $0/월 | 스냅샷 파일 크기 < 1MB |
| **총 운영 비용** | **$0/월** | |

### 개발 비용

| Phase | 작업 시간 | 내용 |
|-------|----------|------|
| Phase 1 | 2h | 인프라 구축 |
| Phase 2 | 1h | 변경 감지 로직 |
| Phase 3 | 0.5h | 알림 시스템 |
| Phase 4 | 0.5h | GitHub Actions |
| **총 개발 시간** | **4h** | |

### 유지보수 비용 (연간)

| 항목 | 시간 | 빈도 | 연간 총 시간 |
|------|------|------|-------------|
| 모니터링 결과 확인 | 0.1h | 주 1회 | 5.2h |
| 오류 대응 | 0.5h | 월 1회 | 6h |
| 시스템 업데이트 | 1h | 분기 1회 | 4h |
| **총 유지보수 시간** | | | **15.2h/년** |

### 비교: 웹 크롤링 vs 알림 시스템

| 항목 | 웹 크롤링 | 알림 시스템 | 절감 |
|------|----------|------------|------|
| 초기 개발 | 10-14h | 4h | **71% ↓** |
| 연간 유지보수 | 55-63h | 15h | **76% ↓** |
| 운영 비용 | $0/월 | $0/월 | 동일 |
| 법적 리스크 | 🟡 중간 | 🟢 없음 | **안전** |
| 총 1년 비용 | 65-77h | 19h | **75% ↓** |

---

## 결론 (Conclusion)

### 권장 사항

✅ **업데이트 알림 시스템 도입 권장**

**근거:**
1. **법적 안전성**: 저작권 정책 위반 리스크 없음
2. **비용 효율성**: 초기 4h, 연간 15h로 웹 크롤링 대비 75% 절감
3. **운영 용이성**: GitHub Actions 무료 플랜 활용, 완전 자동화
4. **신뢰성**: 주 1회 모니터링으로 세법 개정 시점 놓치지 않음
5. **확장성**: 향후 다른 법규 모니터링으로 쉽게 확장 가능

### 향후 계획

1. **단기 (Phase 1-2)**: 기본 시스템 구축 및 테스트 (2-3주)
2. **중기 (Phase 3-4)**: 알림 채널 확장 및 안정화 (1-2개월)
3. **장기**:
   - 다른 법규 모니터링 추가 (부동산 세법, 법인세법 등)
   - AI 기반 변경 내용 자동 분석 및 코드 업데이트 제안
   - 세법 개정 예고 시스템 통합

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-10-18
**다음 검토 예정일**: 2025-11-18
**담당자**: AI Tax Consultant Development Team
