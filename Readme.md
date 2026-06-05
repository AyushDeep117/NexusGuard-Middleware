# Nexus Guard Middleware 

Nexus Guard is a high-performance, enterprise-grade distributed rate-limiting security middleware built using Node.js, Express, and Redis. It implements a highly scalable **Token Bucket Algorithm** alongside an automated **Circuit Breaker Pattern** to secure backend endpoints against brute-force attacks and Distributed Denial of Service (DDoS) attempts without compromising application availability.

## Core Features

* **Token Bucket Throttling:** Dynamic, real-time tracking of request capacities mapped securely to remote Redis caches.
* **Circuit Breaker Fault Tolerance:** Built-in resilience engineering. If the Redis layer drops offline or encounters network latency, the gateway automatically trips its internal circuit to an **Open State**, falling back to pass traffic gracefully (**Fail-Open Architecture**) to protect overall system uptime.
* **Zero-Configuration Multi-Container Stack:** Fully Dockerized development orchestration, decoupling environment state between local isolated containers and distributed production environments seamlessly.
* **Live Observability Telemetry:** Real-time logging of inbound traffic paths and explicit structural indicators highlighting active security mitigations.

---

##  System Architecture

Our middleware sits directly in front of vulnerable API routes, parsing incoming identifiers before passing execution contexts down the network lane.

## Installation & Setup

### Prerequisites
* Node.js (v20+)
* Docker Desktop

### Quickstart (Containerized Stack)
To spin up the entire application along with an isolated local Redis cluster simultaneously, run:
```bash
docker-compose up --build