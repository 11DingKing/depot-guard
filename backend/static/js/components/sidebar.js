/**
 * 侧边栏菜单模块
 * URL格式: /menu/页面名/
 */

const Sidebar = {
    // 菜单配置
    menuConfig: [
        {
            id: 'dashboard',
            title: '仪表盘',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            url: '/menu/dashboard/',
        },
        {
            id: 'stock-in',
            title: '货物入库',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M5 12l7-7 7 7"/></svg>',
            url: '/menu/stock-in/',
        },
        {
            id: 'type-manage',
            title: '类型管理',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
            children: [
                { id: 'unit', title: '单位管理', url: '/menu/unit/' },
                { id: 'category', title: '品类管理', url: '/menu/category/' },
                { id: 'variety', title: '品种管理', url: '/menu/variety/' },
            ],
        },
        {
            id: 'query-export',
            title: '查询导出',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
            url: '/menu/query-export/',
        },
        {
            id: 'daily-report',
            title: '每日报表',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
            url: '/menu/daily-report/',
        },
        {
            id: 'warning',
            title: '预警',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
            url: '/menu/warning/',
        },
        {
            id: 'approval',
            title: '审批区域',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
            url: '/menu/approval/',
        },
        {
            id: 'personnel',
            title: '人员管理',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
            children: [
                { id: 'attendance-person', title: '考勤人员管理', url: '/menu/attendance-person/' },
                { id: 'stock-out-person', title: '出库人员管理', url: '/menu/stock-out-person/' },
            ],
        },
    ],
    
    // 初始化
    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
        this.setActiveMenu();
    },
    
    // 渲染菜单
    render() {
        let html = '';
        
        this.menuConfig.forEach(item => {
            if (item.children) {
                html += `
                    <div class="menu-item has-submenu" data-id="${item.id}">
                        <div class="menu-link parent-link">
                            <span class="menu-icon">${item.icon}</span>
                            <span class="menu-text">${item.title}</span>
                            <span class="menu-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </span>
                        </div>
                        <div class="submenu">
                            ${item.children.map(child => `
                                <a href="${child.url}" class="menu-link submenu-link" data-id="${child.id}">
                                    <span class="menu-text">${child.title}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="menu-item" data-id="${item.id}">
                        <a href="${item.url}" class="menu-link">
                            <span class="menu-icon">${item.icon}</span>
                            <span class="menu-text">${item.title}</span>
                        </a>
                    </div>
                `;
            }
        });
        
        this.container.innerHTML = html;
    },
    
    // 绑定事件
    bindEvents() {
        // 只给父菜单标题绑定展开/收起事件
        this.container.querySelectorAll('.parent-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const menuItem = link.closest('.menu-item');
                if (menuItem) {
                    menuItem.classList.toggle('open');
                }
            });
        });
    },
    
    // 设置当前激活菜单
    setActiveMenu() {
        const currentPath = window.location.pathname;
        
        // 遍历所有子菜单链接
        this.container.querySelectorAll('.submenu-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath === href) {
                link.classList.add('active');
                
                // 展开父菜单
                const parentItem = link.closest('.menu-item.has-submenu');
                if (parentItem) {
                    parentItem.classList.add('open');
                }
            }
        });
        
        // 遍历普通菜单链接
        this.container.querySelectorAll('.menu-item:not(.has-submenu) > .menu-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath === href) {
                link.classList.add('active');
            }
        });
    },
};

// 导出
window.Sidebar = Sidebar;
