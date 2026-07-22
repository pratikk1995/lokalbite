// LokaBite Rider (Delivery Partner) app configuration
class AppConfig {
  // ─── Production URL (delivery dashboard) ──────────────────────────────
  static const String prodUrl = 'https://lokabite.vercel.app/delivery';

  // ─── Dev URL (local machine) ──────────────────────────────────────────
  static const String devUrl = 'http://localhost:3000/delivery';

  // ─── Toggle: set to true only when developing locally ─────────────────
  static const bool useDev = false;

  static String get baseUrl => useDev ? devUrl : prodUrl;

  // App branding
  static const String appName = 'LokaBite Rider';
  static const String appVersion = '1.0.0';

  // Brand colors
  static const int primaryColor = 0xFF0D9488; // Teal green for delivery app
  static const int accentColor = 0xFFFF6B35;  // LokaBite orange accent
}
