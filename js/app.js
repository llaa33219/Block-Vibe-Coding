// 메인 애플리케이션 로직
class App {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // DOM 요소
        this.workspace = document.getElementById('workspace');
        this.runBtn = document.getElementById('runBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearBtn = document.getElementById('clearBtn');

        // 모듈 초기화
        window.blockManager.init(this.workspace);

        // 이벤트 리스너 설정
        this.setupEventListeners();

        this.initialized = true;
        console.log('Block Vibe Coding 초기화 완료!');
    }

    setupEventListeners() {
        // 실행 버튼
        this.runBtn.addEventListener('click', () => {
            const blocks = window.blockManager.getAllBlocks();
            window.codeExecutor.executeBlocks(blocks);
        });

        // 내보내기 버튼
        this.exportBtn.addEventListener('click', () => {
            const blocks = window.blockManager.getAllBlocks();
            window.fileExporter.exportProject(blocks);
        });

        // 초기화 버튼
        this.clearBtn.addEventListener('click', () => {
            if (confirm('모든 블록을 삭제하시겠습니까?')) {
                window.blockManager.clearAllBlocks();
            }
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 실행
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runBtn.click();
            }
            
            // Ctrl/Cmd + S: 내보내기
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.exportBtn.click();
            }
        });
    }
}

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    
    // 환영 메시지
    console.log('%c🎨 Block Vibe Coding', 'font-size: 20px; font-weight: bold; color: #667eea;');
    console.log('%cAI 기반 블록 코딩 플랫폼에 오신 것을 환영합니다!', 'font-size: 14px; color: #764ba2;');
    console.log('');
    console.log('🤖 AI 모델: Qwen3-Coder-480B-A35B-Instruct');
    console.log('');
    console.log('💡 시작하기:');
    console.log('1. 왼쪽에서 블록을 드래그하여 작업 공간에 추가하세요');
    console.log('2. 블록에 원하는 동작을 설명하세요');
    console.log('3. "AI 코드 생성" 버튼을 클릭하세요');
    console.log('4. "실행" 버튼으로 결과를 확인하세요');
    console.log('');
    console.log('⌨️ 단축키:');
    console.log('  Ctrl/Cmd + Enter: 실행');
    console.log('  Ctrl/Cmd + S: 내보내기');
});

