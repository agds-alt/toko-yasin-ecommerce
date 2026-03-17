# 🔔 Push Notification Testing Guide

## Prerequisites
✅ VAPID keys configured in Vercel environment variables
✅ Service worker registered (`/sw.js`)
✅ PushNotificationManager component in root layout
✅ Backend notification router ready

## Environment Variables (Already Set)
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BInG0oJ_hFfFkifF8jVZ1t7a0tIEOeb2M6pqJ2TFZ8fjUS9oxTRaE0F3iMJpzG2xONvq5hUddINhx647hB3TX_U"
VAPID_PRIVATE_KEY="EqiAyoDFabyMxRYMqnD50moEZxQhD65NXVo4SsytH6o"
VAPID_SUBJECT="mailto:admin@example.com"
```

## Testing Steps

### 1️⃣ Test User Subscription Flow
**Location:** Any page (popup shows on first visit)

**Steps:**
1. Open production URL in browser
2. Look for "Enable Notifications" popup (bottom-right)
3. Click "Enable Notifications"
4. Browser will ask for permission → Click "Allow"
5. Popup should change to "Notifications Enabled ✓"

**Expected Result:**
- Subscription saved to database (`PushSubscription` table)
- User can receive notifications

**Troubleshooting:**
- If popup doesn't show: Check browser console for errors
- If permission denied: Clear site data and try again
- Check Supabase database for new subscription entry

---

### 2️⃣ Test Admin Send Custom Notification
**Location:** `/admin/notifications` (needs to be created)

**What to Test:**
- Admin can compose custom notification
- Select target: All users / Specific user / User role
- Send notification with title, body, icon, URL
- Notification appears on user's device

**Current Status:** ⚠️ Admin UI for sending notifications not yet created

**Quick Test via Browser Console:**
```javascript
// In production, open browser console and run:
await fetch('/api/trpc/notification.send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Test Notification",
    body: "Hello from Toko Buku Abdul!",
    icon: "/icons/icon-192x192.png",
    url: "/"
  })
});
```

---

### 3️⃣ Test Automatic Order Status Notifications
**Location:** Triggered when admin updates order status

**Flow:**
1. User places an order → Status: PENDING
2. Admin updates to PAYMENT_UPLOADED
   - ✅ Notification: "Pembayaran Anda sedang diverifikasi"
3. Admin updates to CONFIRMED
   - ✅ Notification: "Pesanan Anda dikonfirmasi!"
4. Admin updates to PROCESSING
   - ✅ Notification: "Pesanan sedang dikemas"
5. Admin updates to SHIPPED
   - ✅ Notification: "Pesanan dalam pengiriman!"
6. Admin updates to DELIVERED
   - ✅ Notification: "Pesanan telah sampai"

**How to Test:**
1. Create test order as customer
2. Login as admin
3. Go to `/admin/orders`
4. Update order status
5. Check if notification received on user device

---

### 4️⃣ Test on Different Devices

**Desktop Browsers:**
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ❌ Safari (limited support)

**Mobile:**
- ✅ Chrome Android
- ✅ Firefox Android
- ✅ Samsung Internet
- ⚠️ iOS Safari (requires Add to Home Screen)
- ✅ iOS Chrome (via Add to Home Screen)

**Testing Checklist:**
- [ ] Notification permission request works
- [ ] Notifications appear when app is closed
- [ ] Notifications appear when app is open
- [ ] Click notification opens correct URL
- [ ] Notification icon displays correctly
- [ ] Sound/vibration works (if enabled)

---

## Database Check

Check subscriptions in Supabase:
```sql
SELECT
  id,
  "userId",
  endpoint,
  "userAgent",
  "createdAt"
FROM "PushSubscription"
ORDER BY "createdAt" DESC;
```

---

## Common Issues & Solutions

### Issue: "Notification permission denied"
**Solution:**
1. Clear browser site data
2. Restart browser
3. Try again

### Issue: "Service worker not found"
**Solution:**
- Check `/sw.js` is accessible
- Verify service worker registration in browser DevTools

### Issue: "Notifications not received"
**Solution:**
1. Check browser console for errors
2. Verify VAPID keys are correct
3. Check subscription exists in database
4. Test with browser notification test tool

### Issue: "VAPID key mismatch"
**Solution:**
- Verify environment variables in Vercel match local `.env`
- Redeploy if keys were changed

---

## Next Steps

### To Complete Testing:
1. ✅ Test user subscription flow
2. ⚠️ Create admin notification UI (`/admin/notifications`)
3. ✅ Test automatic order notifications
4. ✅ Test on multiple devices
5. 📊 Monitor Lighthouse PWA score

### Recommended Admin UI Features:
- Send broadcast to all users
- Send to specific user by email
- Send to users with role (ADMIN/USER)
- Schedule notifications (future feature)
- View notification history
- View active subscriptions

---

## Production URL
🔗 **[Your Vercel Production URL]**

## Status
- ✅ Backend: Ready
- ✅ Frontend: PushNotificationManager component active
- ✅ Service Worker: Registered
- ⚠️ Admin UI: Needs to be created
- ⏳ Testing: In Progress
