/**
 * 品类管理页面
 */

document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const pageSize = 10;
    let selectedIds = [];
    let units = [];
    
    // 加载单位列表
    async function loadUnits() {
        try {
            const result = await API.getAllUnits();
            if (result && result.success) {
                units = result.data;
            }
        } catch (error) {
            console.error('加载单位列表失败:', error);
        }
    }
    
    // 加载品类列表
    async function loadCategories(page = 1) {
        Loading.show('加载中...');
        
        try {
            const result = await API.getCategories({ page, page_size: pageSize });
            
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
    function renderTable(categories) {
        const tbody = document.getElementById('categoryTableBody');
        selectedIds = [];
        document.getElementById('selectAll').checked = false;
        
        if (!categories || categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 60px; color: var(--text-muted);">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = categories.map(category => {
            const statusClass = category.is_linked ? 'status-success' : 'status-warning';
            const statusText = category.is_linked ? '已关联' : '未关联';
            const canDelete = !category.is_linked;
            
            return `
                <tr data-id="${category.id}" data-linked="${category.is_linked}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="form-checkbox row-checkbox" data-id="${category.id}" ${category.is_linked ? 'disabled' : ''}>
                    </td>
                    <td>${category.id}</td>
                    <td><span class="badge badge-primary">${category.name}</span></td>
                    <td><span class="badge badge-secondary">${category.unit_name}</span></td>
                    <td>${new Date(category.created_at).toLocaleString('zh-CN')}</td>
                    <td><span class="table-status ${statusClass}">${statusText}</span></td>
                    <td>${category.created_by_name || '-'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit-btn" data-id="${category.id}" data-name="${category.name}" data-unit="${category.unit}" title="编辑">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            ${canDelete ? `
                                <button class="table-action-btn danger delete-btn" data-id="${category.id}" data-name="${category.name}" title="删除">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    </svg>
                                </button>
                            ` : ''}
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
                loadCategories(parseInt(btn.dataset.page));
            });
        });
    }
    
    // 绑定表格事件
    function bindTableEvents() {
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedIds);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showEditModal(btn.dataset.id, btn.dataset.name, btn.dataset.unit);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirm(btn.dataset.id, btn.dataset.name);
            });
        });
    }
    
    // 更新选中的ID
    function updateSelectedIds() {
        selectedIds = [];
        document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
            selectedIds.push(parseInt(checkbox.dataset.id));
        });
        
        const allCheckboxes = document.querySelectorAll('.row-checkbox:not(:disabled)');
        const checkedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
        document.getElementById('selectAll').checked = 
            allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
    }
    
    // 全选
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.row-checkbox:not(:disabled)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateSelectedIds();
    });
    
    // 显示新增/编辑弹窗
    function showEditModal(categoryId = null, categoryName = '', categoryUnit = '') {
        const isEdit = !!categoryId;
        
        const unitOptions = units.map(u => 
            `<option value="${u.id}" ${u.id == categoryUnit ? 'selected' : ''}>${u.name}</option>`
        ).join('');
        
        let content = `
            <form id="categoryForm" class="modal-form">
                <div class="form-group">
                    <label class="form-label">品类名称 <span class="required">*</span></label>
                    <input type="text" class="form-input" name="name" value="${categoryName}" 
                           placeholder="请输入品类名称（1-10个字）" maxlength="10" required>
                    <div class="form-hint">最少1个字，最多10个字</div>
                </div>
                <div class="form-group">
                    <label class="form-label">单位 <span class="required">*</span></label>
                    <select class="form-input form-select" name="unit" required>
                        <option value="">请选择单位</option>
                        ${unitOptions}
                    </select>
                </div>
            </form>
        `;
        
        const modal = Modal.create({
            title: isEdit ? '编辑品类' : '新增品类',
            content: content,
            size: 'sm',
            confirmText: '保存',
            onConfirm: async () => {
                const form = document.getElementById('categoryForm');
                const name = form.querySelector('[name="name"]').value.trim();
                const unit = form.querySelector('[name="unit"]').value;
                
                if (!name) {
                    Toast.error('请输入品类名称');
                    return false;
                }
                
                if (name.length < 1 || name.length > 10) {
                    Toast.error('品类名称需要1-10个字');
                    return false;
                }
                
                if (!unit) {
                    Toast.error('请选择单位');
                    return false;
                }
                
                Loading.btnLoading(modal.getConfirmBtn(), true);
                
                try {
                    let result;
                    if (isEdit) {
                        result = await API.updateCategory(categoryId, { name, unit: parseInt(unit) });
                    } else {
                        result = await API.createCategory({ name, unit: parseInt(unit) });
                    }
                    
                    if (result && result.success) {
                        Toast.success(isEdit ? '更新成功' : '创建成功');
                        loadCategories(currentPage);
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
    function showDeleteConfirm(categoryId, name) {
        Confirm.show({
            title: '确认删除',
            message: `确定要删除品类 "${name}" 吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.deleteCategory(categoryId);
                    
                    if (result && result.success) {
                        Toast.success('删除成功');
                        loadCategories(currentPage);
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
    
    // 批量删除
    document.getElementById('batchDeleteBtn').addEventListener('click', function() {
        document.querySelectorAll('.row-checkbox:not(:disabled)').forEach(checkbox => {
            checkbox.checked = true;
        });
        updateSelectedIds();
        
        if (selectedIds.length === 0) {
            Toast.warning('没有可删除的品类（已关联的品类不能删除）');
            return;
        }
        
        Confirm.show({
            title: '确认批量删除',
            message: `确定要删除这 ${selectedIds.length} 个品类吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.batchDeleteCategories(selectedIds);
                    
                    if (result && result.success) {
                        Toast.success(result.message);
                        loadCategories(currentPage);
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
    });
    
    // 新增按钮
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        if (units.length === 0) {
            Toast.warning('请先添加单位');
            return;
        }
        showEditModal();
    });
    
    // 初始加载
    loadUnits().then(() => {
        loadCategories();
    });
});
