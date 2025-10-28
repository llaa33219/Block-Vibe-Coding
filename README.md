# 🧱 Block Vibe Coding

AI 기반 비주얼 블록 코딩 플랫폼입니다. Blockly를 커스터마이징하여 사용자가 자연어로 블록을 정의하면 AI가 자동으로 코드를 생성합니다.

## ✨ 주요 기능

- 🤖 **AI 코드 생성**: HuggingFace API를 사용하여 블록 설명을 실제 코드로 변환
- 🎨 **커스텀 블록**: 사용자가 직접 블록을 만들고 색상, 타입 등을 설정
- ▶️ **실시간 실행**: 생성된 코드를 브라우저 팝업에서 즉시 실행
- 💾 **파일 내보내기**: 완성된 프로젝트를 HTML 파일로 내보내기
- 🎯 **직관적인 UI**: 모던하고 사용하기 쉬운 인터페이스

## 🚀 시작하기

### 필수 요구사항

- Node.js 16 이상
- HuggingFace API 토큰

### 설치

1. 저장소 클론 또는 다운로드

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정:
```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` 파일을 열고 HuggingFace 토큰을 입력:
```
HF_TOKEN=your_actual_token_here
```

### 로컬 개발

```bash
npm run dev
```

브라우저에서 `http://localhost:8788` 접속

### 배포

Cloudflare Pages에 배포:

1. Cloudflare 계정 로그인
2. Pages 프로젝트 생성
3. 환경 변수 설정 (HF_TOKEN)
4. 배포:

```bash
npm run deploy
```

또는 GitHub 연동으로 자동 배포 가능

## 📖 사용 방법

### 1. 새 블록 만들기 (초간단!)

1. 왼쪽 사이드바의 텍스트 입력창에 원하는 블록 설명 입력
   - 예: "버튼 만들기"
   - 예: "알림창 띄우기"
   - 예: "랜덤 숫자 생성하기"
2. "🤖 AI로 생성" 버튼 클릭 (또는 Ctrl+Enter)
3. AI가 자동으로 블록 이름, 타입, 색상, 코드 모두 생성!
4. 생성된 블록이 툴박스에 자동으로 추가됨

**AI가 자동으로 결정하는 것들:**
- 블록 이름
- 블록 타입 (statement/value/boolean/output)
- 블록 색상
- 입력 필드 필요 여부
- 실행될 JavaScript 코드

### 2. 블록 사용하기

1. 왼쪽 툴박스에서 "사용자 정의" 카테고리 클릭
2. 생성한 블록을 드래그하여 워크스페이스에 배치
3. 블록을 연결하여 프로그램 구성

### 3. 코드 실행

1. "▶️ 실행" 버튼 클릭
2. 새 창이 열리며 코드가 실행됨
3. 결과를 확인

### 4. 프로젝트 내보내기

1. "💾 내보내기" 버튼 클릭
2. HTML 파일이 다운로드됨
3. 다운로드한 파일을 브라우저에서 열어 실행 가능

## 🎨 블록 타입

- **Statement**: 명령문 블록 (앞뒤로 연결 가능)
- **Value**: 값을 반환하는 블록 (다른 블록의 입력으로 사용)
- **Boolean**: 참/거짓 값을 반환
- **Output**: 결과를 출력하는 블록

## 🔧 기술 스택

- **프론트엔드**: Vanilla JavaScript, Blockly
- **백엔드**: Cloudflare Functions (서버리스)
- **AI**: HuggingFace Inference API (Qwen3-Coder-480B-A35B-Instruct)
- **호스팅**: Cloudflare Pages

## 📝 환경 변수

### 로컬 개발 (.dev.vars)
```
HF_TOKEN=your_huggingface_token
```

### 프로덕션 (Cloudflare Pages 대시보드에서 설정)
- `HF_TOKEN`: HuggingFace API 토큰

## 🤝 기여

기여는 언제나 환영합니다! 이슈나 풀 리퀘스트를 자유롭게 제출해주세요.

## 📄 라이선스

MIT License

## 🙏 감사

- [Blockly](https://developers.google.com/blockly) - Google의 비주얼 프로그래밍 라이브러리
- [HuggingFace](https://huggingface.co/) - AI 모델 API 제공
- [Cloudflare Pages](https://pages.cloudflare.com/) - 호스팅 및 서버리스 함수

---

Made with ❤️ by Block Vibe Coding Team

