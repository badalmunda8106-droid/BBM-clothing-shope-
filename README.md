# BBM Clothing Shop — functional e-commerce starter

This project upgrades the supplied BBM black/orange storefront with a working product catalogue, server-backed filters, persistent browser cart, newsletter subscriptions, and Razorpay Checkout integration.

## Features

- **Quick Add:** adds a selected product to the cart and persists the cart in the browser.
- **Shopping cart:** quantity changes, remove, subtotal calculation, and stock limits.
- **Product filtering:** search, category, maximum price, and sorting. Product data and prices are served by the backend.
- **Newsletter:** validates and saves subscriber emails in SQLite. Optional SMTP settings send a welcome email; without SMTP, the subscription is still saved but no email is sent.
- **Payment:** creates Razorpay orders on the server, calculates price from the server catalogue, and verifies the Razorpay signature on the server. Use test keys first.
- **Database:** SQLite stores products, subscribers, and orders in `bbm.sqlite`.

## Requirements

- Node.js 20 or newer
- npm
- Internet connection for Google Fonts and Razorpay Checkout script

## Run locally

1. Extract the ZIP and open the `bbm-clothing-shop` folder in a terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Add your Razorpay **test** Key ID and Key Secret to `.env` to test checkout. Keep secret keys private; never put them in browser JavaScript.
5. Start the server:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in Chrome.

The product catalogue and newsletter storage work locally without Razorpay keys. Payment checkout will display a setup message until Razorpay test credentials are configured.

## Razorpay setup

- Create a Razorpay merchant account with the appropriate business/guardian support and complete the provider's required verification.
- Use the provider's **test mode** keys first. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`.
- Configure the webhook URL as `https://YOUR-DOMAIN/api/payment/webhook` and set the webhook secret as `RAZORPAY_WEBHOOK_SECRET`.
- Test successful, failed, cancelled, and duplicate payment scenarios before considering live mode.
- Do not enable live payments until the merchant account is approved, the store's legal/tax/shipping details are ready, and all end-to-end checks are complete.

## Optional newsletter email delivery

The newsletter form always saves a valid email address in SQLite. To send a welcome email too, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `NEWSLETTER_FROM` in `.env` using an email provider's SMTP credentials. Do not commit `.env` or share credentials.

## API endpoints

- `GET /api/health`
- `GET /api/products?search=&category=&min=&max=&sort=`
- `POST /api/newsletter` with `{ "email": "person@example.com" }`
- `POST /api/checkout/create-order` with customer details and product IDs/quantities
- `POST /api/checkout/verify` for server-side Razorpay signature verification
- `POST /api/payment/webhook` for Razorpay payment-captured webhook events

## Important limitations before real launch

This is a functional starter, not a guarantee of production readiness. The sample products, prices, and stock are demo data. Shipping charges, tax/GST invoices, refunds, order-status/customer-account pages, inventory reservation during concurrent checkouts, admin tools, transactional order emails, privacy/terms pages, backups, monitoring, and a live courier API still need to be implemented and tested. A successful payment is recorded in the local order database; production deployment must use persistent storage and HTTPS.
