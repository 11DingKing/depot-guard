/**
 * 仪表盘页面逻辑
 * 处理统计数据加载和渲染
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/menu/dashboard/')) {
        initDashboard();
    }
});

function initDashboard() {
    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const response = await API.getDashboardStats();
        
        if (response && response.code === 200) {
            const data = response.data;
            updateStatValue('unitCount', data.unit_count);
            updateStatValue('categoryCount', data.category_count);
            updateStatValue('varietyCount', data.variety_count);
            updateStatValue('personCount', data.stock_out_person_count);
            updateStatValue('todayCount', data.today_variety_count);
        }
    } catch (error) {
        console.error('加载仪表盘统计数据失败:', error);
    }
}

function updateStatValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        animateCount(element, 0, value, 1000);
    }
}

function animateCount(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}
