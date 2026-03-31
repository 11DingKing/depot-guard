# 第六师兵团库房管理系统

基于 Python + Django 后端，HTML5 + CSS3 + JavaScript 前端开发的具有未来科技感的库房管理系统。

## 快速启动

### 本地开发环境

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 使用清华镜像源安装依赖
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 数据库迁移
python manage.py migrate

# 创建超级管理员（ID=1）
python scripts/create_admin.py

# 启动服务器
python manage.py runserver 0.0.0.0:8000
```

启动后访问：http://localhost:8000

### Docker 部署

```bash
docker-compose up --build -d
```

启动后访问：http://localhost:8081

## 测试账号

| 用户名 | 密码 | 角色 | ID |
|--------|------|------|-----|
| admin | 123456789 | 超级管理员 | 1（固定） |

## 功能特性

### 登录页面
- 未来科技感设计，深空蓝主题
- 动态背景效果（浮动光球、粒子效果）
- 前端自动生成算术验证码
- 与后端API完整连接

### 菜单栏系统
URL格式：`/menu/页面名/`
页面标题格式：`warehouse/菜单栏/页面名`

| 菜单 | URL | 状态 |
|------|-----|------|
| 仪表盘 | /menu/dashboard/ | 开发中 |
| 货物入库 | /menu/stock-in/ | 开发中 |
| 单位管理 | /menu/unit/ | ✅ 完成 |
| 品类管理 | /menu/category/ | ✅ 完成 |
| 品种管理 | /menu/variety/ | ✅ 完成 |
| 查询导出 | /menu/query-export/ | 开发中 |
| 每日报表 | /menu/daily-report/ | 开发中 |
| 预警 | /menu/warning/ | 开发中 |
| 审批区域 | /menu/approval/ | 开发中 |
| 考勤人员管理 | /menu/attendance-person/ | ✅ 完成 |
| 出库人员管理 | /menu/stock-out-person/ | ✅ 完成 |

### 已完成功能

#### 考勤人员管理
- 显示所有可登录用户列表
- 新增用户（用户名、密码确认、角色选择）
- 编辑用户信息
- 删除用户（超级管理员ID=1不可删除）
- 显示关联出库人员数量，点击查看详情
- 普通用户无权限访问此页面

#### 出库人员管理
- 显示出库人员列表（ID、警号、姓名、手机号、关联管理员）
- 新增出库人员（警号、姓名、身份证号、手机号均需唯一性验证）
- 绑定管理员（只能绑定admin角色，不能绑定普通用户和超级管理员）
- 上传蓝底照片，支持查看示范图
- 编辑、删除出库人员

#### 单位管理
- 显示单位列表（ID、单位、创建日期、状态、创建人、操作）
- 新增单位（1-5个字限制）
- 编辑单位
- 删除单位（已关联品类的不可删除）
- 批量删除（自动选中未关联的）

#### 品类管理
- 显示品类列表（ID、品类、单位、创建日期、状态、创建人、操作）
- 新增品类（1-10个字限制，选择关联单位）
- 编辑品类
- 删除品类（已关联品种的不可删除）
- 批量删除

#### 品种管理
- 显示品种列表（ID、品种、品类、单位、创建日期、状态、创建人、操作）
- 新增品种（1-20个字限制，选择品类后自动显示单位）
- 编辑品种
- 删除品种（已入库的不可删除）
- 批量删除
- Excel导入功能
  - 下载模板（第一表格填写品种信息，第二表格显示品类参考）
  - 上传预览（显示可导入/不可导入数量及原因）
  - 确认导入

## 技术栈

### 后端
- Python 3.9+
- Django 4.2 + Django REST Framework
- SQLite3（默认）/ MySQL（可选）
- JWT 认证
- django-filter（数据筛选）
- django-import-export（数据导入导出）
- openpyxl（Excel处理）
- Pillow（图片处理）

### 前端
- HTML5 + CSS3 + JavaScript（原生模块化）
- 未来科技感UI主题（深空蓝系）
- 独立CSS/JS组件模块

## 项目结构

```
backend/
├── apps/
│   ├── authentication/     # 用户认证模块
│   │   ├── models.py       # User模型（含SUPERADMIN_ID=1）
│   │   ├── views.py        # 登录、用户管理API
│   │   └── serializers.py  # 序列化器
│   ├── warehouse/          # 仓库管理模块
│   │   ├── models.py       # Unit/Category/Variety/Goods等模型
│   │   ├── views.py        # 单位/品类/品种管理API
│   │   └── serializers.py  # 序列化器
│   ├── personnel/          # 人员管理模块
│   │   ├── models.py       # StockOutPerson模型
│   │   └── views.py        # 出库人员管理API
│   ├── reports/            # 报表模块
│   ├── frontend/           # 前端页面路由
│   └── core/               # 核心模块（响应、异常、日志）
├── static/
│   ├── css/
│   │   ├── variables.css   # CSS变量
│   │   ├── base.css        # 基础样式
│   │   ├── main.css        # 主布局
│   │   ├── login.css       # 登录页样式
│   │   └── components/     # 组件样式
│   └── js/
│       ├── utils/          # 工具模块（api/toast/loading/captcha）
│       ├── components/     # 组件模块（sidebar/header/modal）
│       └── pages/          # 页面逻辑
├── templates/
│   ├── base.html           # 基础模板
│   ├── login.html          # 登录页
│   ├── index.html          # 主页
│   └── pages/              # 功能页面
├── scripts/
│   └── create_admin.py     # 创建超级管理员脚本
└── logs/                   # 日志文件
```

## CSS/JS模块说明

### CSS模块
- `variables.css` - 颜色、阴影、圆角、间距等变量
- `base.css` - 重置样式、工具类
- `main.css` - 主布局、页面通用样式
- `components/` - 按钮、表单、表格、模态框、侧边栏等组件

### JS模块
- `utils/api.js` - API请求封装
- `utils/toast.js` - 提示框和确认框
- `utils/loading.js` - 加载动画
- `utils/captcha.js` - 算术验证码
- `components/sidebar.js` - 侧边栏菜单
- `components/header.js` - 顶部栏（用户信息、退出登录）
- `components/modal.js` - 模态框

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| USE_MYSQL | 使用MySQL数据库 | false |
| DB_HOST | 数据库地址 | localhost |
| DB_NAME | 数据库名 | warehouse_db |
| DB_USER | 数据库用户 | root |
| DB_PASSWORD | 数据库密码 | root123456 |
| DJANGO_DEBUG | 调试模式 | True |

## 日志文件

```
backend/logs/
├── app.log           # 应用日志
├── error.log         # 错误日志
├── access.log        # 访问日志
├── security.log      # 安全日志
└── performance.log   # 性能日志
```

## 运行测试

```bash
cd backend
source venv/bin/activate
pytest
```
