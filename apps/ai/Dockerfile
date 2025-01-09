# Use Python base image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy all project files into the container
COPY . /app

# Install Poetry
RUN pip install --no-cache-dir poetry

# Install project dependencies in the global environment
RUN poetry config virtualenvs.create false && poetry install --no-root

# Generate Prisma client
RUN prisma generate

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
