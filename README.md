# 🎨 Block Vibe Coding

AI 기반 블록 코딩 플랫폼 - 블록만 배치하고 설명하면 AI가 코드를 생성합니다!

## ✨ 주요 기능

- **🤖 AI 코드 생성**: Hugging Face API를 활용한 자동 코드 생성
- **🎯 7가지 블록 타입**: 동작, 조건, 반복, 함수, 이벤트, UI, 데이터 블록
- **🖱️ 드래그 앤 드롭**: 직관적인 블록 배치 시스템
- **▶️ 즉시 실행**: 팝업 브라우저에서 실시간 코드 실행
- **💾 파일 내보내기**: HTML, JavaScript, JSON 형식 지원
- **🎨 모던 UI**: 다크 테마의 세련된 인터페이스

## 🚀 시작하기

### 1. 환경변수 설정 (Cloudflare Pages)

Cloudflare Pages에 배포 후 환경변수를 설정해야 합니다:

1. [Hugging Face](https://huggingface.co/) 회원가입
2. Settings → Access Tokens에서 새 토큰 생성
3. Cloudflare Pages 대시보드 → 프로젝트 설정 → Environment variables
4. 변수 추가:
   - **변수명**: `HF_TOKEN`
   - **값**: Hugging Face API 토큰
   - **환경**: Production 및 Preview 모두 체크

### 2. 블록 추가 및 코드 생성

1. 왼쪽 팔레트에서 원하는 블록을 드래그
2. 작업 공간에 드롭
3. 블록에 원하는 동작을 한글로 설명
4. "✨ AI 코드 생성" 버튼 클릭

### 3. 실행 및 내보내기

- **실행**: "▶ 실행" 버튼으로 새 창에서 결과 확인
- **내보내기**: "💾 내보내기" 버튼으로 파일 저장

## 📦 블록 타입

| 블록 | 설명 | 예시 |
|------|------|------|
| 🔵 동작 블록 | 기본 동작 수행 | "Hello World를 알림창으로 표시해줘" |
| 🟠 조건 블록 | if-else 조건문 | "숫자가 10보다 크면 알림을 표시해줘" |
| 🟣 반복 블록 | for, while 반복문 | "1부터 10까지 숫자를 콘솔에 출력해줘" |
| 🔴 함수 블록 | 재사용 가능한 함수 | "두 숫자를 더하는 함수를 만들어줘" |
| 🟢 이벤트 블록 | 이벤트 핸들러 | "버튼을 클릭하면 배경색이 바뀌게 해줘" |
| 🔵 UI 블록 | HTML 요소 생성 | "빨간색 버튼을 화면에 추가해줘" |
| 🟦 데이터 블록 | 데이터 처리 | "사용자 정보를 담은 객체를 만들어줘" |

## ⌨️ 키보드 단축키

- `Ctrl/Cmd + Enter`: 코드 실행
- `Ctrl/Cmd + S`: 프로젝트 내보내기

## 🛠️ 기술 스택

- **프론트엔드**: 바닐라 JavaScript (순수 JS)
- **백엔드**: Cloudflare Pages Functions (서버리스)
- **스타일링**: CSS3 (Gradient, Flexbox, Grid)
- **AI 모델**: Qwen3-Coder-480B-A35B-Instruct (Hugging Face)
- **배포**: Cloudflare Pages

## 📂 프로젝트 구조

```
Block Vibe Coding/
├── index.html              # 메인 HTML
├── functions/
│   └── api/
│       └── generate.js     # Cloudflare Pages Function (AI API)
├── styles/
│   └── main.css           # 스타일시트
├── js/
│   ├── ai.js              # AI 코드 생성 클라이언트
│   ├── blocks.js          # 블록 시스템
│   ├── executor.js        # 코드 실행
│   ├── exporter.js        # 파일 내보내기
│   └── app.js             # 메인 앱 로직
└── README.md              # 문서
```

## 🌐 Cloudflare Pages 배포

### 1단계: GitHub 연결

1. GitHub 저장소에 코드 푸시
2. [Cloudflare Pages](https://pages.cloudflare.com/)에 로그인
3. "Create a project" 클릭
4. GitHub 저장소 연결

### 2단계: Build 설정

5. Build settings:
   - **Framework preset**: None
   - **Build command**: (비워두기)
   - **Build output directory**: `/`
6. "Save and Deploy" 클릭

### 3단계: 환경변수 설정 (중요!)

7. 배포 완료 후 프로젝트 설정으로 이동
8. **Settings** → **Environment variables** 클릭
9. 환경변수 추가:
   - **Variable name**: `HF_TOKEN`
   - **Value**: [여기에 Hugging Face API 토큰 입력]
   - **Production** 및 **Preview** 체크
10. "Save" 클릭
11. **Deployments** 탭에서 "Retry deployment" 클릭

### 로컬 개발 (선택사항)

로컬에서 테스트하려면:

```bash
# Wrangler 설치 (Cloudflare CLI)
npm install -g wrangler

# 로컬 환경변수 설정
echo "HF_TOKEN=your_token_here" > .dev.vars

# 로컬 서버 실행
wrangler pages dev .
```

## 💡 사용 예시

### 간단한 웹사이트 만들기

1. **UI 블록**: "제목 'My Website'와 소개 문구를 화면에 표시해줘"
2. **UI 블록**: "클릭하면 반응하는 파란색 버튼을 추가해줘"
3. **이벤트 블록**: "버튼 클릭 시 축하 메시지를 알림으로 표시해줘"
4. **실행** 버튼 클릭!

### 계산기 만들기

1. **UI 블록**: "입력 필드 2개와 더하기 버튼 만들어줘"
2. **함수 블록**: "두 숫자를 더하는 함수 만들어줘"
3. **이벤트 블록**: "버튼 클릭 시 입력값을 더해서 결과 표시해줘"
4. **실행** 버튼 클릭!

## 🔒 보안

- API 키는 Cloudflare Pages 환경변수에 안전하게 저장됩니다
- 클라이언트에 API 키가 노출되지 않습니다
- Cloudflare Pages Functions을 통한 서버 사이드 API 호출
- CORS 및 보안 헤더가 자동으로 적용됩니다

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📝 라이선스

MIT License

## 🎯 로드맵

- [ ] 블록 템플릿 저장/불러오기
- [ ] 다크/라이트 테마 전환
- [ ] 블록 복사/붙여넣기
- [ ] 실행 결과 미리보기
- [ ] 다양한 AI 모델 선택
- [ ] 협업 기능

---

Made with ❤️ by Block Vibe Coding Team

