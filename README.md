# REFAB — A simpler highway companion

REFAB is a mobile-first web prototype for Indian National Highway users. It demonstrates how toll passes, FASTag recharge, highway problem reporting, amenities and route planning can feel like one trustworthy citizen journey — not a fragmented government portal.

**REFAB is an independent prototype. It is not an official NHAI product.**

## Problem

Highway users in India navigate scattered services for FASTag, toll passes, complaints, amenities and highway information. Each service has different language, steps and follow-up — making simple tasks slow and confusing.

## Target citizen

Daily and occasional National Highway travellers who need to:

- Check pass and FASTag status quickly
- Report a road problem with location and evidence
- Track what happens after they report
- Find fuel, food and help on the road

## REFAB solution

One mobile app organised around:

**DISCOVER → UNDERSTAND → ACT → CONFIRM → TRACK**

## Main user journey (2-minute demo)

1. Open **Home** — see FASTag and Annual Pass at a glance
2. Tap **Annual Pass** — view crossings and validity
3. Return home → **Report a highway problem**
4. Confirm synthetic location on NH-44 · Murthal
5. Select **Pothole / damaged road**, add description
6. **Submit** → receive reference e.g. `REFAB-2026-004821`
7. **Track report** → see timeline (submitted → verified → assigned → resolution)

## Architecture

```
Browser (refab-app.js)
    ↕ localStorage (demo state: balance, passes, reports)
    ↕ REST API (server.mjs)
    ↕ raahi-demo-data.json (synthetic case records)
```

| Layer | Files | Role |
|-------|-------|------|
| UI | `refab-app.js`, `refab.css` | Mobile-first screens and navigation |
| Mock data | `mock-data.js` | Synthetic users, plazas, amenities, routes |
| Services | `refab-services.js` | `submitReport()`, `simulateRecharge()`, `getPassDetails()`, etc. |
| API | `server.mjs` | POST reports, GET cases, static file serving |
| Storage | `raahi-demo-data.json` | Server-side demo case persistence |

## Mock data strategy

All citizen data is synthetic:

- Vehicle: `DL12XX0000` (demo account: Rahul Sharma)
- Location: NH-44 · Murthal
- FASTag balance: starts at ₹1,240
- Annual Pass: 125 crossings, valid until 11 Sep 2026

Client state persists in `localStorage` (`refab-demo-v2`). Server cases persist in `raahi-demo-data.json`.

## What is simulated

- Government / NHAI integrations
- Payments (UPI, card, net banking)
- Identity verification (no Aadhaar, PAN or OTP)
- Complaint routing to field teams
- GPS, maps, weather and phone calls
- FASTag issuer lookups

Every screen shows **DEMO MODE** and explains that no real government action occurs.

## Production integrations (not connected)

A production version could integrate with:

- Authorised NHAI / highway APIs
- FASTag issuer and toll infrastructure
- Approved payment gateways (RBI-compliant)
- GIS and highway segment matching
- Government complaint and SLA workflows

All would require authorised access, user consent, data minimisation and security review.

## Run locally

```sh
cd outputs
node server.mjs
```

Open [http://localhost:4173](http://localhost:4173).

Do not open the HTML file directly — the report API requires the server.

## API endpoints

- `POST /api/road-reports` — create synthetic road report
- `POST /api/fastag-reports` — create synthetic FASTag dispute
- `GET /api/cases/:id` — fetch case by ID
- `GET /api/health` — health check

## Demo credentials

No login required. Demo account is pre-filled:

- Name: Rahul Sharma
- Vehicle: DL12XX0000
- Status check vehicle: DL12AB0000

## Publish on Render

1. Put this `outputs` folder in a GitHub repository.
2. In Render, select **New → Blueprint** and select that repository. Render reads `render.yaml`.
3. Deploy. Render creates a public test URL.
4. Test both report journeys on that public URL.
5. In the Render service, open **Settings → Custom Domains**, add your domain, then add the exact DNS record Render shows at your domain registrar. Verify it in Render after DNS propagation.

The service exposes `/api/health` for deployment health checks. On free or ephemeral hosting, server-side synthetic report records can reset after a redeploy. Browser demo state persists in localStorage.

GitHub Pages alone cannot run this API; it can only host the static frontend. Render web services support Node apps and custom domains.

Never connect this demo to live NHAI/IHMCL, bank, payment, Aadhaar, OTP or real citizen data without authorised integrations and a production security review.
