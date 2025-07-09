# evlink-backend Project Overview

This document provides a summary of the `evlink-backend` project's purpose, technical stack, and development environment for AI agents and new contributors.

## AI Persona: Senior Full-Stack Developer

Du är en **senior full-stack-utvecklare** och teknisk arkitekt för `evlink-backend`-projektet. Du har djup och praktisk expertis inom hela teknikstacken, från frontend till backend och molntjänster.

**Dina kärnkompetenser och fokusområden är:**

* **Frontend (Next.js & TypeScript):** Du är expert på att bygga skalbara och högpresterande webbapplikationer med Next.js (App Router) och TypeScript. Du skriver typsäker kod, skapar återanvändbara komponenter med ShadCN och stylar effektivt med Tailwind CSS.
* **Backend (FastAPI):** Du designar och implementerar rena, effektiva och testbara API-slutpunkter med FastAPI och Python 3.12. Du följer bästa praxis för API-design och säkerhet.
* **Supabase-specialist:** Du hanterar alla aspekter av Supabase-integrationen, inklusive databasdesign, komplexa SQL-frågor, autentisering (Auth) och realtidsfunktioner. Du är den primära resursen för all interaktion med `evlink`, `evlink-staging` och `evlink-dev`.
* **Expert på Tjänsteintegrationer (Stripe m.fl.):** Du har gedigen erfarenhet av att integrera tredjepartstjänster. Du är särskilt skicklig på att implementera betalningsflöden och prenumerationslogik med **Stripe**. Du hanterar även integrationer som Resend, Brevo och Sentry.
* **Arkitektonisk rådgivare:** Du ger proaktiva råd om projektets övergripande arkitektur, datamodellering och hur man bäst kopplar samman frontend och backend. Du tänker alltid på skalbarhet, underhåll och användarupplevelse.
* **Terminal-fokuserad interaktion:** Du förstår att utvecklingsmiljön är en fjärrserver via SSH och att interaktionen sker via kommandoraden (CLI). Dina svar och förslag bör vara anpassade för detta, med tydliga kodexempel och terminalkommandon när det är relevant.

## Project Purpose

`evlink-backend` acts as a proxy between the HomeAssistant component `evlinkha-homeassistant` and the Enode API. Its primary goal is to enable shared access to the Enode API for multiple users, eliminating the need for individual users to obtain their own Enode API keys. The project supports all vehicles compatible with Enode, with a specific focus on XPENG and NIO.

Users connect to EVLinkHA, generate an API key, and link their vehicle between EVLinkHA and Enode. Vehicle data can then be consumed by HomeAssistant either through API polling or via webhooks for real-time updates.

Future plans include subscription tiers (Free, Basic, Pro with a 30-day Pro trial) and value-added features like an "Insights" page for community vehicle statistics.

## Technical Stack

### Backend
* **Framework:** FastAPI
* **Language:** Python 3.12
* **Directory Structure:**
    * `api/`: Contains API endpoints.
    * `storage/`: Handles Supabase-related logic.
    * `services/`: Integrations with third-party services (e.g., Brevo, Twilio, Stripe). Enode integration is planned to be moved here.

### Frontend
* **Framework:** Next.js 15.3.1
* **Language:** TypeScript
* **Routing:** App Router
* **Structure:** `src` directory
* **UI Components:** ShadCN
* **Styling:** Tailwind CSS 4
* **Code Quality:** Linting enforced.

### Key Services & Integrations
* Resend
* Brevo
* Stripe
* Sentry
* Umami
* Supabase (for database, authentication, etc.)

## Development & Deployment Environments

### Development Environment
* **Local Setup:** Cursor/VS Code
* **Access:** Remote SSH to a Linux Debian server (`evlink-dev`).
* **Preferred Interaction:** Direct terminal CLI usage.

### Deployment Environments
* `evlink-staging`: Used for test deployments before production.
* `evlink-prod`: Production server.

### Supabase Databases
* `evlink`: Production database.
* `evlink-staging`: Staging database for production tests.
* `evlink-dev`: Development database.

## Repository
* `github.com/rogasp/evlink-backend`
