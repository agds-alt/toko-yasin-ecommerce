# ecommerce-manual — Fix Roadmap

> Actionable fix checklist. Work through in order.
> Created: 2026-06-10

---

## PHASE 1: Critical Security (MUST FIX BEFORE DEPLOY)

- [ ] **1. Remove demo credentials from login page**
  - File: `app/auth/login/page.tsx:166-175`
  - Remove hardcoded email "Achmadmoeslem@gmail.com" + password "admin123" from UI
  - If want to keep demo, use env var and only show in development

- [ ] **2. Create middleware.ts for route protection + security headers**
  - Create `middleware.ts` at project root
  - Protect `/admin/*` routes server-side (check session, redirect if not admin)
  - Add security headers: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy

- [ ] **3. Add rate limiting to auth endpoints**
  - Install `@upstash/ratelimit` or use custom in-memory limiter
  - Apply to: login (5/15min), register (3/15min), password reset (3/15min)

- [ ] **4. Fix order price manipulation (CRITICAL)**
  - File: `server/routers/order.ts:23-24,78-82`
  - Never trust client-sent `price` or `totalAmount`
  - Always fetch product price from DB inside the transaction
  - Recalculate totalAmount server-side

- [ ] **5. Fix stock check race condition**
  - File: `server/routers/order.ts:43-61`
  - Move stock verification INSIDE the $transaction block
  - Use `WHERE stock >= quantity` in the decrement query

- [ ] **6. Remove console.log of auth credentials**
  - File: `app/api/auth/[...nextauth]/route.ts:19,26,30,37`
  - Remove logs that print email, password validity, user found status

- [ ] **7. Move bank account numbers to env vars**
  - Files: `server/routers/order.ts:97-102`, `app/page.tsx:1089-1103`
  - Move BCA/Mandiri/BRI numbers + account name to `BANK_BCA`, `BANK_MANDIRI`, etc.
  - Fetch from env or database, never hardcode

- [ ] **8. Remove test files with credentials**
  - Delete: `test-auth.js`, `test-compare.js`
  - Add `test-*.js` to `.gitignore`

---

## PHASE 2: Critical Fixes

- [ ] **9. Fix undefined functions in recommendations**
  - File: `app/page.tsx:949,988`
  - Define `handleWishlistToggle` and `handleAddToCart` in HomeContent component
  - Or use the existing `toggleWishlist.mutate()` and `addToCart()` patterns

- [ ] **10. Wrap root layout with ErrorBoundary**
  - File: `app/layout.tsx`
  - Import and wrap children with existing `ErrorBoundary` component

- [ ] **11. Fix hardcoded WhatsApp number**
  - File: `app/page.tsx:695`
  - Replace dummy "6281234567890" with fetched admin contact (like WhatsAppFloat does)

- [ ] **12. Add try/catch to JSON.parse calls**
  - File: `app/page.tsx:450,631,670,874`
  - Wrap `JSON.parse(product.images)` in try/catch, fallback to empty array

- [ ] **13. Escape HTML in email templates**
  - Files: `lib/email/templates.ts`, `lib/email/index.ts`, `lib/email.ts`
  - Sanitize user-supplied data (name, address, phone) before HTML interpolation
  - Use a simple escape function or library like `he`

- [ ] **14. Consolidate email implementations**
  - Keep: `lib/email/` (resend.ts + templates.ts + index.ts)
  - Delete: `lib/email.ts` (standalone version with dummy key)
  - Update all imports to use `lib/email/`

- [ ] **15. Fix branding mismatch**
  - Pick ONE brand name (Qohira? Toko Yasin?)
  - Update: `lib/email.ts`, `app/layout.tsx`, `app/page.tsx`, email templates
  - Fix domain: qahira.com vs qohira.com

---

## PHASE 3: Performance + Backend

- [ ] **16. Fix N+1 queries**
  - `review.ts:47-72` — Use pre-computed `averageRating`/`reviewCount` from Product model
  - `admin.ts:25-34` — Use `prisma.order.aggregate({ _sum: { totalAmount } })`
  - `admin.ts:63-90` — Use `_sum` aggregation on relation
  - `admin.ts:133-146` — Use database GROUP BY aggregation

- [ ] **17. Consolidate duplicate payment endpoints**
  - Keep one verification endpoint (decide: reject = PENDING or CANCELLED?)
  - Remove duplicate from either `order.ts` or `payment.ts`

- [ ] **18. Use adminProcedure for notification send**
  - File: `server/routers/notification.ts:94,201`
  - Change `protectedProcedure` + manual check → `adminProcedure`

- [ ] **19. Fix wishlist Error → TRPCError**
  - File: `server/routers/wishlist.ts:45,59`
  - `throw new Error(...)` → `throw new TRPCError({ code: 'NOT_FOUND', ... })`

- [ ] **20. Fix getRecommendations privacy leak**
  - File: `server/routers/product.ts:394`
  - Use `ctx.session.user.id` instead of input userId

- [ ] **21. Fix product hard delete → soft delete**
  - File: `server/routers/product.ts:159-167`
  - Use `update({ isActive: false })` instead of `delete()`

- [ ] **22. Fix cart variant comparison**
  - File: `server/routers/cart.ts:107-114`
  - Sort keys before JSON.stringify comparison, or use deep equality

- [ ] **23. Augment NextAuth session types**
  - Create `types/next-auth.d.ts` extending Session with `id` and `role`
  - Remove all `(ctx.session.user as any).id` casts

---

## PHASE 4: UX + Frontend

- [ ] **24. Replace 57 alert() calls with toast notifications**
  - Create or import a Toast/Snackbar component
  - Replace all `alert('...')` with toast calls
  - Files: 15 files across shop, admin, components

- [ ] **25. Add pagination to product listings**
  - `app/(shop)/products/page.tsx` — add cursor pagination or infinite scroll
  - `app/page.tsx` — limit homepage products (e.g., 20 featured)

- [ ] **26. Consolidate admin layouts**
  - Delete one of: `app/(admin)/layout.tsx` or `app/(admin)/admin/layout.tsx`
  - Keep one layout with all 7 menu items

- [ ] **27. Fix full page reload on review submit**
  - File: `app/(shop)/products/[slug]/page.tsx:100`
  - Replace `window.location.reload()` with `trpcUtils.review.getByProduct.invalidate()`

- [ ] **28. Wire OptimizedImage component**
  - Replace plain `<img>` tags with `OptimizedImage` component
  - Gets: error handling, loading states, Cloudinary optimization

- [ ] **29. Fix hardcoded static ratings**
  - File: `app/page.tsx:573-578,816-820`
  - Use actual `product.averageRating` and `product.reviewCount`

- [ ] **30. Add lazy loading to images**
  - Add `loading="lazy"` to all below-the-fold images
  - Keep `loading="eager"` only for above-the-fold hero images

- [ ] **31. Fix Cloudinary preset inconsistency**
  - Use env var `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` everywhere
  - Remove hardcoded "toko-yasin" from product detail and order pages

---

## PHASE 5: Polish + Infrastructure

- [ ] **32. Replace inline styles with Tailwind**
  - 216 `style={{}}` instances → convert to Tailwind classes
  - Add CSS variables to tailwind.config.ts as custom colors/utilities

- [ ] **33. Add security headers in next.config.ts**
  - Content-Security-Policy, X-Frame-Options, HSTS, etc.

- [ ] **34. Suppress TS/ESLint errors properly**
  - Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`
  - Fix the underlying type/lint errors

- [ ] **35. Add .env.example with all required vars**
  - Add: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_APP_URL
  - Document each var with comments

- [ ] **36. Add env validation**
  - Use `@t3-oss/env-nextjs` or zod to validate env at startup

- [ ] **37. Add audit logging for admin actions**
  - Log: payment verification, order status changes, product modifications
  - Create AuditLog model in Prisma

- [ ] **38. Add automated tests**
  - Unit: domain logic (pricing, stock, order creation)
  - Integration: tRPC routers (auth flow, order flow)
  - E2E: critical paths (browse → cart → checkout → payment)

---

## NOTES

- Project uses `prisma` (not Supabase) — all DB access through Prisma Client
- Auth via NextAuth v4 (consider upgrading to v5/Auth.js for Next.js 16)
- Tailwind CSS 3 (not v4) — standard config approach
- No Redis session — NextAuth JWT strategy (stateless)
- Cloudinary for images (unsigned upload preset)

---

*Working document — check off items as completed*
