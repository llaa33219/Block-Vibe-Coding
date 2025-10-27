// 파일 내보내기 시스템
class FileExporter {
    constructor() {
        this.exportFormats = ['html', 'js', 'json'];
    }

    async exportProject(blocks) {
        if (blocks.length === 0) {
            alert('내보낼 블록이 없습니다!');
            return;
        }

        // 내보내기 형식 선택
        const format = await this.showExportDialog();
        
        if (!format) return;

        switch (format) {
            case 'html':
                this.exportAsHTML(blocks);
                break;
            case 'js':
                this.exportAsJavaScript(blocks);
                break;
            case 'json':
                this.exportAsJSON(blocks);
                break;
            case 'all':
                this.exportAll(blocks);
                break;
        }
    }

    showExportDialog() {
        return new Promise((resolve) => {
            const choice = prompt(
                '내보내기 형식을 선택하세요:\n' +
                '1 - HTML 파일 (실행 가능한 웹페이지)\n' +
                '2 - JavaScript 파일 (순수 JS 코드)\n' +
                '3 - JSON 파일 (블록 데이터)\n' +
                '4 - 모두 내보내기',
                '1'
            );

            const formatMap = {
                '1': 'html',
                '2': 'js',
                '3': 'json',
                '4': 'all'
            };

            resolve(formatMap[choice] || null);
        });
    }

    exportAsHTML(blocks) {
        const executableBlocks = blocks.filter(b => b.generated && b.code);
        
        if (executableBlocks.length === 0) {
            alert('생성된 코드가 있는 블록이 없습니다!');
            return;
        }

        const jsCode = this.combineBlockCode(executableBlocks);
        const htmlContent = this.generateFullHTML(jsCode, blocks);
        
        this.downloadFile('block-vibe-project.html', htmlContent, 'text/html');
    }

    exportAsJavaScript(blocks) {
        const executableBlocks = blocks.filter(b => b.generated && b.code);
        
        if (executableBlocks.length === 0) {
            alert('생성된 코드가 있는 블록이 없습니다!');
            return;
        }

        const jsCode = this.combineBlockCode(executableBlocks);
        
        this.downloadFile('block-vibe-code.js', jsCode, 'text/javascript');
    }

    exportAsJSON(blocks) {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            blocks: blocks.map(block => ({
                type: block.type,
                description: block.description,
                code: block.code,
                generated: block.generated
            }))
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        
        this.downloadFile('block-vibe-project.json', jsonContent, 'application/json');
    }

    exportAll(blocks) {
        this.exportAsHTML(blocks);
        setTimeout(() => this.exportAsJavaScript(blocks), 300);
        setTimeout(() => this.exportAsJSON(blocks), 600);
    }

    combineBlockCode(blocks) {
        let code = '// Block Vibe Coding - 생성된 코드\n';
        code += `// 생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;

        blocks.forEach((block, index) => {
            code += `// ========================================\n`;
            code += `// 블록 ${index + 1}: ${block.type} - ${block.description}\n`;
            code += `// ========================================\n\n`;
            code += block.code + '\n\n';
        });

        return code;
    }

    generateFullHTML(jsCode, blocks) {
        const blocksList = blocks
            .filter(b => b.generated)
            .map((b, i) => `        <li><strong>${b.type}</strong>: ${b.description}</li>`)
            .join('\n');

        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block Vibe Coding - 프로젝트</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        
        .info-section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .blocks-list {
            list-style: none;
            padding: 0;
        }
        
        .blocks-list li {
            padding: 10px;
            margin: 8px 0;
            background: white;
            border-left: 4px solid #667eea;
            border-radius: 6px;
        }
        
        #output {
            min-height: 300px;
            padding: 20px;
            background: #1e1e1e;
            color: #00ff00;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin-top: 20px;
            overflow-y: auto;
        }
        
        .controls {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 2px solid #e0e0e0;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Block Vibe Coding</h1>
            <p>AI 기반 블록 코딩 프로젝트</p>
        </div>
        
        <div class="content">
            <div class="info-section">
                <h2>📦 프로젝트 정보</h2>
                <p><strong>생성일:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                <p><strong>블록 수:</strong> ${blocks.filter(b => b.generated).length}개</p>
            </div>
            
            <div class="info-section">
                <h2>🔧 포함된 블록</h2>
                <ul class="blocks-list">
${blocksList}
                </ul>
            </div>
            
            <div class="controls">
                <button onclick="executeCode()">▶ 코드 실행</button>
                <button onclick="clearOutput()">🗑️ 출력 지우기</button>
            </div>
            
            <div id="output">
                <div style="color: #00ff00;">===== 출력 콘솔 =====</div>
                <div style="color: #888; margin-top: 10px;">실행 버튼을 눌러 코드를 실행하세요...</div>
            </div>
            
            <div class="footer">
                <p>Made with ❤️ by Block Vibe Coding</p>
            </div>
        </div>
    </div>

    <script>
        const outputDiv = document.getElementById('output');
        
        // console.log 오버라이드
        const originalLog = console.log;
        console.log = function(...args) {
            originalLog.apply(console, args);
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            
            const p = document.createElement('div');
            p.textContent = '> ' + message;
            p.style.margin = '5px 0';
            p.style.color = '#00ff00';
            outputDiv.appendChild(p);
        };
        
        // 에러 처리
        window.addEventListener('error', function(e) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = '❌ ERROR: ' + e.message;
            errorDiv.style.color = '#ff4444';
            errorDiv.style.margin = '10px 0';
            outputDiv.appendChild(errorDiv);
        });
        
        function executeCode() {
            clearOutput();
            console.log('===== 코드 실행 시작 =====');
            console.log('');
            
            try {
                // 블록 코드 실행
                ${jsCode}
                
                console.log('');
                console.log('===== 코드 실행 완료 =====');
            } catch (error) {
                console.error('실행 오류:', error.message);
            }
        }
        
        function clearOutput() {
            outputDiv.innerHTML = '<div style="color: #00ff00;">===== 출력 콘솔 =====</div>';
        }
    </script>
</body>
</html>`;
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log(`파일 다운로드: ${filename}`);
    }
}

// 전역 인스턴스
window.fileExporter = new FileExporter();

