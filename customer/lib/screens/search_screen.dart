import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Search shops, products...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _controller.clear(); setState(() => _query = ''); })
                    : null,
              ),
            ),
          ),
          Expanded(
            child: _query.isEmpty
                ? const Center(child: Text('Type to search', style: TextStyle(color: Colors.grey)))
                : StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance.collection('shops').where('name', isGreaterThanOrEqualTo: _query).snapshots(),
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                      final results = snapshot.data!.docs;
                      return ListView.builder(
                        itemCount: results.length,
                        itemBuilder: (context, i) {
                          final shop = results[i].data() as Map<String, dynamic>;
                          return ListTile(
                            leading: Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                              child: const Icon(Icons.store, color: AppTheme.primaryColor),
                            ),
                            title: Text(shop['name'] ?? ''),
                            subtitle: Text(shop['address'] ?? ''),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
