# Rajmarg Yatra — citizen-service concept demo

## Project summary (221 words)

Rajmarg Yatra is an independent concept prototype that fixes two frustrating journeys faced by highway users.

First, “Report an Issue on NH” can verify that a citizen is on a National Highway and then redirect them to call 1033. That loses the context a road team needs: the precise road segment, coordinates, photo evidence, complaint description, acknowledgement and a trackable outcome. Our redesigned journey asks for consented location in production, matches the report to a highway segment, supports a manual landmark fallback for weak GPS, collects a photo and simple issue category, and immediately creates a ticket with clear routing and milestones.

Second, FASTag users who spot a duplicate or incorrect toll debit are often left between alerts, issuer apps and helplines. Our flow lets the user select the suspicious transaction, choose the problem, review already-known evidence and submit one readable case.

Both journeys are end to end: submit → instant ticket → simulated acknowledgement email → citizen status timeline → assigned/review/resolution or escalation milestone. The prototype uses large touch controls, short screens and pre-filled data for mobile users and slower networks.

This is not an official NHAI, IHMCL or Rajmarg Yatra product. All vehicles, toll charges, locations, images, acknowledgements, tickets, teams and outcomes are synthetic. Production deployment would need authorised integrations, explicit user consent for location, data minimisation, secure evidence storage, audit logs, owner-level routing and a service-level escalation policy.

## Two-minute video plan

- 0:00–0:14 — State the two real pain points: a road issue becomes a 1033 call, and a wrong FASTag debit becomes a maze.
- 0:14–0:42 — Demo road issue: map/NH match, issue and photo, review, ticket and acknowledgement.
- 0:42–1:00 — Demo FASTag: choose the suspicious charge, reason, review, case and acknowledgement.
- 1:00–1:33 — Show both status timelines; explain accountable routing and low-connectivity fallback.
- 1:33–1:52 — Explain the product choices and Codex-built prototype.
- 1:52–2:00 — Disclose synthetic data and the authorised, privacy-safe production path.

## Reviewer test path

- Road issue: **Report an Issue on NH** → **This is the right location** → select issue → **Review report** → **Submit road report**.
- FASTag: **FASTag Help** → choose a charge → **This is the charge I want to report** → select reason → **Submit FASTag report**.
