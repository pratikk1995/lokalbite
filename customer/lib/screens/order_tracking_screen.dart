import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../app_theme.dart';
import '../providers/language_provider.dart';

class OrderTrackingScreen extends StatelessWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  String _t(BuildContext context, String en, String hi, String mr) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    if (lang == 'hi') return hi;
    if (lang == 'mr') return mr;
    return en;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_t(context, 'Order Tracking', 'ऑर्डर ट्रैकिंग', 'ऑर्डर ट्रॅकिंग'))),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance.collection('orders').doc(orderId).snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final order = snapshot.data!.data() as Map<String, dynamic>;
          final status = order['status'] ?? 'pending';
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle, size: 60, color: AppTheme.primaryColor),
                      const SizedBox(height: 12),
                      Text(_t(context, 'Order Placed!', 'ऑर्डर हो गई!', 'ऑर्डर झाली!'),
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Order ID: $orderId', style: const TextStyle(color: Colors.grey)),
                      const SizedBox(height: 4),
                      Text('₹${order['total']}', style: const TextStyle(fontSize: 28, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                _buildStep('pending', _t(context, 'Order Placed', 'ऑर्डर हो गई', 'ऑर्डर झाली'), true, status),
                _buildStep('accepted', _t(context, 'Shop Accepted', 'दुकान ने स्वीकारा', 'दुकानाने स्वीकारले'), 
                    ['accepted', 'preparing', 'ready', 'delivering', 'delivered'].contains(status), status),
                _buildStep('preparing', _t(context, 'Preparing', 'तैयार हो रहा', 'तयार होतंय'),
                    ['preparing', 'ready', 'delivering', 'delivered'].contains(status), status),
                _buildStep('delivering', _t(context, 'Out for Delivery', 'डिलीवरी के लिए', 'डिलिव्हरीसाठी'),
                    ['delivering', 'delivered'].contains(status), status),
                _buildStep('delivered', _t(context, 'Delivered', 'डिलीवर हो गया', 'मिळालं'),
                    status == 'delivered', status),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(_t(context, 'Back to Home', 'होम पर जाएं', 'होम वर जा')),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStep(String step, String label, bool isActive, String currentStatus) {
    final isCompleted = _isStepCompleted(step, currentStatus);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isCompleted ? AppTheme.primaryColor : Colors.grey.shade300,
              shape: BoxShape.circle,
            ),
            child: Icon(isCompleted ? Icons.check : Icons.circle, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 14),
          Text(label, style: TextStyle(fontSize: 15, fontWeight: isCompleted ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  bool _isStepCompleted(String step, String current) {
    const order = ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered'];
    return order.indexOf(current) >= order.indexOf(step);
  }
}
