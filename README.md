# 🍽️ LocalBite — Complete Delivery Platform

**LocalBite** is a multi-app local delivery platform built with Flutter for rural India. Customers order food & kirana from local shops, delivery partners fulfill orders, shop owners manage inventory, and you (admin) control everything.

---

## 📦 What's Inside

This repository contains **4 apps** built with Flutter:

| App | Folder | Description |
|-----|--------|-------------|
| 👤 **Customer App** | `customer/` | Browse shops, order food/kirana, track delivery, pay (COD/UPI/Card) |
| 🛵 **Delivery Partner App** | `delivery/` | Accept orders, navigate, mark delivered, track earnings |
| 🏪 **Shop Owner App** | `shop_owner/` | Manage products, view orders, accept/reject |
| 💻 **Admin Web Panel** | `admin_web/` | (HTML/JS) Manage shops, users, view analytics |

All apps share the same **Firebase backend** and **orange brand theme**.

---

## 🚀 Quick Start

### Option A: Cloud Build (No Laptop Required) ⭐ RECOMMENDED

Since you mentioned no laptop, use **Codemagic** (free, mobile-friendly):

1. **Sign up** at https://codemagic.io (use Google account)
2. **Connect** this repository (or upload as zip)
3. Click **"Start new build"** → Select workflow (e.g., `android_customer`)
4. Wait ~10-15 min → Download APK from artifacts
5. Install on phone → Done! 🎉

**Build workflows available:**
- `android_customer` → Customer APK
- `ios_customer` → Customer IPA
- `android_delivery` → Delivery APK
- `ios_delivery` → Delivery IPA
- `android_shop` → Shop Owner APK
- `ios_shop` → Shop Owner IPA

### Option B: Local Build (Laptop Required)

```bash
# Install Flutter
# https://docs.flutter.dev/get-started/install

# Pick an app
cd customer
flutter pub get
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔥 Firebase Setup (Required)

1. Go to https://console.firebase.google.com
2. Create project: **LocalBite**
3. Add Android apps (3) and iOS apps (3) — package names:
   - `com.localbite.customer`
   - `com.localbite.delivery`
   - `com.localbite.shop`
4. Enable **Phone Authentication**
5. Create **Firestore Database** (start in test mode)
6. Download `google-services.json` → put in each app's `android/app/`
7. Download `GoogleService-Info.plist` → put in each app's `ios/Runner/`

### Firestore Collections Structure

```
shops/
  {shopId}/
    name: string
    address: string
    phone: string
    rating: number
    isActive: bool
    lat: number, lng: number

products/
  {productId}/
    name: string
    price: number
    category: string (food/kirana/medical/vegetable/bakery)
    stock: number
    shopId: string
    shopOwnerId: string

orders/
  {orderId}/
    orderId: string
    customerId: string
    customerPhone: string
    customerAddress: string
    items: array
    total: number
    paymentMethod: string (cod/upi/razorpay)
    status: string (pending/accepted/preparing/ready/delivering/delivered)
    deliveryBoyId: string
    createdAt: timestamp

delivery_partners/
  {uid}/
    phone: string
    isAvailable: bool
    lat: number, lng: number
    rating: number

users/
  {uid}/
    phone: string
    role: string (customer)
```

---

## 💳 Payment Setup

### Razorpay (Online Payments)
1. Sign up at https://razorpay.com (PAN + Bank account — no GST needed for testing)
2. Get test API keys from dashboard
3. Replace `rzp_test_YOUR_KEY_HERE` in `customer/lib/screens/checkout_screen.dart`

### COD (Cash on Delivery)
- Works out of the box — no setup needed
- Recommended for rural India

### UPI Direct
- Shop owner uploads their QR code (PhonePe/Paytm/GPay)
- Customer scans and pays directly
- No platform commission

---

## 🎨 Branding

- **Primary color:** `#FF6B35` (Orange — Swiggy-style)
- **Multi-language:** English, Hindi (हिंदी), Marathi (मराठी)
- **Logo:** Place at `assets/images/logo.png` in each app

---

## 📱 App Features

### Customer App
- ✅ Phone OTP login
- ✅ Browse by category (Food, Kirana, Medical, Vegetable, Bakery)
- ✅ Search shops & products
- ✅ Add to cart, checkout
- ✅ Multiple payment options (COD, UPI, Card)
- ✅ Real-time order tracking
- ✅ Order history
- ✅ Multi-language (En/Hi/Mr)
- ✅ GPS for delivery

### Delivery Partner App
- ✅ Phone OTP login
- ✅ Online/Offline toggle
- ✅ Receive order notifications
- ✅ View order details
- ✅ Call customer & navigate
- ✅ Update order status (Preparing → Picked → Delivered)
- ✅ Track daily/total earnings
- ✅ 10% commission per delivery

### Shop Owner App
- ✅ Phone OTP login
- ✅ Add/Edit/Delete products
- ✅ Manage inventory & stock
- ✅ View incoming orders
- ✅ Accept/Reject orders
- ✅ Earnings dashboard
- ✅ UPI QR upload (for direct payments)

---

## 🌍 Multi-Language

All UI text is in English with helper functions for translation. To translate, just call:
```dart
String t(String en, String hi, String mr) { ... }
```

Current languages: **English, Hindi, Marathi**

To add another language, edit `lib/main.dart`:
```dart
supportedLocales: const [
  Locale('en', 'US'),
  Locale('hi', 'IN'),
  Locale('mr', 'IN'),
],
```

---

## 🛠️ Tech Stack

- **Flutter 3.10+** (Dart 3+)
- **Firebase** (Auth, Firestore, Storage, Messaging)
- **Provider** (State management)
- **Razorpay** (Payments)
- **Google Maps** (Navigation)
- **Geolocator** (GPS)

---

## 📄 License

This project is built for **LocalBite** — your local delivery platform. Make it yours! 🚀

---

## 💡 Tips for Success

1. **Start small:** Launch with 5-10 local shops in your village/town
2. **COD first:** 90% of rural India prefers cash on delivery
3. **Train shop owners:** Help them add products & use the app
4. **Incentivize delivery partners:** 10-15% commission works well
5. **WhatsApp marketing:** Most effective for rural India
6. **Multi-language:** Critical for adoption

---

**Built with ❤️ for rural India by Mavis**
