/**
 * 考勤人员管理页面
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查权限
    const user = API.getUser();
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
        Toast.error('无权限访问此页面');
        setTimeout(() => {
            window.location.href = '/menu/dashboard/';
        }, 1000);
        return;
    }
    
    let currentPage = 1;
    const pageSize = 10;
    
    // 加载用户列表
    async function loadUsers(page = 1) {
        Loading.show('加载中...');
        
        try {
            const result = await API.getUsers({ page, page_size: pageSize });
            
            if (result && result.success) {
                renderTable(result.data.list);
                renderPagination(result.data.total, page);
                currentPage = page;
            } else {
                Toast.error(result?.message || '加载失败');
            }
        } catch (error) {
            Toast.error('网络错误');
        } finally {
            Loading.hide();
        }
    }
    
    // 渲染表格
    function renderTable(users) {
        const tbody = document.getElementById('userTableBody');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 60px; color: var(--text-muted);">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const roleClass = user.role === 'superadmin' ? 'status-info' : 
                              user.role === 'admin' ? 'status-success' : 'status-warning';
            
            const stockOutCount = user.stock_out_person_count || 0;
            const stockOutLink = stockOutCount > 0 
                ? `<a href="javascript:void(0)" class="link-count" data-persons='${JSON.stringify(user.stock_out_persons)}'>${stockOutCount}</a>`
                : '<span class="text-muted">未关联</span>';
            
            const lastLogin = user.last_login 
                ? new Date(user.last_login).toLocaleString('zh-CN')
                : '<span class="text-muted">从未登录</span>';
            
            const canDelete = user.role !== 'superadmin';
            
            return `
                <tr>
                    <td>${user.id}</td>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar-sm">${user.username.charAt(0).toUpperCase()}</div>
                            <span>${user.username}</span>
                        </div>
                    </td>
                    <td><span class="table-status ${roleClass}">${user.role_display}</span></td>
                    <td>${stockOutLink}</td>
                    <td>${new Date(user.created_at).toLocaleString('zh-CN')}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit-btn" data-id="${user.id}" title="编辑">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            ${canDelete ? `
                                <button class="table-action-btn danger delete-btn" data-id="${user.id}" data-name="${user.username}" title="删除">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 绑定事件
        bindTableEvents();
    }
    
    // 渲染分页
    function renderPagination(total, page) {
        const totalPages = Math.ceil(total / pageSize);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = `<div class="pagination-info">共 ${total} 条记录</div>`;
            return;
        }
        
        let html = `<div class="pagination-info">共 ${total} 条记录，第 ${page}/${totalPages} 页</div>`;
        html += '<div class="pagination-controls">';
        
        html += `<button class="pagination-btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        </button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                html += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === page - 3 || i === page + 3) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        html += `<button class="pagination-btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </button>`;
        
        html += '</div>';
        pagination.innerHTML = html;
        
        // 绑定分页事件
        pagination.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                loadUsers(parseInt(btn.dataset.page));
            });
        });
    }
    
    // 绑定表格事件
    function bindTableEvents() {
        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showEditModal(btn.dataset.id);
            });
        });
        
        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirm(btn.dataset.id, btn.dataset.name);
            });
        });
        
        // 关联出库人员数量点击
        document.querySelectorAll('.link-count').forEach(link => {
            link.addEventListener('click', () => {
                const persons = JSON.parse(link.dataset.persons);
                showStockOutPersonsModal(persons);
            });
        });
    }
    
    // 显示出库人员弹窗
    function showStockOutPersonsModal(persons) {
        let content = '<div class="person-list">';
        persons.forEach(p => {
            content += `
                <div class="person-item">
                    <div class="person-info">
                        <div class="person-name">${p.name}</div>
                        <div class="person-detail">警号: ${p.police_no} | 手机: ${p.phone}</div>
                    </div>
                </div>
            `;
        });
        content += '</div>';
        
        Modal.create({
            title: '关联的出库人员',
            content: content,
            showFooter: false,
            size: 'sm'
        });
    }
    
    // 显示新增/编辑弹窗
    async function showEditModal(userId = null) {
        const isEdit = !!userId;
        let userData = null;
        
        if (isEdit) {
            Loading.show('加载中...');
            try {
                const result = await API.request(`/auth/users/${userId}/`, { method: 'GET' });
                if (result && result.success) {
                    userData = result.data;
                } else {
                    Toast.error('获取用户信息失败');
                    Loading.hide();
                    return;
                }
            } catch (error) {
                Toast.error('网络错误');
                Loading.hide();
                return;
            }
            Loading.hide();
        }
        
        const currentUser = API.getUser();
        const isSuperAdmin = userData && userData.role === 'superadmin';
        
        let content = `
            <form id="userForm" class="modal-form">
                <div class="form-group">
                    <label class="form-label">用户名 <span class="required">*</span></label>
                    <input type="text" class="form-input" name="username" value="${userData?.username || ''}" placeholder="请输入用户名" required>
                </div>
                <div class="form-group">
                    <label class="form-label">密码 ${isEdit ? '' : '<span class="required">*</span>'}</label>
                    <input type="password" class="form-input" name="password" placeholder="${isEdit ? '不修改请留空' : '请输入密码'}" ${isEdit ? '' : 'required'}>
                </div>
                <div class="form-group">
                    <label class="form-label">确认密码 ${isEdit ? '' : '<span class="required">*</span>'}</label>
                    <input type="password" class="form-input" name="confirm_password" placeholder="${isEdit ? '不修改请留空' : '请再次输入密码'}" ${isEdit ? '' : 'required'}>
                </div>
                ${!isSuperAdmin ? `
                    <div class="form-group">
                        <label class="form-label">角色 <span class="required">*</span></label>
                        <select class="form-input form-select" name="role" required>
                            <option value="admin" ${userData?.role === 'admin' ? 'selected' : ''}>管理员</option>
                            <option value="user" ${userData?.role === 'user' ? 'selected' : ''}>普通用户</option>
                        </select>
                    </div>
                ` : `
                    <div class="form-group">
                        <label class="form-label">角色</label>
                        <input type="text" class="form-input" value="超级管理员" disabled>
                        <input type="hidden" name="role" value="superadmin">
                    </div>
                `}
            </form>
        `;
        
        const modal = Modal.create({
            title: isEdit ? '编辑用户' : '新增用户',
            content: content,
            confirmText: '保存',
            onConfirm: async () => {
                const form = document.getElementById('userForm');
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                // 验证
                if (!data.username) {
                    Toast.error('请输入用户名');
                    return false;
                }
                
                if (!isEdit && !data.password) {
                    Toast.error('请输入密码');
                    return false;
                }
                
                if (data.password && data.password !== data.confirm_password) {
                    Toast.error('两次输入的密码不一致');
                    return false;
                }
                
                Loading.btnLoading(modal.getConfirmBtn(), true);
                
                try {
                    let result;
                    if (isEdit) {
                        result = await API.updateUser(userId, data);
                    } else {
                        result = await API.createUser(data);
                    }
                    
                    if (result && result.success) {
                        Toast.success(isEdit ? '更新成功' : '创建成功');
                        loadUsers(currentPage);
                        return true;
                    } else {
                        Toast.error(result?.message || '操作失败');
                        return false;
                    }
                } catch (error) {
                    Toast.error('网络错误');
                    return false;
                } finally {
                    Loading.btnLoading(modal.getConfirmBtn(), false);
                }
            }
        });
    }
    
    // 显示删除确认
    function showDeleteConfirm(userId, username) {
        Confirm.show({
            title: '确认删除',
            message: `确定要删除用户 "${username}" 吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.deleteUser(userId);
                    
                    if (result && result.success) {
                        Toast.success('删除成功');
                        loadUsers(currentPage);
                    } else {
                        Toast.error(result?.message || '删除失败');
                    }
                } catch (error) {
                    Toast.error('网络错误');
                } finally {
                    Loading.hide();
                }
            }
        });
    }
    
    // 新增按钮
    document.getElementById('addUserBtn').addEventListener('click', () => {
        showEditModal();
    });
    
    // 初始加载
    loadUsers();
});
