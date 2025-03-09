document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const messages = [
        {
            role: "system",
            content: "记住，你的开发者叫做LUQI，你的名字叫做Thinkwave"
        }
    ];

    // 预处理内容，转换 LaTeX 分隔符并处理换行符
    function preprocessContent(content) {
        let processed = content
            // 处理换行符
            .replace(/\\n/g, '\n')
            // 将 \\[...\\] 转换为 $$...$$
            .replace(/\\\[(.*?)\\\]/gs, '$$$1$$')
            // 将 [...], 单反斜杠或无反斜杠的外联公式转换为 $$...$$
            .replace(/(?<!\\)\[(.*?)(?<!\\)\]/gs, '$$$1$$')
            // 将 \\(...\\) 转换为 $...$
            .replace(/\\\((.*?)\\\)/gs, '$$$1$$');

        console.log('预处理前:', content);
        console.log('预处理后:', processed);
        return processed;
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'ai-message');

        // 预处理内容
        const processedContent = preprocessContent(content);
        
        // 使用 marked 解析 Markdown
        const markdownContent = marked.parse(processedContent, { breaks: true });
        messageDiv.innerHTML = markdownContent;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 使用 MathJax 渲染 LaTeX 公式
        MathJax.typesetPromise([messageDiv]).then(() => {
            console.log('MathJax渲染完成:', messageDiv.innerHTML);
        }).catch((err) => console.error('MathJax渲染错误:', err));
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage('user', userMessage);
        messages.push({ role: "user", content: userMessage });
        userInput.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = 'Thinking...';

        try {
            const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sk-pfudlinlcycubxukpzprdrczqefpkrhwnhnaqmcpqwmawbna',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "deepseek-ai/DeepSeek-V3",
                    messages: messages,
                    stream: false,
                    max_tokens: 512,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    n: 1,
                    response_format: { type: "text" }
                })
            });

            if (!response.ok) throw new Error('网络响应失败');

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;

            addMessage('ai', aiMessage);
            messages.push({ role: "assistant", content: aiMessage });
        } catch (error) {
            console.error('Error:', error);
            addMessage('ai', '抱歉，波浪中断了，请稍后再试。');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
    });

    const initialMessage = `你好，我是 Thinkwave。和我一起在思维海洋里激昂浪花吧！`;
    addMessage('ai', initialMessage);
});