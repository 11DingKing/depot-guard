/**
 * 提示框模块
 */

const Toast = {
    // 容器元素
    container: null,
    
    // 初始化
    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    // 显示提示
    show(options) {
        this.init();
        
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 3000,
        } = options;
        
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;
        
        this.container.appendChild(toast);
        
        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 关闭按钮
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.close(toast));
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => this.close(toast), duration);
        }
        
        return toast;
    },
    
    // 关闭提示
    close(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },
    
    // 快捷方法
    success(message, title = '成功') {
        return this.show({ type: 'success', title, message });
    },
    
    error(message, title = '错误') {
        return this.show({ type: 'error', title, message });
    },
    
    warning(message, title = '警告') {
        return this.show({ type: 'warning', title, message });
    },
    
    info(message, title = '提示') {
        return this.show({ type: 'info', title, message });
    },
};

// 确认对话框
const Confirm = {
    overlay: null,
    
    show(options) {
        const {
            title = '确认操作',
            message = '确定要执行此操作吗？',
            confirmText = '确定',
            cancelText = '取消',
            type = 'info',
            onConfirm = () => {},
            onCancel = () => {},
        } = options;
        
        const icons = {
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
        };
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'confirm-overlay';
        this.overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-icon">${icons[type] || icons.info}</div>
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button class="btn btn-secondary confirm-cancel">${cancelText}</button>
                    <button class="btn btn-primary confirm-ok">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        // 触发动画
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
        
        // 绑定事件
        const cancelBtn = this.overlay.querySelector('.confirm-cancel');
        const okBtn = this.overlay.querySelector('.confirm-ok');
        
        cancelBtn.addEventListener('click', () => {
            this.close();
            onCancel();
        });
        
        okBtn.addEventListener('click', () => {
            this.close();
            onConfirm();
        });
        
        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
                onCancel();
            }
        });
    },
    
    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300);
        }
    },
};

// 导出
window.Toast = Toast;
window.Confirm = Confirm;
