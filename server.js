const express = require('express');
const app = express();
app.use(express.json());
app.use(express.text());

let pendingCode = null;
let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>QL ServerSide - 远程执行器</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', sans-serif;
            padding: 20px;
        }

        /* 主容器 */
        .container {
            max-width: 550px;
            width: 100%;
            background: rgba(20, 22, 32, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 28px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            overflow: hidden;
        }

        /* 头部 */
        .header {
            background: linear-gradient(135deg, #1a1c2c 0%, #141624 100%);
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 800;
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #fff, #a5b4fc);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
        }

        .logo-badge {
            font-size: 10px;
            background: rgba(99, 102, 241, 0.2);
            padding: 2px 8px;
            border-radius: 20px;
            color: #a5b4fc;
            margin-left: 8px;
            font-weight: 500;
        }

        .version {
            font-size: 11px;
            color: #565a7a;
            margin-top: 4px;
        }

        /* 内容区域 */
        .content {
            padding: 24px;
        }

        /* 输入组 */
        .input-group {
            margin-bottom: 20px;
        }

        .input-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 500;
            color: #b9b9d6;
        }

        .input-label span:first-child {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .code-hint {
            font-size: 11px;
            color: #565a7a;
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 8px;
            border-radius: 12px;
        }

        .input-field {
            width: 100%;
            background: #0c0d14;
            border: 1.5px solid #25283a;
            border-radius: 16px;
            padding: 14px 16px;
            font-size: 14px;
            color: white;
            font-family: 'Inter', monospace;
            transition: all 0.2s ease;
        }

        .input-field:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .input-field::placeholder {
            color: #3a3d5c;
        }

        textarea.input-field {
            resize: vertical;
            min-height: 180px;
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
        }

        /* 按钮 */
        .btn-execute {
            width: 100%;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: none;
            border-radius: 16px;
            padding: 14px;
            font-size: 15px;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 8px;
        }

        .btn-execute:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
        }

        .btn-execute:active {
            transform: translateY(0);
        }

        /* 状态消息 */
        .status {
            margin-top: 20px;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 14px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-left: 3px solid #6366f1;
        }

        .status-icon {
            width: 20px;
            height: 20px;
            border-radius: 10px;
            background: #6366f1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .status-text {
            color: #a5b4fc;
            flex: 1;
        }

        /* 快捷模板 */
        .templates {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .templates-title {
            font-size: 12px;
            color: #565a7a;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .template-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .template-btn {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 11px;
            color: #a5b4fc;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .template-btn:hover {
            background: rgba(99, 102, 241, 0.2);
            border-color: #6366f1;
        }

        /* 页脚 */
        .footer {
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.2);
            text-align: center;
            font-size: 11px;
            color: #3a3d5c;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* 动画 */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .loading {
            animation: pulse 1s ease infinite;
        }

        /* 响应式 */
        @media (max-width: 480px) {
            .container {
                border-radius: 20px;
            }
            .content {
                padding: 20px;
            }
            .logo-text {
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">Q</div>
                <div>
                    <span class="logo-text">QL ServerSide</span>
                    <span class="logo-badge">SECURE</span>
                    <div class="version">Remote Execution System v3.2</div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="input-group">
                <div class="input-label">
                    <span>🔐 验证码</span>
                    <span class="code-hint">从 Discord 获取</span>
                </div>
                <input type="text" class="input-field" id="authCode" placeholder="输入验证码..." autocomplete="off">
            </div>

            <div class="input-group">
                <div class="input-label">
                    <span>📝 Lua 代码</span>
                    <span class="code-hint">将在此服务器执行</span>
                </div>
                <textarea class="input-field" id="luaCode" placeholder='-- 输入要执行的 Lua 代码
print("Hello from QL ServerSide!")
    
-- 支持多行代码
local players = game.Players:GetPlayers()
print("当前玩家数: " .. #players)'></textarea>
            </div>

            <button class="btn-execute" id="executeBtn">
                <span>⚡</span>
                <span>执行代码</span>
            </button>

            <div class="status" id="statusBox">
                <div class="status-icon">●</div>
                <div class="status-text" id="statusText">等待执行</div>
            </div>

            <div class="templates">
                <div class="templates-title">📋 快捷模板</div>
                <div class="template-buttons">
                    <button class="template-btn" data-code='print("Hello from QL ServerSide!")'>打印消息</button>
                    <button class="template-btn" data-code='for _, p in pairs(game.Players:GetPlayers()) do p:Kick("执行器测试") end'>踢出所有人</button>
                    <button class="template-btn" data-code='game.Lighting.ClockTime = 0'>设为黑夜</button>
                    <button class="template-btn" data-code='game.Lighting.ClockTime = 14'>设为白天</button>
                    <button class="template-btn" data-code='for _, p in pairs(game.Players:GetPlayers()) do p.Character.Humanoid.Health = 0 end'>秒杀所有人</button>
                </div>
            </div>
        </div>

        <div class="footer">
            QL ServerSide • 安全远程执行 • 仅限授权使用
        </div>
    </div>

    <script>
        const serverUrl = window.location.origin;
        const executeBtn = document.getElementById('executeBtn');
        const authCodeInput = document.getElementById('authCode');
        const luaCodeInput = document.getElementById('luaCode');
        const statusText = document.getElementById('statusText');
        const statusBox = document.getElementById('statusBox');

        function setStatus(message, isError = false) {
            statusText.textContent = message;
            statusBox.style.borderLeftColor = isError ? '#ef4444' : '#6366f1';
            if (isError) {
                statusText.style.color = '#f87171';
            } else {
                statusText.style.color = '#a5b4fc';
            }
        }

        function setLoading(loading) {
            if (loading) {
                executeBtn.disabled = true;
                executeBtn.style.opacity = '0.6';
                executeBtn.querySelector('span:first-child').innerHTML = '◌';
                setStatus('正在发送...');
            } else {
                executeBtn.disabled = false;
                executeBtn.style.opacity = '1';
                executeBtn.querySelector('span:first-child').innerHTML = '⚡';
            }
        }

        async function executeCode() {
            const authCode = authCodeInput.value.trim();
            const luaCode = luaCodeInput.value.trim();

            if (!authCode) {
                setStatus('请输入验证码', true);
                return;
            }

            if (!luaCode) {
                setStatus('请输入要执行的 Lua 代码', true);
                return;
            }

            setLoading(true);

            try {
                const response = await fetch('/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: authCode,
                        luaCode: luaCode
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus(data.message || '代码已发送，游戏内将执行');
                    luaCodeInput.value = '';
                } else {
                    setStatus(data.error || '发送失败', true);
                }
            } catch (error) {
                console.error('Error:', error);
                setStatus('网络错误: ' + error.message, true);
            } finally {
                setLoading(false);
            }
        }

        function loadTemplate(code) {
            luaCodeInput.value = code;
            luaCodeInput.focus();
        }

        executeBtn.addEventListener('click', executeCode);

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                loadTemplate(code);
            });
        });

        authCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                luaCodeInput.focus();
            }
        });

        luaCodeInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                executeCode();
            }
        });
    </script>
</body>
</html>
    `);
});

app.post('/execute', (req, res) => {
    const { code, luaCode } = req.body;
    pendingCode = code;
    pendingCommand = luaCode;
    res.json({ message: '已发送，等待游戏内执行...' });
});

app.get('/getCommand', (req, res) => {
    const authCode = req.query.code;
    if (authCode === pendingCode && pendingCommand) {
        const command = pendingCommand;
        pendingCommand = null;
        pendingCode = null;
        res.send(command);
    } else {
        res.status(204).send('');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('服务器运行在端口 ' + port));