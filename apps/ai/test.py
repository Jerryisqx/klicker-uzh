import os
import subprocess

# 通过 Doppler 动态加载 OPENAI_API_KEY 到环境变量
def load_openai_api_key():
    try:
        # 调用 Doppler CLI 获取密钥
        result = subprocess.run(
            ["doppler", "secrets", "get", "OPENAI_API_KEY", "--plain"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if result.returncode == 0:
            # 将获取到的密钥加载到环境变量
            os.environ["OPENAI_API_KEY"] = result.stdout.strip()
        else:
            raise RuntimeError(
                f"Failed to retrieve OPENAI_API_KEY: {result.stderr.strip()}"
            )
    except FileNotFoundError:
        raise RuntimeError("Doppler CLI is not installed or not found in PATH.")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {e}")

# 调用的主程序
class OpenAIHandler:
    def __init__(self):
        # 加载 Doppler 的 API Key
        load_openai_api_key()
        # 使用从环境变量读取的 API Key
        self.api_key = os.environ["OPENAI_API_KEY"]

    def use_api_key(self):
        # 示例方法，展示如何使用 API Key
        print(f"Using OpenAI API Key: {self.api_key}")

# 示例运行代码
if __name__ == "__main__":
    try:
        handler = OpenAIHandler()
        handler.use_api_key()
    except RuntimeError as e:
        print(f"Error: {e}")
