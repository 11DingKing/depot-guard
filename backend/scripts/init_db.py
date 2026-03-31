#!/usr/bin/env python
"""
数据库初始化脚本
创建初始管理员账户
"""
import os
import sys
import django

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warehouse_system.settings')

django.setup()

from apps.authentication.models import User


def init_admin():
    """创建初始管理员账户"""
    username = 'admin'
    password = '123456789'
    
    if User.objects.filter(username=username).exists():
        print(f'用户 {username} 已存在')
        return
    
    user = User.objects.create_superuser(
        username=username,
        password=password,
        real_name='系统管理员',
        role='admin'
    )
    print(f'管理员账户创建成功: {username} / {password}')


if __name__ == '__main__':
    init_admin()
