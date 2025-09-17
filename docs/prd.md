# Opera MiniPay × PawaPay Merchant Payments — Product Requirements Document (PRD)

## 1) Goals and Background Context

### Goals
- Enable consumers to pay participating merchants directly from MiniPay using stablecoins.
- Provide merchants the option to receive settlement in stablecoins or local currency via PawaPay.
- Keep the UX extremely simple: select merchant → enter reference & amount → confirm & pay.
- Reduce transaction costs compared to traditional rails.
- Launch an MVP in one pilot country, then expand to multiple African markets.

### Background Context
Opera MiniPay is a lightweight, non-custodial stablecoin wallet (Celo) used widely across African markets for cUSD/USDC/USDT. PawaPay is a mobile money aggregator enabling payouts/collections in local currencies across many African countries. Combining them lets users pay with stablecoins while merchants can receive value in stablecoins or local fiat/mobile money through PawaPay.

This addresses high fees, cross-border friction, and mobile money fragmentation, while expanding stablecoin utility for everyday commerce.

### Change Log
| Date       | Version | Description                      | Author |
|------------|---------|----------------------------------|--------|
| 2025-09-17 | 0.1     | Initial draft of PRD context     | PM     |
| 2025-09-17 | 0.2     | Added MSISDN handling to FRs     | PM     |

---

## 2) Requirements

### Functional Requirements (FR)
1. **FR1:** Users can search or select a merchant from a list in the MiniPay mini-app.  
2. **FR2:** Users can enter a payment reference (invoice ID, order ID, or free text).  
3. **FR3:** Users can enter an amount in either local currency or stablecoin.  
4. **FR4:** The app displays real-time conversion between stablecoin and local currency.  
5. **FR5:** The app verifies wallet balance and prompts top-up if insufficient.  
6. **FR6:** Payment triggers a blockchain transfer of stablecoins from user wallet to merchant (or intermediary) wallet.  
7. **FR7:** If a merchant prefers fiat, stablecoin is converted and payout executed via PawaPay.  
8. **FR8:** Users receive transaction confirmation and a digital receipt.  
9. **FR9:** Merchants can view received transactions (with references) in a dashboard.  
10. **FR10 (MSISDN):** The system must provide **user MSISDN** to the payment backend:  
    - Prefer **automatic retrieval** from MiniPay (if SDK exposes it).  
    - If not available, **prompt user to enter MSISDN** manually.  
    - Validate MSISDN format & country code before submission.

### Non-Functional Requirements (NFR)
1. **NFR1:** User confirmation → blockchain broadcast in < 10s on average.  
2. **NFR2:** No crypto jargon; hide “gas”/chain details.  
3. **NFR3:** Exchange rates & fees displayed pre-confirmation.  
4. **NFR4:** Scale to ≥100k MAU at launch.  
5. **NFR5:** KYC/AML compliance per market.  
6. **NFR6:** Resilient to mobile money/operator downtime (retries, graceful errors).  
7. **NFR7:** Encrypt sensitive data in transit and at rest.  
8. **NFR8:** Auditable logs for transactions, conversions, and payouts.

---

## 3) User Interface Design Goals

- **Overall UX Vision:** Mobile-first, Opera-native look; “money transfer” semantics; trust via merchant branding, receipts, transparent fees.
- **Key Paradigms:** Merchant-first entry; minimal form; confirm-before-send; robust error states.
- **Core Screens:** Merchant search/select → Payment form (merchant, reference, amount, MSISDN if needed) → Confirmation → Receipt.
- **Accessibility:** Target WCAG AA. Works on low bandwidth & low-end devices.
- **Branding:** Follow Opera Mini/Wallet styling; show merchant logo.
- **Platforms:** Opera Mini (Android/iOS), with low-connectivity optimization.

---

## 4) Technical Assumptions

- **Repository structure:** Monorepo (mini-app + backend services).  
- **Architecture:**  
  - Mini-app front-end embedded in MiniPay.  
  - Backend API handles merchant directory, transactions, reconciliation, PawaPay integration.  
- **Testing:** Unit + Integration (+ E2E later). MSISDN validation tests; PawaPay sandbox tests.  
- **MiniPay & Assets:** Assume MiniPay SDK can fetch wallet info and (if supported) MSISDN; fallback to manual MSISDN entry.  
- **Stablecoins:** Start with cUSD + USDC.  
- **Payouts:** PawaPay for fiat/mobile money settlements (post-MVP).  
- **Infra:** AWS (EC2/Lambda) + Postgres; secure storage for merchant KYC, MSISDN mapping, logs.  
- **Compliance:** Merchant KYC required pre-listing.

---

## 5) Epic List

1. **Epic 1:** Foundation & Core Infrastructure  
2. **Epic 2:** Merchant Directory & Onboarding  
3. **Epic 3:** Payment Flow & Wallet Transactions  
4. **Epic 4:** Settlement & PawaPay Integration  
5. **Epic 5:** User Experience Enhancements & Receipts  
6. **Epic 6:** Compliance, Security & Scalability

---

## 6) Epic Details

### Epic 1: Foundation & Core Infrastructure
**Goal:** Integrate MiniPay SDK, enable MSISDN handling, and stand up the backend skeleton.

**Stories**
- **1.1 MiniPay SDK Integration** — show balance, enable send, attempt MSISDN auto-fetch.  
- **1.2 MSISDN Entry & Validation** — manual capture with country-aware validation if auto-fetch unavailable.  
- **1.3 Backend Service Setup** — monorepo services, health endpoints, Postgres init, CI/CD to AWS.  
- **1.4 Security & Logging Baseline** — authN/Z on APIs, no plaintext sensitive logs, encrypt MSISDN/KYC, audit trails.

---

### Epic 2: Merchant Directory & Onboarding
**Goal:** KYC’d merchant catalog with dashboard.

**Stories**
- **2.1 Merchant Registration** — business info, category, country, MSISDN, settlement preference.  
- **2.2 KYC Verification** — upload docs, approve/reject; only approved merchants listed.  
- **2.3 Merchant Directory (Consumer)** — search/browse, show name/logo/category/location; selecting prefills IDs.  
- **2.4 Merchant Dashboard** — transactions list, settlement status, filters, secure login.

---

### Epic 3: Payment Flow & Wallet Transactions
**Goal:** End-to-end consumer payments in stablecoins.

**Stories**
- **3.1 Initiate Payment** — must select an active approved merchant.  
- **3.2 Reference & Amount** — local currency or stablecoin with live conversion & validation.  
- **3.3 MSISDN Capture** — auto-retrieve if possible; else manual; validate & attach to txn.  
- **3.4 Confirmation Screen** — show merchant, reference, amount (local + stablecoin), fees, MSISDN, balance.  
- **3.5 Execute Payment** — send stablecoin; success/failure surfaced; backend logs txn.  
- **3.6 Payment Receipt** — receipt with merchant, reference, amounts, fees, MSISDN, txn ID; share/save.

---

### Epic 4: Settlement & PawaPay Integration
**Goal:** Let merchants receive fiat/mobile money via PawaPay.

**Stories**
- **4.1 Settlement Preferences** — stablecoin vs mobile money/bank; stored & auto-applied.  
- **4.2 Stablecoin → Fiat Conversion** — use off-ramp/liquidity; record rates/fees; handle errors.  
- **4.3 PawaPay Payout API** — payouts with merchant MSISDN/amount/currency/reference; retries.  
- **4.4 Status Reconciliation** — handle callbacks; reflect pending/success/failure; reason codes.  
- **4.5 Settlement Reporting** — history, fees, CSV export; retain ≥1 year.

---

### Epic 5: User Experience Enhancements & Receipts
**Goal:** Polish confirmations, history, localization, error recovery.

**Stories**
- **5.1 Confirmation & Feedback** — success, failure, pending states.  
- **5.2 Digital Receipts** — include merchant, reference, MSISDN, amounts, fees, txn ID; share/save.  
- **5.3 Transaction History (Consumer)** — searchable, retained ≥6 months in-app.  
- **5.4 Localization** — EN + FR + one pilot local language; locale formatting.  
- **5.5 Error Handling & Recovery** — friendly messages, retries, logs, help links.

---

### Epic 6: Compliance, Security & Scalability
**Goal:** KYC/AML, security hardening, multi-country scale.

**Stories**
- **6.1 Merchant KYC Enforcement** — block listing until verified; audit.  
- **6.2 Consumer KYC (Threshold-based)** — trigger when cumulative volume exceeds market threshold.  
- **6.3 Transaction Monitoring & AML** — velocity rules, blacklists, alerts, regulator exports.  
- **6.4 Security Hardening** — encryption, secret vaulting, RBAC, pen-test before launch.  
- **6.5 Scalability & Multi-Country** — country rules configurable; horizontal scale; stress tests.

---

## 7) Checklist Results (to run)
Use the PM checklist before handoff:
- Scope clarity, MVP alignment, FR/NFR coverage, epic sequencing, assumptions.
(Internally: run **PM checklist** in your process.)

---

## 8) Next Steps (handoff prompts)

**UX Expert Prompt**  
> Create a UI/UX Specification focusing on merchant selection, MSISDN capture/validation, confirmations/receipts, low-bandwidth UX, and localization (EN/FR/one local language).

**Architect Prompt**  
> Create a Brownfield/Fullstack Architecture covering MiniPay SDK (wallet + MSISDN), stablecoin tx flow (cUSD/USDC), backend APIs (merchants/transactions/rec), PawaPay payouts integration, and security/compliance/scalability for multi-country rollout.