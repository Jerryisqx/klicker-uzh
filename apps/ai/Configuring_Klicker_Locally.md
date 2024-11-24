# Configuring Klicker Locally

This guide will help you set up and configure Klicker on your local machine.

## Prerequisites

- [Doppler](https://doppler.com) installed
- [Poetry](https://python-poetry.org/) installed
- (If running on WSL) Access to modify the file system

## Setup Instructions

### 1. Configure Doppler

1. Log in to the [Doppler website](https://doppler.com).

2. In your project, add the following environment variables:

   - `OPENAI_API_KEY`
   - `DATABASE_URL_1`:

     ```plaintext
     DATABASE_URL_1=postgresql://klicker:klicker@postgres:5432/klicker
     ```

3. In your terminal, run the following command to initialize Doppler:

   ```bash
   doppler setup

### 2. Modify Traefik Configuration (If Running on WSL)
If you are running Klicker on Windows Subsystem for Linux (WSL), you need to modify the Traefik configuration file:

1. Open the file:

```plaintext
/klicker-uzh/util/traefik/rules_wsl.yaml
```

2. Update the IP address in the file to match your actual IP address.

### 3. Debugging the AI Application
When debugging the AI component, use Poetry for dependency management and ensure that any changes are saved to the following files:
```plaintext
/home/jiangq/klicker-uzh/klicker-uzh/apps/ai/poetry.lock

/home/jiangq/klicker-uzh/klicker-uzh/apps/ai/pyproject.toml
```
By updating these files, you can directly use them to update the Docker image.