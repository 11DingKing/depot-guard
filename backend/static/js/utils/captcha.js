/**
 * 算术验证码模块
 */

const Captcha = {
    // 当前答案
    answer: null,
    
    // 生成验证码
    generate() {
        const operators = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let num1, num2, answer;
        
        switch (operator) {
            case '+':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 - num2;
                break;
            case '×':
                num1 = Math.floor(Math.random() * 9) + 1;
                num2 = Math.floor(Math.random() * 9) + 1;
                answer = num1 * num2;
                break;
        }
        
        this.answer = answer;
        
        return {
            question: `${num1} ${operator} ${num2} = ?`,
            answer: answer,
        };
    },
    
    // 验证答案
    verify(input) {
        const userAnswer = parseInt(input, 10);
        return userAnswer === this.answer;
    },
    
    // 渲染到元素
    render(element) {
        const captcha = this.generate();
        element.textContent = captcha.question;
        return captcha;
    },
};

// 导出
window.Captcha = Captcha;
