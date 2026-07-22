import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../app_theme.dart';
import '../providers/language_provider.dart';
import '../providers/cart_provider.dart';
import 'category_products_screen.dart';
import 'cart_screen.dart';
import 'search_screen.dart';
import 'profile_screen.dart';
import 'order_tracking_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    _HomeTab(),
    SearchScreen(),
    CartScreen(),
    ProfileScreen(),
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
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home), label: _t('Home', 'होम', 'होम')),
          BottomNavigationBarItem(icon: const Icon(Icons.search), label: _t('Search', 'खोजें', 'शोध')),
          BottomNavigationBarItem(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.shopping_cart),
                Positioned(
                  right: -6,
                  top: -4,
                  child: Consumer<CartProvider>(
                    builder: (context, cart, _) => cart.itemCount > 0
                        ? Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                            child: Text('${cart.itemCount}', style: const TextStyle(color: Colors.white, fontSize: 10)),
                          )
                        : const SizedBox(),
                  ),
                ),
              ],
            ),
            label: _t('Cart', 'कार्ट', 'कार्ट'),
          ),
          BottomNavigationBarItem(icon: const Icon(Icons.person), label: _t('Profile', 'प्रोफाइल', 'प्रोफाइल')),
        ],
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    String t(String en, String hi, String mr) {
      if (lang == 'hi') return hi;
      if (lang == 'mr') return mr;
      return en;
    }

    return Scaffold(
      backgroundColor: AppTheme.lightBg,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.only(bottomLeft: Radius.circular(30), bottomRight: Radius.circular(30)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t('Deliver to', 'डिलीवरी पता', 'डिलिव्हरी पत्ता'), style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            const SizedBox(height: 4),
                            const Row(
                              children: [
                                Icon(Icons.location_on, color: Colors.white, size: 18),
                                SizedBox(width: 4),
                                Text('Home', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                Icon(Icons.keyboard_arrow_down, color: Colors.white),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.notifications, color: Colors.white),
                          onPressed: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                      child: Row(
                        children: [
                          const Icon(Icons.search, color: Colors.grey),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: t('Search shops, items...', 'दुकान, सामान खोजें...', 'दुकाने, वस्तू शोधा...'),
                                border: InputBorder.none,
                              ),
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  t('What do you need?', 'आपको क्या चाहिए?', 'तुम्हाला काय हवंय?'),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 110,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _categoryCard(context, '🍱', t('Food', 'खाना', 'अन्न'), 'food', 'restaurant'),
                    _categoryCard(context, '🛒', t('Kirana', 'किराना', 'किराणा'), 'kirana', 'store'),
                    _categoryCard(context, '💊', t('Medical', 'दवाई', 'औषध'), 'medical', 'local_pharmacy'),
                    _categoryCard(context, '🥬', t('Vegetable', 'सब्ज़ी', 'भाजी'), 'vegetable', 'eco'),
                    _categoryCard(context, '🍞', t('Bakery', 'बेकरी', 'बेकरी'), 'bakery', 'bakery_dining'),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(t('Nearby Shops', 'पास के दुकान', 'जवळची दुकाने'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            ),
            StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('shops').where('isActive', isEqualTo: true).limit(20).snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator()));
                }
                final shops = snapshot.data!.docs;
                if (shops.isEmpty) {
                  return SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          const Icon(Icons.store_mall_directory, size: 60, color: Colors.grey),
                          const SizedBox(height: 12),
                          Text(t('No shops yet', 'अभी कोई दुकान नहीं', 'अद्याप दुकाने नाहीत'), style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                }
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final shop = shops[i].data() as Map<String, dynamic>;
                      return _shopCard(context, shop);
                    },
                    childCount: shops.length,
                  ),
                );
              },
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _categoryCard(BuildContext context, String emoji, String label, String category, String iconName) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => CategoryProductsScreen(category: category, label: label)));
      },
      child: Container(
        width: 90,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 36)),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _shopCard(BuildContext context, Map<String, dynamic> shop) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => CategoryProductsScreen(category: 'all', label: shop['name'] ?? 'Shop')));
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.store, size: 32, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(shop['name'] ?? 'Local Shop', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(shop['address'] ?? 'Nearby', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text('${(shop['rating'] ?? 4.2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 10),
                        const Icon(Icons.access_time, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text('25 min', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
