import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const errorRate      = new Rate('error_rate');
const listDuration   = new Trend('list_posts_duration',  true);
const detailDuration = new Trend('post_detail_duration', true);
const usersDuration  = new Trend('list_users_duration',  true);
const totalReqs      = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '30s', target: 5  },
    { duration: '1m',  target: 10 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_duration:    ['p(95)<500', 'p(99)<1000'],
    http_req_failed:      ['rate<0.05'],
    error_rate:           ['rate<0.10'],
    list_posts_duration:  ['p(95)<600'],
    post_detail_duration: ['p(95)<400'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export default function () {

  group('Vista 1: GET /posts - Listado general', () => {
    const res = http.get(`${BASE_URL}/posts`, {
      tags: { endpoint: 'list-posts' },
    });
    const ok = check(res, {
      '[posts] status 200':       (r) => r.status === 200,
      '[posts] body no vacio':    (r) => r.body.length > 0,
      '[posts] es array JSON':    (r) => Array.isArray(JSON.parse(r.body)),
      '[posts] latencia < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!ok);
    listDuration.add(res.timings.duration);
    totalReqs.add(1);
  });

  sleep(1);

  group('Vista 2: GET /posts/:id - Detalle de post', () => {
    const postId = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${postId}`, {
      tags: { endpoint: 'post-detail' },
    });
    const ok = check(res, {
      '[detail] status 200':       (r) => r.status === 200,
      '[detail] tiene id':         (r) => JSON.parse(r.body).id !== undefined,
      '[detail] tiene title':      (r) => JSON.parse(r.body).title !== undefined,
      '[detail] latencia < 400ms': (r) => r.timings.duration < 400,
    });
    errorRate.add(!ok);
    detailDuration.add(res.timings.duration);
    totalReqs.add(1);
  });

  sleep(1);

  group('Vista 3: GET /users - Listado de usuarios', () => {
    const res = http.get(`${BASE_URL}/users`, {
      tags: { endpoint: 'list-users' },
    });
    const ok = check(res, {
      '[users] status 200':       (r) => r.status === 200,
      '[users] hay usuarios':     (r) => JSON.parse(r.body).length > 0,
      '[users] latencia < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!ok);
    usersDuration.add(res.timings.duration);
    totalReqs.add(1);
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'results/summary.json': JSON.stringify(data, null, 2),
  };
}