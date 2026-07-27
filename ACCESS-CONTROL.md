# Selling the course: access control & subscriptions (options + trade-offs)

This is a **business + cost decision as much as a technical one**, so this document *presents the
options* rather than picking one — choose the host/billing stack before any of it is built
(playbook §11). Everything the course ships today (lessons, study tools, the retrieval assistant,
offline use) stays free for authorized users under any option.

## Read this first (honest caveat)

A **purely static site cannot strongly protect paid content.** Anything shipped to the browser can
be read via DevTools, and if the repo is public the source is visible. Client-side password gates
are trivially bypassed. **Real gating needs a server-side check** of an active subscription before
the protected content is served. Plan for one of the three paths below.

## Option A — Recommended for real selling: auth + billing layer

Move hosting to a platform that supports server-side access rules (**Cloudflare Pages/Access**,
**Netlify**, or **Vercel**) and add:

- **Accounts + an access table:** **Supabase** or **Firebase**.
- **Subscription payments:** **Stripe**, **Lemon Squeezy**, or **Gumroad**.
- **Webhooks** that set each user's `access_expiry` when they pay/cancel.

The lesson bundle (or the API that serves it) is released only after a **server-side check that the
subscription is active and unexpired**. With accounts you also get **account-synced progress** —
sync completion, streaks, the Leitner review state, and exam results to the user's profile so they
survive device changes (localStorage becomes a cache, not the source of truth).

*Effort:* medium. *Strength:* strong. *Cost:* free tiers exist for all of these at low volume.

## Option B — Fastest to market: a course platform

Host the lessons on **Teachable, Podia, Kajabi, or Gumroad**, which handle payments, subscriptions,
expiry, and access out of the box.

*Effort:* lowest. *Strength:* proven billing. *Trade-off:* you lose some custom-site control (this
interactive single-page experience may need to be embedded or linked rather than fully hosted).

## Option C — Launch-only stopgap: a lightweight token gate

Issue signed, expiring access tokens (JWT/license keys) validated by a small serverless function
before serving protected content.

*Effort:* low. *Strength:* weak — only as strong as the server check; treat as interim, and do not
rely on it for high-value content.

## Requirements whichever path you choose

- **Server-side validation** of an active, unexpired subscription before granting access — never
  trust the client alone.
- **Time-boxed access** that ends automatically when the subscription lapses (webhook-driven).
- **Secure login/session handling**; no secrets in client code.
- Keep the **free private defaults** (retrieval assistant, offline study tools) working for
  authorized users.

## Commercial & legal basics (not legal advice)

- Terms of Service, Privacy Policy, and a Refund Policy.
- A clear content license / copyright notice.
- Data-handling compliance for paying customers (GDPR in the EU, India's DPDP Act, etc.): collect
  the minimum, disclose what you store, honor deletion requests.

## Recommendation

For a first launch, **Option A on Cloudflare Pages + Supabase + Stripe/Lemon Squeezy** gives the
best balance of control, real protection, and near-zero cost — but confirm the billing specifics
and pick the stack before implementation. Until then the course is best shipped **free and open**
(the current state), which also maximizes reach and word-of-mouth.
