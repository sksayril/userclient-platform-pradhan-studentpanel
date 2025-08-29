# Razorpay Payment Gateway Integration

This document provides instructions for setting up and using the Razorpay payment gateway integration in the Society Management System.

## Prerequisites

1. **Razorpay Account**: You need a Razorpay merchant account
2. **API Keys**: Both test and live API keys from Razorpay
3. **Backend API**: Your backend should have endpoints for creating orders and verifying payments

## Setup Instructions

### 1. Install Dependencies

The Razorpay package is already installed:
```bash
npm install razorpay
```

### 2. Configure Razorpay Keys

Update the `src/config/razorpay.ts` file with your actual Razorpay keys:

```typescript
export const RAZORPAY_CONFIG = {
  // Test keys - Replace with your actual Razorpay test key
  KEY_ID: 'rzp_test_YOUR_ACTUAL_TEST_KEY_ID',
  KEY_SECRET: 'YOUR_ACTUAL_TEST_KEY_SECRET',
  
  // Production keys (uncomment when going live)
  // KEY_ID: 'rzp_live_YOUR_ACTUAL_LIVE_KEY_ID',
  // KEY_SECRET: 'YOUR_ACTUAL_LIVE_KEY_SECRET',
  
  // ... other config
};
```

### 3. Backend API Requirements

Your backend should have these endpoints:

#### Create Razorpay Order
- **URL**: `/api/payment-requests/create-razorpay-order`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "requestId": "string",
    "amount": "number (in paise)",
    "currency": "INR"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "orderId": "order_xyz123",
    "amount": 100000,
    "currency": "INR"
  }
  ```

#### Verify Payment
- **URL**: `/api/payment-requests/verify-razorpay-payment`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "requestId": "string",
    "paymentId": "pay_xyz123",
    "orderId": "order_xyz123",
    "signature": "razorpay_signature",
    "amount": 1000
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully"
  }
  ```

### 4. How It Works

1. **User clicks "Pay Now"** in the Pending Payment popup
2. **System creates Razorpay order** via your backend API
3. **Razorpay payment modal opens** with payment options
4. **User completes payment** using their preferred method
5. **Payment is verified** with your backend
6. **Payment status is updated** and pending payments list is refreshed

### 5. Payment Flow

```
User clicks "Pay Now"
         ↓
Create Razorpay Order (Backend)
         ↓
Initialize Razorpay Payment (Frontend)
         ↓
Razorpay Payment Modal Opens
         ↓
User completes payment
         ↓
Payment Success Handler
         ↓
Verify Payment (Backend)
         ↓
Update Payment Status
         ↓
Refresh Pending Payments
```

### 6. Error Handling

The integration handles various error scenarios:
- **Network errors**: Connection issues with payment server
- **Authentication errors**: Invalid or expired tokens
- **Payment failures**: Declined payments, insufficient funds
- **Verification failures**: Payment verification issues

### 7. Testing

1. **Use test keys** during development
2. **Test with Razorpay test cards**:
   - Success: 4111 1111 1111 1111
   - Failure: 4000 0000 0000 0002
3. **Test UPI**: Use any valid UPI ID
4. **Test net banking**: Use test credentials

### 8. Going Live

1. **Replace test keys** with live keys in production
2. **Update API endpoints** to production URLs
3. **Test thoroughly** with small amounts
4. **Monitor payment logs** for any issues

### 9. Security Considerations

1. **Never expose key secret** in frontend code
2. **Always verify payments** on your backend
3. **Use HTTPS** in production
4. **Validate payment amounts** server-side
5. **Implement proper error handling**

### 10. Customization

You can customize:
- **Company name and description**
- **Theme colors**
- **Payment modal behavior**
- **Error messages**
- **Success handling**

## Troubleshooting

### Common Issues

1. **"Razorpay not loaded" error**
   - Check if the script is loaded in `index.html`
   - Ensure internet connection is stable

2. **Payment modal not opening**
   - Verify API keys are correct
   - Check browser console for errors
   - Ensure backend API is working

3. **Payment verification fails**
   - Check backend logs
   - Verify signature verification logic
   - Ensure all required fields are sent

4. **Amount mismatch errors**
   - Ensure amount is converted to paise (×100)
   - Check backend amount validation

### Support

For technical support:
1. Check browser console for errors
2. Verify backend API responses
3. Check Razorpay dashboard for payment status
4. Review payment logs in your backend

## Files Modified

- `src/components/Dashboard/SocietyMemberDashboard.tsx` - Main payment integration
- `src/config/razorpay.ts` - Configuration file
- `index.html` - Razorpay script inclusion
- `src/vite-env.d.ts` - TypeScript declarations

## Dependencies Added

- `razorpay` - Official Razorpay JavaScript SDK
