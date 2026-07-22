import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:permission_handler/permission_handler.dart';
import 'config.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Teal green status bar for Delivery Rider branding
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(AppConfig.primaryColor),
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(AppConfig.primaryColor),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(const LokaBiteRiderApp());
}

class LokaBiteRiderApp extends StatelessWidget {
  const LokaBiteRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(AppConfig.primaryColor),
        ),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}

// ─── Splash Screen ─────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    _scaleAnim = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _controller.forward();

    Future.delayed(const Duration(milliseconds: 2000), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const MainWebView(),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 400),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.primaryColor),
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      '🚴',
                      style: TextStyle(fontSize: 52),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'LokaBite Rider',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Deliver & Earn Money',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    letterSpacing: 0.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Main WebView Screen ────────────────────────────────────────────────────
class MainWebView extends StatefulWidget {
  const MainWebView({super.key});

  @override
  State<MainWebView> createState() => _MainWebViewState();
}

class _MainWebViewState extends State<MainWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  double _loadingProgress = 0;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    final WebViewController controller = WebViewController();

    if (controller.platform is AndroidWebViewController) {
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        AndroidWebViewController.enableDebugging(true);
      }
      (controller.platform as AndroidWebViewController)
          .setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          final status = await Permission.locationWhenInUse.request();
          return GeolocationPermissionsResponse(
            allow: status.isGranted,
            retain: true,
          );
        },
      );
    }

    _controller = controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(AppConfig.primaryColor))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
              _loadingProgress = 0;
            });
          },
          onProgress: (progress) {
            setState(() {
              _loadingProgress = progress / 100.0;
            });
          },
          onPageFinished: (url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (error) {
            setState(() {
              _isLoading = false;
              _hasError = true;
              _errorMessage = 'Failed to load page.\nCheck your connection and try again.';
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(AppConfig.baseUrl));
  }

  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(AppConfig.primaryColor),
        body: SafeArea(
          child: _hasError
              ? _buildErrorScreen()
              : Stack(
                  children: [
                    RefreshIndicator(
                      onRefresh: () async {
                        await _controller.reload();
                      },
                      color: const Color(AppConfig.accentColor),
                      child: WebViewWidget(controller: _controller),
                    ),
                    if (_isLoading) _buildLoadingOverlay(),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: const Color(AppConfig.primaryColor),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '🚴',
              style: TextStyle(fontSize: 52),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 200,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: _loadingProgress > 0 ? _loadingProgress : null,
                  backgroundColor: Colors.white24,
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  minHeight: 4,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Loading Deliveries...',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      color: const Color(AppConfig.primaryColor),
      width: double.infinity,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('📡', style: TextStyle(fontSize: 64)),
          const SizedBox(height: 24),
          Text(
            _errorMessage,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _hasError = false;
                _isLoading = true;
              });
              _controller.reload();
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Try Again'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(AppConfig.primaryColor),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
