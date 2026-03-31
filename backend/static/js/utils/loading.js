/**
 * 加载动画模块
 */

const Loading = {
    // 加载遮罩元素
    overlay: null,
    
    // 初始化
    init() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-ring">
                    <div class="center-dot"></div>
                </div>
                <div class="loading-text">LOADING</div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    },
    
    // 显示加载
    show(text = 'LOADING') {
        this.init();
        const textEl = this.overlay.querySelector('.loading-text');
        if (textEl) {
            textEl.textContent = text;
        }
        this.overlay.classList.add('active');
    },
    
    // 隐藏加载
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    },
    
    // 按钮加载状态
    btnLoading(btn, loading = true) {
        if (loading) {
            btn.classList.add('btn-loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    },
    
    // 创建骨架屏
    createSkeleton(container, count = 3) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton skeleton-card"></div>
            `;
        }
        container.innerHTML = html;
    },
    
    // 创建表格骨架屏
    createTableSkeleton(container, rows = 5, cols = 5) {
        let html = '<table class="data-table"><thead><tr>';
        for (let i = 0; i < cols; i++) {
            html += '<th><div class="skeleton skeleton-text" style="width: 80px;"></div></th>';
        }
        html += '</tr></thead><tbody>';
        
        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += '<td><div class="skeleton skeleton-text"></div></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        
        container.innerHTML = html;
    },
};

// 导出
window.Loading = Loading;
