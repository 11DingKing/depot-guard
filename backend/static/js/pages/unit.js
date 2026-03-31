/**
 * 单位管理页面
 */

document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const pageSize = 10;
    let selectedIds = [];
    
    // 加载单位列表
    async function loadUnits(page = 1) {
        Loading.show('加载中...');
        
        try {
            const result = await API.getUnits({ page, page_size: pageSize });
            
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
    function renderTable(units) {
        const tbody = document.getElementById('unitTableBody');
        selectedIds = [];
        document.getElementById('selectAll').checked = false;
        
        if (!units || units.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 60px; color: var(--text-muted);">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = units.map(unit => {
            const statusClass = unit.is_linked ? 'status-success' : 'status-warning';
            const statusText = unit.is_linked ? '已关联' : '未关联';
            const canDelete = !unit.is_linked;
            
            return `
                <tr data-id="${unit.id}" data-linked="${unit.is_linked}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="form-checkbox row-checkbox" data-id="${unit.id}" ${unit.is_linked ? 'disabled' : ''}>
                    </td>
                    <td>${unit.id}</td>
                    <td><span class="badge badge-primary">${unit.name}</span></td>
                    <td>${new Date(unit.created_at).toLocaleString('zh-CN')}</td>
                    <td><span class="table-status ${statusClass}">${statusText}</span></td>
                    <td>${unit.created_by_name || '-'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit-btn" data-id="${unit.id}" title="编辑">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            ${canDelete ? `
                                <button class="table-action-btn danger delete-btn" data-id="${unit.id}" data-name="${unit.name}" title="删除">
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
                loadUnits(parseInt(btn.dataset.page));
            });
        });
    }
    
    // 绑定表格事件
    function bindTableEvents() {
        // 行复选框
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedIds);
        });
        
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
    }
    
    // 更新选中的ID
    function updateSelectedIds() {
        selectedIds = [];
        document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
            selectedIds.push(parseInt(checkbox.dataset.id));
        });
        
        // 更新全选状态
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
    async function showEditModal(unitId = null) {
        const isEdit = !!unitId;
        let unitData = null;
        
        if (isEdit) {
            const row = document.querySelector(`tr[data-id="${unitId}"]`);
            const nameCell = row.querySelector('.badge-primary');
            unitData = { name: nameCell.textContent };
        }
        
        let content = `
            <form id="unitForm" class="modal-form">
                <div class="form-group">
                    <label class="form-label">单位名称 <span class="required">*</span></label>
                    <input type="text" class="form-input" name="name" value="${unitData?.name || ''}" 
                           placeholder="请输入单位名称（1-5个字）" maxlength="5" required>
                    <div class="form-hint">最少1个字，最多5个字</div>
                </div>
            </form>
        `;
        
        const modal = Modal.create({
            title: isEdit ? '编辑单位' : '新增单位',
            content: content,
            size: 'sm',
            confirmText: '保存',
            onConfirm: async () => {
                const form = document.getElementById('unitForm');
                const name = form.querySelector('[name="name"]').value.trim();
                
                if (!name) {
                    Toast.error('请输入单位名称');
                    return false;
                }
                
                if (name.length < 1 || name.length > 5) {
                    Toast.error('单位名称需要1-5个字');
                    return false;
                }
                
                Loading.btnLoading(modal.getConfirmBtn(), true);
                
                try {
                    let result;
                    if (isEdit) {
                        result = await API.updateUnit(unitId, { name });
                    } else {
                        result = await API.createUnit({ name });
                    }
                    
                    if (result && result.success) {
                        Toast.success(isEdit ? '更新成功' : '创建成功');
                        loadUnits(currentPage);
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
    function showDeleteConfirm(unitId, name) {
        Confirm.show({
            title: '确认删除',
            message: `确定要删除单位 "${name}" 吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.deleteUnit(unitId);
                    
                    if (result && result.success) {
                        Toast.success('删除成功');
                        loadUnits(currentPage);
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
        // 自动选中所有未关联的
        document.querySelectorAll('.row-checkbox:not(:disabled)').forEach(checkbox => {
            checkbox.checked = true;
        });
        updateSelectedIds();
        
        if (selectedIds.length === 0) {
            Toast.warning('没有可删除的单位（已关联的单位不能删除）');
            return;
        }
        
        Confirm.show({
            title: '确认批量删除',
            message: `确定要删除这 ${selectedIds.length} 个单位吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.batchDeleteUnits(selectedIds);
                    
                    if (result && result.success) {
                        Toast.success(result.message);
                        loadUnits(currentPage);
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
    document.getElementById('addUnitBtn').addEventListener('click', () => {
        showEditModal();
    });
    
    // 初始加载
    loadUnits();
});
