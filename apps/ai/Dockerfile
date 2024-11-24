# 使用 Python 基础镜像
FROM python:3.12

# 设置工作目录
WORKDIR /app

# 安装 Poetry
RUN pip install --no-cache-dir poetry

# 复制项目文件（包含 pyproject.toml 和 poetry.lock）
COPY pyproject.toml poetry.lock ./

# 安装项目依赖到虚拟环境中
RUN poetry config virtualenvs.create false && poetry install --no-root

# 创建 tmp 文件夹并设置权限
RUN mkdir -p ./tmp && chmod -R 777 ./tmp