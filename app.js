// Block Vibe Coding - Main Application
class BlockVibeCoding {
    constructor() {
        console.log('🧱 Block Vibe Coding 시작...');
        this.workspace = null;
        this.customBlocks = [];
        this.init();
    }

    init() {
        // Blockly 워크스페이스 초기화
        this.initBlockly();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 로컬 스토리지에서 사용자 정의 블록 로드
        this.loadCustomBlocks();
        
        console.log('✅ Block Vibe Coding 준비 완료!');
    }

    initBlockly() {
        const blocklyDiv = document.getElementById('blocklyDiv');
        
        const toolbox = {
            kind: 'categoryToolbox',
            contents: [
                {
                    kind: 'category',
                    name: '기본 블록',
                    colour: '#5b67a5',
                    contents: [
                        {
                            kind: 'block',
                            type: 'text'
                        },
                        {
                            kind: 'block',
                            type: 'text_print'
                        },
                        {
                            kind: 'block',
                            type: 'math_number'
                        }
                    ]
                },
                {
                    kind: 'category',
                    name: '사용자 정의',
                    colour: '#a55b99',
                    custom: 'CUSTOM_BLOCKS'
                }
            ]
        };

        this.workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolbox,
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            move: {
                scrollbars: true,
                drag: true,
                wheel: true
            }
        });

        // 워크스페이스 변경 시 코드 미리보기 업데이트
        this.workspace.addChangeListener(() => {
            this.updateCodePreview();
        });

        // 사용자 정의 블록 카테고리 등록
        this.registerCustomBlocksCategory();
    }

    registerCustomBlocksCategory() {
        const app = this;
        Blockly.registry.register(
            Blockly.registry.Type.TOOLBOX_ITEM,
            Blockly.ToolboxCategory.registrationName,
            Blockly.ToolboxCategory,
            true
        );

        // 커스텀 블록 카테고리 콜백
        this.workspace.registerToolboxCategoryCallback('CUSTOM_BLOCKS', function(workspace) {
            const blockList = [];
            app.customBlocks.forEach(block => {
                blockList.push({
                    kind: 'block',
                    type: block.id
                });
            });
            return blockList;
        });
    }

    setupEventListeners() {
        // 블록 생성 버튼
        document.getElementById('createBlockBtn').addEventListener('click', () => {
            this.createCustomBlock();
        });

        // Enter 키로도 생성 가능
        document.getElementById('blockRequest').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.createCustomBlock();
            }
        });

        // 실행 버튼
        document.getElementById('runBtn').addEventListener('click', () => {
            this.runCode();
        });

        // 내보내기 버튼
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportCode();
        });

        // 코드 복사 버튼
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            this.copyCode();
        });

        // 블록 모두 삭제 버튼
        document.getElementById('clearBlocksBtn').addEventListener('click', () => {
            if (confirm('정말로 모든 사용자 정의 블록을 삭제하시겠습니까?')) {
                this.clearAllBlocks();
            }
        });
    }

    clearAllBlocks() {
        // localStorage 초기화
        localStorage.removeItem('blockVibeCustomBlocks');
        this.customBlocks = [];
        
        // UI 업데이트
        this.updateCustomBlocksList();
        
        // 페이지 새로고침 (블록 정의 완전히 제거)
        location.reload();
    }

    async createCustomBlock() {
        const description = document.getElementById('blockRequest').value.trim();

        if (!description) {
            alert('블록 설명을 입력해주세요.');
            return;
        }

        // 로딩 표시
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('createBlockBtn').disabled = true;

        try {
            console.log(`🤖 AI에게 블록 생성 요청: "${description}"`);
            
            // AI에게 블록 정의 생성 요청
            const blockDef = await this.generateBlockDefinition(description);
            
            console.log('📥 AI 응답:', blockDef);

            // 블록 정의 생성
            const blockId = 'custom_' + Date.now();
            const blockDefinition = {
                id: blockId,
                name: blockDef.name,
                description: blockDef.description,
                type: blockDef.type,
                color: blockDef.color,
                hasInput: blockDef.hasInput,
                generatedCode: blockDef.code
            };

            console.log('🔧 블록 정의:', blockDefinition);

            // Blockly 블록 등록
            this.registerBlocklyBlock(blockDefinition);

            // 커스텀 블록 목록에 추가
            this.customBlocks.push(blockDefinition);
            
            // 로컬 스토리지에 저장
            this.saveCustomBlocks();

            // UI 업데이트
            this.updateCustomBlocksList();

            // 툴박스 갱신
            this.refreshToolbox();

            // 입력 필드 초기화
            document.getElementById('blockRequest').value = '';

            // 성공 메시지
            this.showToast(`✅ "${blockDefinition.name}" 블록이 생성되었습니다!`);
        } catch (error) {
            console.error('❌ 블록 생성 오류:', error);
            alert('블록 생성 중 오류가 발생했습니다:\n' + error.message);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('createBlockBtn').disabled = false;
        }
    }

    async generateBlockDefinition(description) {
        try {
            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: description
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 오류 (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            // 응답 검증
            if (!data.code || !data.name) {
                console.warn('⚠️ AI 응답이 불완전합니다. 기본값 사용.');
                throw new Error('AI 응답 형식 오류');
            }
            
            return data;
        } catch (error) {
            console.error('❌ 블록 정의 생성 오류:', error);
            // 폴백: 기본 블록 정의 반환
            console.log('🔄 기본 블록으로 대체합니다.');
            return {
                name: description.length > 20 ? description.substring(0, 20) : description,
                description: description,
                type: 'statement',
                color: '#5C68A6',
                hasInput: false,
                code: `// ${description}\nconsole.log("${description} 실행됨");`
            };
        }
    }

    showToast(message) {
        // 간단한 토스트 메시지 표시
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    registerBlocklyBlock(blockDef) {
        // Blockly 블록 정의
        const blockJson = {
            type: blockDef.id,
            message0: blockDef.name + (blockDef.hasInput ? ' %1' : ''),
            args0: blockDef.hasInput ? [
                {
                    type: 'field_input',
                    name: 'INPUT',
                    text: '입력'
                }
            ] : [],
            colour: blockDef.color,
            tooltip: blockDef.description,
            helpUrl: ''
        };

        // 블록 타입에 따른 설정
        switch (blockDef.type) {
            case 'statement':
                blockJson.previousStatement = null;
                blockJson.nextStatement = null;
                break;
            case 'value':
                blockJson.output = null;
                break;
            case 'boolean':
                blockJson.output = 'Boolean';
                break;
            case 'output':
                blockJson.previousStatement = null;
                blockJson.nextStatement = null;
                break;
        }

        // 블록 정의 등록
        if (!Blockly.Blocks[blockDef.id]) {
            Blockly.Blocks[blockDef.id] = {
                init: function() {
                    this.jsonInit(blockJson);
                }
            };
        }

        // JavaScript 코드 생성기 - 클로저로 blockDef 캡처
        const generatedCode = blockDef.generatedCode;
        const hasInput = blockDef.hasInput;
        const blockType = blockDef.type;

        Blockly.JavaScript[blockDef.id] = function(block) {
            let code = generatedCode;
            
            if (hasInput) {
                const inputValue = block.getFieldValue('INPUT');
                code = code.replace(/\{\{INPUT\}\}/g, inputValue);
            }

            if (blockType === 'value' || blockType === 'boolean') {
                return [code, Blockly.JavaScript.ORDER_NONE];
            } else {
                return code + '\n';
            }
        };
        
        console.log(`✅ 블록 등록됨: ${blockDef.id} (${blockDef.name})`);
    }

    updateCustomBlocksList() {
        const list = document.getElementById('customBlocksList');
        list.innerHTML = '';

        this.customBlocks.forEach(block => {
            const item = document.createElement('div');
            item.className = 'custom-block-item';
            item.style.borderLeftColor = block.color;
            item.innerHTML = `
                <strong>${block.name}</strong>
                <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                    ${block.description}
                </div>
            `;
            list.appendChild(item);
        });
    }

    refreshToolbox() {
        // 워크스페이스 업데이트
        this.workspace.updateToolbox(this.workspace.options.languageTree);
    }

    updateCodePreview() {
        try {
            const code = Blockly.JavaScript.workspaceToCode(this.workspace);
            document.querySelector('#codePreview code').textContent = code || '// 블록을 추가하면 코드가 여기에 표시됩니다.';
        } catch (error) {
            console.error('❌ 코드 생성 오류:', error);
            document.querySelector('#codePreview code').textContent = `// 오류: ${error.message}\n// 페이지를 새로고침해보세요.`;
        }
    }

    runCode() {
        const code = Blockly.JavaScript.workspaceToCode(this.workspace);
        
        if (!code.trim()) {
            alert('실행할 코드가 없습니다. 블록을 추가해주세요.');
            return;
        }

        // 새 창에서 실행
        const popup = window.open('', 'Block Vibe Output', 'width=800,height=600');
        
        if (popup) {
            popup.document.write(`
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Block Vibe Output</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            padding: 2rem;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                        }
                        #output {
                            background: white;
                            padding: 2rem;
                            border-radius: 12px;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                        }
                        .console-log {
                            padding: 0.5rem;
                            border-left: 3px solid #667eea;
                            margin: 0.5rem 0;
                            background: #f3f4f6;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div id="output">
                        <h2>실행 결과</h2>
                        <div id="console"></div>
                    </div>
                    <script>
                        // console.log 오버라이드
                        const originalLog = console.log;
                        console.log = function(...args) {
                            originalLog.apply(console, args);
                            const consoleDiv = document.getElementById('console');
                            const logDiv = document.createElement('div');
                            logDiv.className = 'console-log';
                            logDiv.textContent = args.join(' ');
                            consoleDiv.appendChild(logDiv);
                        };

                        // 생성된 코드 실행
                        try {
                            ${code}
                        } catch (error) {
                            const consoleDiv = document.getElementById('console');
                            const errorDiv = document.createElement('div');
                            errorDiv.style.color = 'red';
                            errorDiv.textContent = '오류: ' + error.message;
                            consoleDiv.appendChild(errorDiv);
                        }
                    </script>
                </body>
                </html>
            `);
            popup.document.close();
        } else {
            alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }
    }

    exportCode() {
        const code = Blockly.JavaScript.workspaceToCode(this.workspace);
        
        if (!code.trim()) {
            alert('내보낼 코드가 없습니다.');
            return;
        }

        // HTML 파일로 내보내기
        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block Vibe Coding - 내보낸 프로젝트</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        #app {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>Block Vibe Coding 프로젝트</h1>
        <div id="output"></div>
    </div>
    <script>
${code}
    </script>
</body>
</html>`;

        // 파일 다운로드
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'block-vibe-project.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    copyCode() {
        const code = document.querySelector('#codePreview code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            const originalText = btn.textContent;
            btn.textContent = '✅ 복사됨!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    saveCustomBlocks() {
        localStorage.setItem('blockVibeCustomBlocks', JSON.stringify(this.customBlocks));
    }

    loadCustomBlocks() {
        const saved = localStorage.getItem('blockVibeCustomBlocks');
        if (saved) {
            try {
                this.customBlocks = JSON.parse(saved);
                console.log(`📦 저장된 블록 ${this.customBlocks.length}개 로드 중...`);
                
                this.customBlocks.forEach(block => {
                    // 블록 재등록
                    this.registerBlocklyBlock(block);
                });
                
                this.updateCustomBlocksList();
                console.log('✅ 모든 블록이 성공적으로 로드되었습니다.');
            } catch (error) {
                console.error('❌ 저장된 블록 로드 오류:', error);
                // 오류 발생 시 localStorage 초기화
                localStorage.removeItem('blockVibeCustomBlocks');
                this.customBlocks = [];
            }
        }
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    new BlockVibeCoding();
});

