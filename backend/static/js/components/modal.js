/**
 * 模态框模块
 */

const Modal = {
    // 当前打开的模态框
    current: null,
    
    // 创建模态框
    create(options) {
        const {
            title = '',
            content = '',
            size = '', // sm, lg, xl, full
            showClose = true,
            showFooter = true,
            confirmText = '确定',
            cancelText = '取消',
            onConfirm = null,
            onCancel = null,
            onClose = null,
        } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        let sizeClass = size ? `modal-${size}` : '';
        
        overlay.innerHTML = `
            <div class="modal ${sizeClass}">
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                    ${showClose ? `
                        <button class="modal-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">${content}</div>
                ${showFooter ? `
                    <div class="modal-footer">
                        <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                        <button class="btn btn-primary modal-confirm">${confirmText}</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 触发动画
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // 绑定事件
        const closeBtn = overlay.querySelector('.modal-close');
        const cancelBtn = overlay.querySelector('.modal-cancel');
        const confirmBtn = overlay.querySelector('.modal-confirm');
        
        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                if (onClose) onClose();
            }, 300);
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                close();
                if (onCancel) onCancel();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                close();
                if (onCancel) onCancel();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (onConfirm) {
                    const result = onConfirm();
                    if (result !== false) {
                        close();
                    }
                } else {
                    close();
                }
            });
        }
        
        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
                if (onCancel) onCancel();
            }
        });
        
        // ESC关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                close();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        this.current = {
            overlay,
            close,
            getBody: () => overlay.querySelector('.modal-body'),
            getConfirmBtn: () => overlay.querySelector('.modal-confirm'),
            getCancelBtn: () => overlay.querySelector('.modal-cancel'),
        };
        
        return this.current;
    },
    
    // 关闭当前模态框
    close() {
        if (this.current) {
            this.current.close();
            this.current = null;
        }
    },
    
    // 表单模态框
    form(options) {
        const {
            title = '',
            fields = [],
            data = {},
            size = '',
            onSubmit = null,
        } = options;
        
        let formHtml = '<form class="modal-form">';
        
        fields.forEach(field => {
            const value = data[field.name] ?? field.default ?? '';
            const required = field.required ? 'required' : '';
            const requiredMark = field.required ? '<span class="required">*</span>' : '';
            
            formHtml += `<div class="form-group">`;
            formHtml += `<label class="form-label ${required}">${field.label}${requiredMark}</label>`;
            
            switch (field.type) {
                case 'textarea':
                    formHtml += `<textarea class="form-input form-textarea" name="${field.name}" placeholder="${field.placeholder || ''}">${value}</textarea>`;
                    break;
                case 'select':
                    formHtml += `<select class="form-input form-select" name="${field.name}">`;
                    if (field.placeholder) {
                        formHtml += `<option value="">${field.placeholder}</option>`;
                    }
                    (field.options || []).forEach(opt => {
                        const selected = opt.value == value ? 'selected' : '';
                        formHtml += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                    });
                    formHtml += `</select>`;
                    break;
                case 'number':
                    formHtml += `<input type="number" class="form-input" name="${field.name}" value="${value}" placeholder="${field.placeholder || ''}" step="${field.step || 1}">`;
                    break;
                default:
                    formHtml += `<input type="${field.type || 'text'}" class="form-input" name="${field.name}" value="${value}" placeholder="${field.placeholder || ''}">`;
            }
            
            formHtml += `</div>`;
        });
        
        formHtml += '</form>';
        
        const modal = this.create({
            title,
            content: formHtml,
            size,
            onConfirm: () => {
                const form = modal.getBody().querySelector('form');
                const formData = FormUtils.getData(form);
                
                if (onSubmit) {
                    return onSubmit(formData, form);
                }
            },
        });
        
        return modal;
    },
};

// 导出
window.Modal = Modal;
