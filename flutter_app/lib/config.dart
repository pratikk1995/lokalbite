// LokaBite app configuration
class AppConfig {
  // ─── Production URL (your live Vercel deployment) ───────────────────────
  static const String prodUrl = 'https://lokabite.vercel.app';

  // ─── Dev URL (your local machine IP when running Next.js locally) ────────
  // Change this to your machine's local IP: e.g. http://192.168.1.x:3000
  static const String devUrl = 'http://localhost:3000';

  // ─── Toggle: set to true only when developing locally ───────────────────
  static const bool useDev = false;

  static String get baseUrl => useDev ? devUrl : prodUrl;

  // App branding
  static const String appName = 'LokaBite';
  static const String appVersion = '1.0.0';
}
