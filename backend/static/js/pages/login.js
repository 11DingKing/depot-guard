/**
 * 登录页面逻辑
 * 验证码前端生成，登录与后端API连接
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    const token = API.getToken();
    if (token) {
        window.location.href = '/index/';
        return;
    }
    
    // 获取DOM元素
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    const captchaBox = document.getElementById('captchaBox');
    const captchaText = document.getElementById('captchaText');
    const loginBtn = document.getElementById('loginBtn');
    
    // 生成验证码
    function refreshCaptcha() {
        Captcha.render(captchaText);
    }
    
    // 初始化验证码
    refreshCaptcha();
    
    // 点击刷新验证码
    captchaBox.addEventListener('click', refreshCaptcha);
    
    // 表单提交 - 与后端API连接
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const captchaValue = captchaInput.value.trim();
        
        // 前端验证
        if (!username) {
            Toast.error('请输入用户名');
            usernameInput.focus();
            return;
        }
        
        if (!password) {
            Toast.error('请输入密码');
            passwordInput.focus();
            return;
        }
        
        if (!captchaValue) {
            Toast.error('请输入验证码');
            captchaInput.focus();
            return;
        }
        
        // 前端验证码校验（算术验证码由前端生成和校验）
        if (!Captcha.verify(captchaValue)) {
            Toast.error('验证码错误');
            captchaInput.value = '';
            captchaInput.focus();
            refreshCaptcha();
            return;
        }
        
        // 验证码通过后，发送登录请求到后端
        Loading.btnLoading(loginBtn, true);
        
        try {
            // 调用后端登录API
            const result = await API.login(username, password);
            
            if (result && result.success) {
                // 登录成功，保存Token和用户信息
                API.setToken(result.data.token);
                API.setUser(result.data.user);
                
                Toast.success('登录成功');
                
                // 跳转到主页
                setTimeout(() => {
                    window.location.href = '/index/';
                }, 500);
            } else {
                // 登录失败
                Toast.error(result?.message || '登录失败');
                refreshCaptcha();
                captchaInput.value = '';
            }
        } catch (error) {
            // 网络错误
            Toast.error('网络错误，请稍后重试');
            refreshCaptcha();
            captchaInput.value = '';
        } finally {
            Loading.btnLoading(loginBtn, false);
        }
    });
    
    // 回车提交
    [usernameInput, passwordInput, captchaInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });
    
    // 密码显示/隐藏
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            // 切换图标
            this.innerHTML = type === 'password' 
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        });
    }
});
