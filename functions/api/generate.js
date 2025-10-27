// Cloudflare Pages Function - AI 코드 생성 API
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // 환경변수에서 API 키 가져오기
        const HF_TOKEN = env.HF_TOKEN;
        
        if (!HF_TOKEN) {
            return new Response(JSON.stringify({
                error: '서버에 API 키가 설정되지 않았습니다. Cloudflare Pages 환경변수를 확인해주세요.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 요청 데이터 파싱
        const { blockType, userDescription } = await request.json();

        if (!userDescription) {
            return new Response(JSON.stringify({
                error: '블록 설명이 필요합니다.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hugging Face API 호출
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(blockType)
                    },
                    {
                        role: 'user',
                        content: getUserPrompt(blockType, userDescription)
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const data = await response.json();
        const generatedCode = data.choices[0].message.content.trim();
        
        // 코드 추출 및 반환
        const code = extractCode(generatedCode);

        return new Response(JSON.stringify({
            success: true,
            code: code
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI 코드 생성 오류:', error);
        return new Response(JSON.stringify({
            error: error.message || '코드 생성 중 오류가 발생했습니다.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function getSystemPrompt(blockType) {
    const prompts = {
        action: `당신은 JavaScript 코드 생성 전문가입니다. 사용자의 요청에 따라 실행 가능한 JavaScript 코드를 생성합니다.
코드는 웹 브라우저에서 실행되며, 간결하고 효율적이어야 합니다.
오직 순수 JavaScript 코드만 작성하고, 설명이나 주석은 최소화하세요.`,
        
        condition: `당신은 JavaScript 조건문 생성 전문가입니다. if-else, switch 등의 조건 로직을 생성합니다.
조건문은 function 형태로 반환되어야 하며, 결과를 return하거나 특정 동작을 수행해야 합니다.`,
        
        loop: `당신은 JavaScript 반복문 생성 전문가입니다. for, while, forEach 등의 반복 로직을 생성합니다.
반복문은 효율적이고 안전해야 하며, 무한 루프를 피해야 합니다.`,
        
        function: `당신은 JavaScript 함수 생성 전문가입니다. 재사용 가능한 함수를 생성합니다.
함수는 명확한 목적을 가지고 있어야 하며, 필요한 경우 파라미터를 받을 수 있어야 합니다.`,
        
        event: `당신은 JavaScript 이벤트 핸들러 생성 전문가입니다. 클릭, 입력, 로드 등의 이벤트를 처리하는 코드를 생성합니다.
이벤트 핸들러는 DOM 요소와 상호작용할 수 있어야 합니다.`,
        
        ui: `당신은 웹 UI 생성 전문가입니다. HTML 요소를 동적으로 생성하고 스타일을 적용하는 JavaScript 코드를 작성합니다.
생성된 UI는 document.body에 추가되거나 기존 요소를 수정할 수 있습니다.`,
        
        data: `당신은 데이터 처리 전문가입니다. 배열, 객체, API 호출 등 데이터를 다루는 JavaScript 코드를 생성합니다.
데이터 처리는 효율적이고 에러 처리가 포함되어야 합니다.`
    };

    return prompts[blockType] || prompts.action;
}

function getUserPrompt(blockType, description) {
    return `다음 요청에 맞는 JavaScript 코드를 생성해주세요:

요청: ${description}

중요 규칙:
1. 오직 실행 가능한 JavaScript 코드만 작성
2. 코드는 function으로 감싸져야 함 (예: function blockCode() { ... })
3. 설명이나 마크다운 코드 블록(\`\`\`)은 포함하지 말 것
4. 웹 브라우저 환경에서 실행됨을 고려
5. console.log로 결과 출력 가능
6. DOM 조작 시 안전하게 처리

코드만 작성해주세요:`;
}

function extractCode(generatedText) {
    // 마크다운 코드 블록 제거
    let code = generatedText.replace(/```(?:javascript|js)?\n?/g, '').replace(/```/g, '');
    
    // 앞뒤 공백 제거
    code = code.trim();
    
    // function으로 감싸지지 않은 경우 자동으로 감싸기
    if (!code.includes('function') && !code.includes('=>')) {
        code = `function blockCode() {\n${code}\n}`;
    }
    
    return code;
}

