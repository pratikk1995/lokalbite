import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import 'auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    String t(String en, String hi, String mr) {
      if (lang == 'hi') return hi;
      if (lang == 'mr') return mr;
      return en;
    }

    return Scaffold(
      appBar: AppBar(title: Text(t('Profile', 'प्रोफाइल', 'प्रोफाइल'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                  child: const Icon(Icons.person, size: 50, color: Colors.white),
                ),
                const SizedBox(height: 12),
                Text(context.read<AuthProvider>().user?.phoneNumber ?? 'Guest', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 30),
          _menuItem(Icons.language, t('Language', 'भाषा', 'भाषा'), () {
            showDialog(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Select Language'),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ListTile(title: const Text('English'), onTap: () { context.read<LanguageProvider>().setLocale('en'); Navigator.pop(context); }),
                    ListTile(title: const Text('हिंदी'), onTap: () { context.read<LanguageProvider>().setLocale('hi'); Navigator.pop(context); }),
                    ListTile(title: const Text('मराठी'), onTap: () { context.read<LanguageProvider>().setLocale('mr'); Navigator.pop(context); }),
                  ],
                ),
              ),
            );
          }),
          _menuItem(Icons.history, t('Order History', 'ऑर्डर इतिहास', 'ऑर्डर इतिहास'), () {}),
          _menuItem(Icons.location_on, t('Saved Addresses', 'सहेजे गए पते', 'जतन केलेले पत्ते'), () {}),
          _menuItem(Icons.help, t('Help & Support', 'मदद', 'मदत'), () {}),
          _menuItem(Icons.info, t('About', 'बारे में', 'बद्दल'), () {}),
          const Divider(),
          _menuItem(Icons.logout, t('Logout', 'लॉगआउट', 'बाहेर पडा'), () async {
            await context.read<AuthProvider>().signOut();
            Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
          }, color: Colors.red),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap, {Color? color}) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppTheme.primaryColor),
      title: Text(label, style: TextStyle(color: color)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
