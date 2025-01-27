# from locust import HttpUser, task, between


# class FastAPIUser(HttpUser):
#     # 设置每个用户之间的等待时间
#     wait_time = between(1, 3)

#     @task
#     def send_message(self):
#         # 模拟发送 POST 请求到 FastAPI 应用
#         self.client.post(
#             "/generate/",
#             json={
#                 "limit": 2,
#                 "language": "English",
#                 "difficulty": "EASY",
#                 "type": "Single Choice",
#                 "model": "OpenAI",
#             },
#         )

#     @task
#     def send_another_message(self):
#         # 另一个任务，模拟不同的 POST 请求
#         self.client.post(
#             "/generate/",
#             json={
#                 "limit": 2,
#                 "language": "English",
#                 "difficulty": "EASY",
#                 "type": "Single Choice",
#                 "model": "OpenAI",
#             },
#         )

import logging
import redis

# 配置Redis连接
redis_cache = redis.Redis(
    host='redis_cache',
    port=6379,
    password='',
    decode_responses=True
)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 测试Redis连接
try:
    if redis_cache.ping():
        logging.info("成功连接到Redis服务器")
    else:
        logging.warning("Redis ping返回失败")
except redis.ConnectionError as e:
    logging.error(f"无法连接到Redis服务器: {str(e)}")
except Exception as e:
    logging.error(f"发生未知错误: {str(e)}")