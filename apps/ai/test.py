from locust import HttpUser, task, between


class FastAPIUser(HttpUser):
    # 设置每个用户之间的等待时间
    wait_time = between(1, 3)

    @task
    def send_message(self):
        # 模拟发送 POST 请求到 FastAPI 应用
        self.client.post(
            "/generate/",
            json={
                "limit": 2,
                "language": "English",
                "difficulty": "EASY",
                "type": "Single Choice",
                "model": "OpenAI",
            },
        )

    @task
    def send_another_message(self):
        # 另一个任务，模拟不同的 POST 请求
        self.client.post(
            "/generate/",
            json={
                "limit": 2,
                "language": "English",
                "difficulty": "EASY",
                "type": "Single Choice",
                "model": "OpenAI",
            },
        )
