# ecommerce-manual — Full Audit Report

> Generated: 2026-06-10 | Project: ecommerce-manual
> Stack: Next.js 16 + Prisma + tRPC + NextAuth + Cloudinary + Tailwind CSS 3

---

## EXECUTIVE SUMMARY

**Overall Health: 4/10** — Banyak critical issues, especially security.

| Layer | Score | Status |
|-------|-------|--------|
| Database/Schema | 8/10 | Well-designed, good indexing |
| Backend/tRPC | 6/10 | Good patterns, critical price manipulation bug |
| Security | 3/10 | Exposed credentials, no rate limiting, no middleware |
| Frontend/UI | 5/10 | Functional but messy (216 inline styles, 57 alerts) |
| Testing | 0/10 | Zero test files |

---

## CRITICAL FINDINGS (13 total)

### Security Critical

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| C1 | **Admin credentials in login page UI** | `app/auth/login/page.tsx:166-175` | Anyone sees real admin email + password "admin123" |
| C2 | **No rate limiting anywhere** | No middleware.ts | Brute-force login trivially possible |
| C3 | **No Next.js middleware for route protection** | middleware.ts (missing) | Admin pages SSR'd by unauthenticated users |
| C4 | **No security headers** | next.config.ts | No CSP, no HSTS, no X-Frame-Options |
| C5 | **Hardcoded bank accounts in source** | `server/routers/order.ts:97-102` | BCA/Mandiri/BRI numbers + account name exposed |
| C6 | **Missing env vars in .env.example** | .env.example | Cloudinary secrets, APP_URL not documented |
| C7 | **Admin auth is client-side only** | `app/(admin)/layout.tsx:33-53` | useEffect guard, not server-side |

### Backend Critical

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| C8 | **Order price manipulation** | `server/routers/order.ts:23-24,78-82` | Client sends price, server doesn't verify → pay Rp 1 for anything |
| C9 | **Stock check race condition** | `server/routers/order.ts:43-61` | Check outside transaction, decrement inside → overselling |

### Frontend Critical

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| C10 | **Undefined functions in recommendations** | `app/page.tsx:949,988` | handleWishlistToggle/handleAddToCart not defined → runtime crash |
| C11 | **Hardcoded WhatsApp number** | `app/page.tsx:695` | Dummy "6281234567890" instead of real admin number |
| C12 | **Unsafe JSON.parse without try/catch** | `app/page.tsx:450,631,670,874` | One corrupt product crashes entire homepage |
| C13 | **Inconsistent Cloudinary presets** | Multiple files | Hardcoded "toko-yasin" vs env var → uploads may fail |

---

## MAJOR FINDINGS (28 total)

### Backend Major

| # | Finding | Location |
|---|---------|----------|
| M1 | Notification router manual admin check instead of adminProcedure | `notification.ts:94,107` |
| M2 | Review getByProduct N+1 - fetches ALL reviews for average | `review.ts:47-72` |
| M3 | Admin getStats N+1 - fetches ALL orders for revenue sum | `admin.ts:25-34` |
| M4 | Admin getCustomers N+1 - loads all orders per user | `admin.ts:63-90` |
| M5 | Admin getAnalytics N+1 - loads all orders in date range | `admin.ts:133-146` |
| M6 | Duplicate payment verification logic (order.ts vs payment.ts) | Both files |
| M7 | Duplicate payment proof upload logic | Both files |
| M8 | Login credentials logged to console | `nextauth/route.ts:19,26,30,37` |
| M9 | XSS in email templates (unescaped user input) | `lib/email/templates.ts` |
| M10 | Weak password policy (min 6 chars, no complexity) | `auth.ts:17` |

### Frontend Major

| # | Finding | Location |
|---|---------|----------|
| M11 | ErrorBoundary exists but never used | `ErrorBoundary.tsx` unused |
| M12 | 57 native alert() calls across codebase | 15 files |
| M13 | 216 inline style={{}} instances | All pages |
| M14 | Duplicate admin layouts (2 separate sidebars) | `app/(admin)/layout.tsx` + `admin/layout.tsx` |
| M15 | Full page reload on review submit | `products/[slug]/page.tsx:100` |
| M16 | Email branding mismatch (Toko Yasin vs Qohira vs Qahira) | Multiple files |
| M17 | No pagination for product listings | `products/page.tsx` |
| M18 | Hardcoded static 5-star ratings on all products | `page.tsx:573-578` |
| M19 | Cart only in localStorage (no server sync) | `CartContext.tsx` |
| M20 | Hardcoded bank accounts in public footer | `page.tsx:1089-1103` |
| M21 | Duplicate conflicting email implementations | `lib/email.ts` vs `lib/email/` |
| M22 | Test credential files in repository | `test-auth.js`, `test-compare.js` |
| M23 | TS/ESLint errors suppressed in build | `next.config.ts:10-16` |
| M24 | Push subscribe endpoint is public | `notification.ts:21` |
| M25 | Admin contact info publicly exposed | `user.ts:10-20` |
| M26 | Hardcoded Cloudinary upload preset | `products/[slug]:180`, `orders/[id]:221` |
| M27 | Admin layout missing navigation links | `admin/layout.tsx` |
| M28 | OptimizedImage component never used | `OptimizedImage.tsx` unused |

---

## MINOR FINDINGS (22)

### Backend Minor

| # | Finding |
|---|---------|
| m1 | Wishlist uses plain Error instead of TRPCError |
| m2 | getRecommendations accepts userId from client (privacy) |
| m3 | Math.random() for order numbers |
| m4 | Seed file hardcoded credentials + wrong log message |
| m5 | Product hard delete instead of soft delete |
| m6 | Product create doesn't check slug uniqueness |
| m7 | Cart variant comparison via JSON.stringify (order-dependent) |
| m8 | Session user type cast to `any` everywhere |
| m9 | Seed missing cleanup for WishlistItem, Review, PushSubscription |
| m10 | No audit logging for admin actions |

### Frontend Minor

| # | Finding |
|---|---------|
| m11 | No lazy loading on images |
| m12 | 7 "as any" type assertions |
| m13 | Splash screen blocks for 3 seconds |
| m14 | Missing skip-to-content link |
| m15 | Missing focus-visible styles |
| m16 | Tailwind config is minimal (no design tokens) |
| m17 | Mixed CSS approaches (Tailwind + inline + style jsx) |
| m18 | No explicit viewport meta tag |
| m19 | WhatsApp badge always shows "1" |
| m20 | email.ts dummy key fallback |
| m21 | Checkout loading state is minimal |
| m22 | No CAPTCHA on auth forms |

---

## DATABASE SCHEMA (Good)

12 models, well-indexed:
- User, Product, ProductVariant, Category
- Cart, CartItem, Order, OrderItem, Payment
- WishlistItem, Review, PushSubscription

Good patterns: composite indexes, cascade deletes, unique constraints.

---

## RECOMMENDED FIX ORDER

### Week 1: Critical Security (DO BEFORE ANY DEPLOYMENT)

| # | Fix | Effort |
|---|-----|--------|
| 1 | Remove demo credentials from login page | 5 min |
| 2 | Create middleware.ts with security headers + admin route protection | 2h |
| 3 | Add rate limiting to auth endpoints | 2h |
| 4 | Verify order price server-side (never trust client price) | 1h |
| 5 | Fix stock check race condition (move inside transaction) | 30 min |
| 6 | Remove console.log of auth credentials | 15 min |
| 7 | Move bank account numbers to env vars | 30 min |
| 8 | Remove test-*.js files, add to .gitignore | 5 min |

### Week 2: Critical Fixes

| # | Fix | Effort |
|---|-----|--------|
| 9 | Fix undefined functions in recommendations section | 1h |
| 10 | Wrap root layout with ErrorBoundary | 15 min |
| 11 | Fix hardcoded WhatsApp number | 15 min |
| 12 | Add try/catch to all JSON.parse calls | 30 min |
| 13 | Escape HTML in email templates | 1h |
| 14 | Consolidate duplicate email implementations | 2h |
| 15 | Fix branding mismatch (pick one name) | 30 min |

### Week 3: Performance + UX

| # | Fix | Effort |
|---|-----|--------|
| 16 | Fix N+1 queries (reviews, admin stats, analytics) | 3h |
| 17 | Consolidate duplicate payment endpoints | 1h |
| 18 | Replace alert() calls with toast notifications | 4h |
| 19 | Add pagination to product listings | 2h |
| 20 | Wire OptimizedImage component | 1h |
| 21 | Consolidate admin layouts | 2h |

---

## WHAT'S DONE RIGHT

- ✅ tRPC with Zod input validation
- ✅ Prisma schema well-designed with proper indexes
- ✅ adminProcedure checks DB role (not just session)
- ✅ bcrypt with 10 rounds for password hashing
- ✅ Cloudinary integration with optimization utilities
- ✅ Order ownership verification before payment
- ✅ Review requires DELIVERED order
- ✅ Proper Prisma transaction for order creation
- ✅ Responsive design (sm/md/lg breakpoints)
- ✅ PWA support with manifest + service worker

---

*Report generated by Hermes Agent*
*Project: ecommerce-manual at /x/projects/ecommerce-manual*
