# 第六师兵团库房管理系统 - 后端Dockerfile
# 支持 ARM64 和 AMD64 架构

FROM python:3.11-slim

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=warehouse_system.settings

# 设置工作目录
WORKDIR /app

# 使用清华镜像源安装系统依赖
RUN sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 使用清华镜像源安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制项目文件
COPY . .

# 创建必要目录
RUN mkdir -p /app/logs /app/media /app/staticfiles

# 设置脚本权限
RUN chmod +x /app/scripts/entrypoint.sh

# 暴露端口
EXPOSE 8000

# 入口点
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "warehouse_system.wsgi:application"]
