// Cloudflare Functions - AI 코드 생성 API
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { name, description, type, hasInput } = await request.json();

        // 환경 변수에서 HuggingFace 토큰 가져오기
        const HF_TOKEN = env.HF_TOKEN;

        if (!HF_TOKEN) {
            return new Response(JSON.stringify({
                error: 'HF_TOKEN이 설정되지 않았습니다.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // AI 프롬프트 생성
        const prompt = generatePrompt(name, description, type, hasInput);

        // HuggingFace API 호출
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful coding assistant. Generate clean, working JavaScript code based on user requirements. Only output the code without any explanation or markdown formatting.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'meta-llama/Llama-3.3-70B-Instruct',
                stream: false,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API 오류: ${response.status}`);
        }

        const data = await response.json();
        let generatedCode = data.choices[0].message.content.trim();

        // 마크다운 코드 블록 제거
        generatedCode = cleanCode(generatedCode);

        return new Response(JSON.stringify({
            code: generatedCode
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('코드 생성 오류:', error);
        
        return new Response(JSON.stringify({
            error: error.message,
            code: '// 기본 코드\nconsole.log("실행됨");'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// OPTIONS 요청 처리 (CORS)
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

function generatePrompt(name, description, type, hasInput) {
    let prompt = `Create a JavaScript code snippet for a block named "${name}".\n`;
    prompt += `Description: ${description}\n`;
    prompt += `Block type: ${type}\n`;
    
    if (hasInput) {
        prompt += `This block has an input field. Use {{INPUT}} as a placeholder for the user input value.\n`;
    }

    switch (type) {
        case 'statement':
            prompt += `Generate code that executes a statement or command.\n`;
            break;
        case 'value':
            prompt += `Generate code that returns a value. The code should be an expression.\n`;
            break;
        case 'boolean':
            prompt += `Generate code that returns a boolean value (true/false).\n`;
            break;
        case 'output':
            prompt += `Generate code that outputs or displays something to the user.\n`;
            break;
    }

    prompt += `\nProvide only the JavaScript code without any explanation, comments about the structure, or markdown formatting. The code should be clean, working, and ready to use.`;

    return prompt;
}

function cleanCode(code) {
    // 마크다운 코드 블록 제거
    code = code.replace(/```javascript\n?/g, '');
    code = code.replace(/```js\n?/g, '');
    code = code.replace(/```\n?/g, '');
    
    // 앞뒤 공백 제거
    code = code.trim();
    
    return code;
}

