# Section 14 Scalability Foundations

This document tracks architecture hooks added to support future growth.

## 1) Multi-country expansion

- Added `countries` table with active-country controls and currency metadata.
- Added `country_code` support to:
  - `charities`
  - `profiles`
  - `organizations`
  - `campaigns`
- Added index coverage for all new country-based queries.
- Added public API filtering support by country for charities and campaigns.

## 2) Extensible to teams / corporate accounts

- Added `organizations` table with account types: `individual`, `team`, `corporate`.
- Added `organization_members` join table with roles: `owner`, `admin`, `member`.
- Added optional `profiles.organization_id` for user-account linking.
- Added `services/organizationService.ts` for creation and membership workflows.

## 3) Campaign module ready for future activation

- Added `campaigns` table with lifecycle status enum and JSON settings payload.
- Added `services/campaignService.ts` with public-safe listing filters.
- Added module activation flags via environment variables:
  - `NEXT_PUBLIC_CAMPAIGNS_ACTIVE`
  - `NEXT_PUBLIC_ORGANIZATIONS_ACTIVE`

## 4) Mobile app readiness

- Added versioned REST endpoints under `app/api/v1/public/...`:
  - `/api/v1/public/config`
  - `/api/v1/public/charities`
  - `/api/v1/public/campaigns`
- Added `services/platformConfigService.ts` for client bootstrap payloads.
- Versioned endpoint strategy allows mobile clients to pin API contracts while web evolves.

## Migration checklist

Apply migrations in order, including `0004_scalability_foundations.sql`, before validating API responses.
