// LokaBite Partner (Store Owner) app configuration
class AppConfig {
  // ─── Production URL (store dashboard) ─────────────────────────────────
  static const String prodUrl = 'https://lokabite.vercel.app/store';

  // ─── Dev URL (local machine) ──────────────────────────────────────────
  static const String devUrl = 'http://localhost:3000/store';

  // ─── Toggle: set to true only when developing locally ─────────────────
  static const bool useDev = false;

  static String get baseUrl => useDev ? devUrl : prodUrl;

  // App branding
  static const String appName = 'LokaBite Partner';
  static const String appVersion = '1.0.0';

  // Brand colors
  static const int primaryColor = 0xFF1E3A5F; // Deep navy blue for store app
  static const int accentColor = 0xFFFF6B35;  // LokaBite orange accent
}
