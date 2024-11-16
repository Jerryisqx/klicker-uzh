FROM python:3.12
RUN apt-get update && apt-get install -y python3-distutils
WORKDIR /app

COPY apps/ai/requirements.txt .
RUN pip install -r requirements.txt
COPY apps/analytics/ .
COPY packages/prisma/src/prisma/schema/*.prisma apps/ai/prisma/schema/
RUN rm apps/ai/prisma/schema/js.prisma

RUN prisma generate
RUN mkdir -p apps/ai/tmp && chmod -R 777 apps/ai/tmp