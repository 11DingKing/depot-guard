#!/usr/bin/env python
"""
创建初始管理员用户
超级管理员admin使用固定ID=1
"""
import os
import sys
import django

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warehouse_system.settings')
django.setup()

from apps.authentication.models import User, SUPERADMIN_ID

def create_admin():
    """创建超级管理员（固定ID=1）"""
    username = 'admin'
    password = '123456789'
    
    # 检查ID=1的用户是否存在
    if User.objects.filter(id=SUPERADMIN_ID).exists():
        user = User.objects.get(id=SUPERADMIN_ID)
        print(f'超级管理员已存在 (ID={SUPERADMIN_ID})')
        user.username = username
        user.set_password(password)
        user.role = 'superadmin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f'已更新超级管理员: {username} (ID={SUPERADMIN_ID})')
    elif User.objects.filter(username=username).exists():
        # 用户名存在但ID不是1，需要处理
        old_user = User.objects.get(username=username)
        old_user.delete()
        user = User.objects.create_superuser(
            username=username,
            password=password
        )
        print(f'重新创建超级管理员: {username} (ID={user.id})')
    else:
        user = User.objects.create_superuser(
            username=username,
            password=password
        )
        print(f'成功创建超级管理员: {username} (ID={user.id})')
    
    return user

if __name__ == '__main__':
    create_admin()
