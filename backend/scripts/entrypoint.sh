#!/bin/bash
set -e

echo "=== 第六师兵团库房管理系统启动脚本 ==="

# 等待数据库就绪
echo "等待数据库就绪..."
python /app/scripts/wait_for_db.py

# 创建数据库（如果不存在）
echo "检查数据库..."
python -c "
import pymysql
import os
conn = pymysql.connect(
    host=os.environ.get('DB_HOST', 'db'),
    port=int(os.environ.get('DB_PORT', '3306')),
    user=os.environ.get('DB_USER', 'root'),
    password=os.environ.get('DB_PASSWORD', 'root123456')
)
cursor = conn.cursor()
cursor.execute('CREATE DATABASE IF NOT EXISTS warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
conn.close()
print('数据库检查完成')
"

# 执行数据库迁移
echo "执行数据库迁移..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 收集静态文件
echo "收集静态文件..."
python manage.py collectstatic --noinput

# 创建初始管理员
echo "创建初始管理员..."
python scripts/init_db.py

echo "=== 启动服务 ==="
exec "$@"
