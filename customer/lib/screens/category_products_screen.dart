import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../app_theme.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';

class CategoryProductsScreen extends StatelessWidget {
  final String category;
  final String label;
  const CategoryProductsScreen({super.key, required this.category, required this.label});

  @override
  Widget build(BuildContext context) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    String t(String en, String hi, String mr) {
      if (lang == 'hi') return hi;
      if (lang == 'mr') return mr;
      return en;
    }

    return Scaffold(
      appBar: AppBar(title: Text(label)),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('products').where('category', isEqualTo: category).snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final products = snapshot.data!.docs;
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_bag_outlined, size: 60, color: Colors.grey),
                  const SizedBox(height: 12),
                  Text(t('No products yet', 'अभी कोई उत्पाद नहीं', 'अद्याप उत्पादने नाहीत'),
                      style: const TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.7, crossAxisSpacing: 10, mainAxisSpacing: 10),
            itemCount: products.length,
            itemBuilder: (context, i) {
              final p = products[i].data() as Map<String, dynamic>;
              return Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        child: const Icon(Icons.fastfood, size: 50, color: AppTheme.primaryColor),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p['name'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('₹${p['price']}', style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                context.read<CartProvider>().add(CartItem(
                                  id: products[i].id,
                                  name: p['name'],
                                  price: (p['price'] as num).toDouble(),
                                  qty: 1,
                                  shopId: p['shopId'] ?? '',
                                  shopOwnerId: p['shopOwnerId'] ?? '',
                                ));
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t('Added to cart', 'कार्ट में जोड़ा', 'कार्टमध्ये टाकलं'))));
                              },
                              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 6)),
                              child: Text(t('Add', 'जोड़ें', 'टाका')),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
