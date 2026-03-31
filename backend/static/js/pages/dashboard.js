class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.loadStats();
    }

    async loadStats() {
        try {
            const response = await API.getDashboardStats();
            const data = response.data;

            this.animateValue('unit-count', data.unit_count);
            this.animateValue('category-count', data.category_count);
            this.animateValue('variety-count', data.variety_count);
            this.animateValue('stock-out-person-count', data.stock_out_person_count);
            this.animateValue('today-variety-count', data.today_variety_count);
        } catch (error) {
            console.error('加载统计数据失败:', error);
            Toast.error('加载统计数据失败');
        }
    }

    animateValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) {
            return;
        }
        
        const value = targetValue || 0;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeProgress * value);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
