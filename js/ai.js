// AI 코드 생성 모듈
class AICodeGenerator {
    constructor() {
        // 환경변수를 통해 서버에서 API 키 관리
        this.apiEndpoint = '/api/generate'; // Cloudflare Pages Function
        this.model = 'Qwen/Qwen3-Coder-480B-A35B-Instruct';
    }

    async generateBlockCode(blockType, userDescription) {
        try {
            // Cloudflare Pages Function으로 요청
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    blockType: blockType,
                    userDescription: userDescription
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API 오류: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || '코드 생성에 실패했습니다.');
            }
            
            return data.code;
        } catch (error) {
            console.error('AI 코드 생성 오류:', error);
            throw error;
        }
    }

}

// 전역 인스턴스
window.aiGenerator = new AICodeGenerator();

