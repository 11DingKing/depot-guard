/**
 * 出库人员管理页面
 */

document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const pageSize = 10;
    let adminUsers = [];
    
    // 加载管理员用户列表
    async function loadAdminUsers() {
        try {
            const result = await API.getAdminUsers();
            if (result && result.success) {
                adminUsers = result.data;
            }
        } catch (error) {
            console.error('加载管理员列表失败:', error);
        }
    }
    
    // 加载出库人员列表
    async function loadPersons(page = 1) {
        Loading.show('加载中...');
        
        try {
            const result = await API.getStockOutPersons({ page, page_size: pageSize });
            
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
    function renderTable(persons) {
        const tbody = document.getElementById('personTableBody');
        
        if (!persons || persons.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 60px; color: var(--text-muted);">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = persons.map(person => {
            const bindUserDisplay = person.binduser_name 
                ? `<span class="table-status status-success">${person.binduser_name}</span>`
                : '<span class="text-muted">未绑定</span>';
            
            return `
                <tr>
                    <td>${person.id}</td>
                    <td><span class="badge badge-info">${person.police_no}</span></td>
                    <td>
                        <div class="person-cell">
                            ${person.avatar_url 
                                ? `<img src="${person.avatar_url}" class="person-avatar-sm" alt="${person.name}">`
                                : `<div class="person-avatar-sm-placeholder">${person.name.charAt(0)}</div>`
                            }
                            <span>${person.name}</span>
                        </div>
                    </td>
                    <td>${person.phone}</td>
                    <td>${bindUserDisplay}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit-btn" data-id="${person.id}" title="编辑">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="table-action-btn danger delete-btn" data-id="${person.id}" data-name="${person.name}" title="删除">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
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
        
        pagination.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                loadPersons(parseInt(btn.dataset.page));
            });
        });
    }
    
    // 绑定表格事件
    function bindTableEvents() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showEditModal(btn.dataset.id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirm(btn.dataset.id, btn.dataset.name);
            });
        });
    }
    
    // 显示新增/编辑弹窗
    async function showEditModal(personId = null) {
        const isEdit = !!personId;
        let personData = null;
        
        if (isEdit) {
            Loading.show('加载中...');
            try {
                const result = await API.request(`/stock-out-persons/${personId}/`, { method: 'GET' });
                if (result && result.success) {
                    personData = result.data;
                } else {
                    Toast.error('获取人员信息失败');
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
        
        // 管理员选项
        const adminOptions = adminUsers.map(u => 
            `<option value="${u.id}" ${personData?.binduser === u.id ? 'selected' : ''}>${u.username}</option>`
        ).join('');
        
        let content = `
            <form id="personForm" class="modal-form" enctype="multipart/form-data">
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">警号 <span class="required">*</span></label>
                        <input type="text" class="form-input" name="police_no" value="${personData?.police_no || ''}" placeholder="请输入警号" required>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">姓名 <span class="required">*</span></label>
                        <input type="text" class="form-input" name="name" value="${personData?.name || ''}" placeholder="请输入姓名" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">身份证号</label>
                        <input type="text" class="form-input" name="id_card" value="${personData?.id_card || ''}" placeholder="选填">
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">手机号 <span class="required">*</span></label>
                        <input type="text" class="form-input" name="phone" value="${personData?.phone || ''}" placeholder="请输入手机号" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">绑定管理员</label>
                    <select class="form-input form-select" name="binduser">
                        <option value="">不绑定</option>
                        ${adminOptions}
                    </select>
                    <div class="form-hint">只能绑定管理员用户，不能绑定普通用户和超级管理员</div>
                </div>
                <div class="form-group">
                    <label class="form-label">蓝底照片</label>
                    <div class="upload-area">
                        <div class="upload-preview" id="uploadPreview">
                            ${personData?.avatar_url 
                                ? `<img src="${personData.avatar_url}" alt="当前照片">`
                                : '<div class="upload-placeholder">点击上传照片</div>'
                            }
                        </div>
                        <input type="file" class="upload-input" name="avatar" id="avatarInput" accept="image/*">
                        <div class="upload-hint">
                            <a href="javascript:void(0)" id="showSampleBtn">查看示范图</a>
                        </div>
                    </div>
                </div>
            </form>
        `;
        
        const modal = Modal.create({
            title: isEdit ? '编辑出库人员' : '新增出库人员',
            content: content,
            size: 'lg',
            confirmText: '保存',
            onConfirm: async () => {
                const form = document.getElementById('personForm');
                const formData = new FormData(form);
                
                // 验证
                if (!formData.get('police_no')) {
                    Toast.error('请输入警号');
                    return false;
                }
                if (!formData.get('name')) {
                    Toast.error('请输入姓名');
                    return false;
                }
                if (!formData.get('phone')) {
                    Toast.error('请输入手机号');
                    return false;
                }
                
                Loading.btnLoading(modal.getConfirmBtn(), true);
                
                try {
                    let result;
                    if (isEdit) {
                        result = await API.updateStockOutPerson(personId, formData);
                    } else {
                        result = await API.createStockOutPerson(formData);
                    }
                    
                    if (result && result.success) {
                        Toast.success(isEdit ? '更新成功' : '创建成功');
                        loadPersons(currentPage);
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
        
        // 图片预览
        const avatarInput = document.getElementById('avatarInput');
        const uploadPreview = document.getElementById('uploadPreview');
        
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadPreview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        uploadPreview.addEventListener('click', () => {
            avatarInput.click();
        });
        
        // 查看示范图
        document.getElementById('showSampleBtn').addEventListener('click', () => {
            Modal.create({
                title: '蓝底照片示范',
                content: '<div class="sample-modal"><img src="/static/images/001.png" alt="示范图" style="max-width: 100%; border-radius: 8px;"></div>',
                showFooter: false,
                size: 'sm'
            });
        });
    }
    
    // 显示删除确认
    function showDeleteConfirm(personId, name) {
        Confirm.show({
            title: '确认删除',
            message: `确定要删除出库人员 "${name}" 吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.deleteStockOutPerson(personId);
                    
                    if (result && result.success) {
                        Toast.success('删除成功');
                        loadPersons(currentPage);
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
    document.getElementById('addPersonBtn').addEventListener('click', () => {
        showEditModal();
    });
    
    // 初始加载
    loadAdminUsers().then(() => {
        loadPersons();
    });
});
