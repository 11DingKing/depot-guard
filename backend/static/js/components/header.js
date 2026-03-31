/**
 * 顶部栏模块
 */

const Header = {
    // 初始化
    init() {
        this.renderUserInfo();
        this.bindEvents();
        this.startClock();
    },
    
    // 渲染用户信息
    renderUserInfo() {
        const user = API.getUser();
        if (!user) return;
        
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');
        
        if (userNameEl) {
            // 显示用户名（username）
            userNameEl.textContent = user.username;
        }
        if (userRoleEl) {
            userRoleEl.textContent = user.role_display || user.role;
        }
        if (userAvatarEl) {
            userAvatarEl.textContent = user.username.charAt(0).toUpperCase();
        }
    },
    
    // 绑定事件
    bindEvents() {
        // 点击用户名直接触发退出确认框
        const logoutBtn = document.querySelector('.header-user.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // 全屏切换
        const fullscreenBtn = document.querySelector('.header-fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    },
    
    // 处理退出登录
    handleLogout() {
        Confirm.show({
            title: '确认退出',
            message: '确定要退出登录吗？',
            type: 'warning',
            confirmText: '退出',
            cancelText: '取消',
            onConfirm: async () => {
                Loading.show('正在退出...');
                try {
                    await API.logout();
                } catch (e) {
                    // 忽略错误
                }
                API.clearToken();
                Loading.hide();
                window.location.href = '/login/';
            },
        });
    },
    
    // 切换全屏
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    
    // 启动时钟
    startClock() {
        const timeEl = document.querySelector('.header-time');
        if (!timeEl) return;
        
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    },
};

// 导出
window.Header = Header;
