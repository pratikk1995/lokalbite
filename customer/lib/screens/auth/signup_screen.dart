import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../app_theme.dart';
import '../../providers/language_provider.dart';
import 'login_screen.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    String t(String en, String hi, String mr) {
      if (lang == 'hi') return hi;
      if (lang == 'mr') return mr;
      return en;
    }

    return Scaffold(
      appBar: AppBar(title: Text(t('Create Account', 'खाता बनाएं', 'खाते तयार करा'))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            Text(t('Sign up with your phone number to get started', 'अपने फोन नंबर से साइन अप करें', 'तुमच्या फोन नंबरने साइन अप करा'),
                textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 30),
            TextField(
              decoration: const InputDecoration(labelText: 'Name', prefixIcon: Icon(Icons.person)),
            ),
            const SizedBox(height: 12),
            TextField(
              keyboardType: TextInputType.phone,
              maxLength: 10,
              decoration: const InputDecoration(labelText: 'Phone', prefixIcon: Icon(Icons.phone), counterText: ''),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(labelText: 'City / Village', prefixIcon: Icon(Icons.location_city)),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              },
              child: Text(t('Continue', 'जारी रखें', 'पुढे जा')),
            ),
          ],
        ),
      ),
    );
  }
}
