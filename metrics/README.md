# Метрики

## Сбор метрик

### Prometheus + Grafana

#### docker-compose.yml

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

#### prometheus.yml

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "nodejs-app"
    static_configs:
      - targets: ["host.docker.internal:3001"] # порт твоего Node.js приложения
```

#### Запуск

Выполняем команду `docker compose up`, пробуем зайти в `http://localhost:9090`, и `http://localhost:3000`, если заходит то останавливаем процесс, и запускаем с фагом `-d`, `docker compose up -d`.

Заходим в прометея `http://localhost:9090`, убеждаемся что метрики появляются, сделав запрос на метрику по имени.

После чего идем в графану `http://localhost:3000`, входим, меняем пароль, и идем в `connections`, ищем в поиске Prometheus, добавляем, указываем путь до прометея `http://prometheus:9090` так как прометей и графана запущены в композе в одной сети и доступны по именам сервисов.

И приступаем к созданию дашборда.

#### Создание дашборда.
