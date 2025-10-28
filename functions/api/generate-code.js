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
    return `You are an expert at creating visual programming blocks for Blockly. Analyze this user request and create a perfect block definition: "${description}"

IMPORTANT GUIDELINES:
1. **Block Name**: Short, clear, action-oriented (2-4 words max)
2. **Block Type Selection**:
   - "statement": Actions/commands that DO something (e.g., show alert, create element, change color)
   - "value": Calculations or data that RETURN a value (e.g., random number, get text, calculate sum)
   - "boolean": Logic checks that return true/false (e.g., is number even, is text empty)
   - "output": Same as statement but for display purposes
3. **Input Field**: Set hasInput to true ONLY if user needs to provide a parameter (text, number, etc.)
   - Use {{INPUT}} placeholder in code where user input should be inserted
4. **Color Scheme**:
   - Actions/Commands: #5C68A6 (blue)
   - Math/Numbers: #59A85B (green)
   - Text/String: #5BA58C (teal)
   - Logic/Boolean: #D65CD6 (purple)
   - UI/Display: #FF8C1A (orange)
   - Events: #FFAB19 (yellow)
5. **JavaScript Code**:
   - Write clean, working, browser-compatible code
   - Use modern ES6+ syntax
   - For UI elements, use DOM manipulation (document.createElement, etc.)
   - For alerts/prompts, use native browser APIs
   - Make code production-ready and safe

EXAMPLES:

Request: "버튼 만들기"
Response:
{
  "name": "버튼 생성",
  "description": "클릭 가능한 버튼을 생성합니다",
  "type": "statement",
  "color": "#FF8C1A",
  "hasInput": true,
  "code": "const btn = document.createElement('button');\\nbtn.textContent = '{{INPUT}}';\\nbtn.onclick = () => alert('버튼 클릭됨!');\\ndocument.body.appendChild(btn);"
}

Request: "랜덤 숫자"
Response:
{
  "name": "랜덤 숫자",
  "description": "0부터 100 사이의 랜덤 숫자를 반환합니다",
  "type": "value",
  "color": "#59A85B",
  "hasInput": false,
  "code": "Math.floor(Math.random() * 101)"
}

Request: "알림창 띄우기"
Response:
{
  "name": "알림 표시",
  "description": "메시지를 알림창으로 표시합니다",
  "type": "statement",
  "color": "#FF8C1A",
  "hasInput": true,
  "code": "alert('{{INPUT}}');"
}

Now create a block for: "${description}"

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "name": "block name",
  "description": "clear description",
  "type": "statement|value|boolean|output",
  "color": "#HEXCODE",
  "hasInput": true|false,
  "code": "working javascript code"
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

