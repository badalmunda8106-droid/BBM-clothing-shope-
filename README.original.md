# BBM Clothing Shop — Full-stack e-commerce starter

A runnable Node.js + Express + SQLite store with a responsive storefront, customer registration/login, persistent product catalogue, server-side cart validation, order records, Razorpay checkout integration (UPI method requested), payment signature verification + webhook, admin product/order/return endpoints, and courier tracking fields.

## Pages / flows
- Home, Shop, New Arrivals, Categories, Best Sellers (catalog flags), About, Lookbook-ready brand section, FAQ, Contact link, policies, cart drawer, checkout form.
- Product filtering/search/sorting; stock, sizes and colours are stored per product.
- Customer registration/login, order history API, wishlist API, return request API.
- Admin product/order/return management APIs. Tracking details can be saved to orders.
- Payment uses Razorpay Checkout. UPI must be enabled for the merchant account; the checkout UI asks for UPI only.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
3. Set a strong `ADMIN_PASSWORD` and your `ADMIN_EMAIL`.
4. Run `npm install`, then `npm start`.
5. Open `http://localhost:3000`.
6. Create the first admin with `POST /api/admin/seed-admin` after setting the environment variables. Sign in through `/api/auth/login`; use the returned token as `Authorization: Bearer <token>` for `/api/admin/*`.

## Razorpay / UPI setup
- Create/verify the merchant account with Razorpay and enable UPI in its dashboard.
- Put `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` in `.env`.
- Set webhook URL to `https://YOUR-DOMAIN/api/payment/webhook`, subscribe to `payment.captured`.
- Use provider test keys and test mode first. Switch to live keys only after merchant approval and end-to-end testing.
- Payment is verified server-side by checkout signature and webhook. Do not trust browser-only success callbacks.

## Shipping / courier integration
The order table includes courier, tracking ID and tracking URL. Admin can update them with `PATCH /api/admin/orders/:id`.
Shiprocket credentials are reserved in `.env.example`; no live Shiprocket API calls are wired in this starter. A courier account, pickup address, package dimensions/weights, serviceability rules and API integration must be configured before real fulfilment/tracking can work.

## Admin API quick reference
- `POST /api/admin/seed-admin` — create the first admin once.
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `GET /api/admin/returns`
- `PATCH /api/admin/returns/:id`

All admin routes require a signed-in admin bearer token.

## Important production checklist
This is source code, not a hosted live store. Before taking real customer money:
- Use HTTPS, managed production hosting, persistent database backups, strong secrets and restricted admin access.
- Replace sample product content, images, prices, stock and policy drafts with verified business details.
- Complete payment merchant KYC/approval; UPI availability is controlled by the payment provider.
- Connect a real courier API (e.g. Shiprocket) and test label creation, pickup, cancellation and tracking webhooks.
- Add email/SMS transactional notifications, inventory reservation/rollback on failed payments, refunds through the provider API, tax/GST invoice rules, audit logs, monitoring, CSRF strategy if moving to cookie sessions, and privacy/legal review.
- Configure account order history UI, product option selection on PDP, reviews moderation and full admin dashboard UI. The API groundwork exists but those screens/integrations are not complete in this starter.

## Currency
All prices are stored in paise (₹799 = 79900). Sample seed prices are currently stored as rupees-like integer values in the starter for display consistency; update seed data and checkout currency scaling before production if you want paise-accurate gateway charging. **Do not use live payment keys until amounts are converted to paise correctly and tested.**
