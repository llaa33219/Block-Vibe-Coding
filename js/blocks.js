// 블록 관리 시스템
class BlockManager {
    constructor() {
        this.blocks = [];
        this.blockCounter = 0;
        this.workspace = null;
    }

    init(workspaceElement) {
        this.workspace = workspaceElement;
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        // 팔레트의 블록 아이템에 대한 드래그 시작
        const paletteBlocks = document.querySelectorAll('.block-item');
        paletteBlocks.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const blockType = e.target.dataset.blockType;
                e.dataTransfer.setData('blockType', blockType);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        // 작업 공간에 드롭 처리
        this.workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.workspace.classList.add('drag-over');
        });

        this.workspace.addEventListener('dragleave', (e) => {
            if (e.target === this.workspace) {
                this.workspace.classList.remove('drag-over');
            }
        });

        this.workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            this.workspace.classList.remove('drag-over');
            
            const blockType = e.dataTransfer.getData('blockType');
            if (blockType) {
                this.addBlock(blockType);
            }
        });
    }

    addBlock(blockType) {
        const blockId = `block-${this.blockCounter++}`;
        const block = {
            id: blockId,
            type: blockType,
            description: '',
            code: '',
            generated: false
        };

        this.blocks.push(block);
        this.renderBlock(block);
    }

    renderBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'workspace-block';
        blockElement.id = block.id;
        blockElement.draggable = true;

        const blockTypeClass = `${block.type}-block`;
        const blockLabel = this.getBlockLabel(block.type);
        const placeholder = this.getBlockPlaceholder(block.type);

        blockElement.innerHTML = `
            <div class="block ${blockTypeClass}">
                <span class="block-label">${blockLabel}</span>
                <textarea 
                    class="block-input" 
                    placeholder="${placeholder}"
                    data-block-id="${block.id}"
                >${block.description}</textarea>
                <div class="block-actions">
                    <button class="block-btn btn-generate" data-block-id="${block.id}">
                        ✨ AI 코드 생성
                    </button>
                    <button class="block-btn btn-delete" data-block-id="${block.id}">
                        🗑️ 삭제
                    </button>
                </div>
                ${block.code ? `
                    <div class="block-status status-generated">✓ 코드 생성 완료</div>
                    <div class="block-code">${this.escapeHtml(block.code)}</div>
                ` : ''}
            </div>
        `;

        this.workspace.appendChild(blockElement);
        this.attachBlockEvents(blockElement, block);
    }

    attachBlockEvents(blockElement, block) {
        // 입력 이벤트
        const input = blockElement.querySelector('.block-input');
        input.addEventListener('input', (e) => {
            block.description = e.target.value;
        });

        // AI 코드 생성 버튼
        const generateBtn = blockElement.querySelector('.btn-generate');
        generateBtn.addEventListener('click', async () => {
            await this.generateCode(block);
        });

        // 삭제 버튼
        const deleteBtn = blockElement.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
            this.deleteBlock(block.id);
        });

        // 블록 드래그 (재정렬용)
        blockElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('workspaceBlockId', block.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        blockElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        blockElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedBlockId = e.dataTransfer.getData('workspaceBlockId');
            if (draggedBlockId && draggedBlockId !== block.id) {
                this.reorderBlocks(draggedBlockId, block.id);
            }
        });
    }

    async generateCode(block) {
        if (!block.description.trim()) {
            alert('블록에 대한 설명을 입력해주세요!');
            return;
        }

        const modal = document.getElementById('aiModal');
        const statusText = document.getElementById('aiStatus');
        
        modal.classList.add('active');
        statusText.textContent = `"${block.description}" 코드를 생성하고 있습니다...`;

        try {
            const code = await window.aiGenerator.generateBlockCode(block.type, block.description);
            block.code = code;
            block.generated = true;

            // 블록 다시 렌더링
            const blockElement = document.getElementById(block.id);
            const parent = blockElement.parentNode;
            const nextSibling = blockElement.nextSibling;
            blockElement.remove();
            
            this.renderBlock(block);
            
            // 원래 위치에 삽입
            if (nextSibling) {
                parent.insertBefore(document.getElementById(block.id), nextSibling);
            }

            modal.classList.remove('active');
            
        } catch (error) {
            modal.classList.remove('active');
            alert(`코드 생성 실패: ${error.message}`);
        }
    }

    deleteBlock(blockId) {
        const index = this.blocks.findIndex(b => b.id === blockId);
        if (index !== -1) {
            this.blocks.splice(index, 1);
            const blockElement = document.getElementById(blockId);
            blockElement.remove();
        }
    }

    reorderBlocks(draggedId, targetId) {
        const draggedIndex = this.blocks.findIndex(b => b.id === draggedId);
        const targetIndex = this.blocks.findIndex(b => b.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedBlock] = this.blocks.splice(draggedIndex, 1);
            this.blocks.splice(targetIndex, 0, draggedBlock);
            
            // UI 재렌더링
            this.workspace.innerHTML = '';
            this.blocks.forEach(block => this.renderBlock(block));
        }
    }

    getBlockLabel(type) {
        const labels = {
            action: '동작 블록',
            condition: '조건 블록',
            loop: '반복 블록',
            function: '함수 블록',
            event: '이벤트 블록',
            ui: 'UI 블록',
            data: '데이터 블록'
        };
        return labels[type] || '블록';
    }

    getBlockPlaceholder(type) {
        const placeholders = {
            action: '예: "Hello World를 알림창으로 표시해줘"',
            condition: '예: "숫자가 10보다 크면 알림을 표시해줘"',
            loop: '예: "1부터 10까지 숫자를 콘솔에 출력해줘"',
            function: '예: "두 숫자를 더하는 함수를 만들어줘"',
            event: '예: "버튼을 클릭하면 배경색이 바뀌게 해줘"',
            ui: '예: "빨간색 버튼을 화면에 추가해줘"',
            data: '예: "사용자 정보를 담은 객체를 만들어줘"'
        };
        return placeholders[type] || '블록의 동작을 설명해주세요...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getAllBlocks() {
        return this.blocks;
    }

    clearAllBlocks() {
        this.blocks = [];
        this.workspace.innerHTML = '';
        this.blockCounter = 0;
    }
}

// 전역 인스턴스
window.blockManager = new BlockManager();

