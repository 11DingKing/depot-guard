/**
 * 主页面初始化逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const token = API.getToken();
    if (!token) {
        window.location.href = '/login/';
        return;
    }
    
    // 初始化侧边栏
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
        Sidebar.init(sidebarMenu);
    }
    
    // 初始化顶部栏
    Header.init();
    
    // 侧边栏折叠
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // 保存状态
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // 恢复状态
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
    
    // 移动端菜单
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
    }
});
