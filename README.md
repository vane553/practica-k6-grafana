# practica-k6-grafana
practica k6
#  Práctica K6 + GitHub Actions + Grafana Cloud

Pipeline de pruebas de carga automatizadas con K6, GitHub Actions y Grafana Cloud.

## 📁 Estructura
```
.
├── .github/
│   └── workflows/
│       └── load-tests.yml   # Pipeline CI/CD
├── tests/
│   └── load-test.js         # Script K6
└── README.md
```

## 🎯 Endpoints probados

| Vista | Endpoint | Descripción |
|-------|----------|-------------|
| Vista 1 | `GET /posts` | Listado general de posts |
| Vista 2 | `GET /posts/:id` | Detalle de un post |
| Vista 3 | `GET /users` | Listado de usuarios |

## ⚙️ Configuración de secrets necesarios

| Secret | Descripción |
|--------|-------------|
| `K6_CLOUD_TOKEN` | API Token de Grafana Cloud k6 |
| `K6_PROJECT_ID` | ID del proyecto en Grafana Cloud k6 |

## 📊 Thresholds configurados

- `p(95) < 500ms` en tiempo de respuesta general
- `p(95) < 600ms` en listado de posts
- `p(95) < 400ms` en detalle de post
- Tasa de errores `< 5%`