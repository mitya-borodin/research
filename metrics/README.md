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
  evaluation_interval: 5s
  scrape_timeout: 5s

scrape_configs:
  - job_name: "nodejs-app"
    static_configs:
      - targets: ["host.docker.internal:3001"] # порт Node.js приложения

rule_files:
  - "rules/metric-values.rules.yaml"
```

#### rules/metric-values.rules.yaml

Это подготовка данных для вариантов переменных дашборда.

Если не делать такую подготовку, то для каждой переменной будет выполняться запрос проверяющий всю БД прометея.

А если если сделать, то будет точечный запрос к конкретной метрике, это максимально быстро.

```yaml
groups:
  - name: metric-label-values.rules
    rules:
      - record: grafana:variable:tenant:values
        expr: count by (tenant) ({default_metric="true"}) > 0
      - record: grafana:variable:namespace:values
        expr: count by (tenant, namespace) ({default_metric="true"}) > 0
      - record: grafana:variable:pod:values
        expr: count by (tenant, namespace, pod) ({default_metric="true"}) > 0
      - record: grafana:variable:moleculer_node:values
        expr: count by (tenant, namespace, pod, moleculer_node) ({default_metric="true"}) > 0
      - record: grafana:variable:service_name:values
        expr: count by (tenant, namespace, pod, moleculer_node, service_name) ({application_metric="true"}) > 0
      - record: grafana:variable:action:values
        expr: count by (tenant, namespace, pod, moleculer_node, service_name, action) ({application_metric="true"}) > 0
```

#### Запуск

Выполняем команду `docker compose up`, пробуем зайти в `http://localhost:9090`, и `http://localhost:3000`, если заходит то останавливаем процесс, и запускаем с фагом `-d`, `docker compose up -d`.

Заходим в прометея `http://localhost:9090`, убеждаемся что метрики появляются, сделав запрос на метрику по имени.

После чего идем в графану `http://localhost:3000`, входим, меняем пароль, и идем в `connections`, ищем в поиске Prometheus, добавляем, указываем путь до прометея `http://prometheus:9090` так как прометей и графана запущены в композе в одной сети и доступны по именам сервисов.

И приступаем к созданию дашборда.

#### Создание дашборда
