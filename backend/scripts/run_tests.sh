#!/bin/bash
# 运行所有测试

echo "=========================================="
echo "  第六师兵团库房管理系统 - 测试套件"
echo "=========================================="
echo ""

# 设置Django配置
export DJANGO_SETTINGS_MODULE=warehouse_system.settings

# 运行Django测试
echo "运行Django测试..."
echo "------------------------------------------"
python manage.py test apps --verbosity=2

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✓ 所有测试通过"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "  ✗ 部分测试失败"
    echo "=========================================="
    exit 1
fi
