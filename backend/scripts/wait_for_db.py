#!/usr/bin/env python
"""
等待数据库就绪脚本
"""
import os
import sys
import time
import pymysql

def wait_for_db():
    """等待数据库连接就绪"""
    db_host = os.environ.get('DB_HOST', 'db')
    db_port = int(os.environ.get('DB_PORT', '3306'))
    db_user = os.environ.get('DB_USER', 'root')
    db_password = os.environ.get('DB_PASSWORD', 'root123456')
    
    max_retries = 30
    retry_interval = 2
    
    print(f'等待数据库 {db_host}:{db_port} 就绪...')
    
    for i in range(max_retries):
        try:
            conn = pymysql.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_password
            )
            conn.close()
            print('数据库连接成功!')
            return True
        except pymysql.Error as e:
            print(f'尝试 {i + 1}/{max_retries}: 数据库未就绪 - {e}')
            time.sleep(retry_interval)
    
    print('数据库连接超时!')
    return False


if __name__ == '__main__':
    if not wait_for_db():
        sys.exit(1)
