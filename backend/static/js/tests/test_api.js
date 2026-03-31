/**
 * API模块测试
 * 使用简单的断言函数进行测试
 */

const TestRunner = {
    passed: 0,
    failed: 0,
    results: [],
    
    assert(condition, message) {
        if (condition) {
            this.passed++;
            this.results.push({ status: 'PASS', message });
            console.log(`✓ PASS: ${message}`);
        } else {
            this.failed++;
            this.results.push({ status: 'FAIL', message });
            console.error(`✗ FAIL: ${message}`);
        }
    },
    
    assertEqual(actual, expected, message) {
        this.assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
    },
    
    assertNotNull(value, message) {
        this.assert(value !== null && value !== undefined, message);
    },
    
    assertType(value, type, message) {
        this.assert(typeof value === type, `${message} (expected type: ${type}, actual: ${typeof value})`);
    },
    
    summary() {
        console.log('\n========== 测试结果 ==========');
        console.log(`通过: ${this.passed}`);
        console.log(`失败: ${this.failed}`);
        console.log(`总计: ${this.passed + this.failed}`);
        console.log('==============================\n');
        return this.failed === 0;
    },
    
    reset() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }
};

// API模块测试
const APITests = {
    async runAll() {
        console.log('\n========== API模块测试 ==========\n');
        TestRunner.reset();
        
        this.testTokenManagement();
        this.testUserManagement();
        await this.testLoginAPI();
        
        return TestRunner.summary();
    },
    
    testTokenManagement() {
        console.log('--- Token管理测试 ---');
        
        // 测试设置Token
        API.setToken('test_token_123');
        TestRunner.assertEqual(API.getToken(), 'test_token_123', 'setToken/getToken应正确存储和获取Token');
        
        // 测试清除Token
        API.clearToken();
        TestRunner.assertEqual(API.getToken(), null, 'clearToken应清除Token');
    },
    
    testUserManagement() {
        console.log('--- 用户信息管理测试 ---');
        
        const testUser = {
            id: 1,
            username: 'testuser',
            real_name: '测试用户',
            role: 'admin'
        };
        
        // 测试设置用户
        API.setUser(testUser);
        const savedUser = API.getUser();
        TestRunner.assertNotNull(savedUser, 'setUser/getUser应正确存储和获取用户信息');
        TestRunner.assertEqual(savedUser.username, 'testuser', '用户名应正确保存');
        TestRunner.assertEqual(savedUser.role, 'admin', '角色应正确保存');
        
        // 清理
        API.clearToken();
    },
    
    async testLoginAPI() {
        console.log('--- 登录API测试 ---');
        
        // 注意：这个测试需要后端服务运行
        // 如果后端未运行，测试会失败但不影响其他测试
        try {
            // 测试登录失败（错误密码）
            const failResult = await API.login('admin', 'wrongpassword');
            if (failResult) {
                TestRunner.assertEqual(failResult.success, false, '错误密码应返回失败');
            }
        } catch (e) {
            console.log('登录API测试跳过（后端未运行）');
        }
    }
};

// Captcha模块测试
const CaptchaTests = {
    runAll() {
        console.log('\n========== 验证码模块测试 ==========\n');
        TestRunner.reset();
        
        this.testGenerate();
        this.testVerify();
        
        return TestRunner.summary();
    },
    
    testGenerate() {
        console.log('--- 验证码生成测试 ---');
        
        const captcha = Captcha.generate();
        TestRunner.assertNotNull(captcha, '应生成验证码对象');
        TestRunner.assertNotNull(captcha.question, '应包含问题');
        TestRunner.assertNotNull(captcha.answer, '应包含答案');
        TestRunner.assertType(captcha.answer, 'number', '答案应为数字');
    },
    
    testVerify() {
        console.log('--- 验证码验证测试 ---');
        
        const captcha = Captcha.generate();
        
        // 正确答案
        TestRunner.assert(Captcha.verify(captcha.answer), '正确答案应验证通过');
        
        // 错误答案
        TestRunner.assert(!Captcha.verify(captcha.answer + 1000), '错误答案应验证失败');
        
        // 字符串答案
        TestRunner.assert(Captcha.verify(String(captcha.answer)), '字符串形式的正确答案应验证通过');
    }
};

// Toast模块测试
const ToastTests = {
    runAll() {
        console.log('\n========== Toast模块测试 ==========\n');
        TestRunner.reset();
        
        this.testInit();
        this.testShowMethods();
        
        return TestRunner.summary();
    },
    
    testInit() {
        console.log('--- Toast初始化测试 ---');
        
        Toast.init();
        TestRunner.assertNotNull(Toast.container, 'Toast容器应被创建');
        TestRunner.assert(
            document.body.contains(Toast.container),
            'Toast容器应添加到body'
        );
    },
    
    testShowMethods() {
        console.log('--- Toast显示方法测试 ---');
        
        // 测试各种类型的Toast
        const successToast = Toast.success('成功消息');
        TestRunner.assertNotNull(successToast, 'success方法应返回Toast元素');
        
        const errorToast = Toast.error('错误消息');
        TestRunner.assertNotNull(errorToast, 'error方法应返回Toast元素');
        
        const warningToast = Toast.warning('警告消息');
        TestRunner.assertNotNull(warningToast, 'warning方法应返回Toast元素');
        
        const infoToast = Toast.info('信息消息');
        TestRunner.assertNotNull(infoToast, 'info方法应返回Toast元素');
        
        // 清理
        setTimeout(() => {
            Toast.container.innerHTML = '';
        }, 100);
    }
};

// FormUtils模块测试
const FormUtilsTests = {
    runAll() {
        console.log('\n========== FormUtils模块测试 ==========\n');
        TestRunner.reset();
        
        this.testGetData();
        this.testSetData();
        this.testValidate();
        
        return TestRunner.summary();
    },
    
    testGetData() {
        console.log('--- 表单数据获取测试 ---');
        
        // 创建测试表单
        const form = document.createElement('form');
        form.innerHTML = `
            <input type="text" name="username" value="testuser">
            <input type="number" name="age" value="25">
            <input type="checkbox" name="active" checked>
        `;
        
        const data = FormUtils.getData(form);
        TestRunner.assertEqual(data.username, 'testuser', '应正确获取文本输入值');
        TestRunner.assertEqual(data.age, 25, '应正确获取数字输入值');
    },
    
    testSetData() {
        console.log('--- 表单数据设置测试 ---');
        
        const form = document.createElement('form');
        form.innerHTML = `
            <input type="text" name="username">
            <input type="number" name="age">
        `;
        
        FormUtils.setData(form, {
            username: 'newuser',
            age: 30
        });
        
        TestRunner.assertEqual(
            form.querySelector('[name="username"]').value,
            'newuser',
            '应正确设置文本输入值'
        );
        TestRunner.assertEqual(
            form.querySelector('[name="age"]').value,
            '30',
            '应正确设置数字输入值'
        );
    },
    
    testValidate() {
        console.log('--- 表单验证测试 ---');
        
        const form = document.createElement('form');
        form.innerHTML = `
            <input type="text" name="username" value="">
            <input type="text" name="email" value="invalid">
        `;
        
        const rules = {
            username: [
                { required: true, message: '用户名必填' }
            ],
            email: [
                { pattern: /^[\w-]+@[\w-]+\.\w+$/, message: '邮箱格式错误' }
            ]
        };
        
        const result = FormUtils.validate(form, rules);
        TestRunner.assert(!result.isValid, '验证应失败');
        TestRunner.assertNotNull(result.errors.username, '应有用户名错误');
        TestRunner.assertNotNull(result.errors.email, '应有邮箱错误');
    }
};

// Loading模块测试
const LoadingTests = {
    runAll() {
        console.log('\n========== Loading模块测试 ==========\n');
        TestRunner.reset();
        
        this.testShowHide();
        this.testBtnLoading();
        
        return TestRunner.summary();
    },
    
    testShowHide() {
        console.log('--- Loading显示/隐藏测试 ---');
        
        Loading.show('加载中...');
        TestRunner.assertNotNull(Loading.overlay, 'Loading遮罩应被创建');
        TestRunner.assert(
            Loading.overlay.classList.contains('active'),
            'Loading应显示'
        );
        
        Loading.hide();
        TestRunner.assert(
            !Loading.overlay.classList.contains('active'),
            'Loading应隐藏'
        );
    },
    
    testBtnLoading() {
        console.log('--- 按钮Loading状态测试 ---');
        
        const btn = document.createElement('button');
        
        Loading.btnLoading(btn, true);
        TestRunner.assert(btn.classList.contains('btn-loading'), '按钮应有loading类');
        TestRunner.assert(btn.disabled, '按钮应被禁用');
        
        Loading.btnLoading(btn, false);
        TestRunner.assert(!btn.classList.contains('btn-loading'), '按钮应移除loading类');
        TestRunner.assert(!btn.disabled, '按钮应启用');
    }
};

// 运行所有测试
async function runAllTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     前端模块测试套件                    ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    let allPassed = true;
    
    // API测试
    if (!await APITests.runAll()) allPassed = false;
    
    // Captcha测试
    if (!CaptchaTests.runAll()) allPassed = false;
    
    // Toast测试
    if (!ToastTests.runAll()) allPassed = false;
    
    // FormUtils测试
    if (!FormUtilsTests.runAll()) allPassed = false;
    
    // Loading测试
    if (!LoadingTests.runAll()) allPassed = false;
    
    console.log('\n╔════════════════════════════════════════╗');
    if (allPassed) {
        console.log('║     ✓ 所有测试通过                      ║');
    } else {
        console.log('║     ✗ 部分测试失败                      ║');
    }
    console.log('╚════════════════════════════════════════╝\n');
    
    return allPassed;
}

// 导出
window.TestRunner = TestRunner;
window.runAllTests = runAllTests;
