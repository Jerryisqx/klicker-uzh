# 使用 Python 3.12 作为基础镜像
FROM python:3.12

# 安装 Doppler CLI 和必要工具
RUN apt-get update && apt-get install -y python3-distutils curl gnupg && \
    curl -fsSL https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" > /etc/apt/sources.list.d/doppler.list && \
    apt-get update && apt-get install -y doppler && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 安装 Python 依赖
COPY apps/ai/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# 创建 tmp 文件夹并设置权限
RUN mkdir -p ./apps/ai/tmp && chmod -R 777 ./apps/ai/tmp

# 设置 ENTRYPOINT 为 Doppler，CMD 为 Prisma
ENTRYPOINT ["doppler", "run", "--"]
