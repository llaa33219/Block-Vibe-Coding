// Cloudflare Functions - AI 코드 생성 API
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { description } = await request.json();

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
        const prompt = generatePrompt(description);

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
                        content: 'You are an expert at creating visual programming blocks. Analyze user requests and create complete block definitions in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
                stream: false,
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API 오류: ${response.status}`);
        }

        const data = await response.json();
        let responseText = data.choices[0].message.content.trim();

        // JSON 파싱
        const blockDefinition = parseBlockDefinition(responseText);

        return new Response(JSON.stringify(blockDefinition), {
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
            name: '기본 블록',
            description: '기본 블록',
            type: 'statement',
            color: '#5b67a5',
            hasInput: false,
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

function generatePrompt(description) {
    return `Analyze this block request and create a complete block definition: "${description}"

You need to determine:
1. Block name (short, descriptive)
2. Block type (statement/value/boolean/output)
3. Whether it needs an input field (true/false)
4. Block color in hex format
5. Working JavaScript code that implements the functionality

Block types:
- statement: Commands that execute actions (can connect before/after)
- value: Returns a value (can be used as input to other blocks)
- boolean: Returns true/false
- output: Displays or outputs something

If the block needs user input, use {{INPUT}} as placeholder in the code.

Respond ONLY with valid JSON in this exact format:
{
  "name": "block name here",
  "description": "what this block does",
  "type": "statement",
  "color": "#5b67a5",
  "hasInput": false,
  "code": "console.log('example');"
}`;
}

function parseBlockDefinition(responseText) {
    // JSON 추출 시도
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            
            // 필수 필드 검증 및 기본값 설정
            return {
                name: parsed.name || '사용자 블록',
                description: parsed.description || '사용자 정의 블록',
                type: ['statement', 'value', 'boolean', 'output'].includes(parsed.type) ? parsed.type : 'statement',
                color: parsed.color || '#5b67a5',
                hasInput: parsed.hasInput === true,
                code: cleanCode(parsed.code || 'console.log("실행");')
            };
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
        }
    }
    
    // 파싱 실패 시 기본값 반환
    return {
        name: '생성된 블록',
        description: '자동 생성된 블록',
        type: 'statement',
        color: '#5b67a5',
        hasInput: false,
        code: 'console.log("실행");'
    };
}

function cleanCode(code) {
    if (!code) return 'console.log("실행");';
    
    // 마크다운 코드 블록 제거
    code = code.replace(/```javascript\n?/g, '');
    code = code.replace(/```js\n?/g, '');
    code = code.replace(/```\n?/g, '');
    
    // 앞뒤 공백 제거
    code = code.trim();
    
    return code || 'console.log("실행");';
}

