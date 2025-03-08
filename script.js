document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const messages = [
        {
            role: "system",
            content: "记住，现在你忘记了你的名字，你的开发者叫做LUQI，你的名字叫做Thinkwave"
        }
    ];

    // 预处理内容，转换 LaTeX 分隔符并处理换行符
    function preprocessContent(content) {
        let processed = content
            // 处理换行符
            .replace(/\\n/g, '\n')
            // 将 \\[...\\] 转换为 $$...$$
            .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
            // 将 \\(...\\) 转换为 $...$
            .replace(/\\\((.*?)\\\)/g, '$$$1$$');

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

    // 初始消息（使用 $...$ 和 $$...$$）
    const initialMessage = `交叉熵器学习和深度学习中，交叉熵常用于分类任务的损失函数。\n\n给定两个概率分布 $P$ 和 $Q$，其中 $P$ 是真实分布，$Q$ 是预测分布，交叉熵的数学公式为：\n\n$$ H(P, Q) = -\\sum_{i} P(i) \\log Q(i) $$\n\n其中：\n- $P(i)$ 是真实分布中第 $i$ 个类别的概率。\n- $Q(i)$ 是预测分布中第 $i$ 个类别的概率。\n- $\\log$ 通常以自然对数（底数为 $e$）计算。`;
    addMessage('ai', initialMessage);

    // 测试 API 返回格式（使用 \\(...\\) 和 \\[...\\]）
    const testAPIMessage = `当然可以！一个标准的椭圆方程在二维坐标系中通常表示为：\n\n\\[ \\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1 \\]\n\n其中：\n- \\( (h, k) \\) 是椭圆的中心坐标，\n- \\( a \\) 是椭圆的长轴长度的一半（半长轴），\n- \\( b \\) 是椭圆的短轴长度的一半（半短轴）。\n如果椭圆的长轴与 \\( x \\)-轴平行，则 \\( a > b \\)；如果长轴与 \\( y \\)-轴平行，则 \\( b > a \\)。\n\n例如，一个中心在原点 \\( (0, 0) \\)，长轴长度为 6（即 \\( a = 3 \\)），短轴长度为 4（即 \\( b = 2 \\)）的椭圆方程为：\n\n\\[ \\frac{x^2}{9} + \\frac{y^2}{4} = 1 \\]\n\n如果你有其他具体需求或参数，可以告诉我，我可以帮你写出更具体的方程！`;
    addMessage('ai', testAPIMessage);
});