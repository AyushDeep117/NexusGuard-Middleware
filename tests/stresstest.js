import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '20s', target: 100 }, // Stay at 100 users
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/feed');
  check(res, { 'status is 200 or 429': (r) => [200, 429].includes(r.status) });
  sleep(0.1); 
}