/**
 * 仪表盘页面
 */

document.addEventListener('DOMContentLoaded', function() {
    let animated = false;

    function animateNumber(element, target) {
        const duration = 1500;
        const startTime = performance.now();
        const start = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    async function loadDashboardStats() {
        try {
            const result = await API.getDashboardStats();
            
            if (result && result.success) {
                const data = result.data;
                
                const unitCountEl = document.getElementById('unitCount');
                const categoryCountEl = document.getElementById('categoryCount');
                const varietyCountEl = document.getElementById('varietyCount');
                const stockOutPersonCountEl = document.getElementById('stockOutPersonCount');
                const todayVarietyCountEl = document.getElementById('todayVarietyCount');

                if (!animated) {
                    animateNumber(unitCountEl, data.unit_count || 0);
                    animateNumber(categoryCountEl, data.category_count || 0);
                    animateNumber(varietyCountEl, data.variety_count || 0);
                    animateNumber(stockOutPersonCountEl, data.stock_out_person_count || 0);
                    animateNumber(todayVarietyCountEl, data.today_variety_count || 0);
                    animated = true;
                } else {
                    unitCountEl.textContent = data.unit_count || 0;
                    categoryCountEl.textContent = data.category_count || 0;
                    varietyCountEl.textContent = data.variety_count || 0;
                    stockOutPersonCountEl.textContent = data.stock_out_person_count || 0;
                    todayVarietyCountEl.textContent = data.today_variety_count || 0;
                }
            } else {
                Toast.error(result?.message || '加载失败');
            }
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
            Toast.error('网络错误');
        }
    }

    loadDashboardStats();
});
