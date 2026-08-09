# Paymob Webhook Setup for Production

## Overview
Paymob requires a webhook endpoint to notify your application of payment status changes (success, failure, pending). The Core-Server handles this at `/api/payments/paymob/webhook`.

## Core-Server Webhook Endpoint
- **URL**: `https://your-core-server.com/api/payments/paymob/webhook`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Authentication**: HMAC signature verification (configured in Core-Server)

## Paymob Dashboard Configuration

### 1. Login to Paymob Dashboard
- Go to https://accept.paymob.com
- Navigate to **Settings** → **Webhooks**

### 2. Add Webhook URL
- **Webhook URL**: `https://your-core-server.com/api/payments/paymob/webhook`
- **Events to subscribe**:
  - `TRANSACTION_PROCESSED` (or similar payment status events)
  - Check Paymob documentation for exact event names

### 3. HMAC Secret
- In Core-Server `.env`:
  ```
  PAYMOB_HMAC_SECRET=your_hmac_secret_from_paymob
  ```
- This must match the HMAC secret configured in Paymob dashboard

### 4. Test the Webhook
- Use Paymob's "Test Webhook" feature
- Verify Core-Server logs show successful processing

## Local Development with ngrok

### 1. Start ngrok
```bash
ngrok http 3000
```

### 2. Update Paymob Dashboard
- Webhook URL: `https://your-ngrok-url.ngrok-free.dev/api/payments/paymob/webhook`

### 3. Update Core-Server `.env`
```
PAYMOB_NOTIFICATION_URL=https://your-ngrok-url.ngrok-free.dev/api/payments/paymob/webhook
PAYMOB_REDIRECTION_URL=http://localhost:3050/payment-result
```

## Vercel Deployment

### 1. Core-Server on VPS/Cloud
- Deploy Core-Server to your VPS (e.g., 88.222.220.235:3005)
- Ensure `/api/payments/paymob/webhook` is publicly accessible
- Configure HTTPS (Let's Encrypt recommended)

### 2. Update Paymob Dashboard for Production
- Webhook URL: `https://your-core-server.com/api/payments/paymob/webhook`
- Ensure HMAC secret matches Core-Server `.env`

### 3. Frontend Environment Variables (Vercel)
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_BASE_URL=https://your-frontend.vercel.app/api
```

### 4. Paymob Redirect URL
In Core-Server `.env`:
```
PAYMOB_REDIRECTION_URL=https://your-frontend.vercel.app/payment-result
```

## Core-Server Webhook Handler

The webhook handler is at `src/routes/payment.routes.ts`:
```typescript
router.post('/paymob/webhook', paymentController.handlePaymobWebhook);
```

The handler:
1. Verifies HMAC signature using `PAYMOB_HMAC_SECRET`
2. Parses transaction data
3. Updates token balance / wallet
4. Returns 200 OK to acknowledge

## Troubleshooting

### Webhook Not Receiving Events
1. Check Core-Server logs for incoming requests
2. Verify URL is accessible from internet (not localhost)
3. Check Paymob dashboard for delivery attempts
4. Ensure HMAC secret matches exactly

### HMAC Verification Fails
1. Ensure `PAYMOB_HMAC_SECRET` in Core-Server matches Paymob dashboard
2. Check that request body is not modified before verification
3. Verify Content-Type is `application/json`

### Redirect Not Working
1. Check `PAYMOB_REDIRECTION_URL` format (must be full URL)
2. Ensure frontend `/payment-result` page exists
3. Verify Core-Server CORS allows your frontend domain

## Security Checklist
- [ ] HMAC secret is strong and unique
- [ ] Webhook URL uses HTTPS in production
- [ ] Core-Server validates HMAC on every request
- [ ] Webhook endpoint returns 200 within 10 seconds
- [ ] Idempotency handled for duplicate webhook deliveries
- [ ] Transaction amounts verified before crediting tokens