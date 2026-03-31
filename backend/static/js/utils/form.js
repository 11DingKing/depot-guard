/**
 * 表单工具模块
 */

const FormUtils = {
    // 获取表单数据
    getData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // 处理数字类型
            if (form.querySelector(`[name="${key}"]`)?.type === 'number') {
                data[key] = value ? parseFloat(value) : null;
            } else {
                data[key] = value;
            }
        }
        
        return data;
    },
    
    // 设置表单数据
    setData(form, data) {
        for (const [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = !!value;
                } else if (input.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value ?? '';
                }
            }
        }
    },
    
    // 重置表单
    reset(form) {
        form.reset();
        // 清除错误状态
        form.querySelectorAll('.form-input.error').forEach(input => {
            input.classList.remove('error');
        });
        form.querySelectorAll('.form-error').forEach(error => {
            error.remove();
        });
    },
    
    // 验证表单
    validate(form, rules = {}) {
        let isValid = true;
        const errors = {};
        
        // 清除之前的错误
        form.querySelectorAll('.form-input.error').forEach(input => {
            input.classList.remove('error');
        });
        form.querySelectorAll('.form-error').forEach(error => {
            error.remove();
        });
        
        // 验证每个字段
        for (const [field, fieldRules] of Object.entries(rules)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input) continue;
            
            const value = input.value.trim();
            
            for (const rule of fieldRules) {
                let errorMessage = null;
                
                if (rule.required && !value) {
                    errorMessage = rule.message || '此字段为必填项';
                } else if (rule.minLength && value.length < rule.minLength) {
                    errorMessage = rule.message || `最少需要${rule.minLength}个字符`;
                } else if (rule.maxLength && value.length > rule.maxLength) {
                    errorMessage = rule.message || `最多允许${rule.maxLength}个字符`;
                } else if (rule.pattern && !rule.pattern.test(value)) {
                    errorMessage = rule.message || '格式不正确';
                } else if (rule.validator && !rule.validator(value)) {
                    errorMessage = rule.message || '验证失败';
                }
                
                if (errorMessage) {
                    isValid = false;
                    errors[field] = errorMessage;
                    
                    // 显示错误
                    input.classList.add('error');
                    const errorEl = document.createElement('div');
                    errorEl.className = 'form-error';
                    errorEl.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4M12 16h.01"/>
                        </svg>
                        ${errorMessage}
                    `;
                    input.parentNode.appendChild(errorEl);
                    
                    break;
                }
            }
        }
        
        return { isValid, errors };
    },
    
    // 禁用表单
    disable(form) {
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = true;
        });
    },
    
    // 启用表单
    enable(form) {
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = false;
        });
    },
};

// 导出
window.FormUtils = FormUtils;
