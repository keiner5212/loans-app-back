# loans-app-front

## Requirements
- [Node.js](https://nodejs.org/en/) (>= 18.12.0)
- [TypeScript](https://www.typescriptlang.org/) (>= 5.0.0)
- [Docker](https://www.docker.com/) (>= 20.10.9)

## How to set up the project on docker
1. Create docker volume if not exist
    ```bash
    docker volume create postgres_data
    ```
2. Run the project on the mode dev
    ```bash
    docker-compose -f docker-compose.dev.yml up --build -d
    ```
3. Run the project on the mode prod
    ```bash
    docker-compose -f docker-compose.prod.yml up --build -d
    ```