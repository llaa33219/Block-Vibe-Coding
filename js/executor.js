// 코드 실행 시스템
class CodeExecutor {
    constructor() {
        this.previewWindow = null;
    }

    async executeBlocks(blocks) {
        // 생성된 코드가 있는 블록만 필터링
        const executableBlocks = blocks.filter(block => block.generated && block.code);

        if (executableBlocks.length === 0) {
            alert('실행할 수 있는 블록이 없습니다. 먼저 AI로 코드를 생성해주세요!');
            return;
        }

        // 모든 블록의 코드를 결합
        const combinedCode = this.combineBlockCode(executableBlocks);
        
        // HTML 페이지 생성
        const htmlContent = this.generateHTMLPage(combinedCode);

        // 새 창에서 실행
        this.openPreviewWindow(htmlContent);
    }

    combineBlockCode(blocks) {
        let combinedCode = '';
        
        // UI 블록과 이벤트 블록을 위한 초기화 코드
        combinedCode += `
// 블록 코드 초기화
(function() {
    'use strict';
    
    // 전역 변수 저장소
    window.blockVariables = {};
    window.blockFunctions = {};
    
`;

        // 각 블록의 코드를 순서대로 추가
        blocks.forEach((block, index) => {
            combinedCode += `
    // --- ${block.type} 블록 ${index + 1}: ${block.description} ---
    try {
        ${this.wrapBlockCode(block)}
    } catch (error) {
        console.error('블록 ${index + 1} 실행 오류:', error);
    }
    
`;
        });

        combinedCode += `
})();
`;

        return combinedCode;
    }

    wrapBlockCode(block) {
        let code = block.code;

        // function 선언이 있는 경우 즉시 실행 또는 저장
        if (code.includes('function ')) {
            // 함수를 전역에 저장하고 필요시 실행
            return `
        ${code}
        // 함수가 정의된 경우 즉시 실행 시도
        if (typeof blockCode === 'function') {
            blockCode();
        }
            `.trim();
        }

        // 그 외의 경우 바로 실행
        return code;
    }

    generateHTMLPage(jsCode) {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block Vibe Coding - 실행 결과</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2rem;
        }
        
        .info {
            background: #f0f4f8;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #555;
        }
        
        #output {
            min-height: 200px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }
        
        .error {
            color: #e74c3c;
            background: #fdeaea;
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 15px;
        }
        
        button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Block Vibe Coding - 실행 결과</h1>
        <div class="info">
            <strong>💡 안내:</strong> 블록 코드가 실행되었습니다. 아래 영역에 결과가 표시됩니다.
        </div>
        <div id="output"></div>
        <button onclick="window.close()">창 닫기</button>
    </div>

    <script>
        // console.log 오버라이드하여 화면에도 표시
        const outputDiv = document.getElementById('output');
        const originalLog = console.log;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            
            const p = document.createElement('p');
            p.textContent = message;
            p.style.margin = '5px 0';
            p.style.padding = '8px';
            p.style.background = '#e8f4f8';
            p.style.borderRadius = '4px';
            outputDiv.appendChild(p);
        };
        
        // 에러 캐치
        window.addEventListener('error', function(e) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = '❌ 오류: ' + e.message;
            outputDiv.appendChild(errorDiv);
        });
        
        // 블록 코드 실행
        ${jsCode}
    </script>
</body>
</html>
        `.trim();
    }

    openPreviewWindow(htmlContent) {
        // 기존 창이 있으면 닫기
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.close();
        }

        // 새 창 열기
        this.previewWindow = window.open('', 'BlockVibePreview', 
            'width=1000,height=700,menubar=no,toolbar=no,location=no,status=no');
        
        if (this.previewWindow) {
            this.previewWindow.document.write(htmlContent);
            this.previewWindow.document.close();
        } else {
            alert('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.');
        }
    }
}

// 전역 인스턴스
window.codeExecutor = new CodeExecutor();

