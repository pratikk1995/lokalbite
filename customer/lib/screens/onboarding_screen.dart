import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/language_provider.dart';
import 'auth/login_screen.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _pages = [
    {
      'icon': Icons.shopping_basket,
      'title_en': 'Order from Local Shops',
      'title_hi': 'स्थानीय दुकानों से ऑर्डर करें',
      'title_mr': 'स्थानिक दुकानांकडून ऑर्डर करा',
      'desc_en': 'Food, groceries, daily essentials — all from shops near you',
      'desc_hi': 'भोजन, किराना, दैनिक जरूरतें — सब आपके पास की दुकानों से',
      'desc_mr': 'अन्न, किराणा, दैनंदिन गरजा — सगळं तुमच्या जवळच्या दुकानांमधून',
    },
    {
      'icon': Icons.delivery_dining,
      'title_en': 'Fast Delivery',
      'title_hi': 'तेज़ डिलीवरी',
      'title_mr': 'वेगवान डिलिव्हरी',
      'desc_en': 'Quick delivery to your doorstep by local delivery partners',
      'desc_hi': 'स्थानीय डिलीवरी पार्टनर्स द्वारा तेज़ डिलीवरी',
      'desc_mr': 'स्थानिक डिलिव्हरी पार्टनर्सद्वारे वेगवान डिलिव्हरी',
    },
    {
      'icon': Icons.payments,
      'title_en': 'Pay Your Way',
      'title_hi': 'अपने तरीके से भुगतान',
      'title_mr': 'तुमच्या मार्गाने पेमेंट',
      'desc_en': 'COD, UPI, or Card — pay directly to shop owner',
      'desc_hi': 'COD, UPI, या कार्ड — सीधे दुकानदार को भुगतान',
      'desc_mr': 'COD, UPI, किंवा कार्ड — थेट दुकानदाराला पेमेंट',
    },
  ];

  String _t(String en, String hi, String mr) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    if (lang == 'hi') return hi;
    if (lang == 'mr') return mr;
    return en;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Language selector
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  PopupMenuButton<String>(
                    icon: const Icon(Icons.language, color: AppTheme.primaryColor),
                    onSelected: (value) {
                      context.read<LanguageProvider>().setLocale(value);
                    },
                    itemBuilder: (context) => [
                      const PopupMenuItem(value: 'en', child: Text('English')),
                      const PopupMenuItem(value: 'hi', child: Text('हिंदी')),
                      const PopupMenuItem(value: 'mr', child: Text('मराठी')),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemCount: _pages.length,
                itemBuilder: (context, i) {
                  final page = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 220,
                          height: 220,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(page['icon'], size: 110, color: AppTheme.primaryColor),
                        ),
                        const SizedBox(height: 40),
                        Text(
                          _t(page['title_en'], page['title_hi'], page['title_mr']),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppTheme.darkColor),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _t(page['desc_en'], page['desc_hi'], page['desc_mr']),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            // Page indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _pages.length,
                (i) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentPage == i ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentPage == i ? AppTheme.primaryColor : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
            // Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                      },
                      child: Text(_t('Get Started', 'शुरू करें', 'सुरू करा')),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () {
                      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
                    },
                    child: Text(_t('Skip', 'छोड़ें', 'वगळा')),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
