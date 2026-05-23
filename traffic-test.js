import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "1m", target: 200 },
    { duration: "1m", target: 300 },
    { duration: "1m", target: 500 },
    { duration: "30s", target: 0 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
};

export default function () {
  const res = http.get("https://lagrazia-eg.online/");

  check(res, {
    "website opened successfully": (r) => r.status === 200,
    "website loaded under 3 seconds": (r) => r.timings.duration < 3000,
  });

  sleep(2);
}