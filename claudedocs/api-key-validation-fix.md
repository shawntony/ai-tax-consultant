# API 키 검증 CORS 문제 해결

## 문제 상황

브라우저에서 직접 외부 API (Anthropic, OpenAI, Perplexity)에 요청을 보낼 때, CORS (Cross-Origin Resource Sharing) 정책에 의해 차단되어 "Failed to fetch" 오류가 발생했습니다.

## 해결 방법

**Express 프록시 서버**를 생성하여 브라우저 → 프록시 서버 → 외부 API 구조로 변경했습니다.

### 변경된 파일들

1. **server.js** (새로 생성)
   - Express 프록시 서버
   - 포트 3001에서 실행
   - `/api/validate/claude`, `/api/validate/chatgpt`, `/api/validate/perplexity` 엔드포인트 제공

2. **src/utils/apiKeyValidator.js** (수정)
   - 직접 외부 API 호출 → 프록시 서버 호출로 변경
   - 모든 검증 함수가 `http://localhost:3001/api/validate/*` 사용

3. **package.json** (수정)
   - `npm run server` 스크립트 추가
   - `express`, `cors`, `dotenv` 의존성 추가

## 사용 방법

### 개발 환경 실행

**2개의 터미널**이 필요합니다:

**터미널 1 - 프록시 서버**
```bash
npm run server
```
출력:
```
🚀 Proxy server running on http://localhost:3001
```

**터미널 2 - React 개발 서버**
```bash
npm start
```
출력:
```
webpack compiled successfully
```

### API 키 검증 테스트

1. 브라우저에서 http://localhost:3000 접속
2. 오른쪽 상단 설정 아이콘(⚙️) 클릭
3. Claude API 키 입력 (예: `sk-ant-...`)
4. "키 검증" 버튼 클릭

**성공 시:**
```
✅ Claude API 키가 유효합니다
```

**실패 시:**
```
❌ API 키가 유효하지 않습니다 (401 Unauthorized)
```

**프록시 서버 미실행 시:**
```
❌ 프록시 서버 연결 오류: Failed to fetch. 프록시 서버가 실행 중인지 확인하세요.
```

## 프록시 서버 엔드포인트

### 1. Claude API 검증
- **URL**: `POST http://localhost:3001/api/validate/claude`
- **Request Body**:
  ```json
  {
    "apiKey": "sk-ant-..."
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "message": "Claude API 키가 유효합니다"
  }
  ```

### 2. ChatGPT API 검증
- **URL**: `POST http://localhost:3001/api/validate/chatgpt`
- **Request Body**:
  ```json
  {
    "apiKey": "sk-..."
  }
  ```

### 3. Perplexity API 검증
- **URL**: `POST http://localhost:3001/api/validate/perplexity`
- **Request Body**:
  ```json
  {
    "apiKey": "pplx-..."
  }
  ```

### 4. Health Check
- **URL**: `GET http://localhost:3001/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Proxy server is running"
  }
  ```

## 프로덕션 배포 시 주의사항

### Vercel/Netlify 배포
프로덕션 환경에서는 **Serverless Functions**를 사용해야 합니다:

**Vercel 예시** (`/api/validate/claude.js`):
```javascript
export default async function handler(req, res) {
  const { apiKey } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    })
  });

  const result = await response.json();
  res.status(200).json(result);
}
```

### 환경 변수
프로덕션에서는 `.env` 파일 대신 호스팅 플랫폼의 환경 변수 설정을 사용하세요.

## 보안 고려사항

1. **API 키 전송**: API 키는 HTTPS를 통해서만 전송되어야 합니다
2. **Rate Limiting**: 프록시 서버에 요청 제한을 추가하는 것이 좋습니다
3. **로깅**: 프로덕션에서는 API 키를 로그에 남기지 않도록 주의하세요

## 문제 해결

### 프록시 서버가 시작되지 않음
```bash
# 포트 3001이 이미 사용 중인지 확인
netstat -ano | findstr :3001

# 해당 프로세스 종료 후 재시작
npm run server
```

### React 앱에서 프록시 서버 연결 실패
1. 프록시 서버가 실행 중인지 확인: `http://localhost:3001/health`
2. CORS 오류가 여전히 발생하면 브라우저 캐시 삭제
3. 두 서버 모두 재시작

## 개선 사항 (향후)

1. **동시 실행 스크립트**: `concurrently` 패키지로 한 번에 2개 서버 실행
2. **환경별 설정**: 개발/프로덕션 환경 분리
3. **Rate Limiting**: `express-rate-limit` 추가
4. **에러 로깅**: `winston` 또는 `pino` 로깅 라이브러리 추가
