/**
 * 品种管理页面
 */

document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const pageSize = 10;
    let selectedIds = [];
    let categories = [];
    
    // 加载品类列表
    async function loadCategories() {
        try {
            const result = await API.getAllCategories();
            if (result && result.success) {
                categories = result.data;
            }
        } catch (error) {
            console.error('加载品类列表失败:', error);
        }
    }
    
    // 加载品种列表
    async function loadVarieties(page = 1) {
        Loading.show('加载中...');
        
        try {
            const result = await API.getVarieties({ page, page_size: pageSize });
            
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
    function renderTable(varieties) {
        const tbody = document.getElementById('varietyTableBody');
        selectedIds = [];
        document.getElementById('selectAll').checked = false;
        
        if (!varieties || varieties.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 60px; color: var(--text-muted);">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = varieties.map(variety => {
            // 状态：是否已关联至品类（品种必须关联品类才能创建，所以永远为"已关联"）
            const statusClass = 'status-success';
            const statusText = '已关联';
            // 是否可删除：未入库的可删除
            const canDelete = !variety.is_in_stock;
            
            return `
                <tr data-id="${variety.id}" data-in-stock="${variety.is_in_stock}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="form-checkbox row-checkbox" data-id="${variety.id}" ${variety.is_in_stock ? 'disabled' : ''}>
                    </td>
                    <td>${variety.id}</td>
                    <td><span class="badge badge-primary">${variety.name}</span></td>
                    <td><span class="badge badge-secondary">${variety.category_name}</span></td>
                    <td><span class="badge badge-info">${variety.unit_name}</span></td>
                    <td>${new Date(variety.created_at).toLocaleString('zh-CN')}</td>
                    <td><span class="table-status ${statusClass}">${statusText}</span></td>
                    <td>${variety.created_by_name || '-'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit-btn" data-id="${variety.id}" data-name="${variety.name}" data-category="${variety.category}" title="编辑">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            ${canDelete ? `
                                <button class="table-action-btn danger delete-btn" data-id="${variety.id}" data-name="${variety.name}" title="删除">
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
                loadVarieties(parseInt(btn.dataset.page));
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
                showEditModal(btn.dataset.id, btn.dataset.name, btn.dataset.category);
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
    function showEditModal(varietyId = null, varietyName = '', varietyCategory = '') {
        const isEdit = !!varietyId;
        
        const categoryOptions = categories.map(c => 
            `<option value="${c.id}" data-unit="${c.unit_name}" ${c.id == varietyCategory ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        // 获取当前选中品类的单位
        const selectedCategory = categories.find(c => c.id == varietyCategory);
        const currentUnit = selectedCategory ? selectedCategory.unit_name : '';
        
        let content = `
            <form id="varietyForm" class="modal-form">
                <div class="form-group">
                    <label class="form-label">品种名称 <span class="required">*</span></label>
                    <input type="text" class="form-input" name="name" value="${varietyName}" 
                           placeholder="请输入品种名称（1-20个字）" maxlength="20" required>
                    <div class="form-hint">最少1个字，最多20个字</div>
                </div>
                <div class="form-group">
                    <label class="form-label">品类 <span class="required">*</span></label>
                    <select class="form-input form-select" name="category" id="categorySelect" required>
                        <option value="">请选择品类</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">单位</label>
                    <input type="text" class="form-input" id="unitDisplay" value="${currentUnit}" disabled>
                    <div class="form-hint">单位根据品类自动显示</div>
                </div>
            </form>
        `;
        
        const modal = Modal.create({
            title: isEdit ? '编辑品种' : '新增品种',
            content: content,
            size: 'sm',
            confirmText: '保存',
            onConfirm: async () => {
                const form = document.getElementById('varietyForm');
                const name = form.querySelector('[name="name"]').value.trim();
                const category = form.querySelector('[name="category"]').value;
                
                if (!name) {
                    Toast.error('请输入品种名称');
                    return false;
                }
                
                if (name.length < 1 || name.length > 20) {
                    Toast.error('品种名称需要1-20个字');
                    return false;
                }
                
                if (!category) {
                    Toast.error('请选择品类');
                    return false;
                }
                
                Loading.btnLoading(modal.getConfirmBtn(), true);
                
                try {
                    let result;
                    if (isEdit) {
                        result = await API.updateVariety(varietyId, { name, category: parseInt(category) });
                    } else {
                        result = await API.createVariety({ name, category: parseInt(category) });
                    }
                    
                    if (result && result.success) {
                        Toast.success(isEdit ? '更新成功' : '创建成功');
                        loadVarieties(currentPage);
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
        
        // 品类选择变化时更新单位显示
        document.getElementById('categorySelect').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const unitName = selectedOption.dataset.unit || '';
            document.getElementById('unitDisplay').value = unitName;
        });
    }
    
    // 显示删除确认
    function showDeleteConfirm(varietyId, name) {
        Confirm.show({
            title: '确认删除',
            message: `确定要删除品种 "${name}" 吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.deleteVariety(varietyId);
                    
                    if (result && result.success) {
                        Toast.success('删除成功');
                        loadVarieties(currentPage);
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
            Toast.warning('没有可删除的品种（已入库的品种不能删除）');
            return;
        }
        
        Confirm.show({
            title: '确认批量删除',
            message: `确定要删除这 ${selectedIds.length} 个品种吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: async () => {
                Loading.show('删除中...');
                
                try {
                    const result = await API.batchDeleteVarieties(selectedIds);
                    
                    if (result && result.success) {
                        Toast.success(result.message);
                        loadVarieties(currentPage);
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
    
    // 导入按钮
    document.getElementById('importBtn').addEventListener('click', showImportModal);
    
    // 显示导入弹窗
    function showImportModal() {
        let content = `
            <div class="import-container">
                <div class="import-actions">
                    <button class="btn btn-secondary" id="downloadTemplateBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        下载模板
                    </button>
                    <div class="upload-btn-wrapper">
                        <button class="btn btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            上传文件
                        </button>
                        <input type="file" id="importFileInput" accept=".xlsx,.xls">
                    </div>
                </div>
                <div class="import-hint">
                    <p>1. 先下载模板，按模板格式填写数据</p>
                    <p>2. 第一个表格填写要导入的品种信息</p>
                    <p>3. 第二个表格显示所有品类及对应单位供参考</p>
                </div>
                <div class="import-preview hidden" id="importPreview">
                    <div class="preview-header">
                        <span class="preview-title">导入预览</span>
                    </div>
                    <div class="preview-content" id="previewContent"></div>
                </div>
            </div>
        `;
        
        const modal = Modal.create({
            title: '导入品种',
            content: content,
            size: 'lg',
            showFooter: false
        });
        
        // 下载模板
        document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
            API.downloadVarietyTemplate();
        });
        
        // 上传文件
        document.getElementById('importFileInput').addEventListener('change', async function() {
            const file = this.files[0];
            if (!file) return;
            
            Loading.show('解析文件中...');
            
            try {
                const result = await API.previewVarietyImport(file);
                
                if (result && result.success) {
                    showImportPreview(result.data, file);
                } else {
                    Toast.error(result?.message || '解析失败');
                }
            } catch (error) {
                Toast.error('网络错误');
            } finally {
                Loading.hide();
            }
        });
    }
    
    // 显示导入预览
    function showImportPreview(data, file) {
        const previewDiv = document.getElementById('importPreview');
        const contentDiv = document.getElementById('previewContent');
        
        let html = `
            <div class="preview-summary">
                <div class="summary-item success">
                    <span class="summary-count">${data.can_import_count}</span>
                    <span class="summary-label">可导入</span>
                </div>
                <div class="summary-item error">
                    <span class="summary-count">${data.cannot_import_count}</span>
                    <span class="summary-label">不可导入</span>
                </div>
            </div>
        `;
        
        if (data.cannot_import.length > 0) {
            html += `
                <div class="preview-errors">
                    <div class="errors-title">不可导入的数据：</div>
                    <div class="errors-list">
                        ${data.cannot_import.map(item => `
                            <div class="error-item">
                                <span class="error-row">第${item.row}行</span>
                                <span class="error-name">${item.variety}</span>
                                <span class="error-reason">${item.reason}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (data.can_import_count > 0) {
            html += `
                <div class="preview-actions">
                    <button class="btn btn-primary" id="confirmImportBtn">
                        确认导入 ${data.can_import_count} 条数据
                    </button>
                </div>
            `;
        }
        
        contentDiv.innerHTML = html;
        previewDiv.classList.remove('hidden');
        
        // 确认导入
        const confirmBtn = document.getElementById('confirmImportBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                Loading.show('导入中...');
                
                try {
                    const result = await API.importVarieties(file);
                    
                    if (result && result.success) {
                        Toast.success(result.message);
                        Modal.close();
                        loadVarieties(currentPage);
                    } else {
                        Toast.error(result?.message || '导入失败');
                    }
                } catch (error) {
                    Toast.error('网络错误');
                } finally {
                    Loading.hide();
                }
            });
        }
    }
    
    // 新增按钮
    document.getElementById('addVarietyBtn').addEventListener('click', () => {
        if (categories.length === 0) {
            Toast.warning('请先添加品类');
            return;
        }
        showEditModal();
    });
    
    // 初始加载
    loadCategories().then(() => {
        loadVarieties();
    });
});
