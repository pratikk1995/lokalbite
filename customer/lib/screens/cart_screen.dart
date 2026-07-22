import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';
import 'checkout_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  String _t(BuildContext context, String en, String hi, String mr) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    if (lang == 'hi') return hi;
    if (lang == 'mr') return mr;
    return en;
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;

    return Scaffold(
      appBar: AppBar(title: Text(_t(context, 'My Cart', 'मेरा कार्ट', 'माझी कार्ट'))),
      body: cart.items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(_t(context, 'Cart is empty', 'कार्ट खाली है', 'कार्ट रिकामा आहे'),
                      style: const TextStyle(fontSize: 18, color: Colors.grey)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cart.items.length,
                    itemBuilder: (context, i) {
                      final item = cart.items[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.fastfood, color: AppTheme.primaryColor),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    Text('₹${item.price}', style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline),
                                    onPressed: () => cart.updateQty(item.id, item.qty - 1),
                                  ),
                                  Text('${item.qty}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle, color: AppTheme.primaryColor),
                                    onPressed: () => cart.updateQty(item.id, item.qty + 1),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_t(context, 'Total', 'कुल', 'एकूण'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Text('₹${cart.total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen()));
                          },
                          child: Text(_t(context, 'Proceed to Checkout', 'चेकआउट पर जाएं', 'चेकआउटवर जा')),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
