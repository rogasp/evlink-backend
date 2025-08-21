![CI](https://github.com/rogasp/evlink-backend/actions/workflows/deploy-production.yml/badge.svg)
[![CodeQL](https://github.com/rogasp/evlink-backend/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/rogasp/evlink-backend/actions/workflows/github-code-scanning/codeql)
![License](https://img.shields.io/badge/license-MIT-green)

# EVLinkHA

EVLinkHA is an open-source bridge between Home Assistant and Enode, enabling seamless electric vehicle integration and smart energy management in your home.

> Project website: [https://evlinkha.se](https://evlinkha.se)

---

## Overview

EVLinkHA is designed to provide:

* 🔌 Integration with EV brands via [Enode](https://enode.com)
* 🧠 Local API proxy for Home Assistant
* 🌱 Privacy-first and self-hostable
* 💬 Web dashboard with live vehicle data
* 🔒 Secure authentication (via Supabase)

---

## Documentation

Full documentation is available in the `docs/` folder:

* [Roadmap](docs/ROADMAP.md)
* [Release notes](docs/RELEASES.md)
* [Integration guide](docs/guides/INTEGRATION.md)
* [Architecture Decisions](docs/decisions/README.md)

## Architecture Decisions

* [0001-record-architecture.md](docs/decisions/0001-record-architecture.md) - Initial architecture overview
* [0002-stripe-payments.md](docs/decisions/0002-stripe-payments.md) - Stripe Checkout integration and webhook handling options

---

## Repository Structure

```
.
├── backend/         # FastAPI backend
├── frontend/        # Next.js frontend
├── supabase/        # Supabase local dev setup
├── docs/            # Project documentation
├── .github/         # GitHub Actions, templates etc
├── docker-compose.yml    # Docker development environment
├── docker-compose.prod.yml  # Docker production overrides
├── DOCKER.md        # Docker setup guide
└── Makefile         # Docker convenience commands
```

---

## Getting Started

Start here if you want to run EVLinkHA locally:

### 🐳 Docker (Recommended)
For the easiest setup with all services in containers:

* [Docker Setup Guide](DOCKER.md) - Complete guide for running with Docker
* Quick start: `cp .env.docker .env && docker compose up -d`

### 🛠️ Manual Setup
For traditional development setup:

* [Quickstart for Developers](docs/guides/QUICKSTART.md)
* [Architecture Overview](docs/ARCHITECTURE.md)

---

## Contributions

We welcome community contributions! To get started:

* [CONTRIBUTING.md](CONTRIBUTING.md)
* [Open issues](https://github.com/rogasp/evlink-backend/issues)

All contributions must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

EVLinkHA is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Maintainer

EVLinkHA is developed and maintained by [Roger Aspelin](https://github.com/rogasp).
