import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import 'package:geolocator/geolocator.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../app_theme.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../services/payment_service.dart';
import 'order_tracking_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _paymentMethod = 'cod';
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _loading = false;
  late Razorpay _razorpay;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  String _t(BuildContext context, String en, String hi, String mr) {
    final lang = context.read<LanguageProvider>().currentLocale.languageCode;
    if (lang == 'hi') return hi;
    if (lang == 'mr') return mr;
    return en;
  }

  void _placeOrder() async {
    if (_addressController.text.isEmpty || _phoneController.text.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_t(context, 'Fill all details', 'सब भरें', 'सगळं भरा'))));
      return;
    }

    setState(() => _loading = true);

    try {
      final cart = context.read<CartProvider>();
      final auth = context.read<AuthProvider>();
      final orderId = const Uuid().v4().substring(0, 8).toUpperCase();
      final position = await Geolocator.getCurrentPosition();

      // Find nearest delivery boy
      final deliveryBoys = await FirebaseFirestore.instance
          .collection('delivery_partners')
          .where('isAvailable', isEqualTo: true)
          .get();

      String? assignedDeliveryBoy;
      double minDistance = double.infinity;
      for (var boy in deliveryBoys.docs) {
        final boyData = boy.data();
        if (boyData['lat'] != null && boyData['lng'] != null) {
          final dist = Geolocator.distanceBetween(
            position.latitude, position.longitude, boyData['lat'], boyData['lng'],
          );
          if (dist < minDistance) {
            minDistance = dist;
            assignedDeliveryBoy = boy.id;
          }
        }
      }

      final orderData = {
        'orderId': orderId,
        'customerId': auth.user!.uid,
        'customerPhone': _phoneController.text,
        'customerAddress': _addressController.text,
        'items': cart.items.map((i) => {'id': i.id, 'name': i.name, 'price': i.price, 'qty': i.qty, 'shopId': i.shopId, 'shopOwnerId': i.shopOwnerId}).toList(),
        'total': cart.total,
        'paymentMethod': _paymentMethod,
        'status': 'pending',
        'deliveryBoyId': assignedDeliveryBoy,
        'createdAt': FieldValue.serverTimestamp(),
        'customerLat': position.latitude,
        'customerLng': position.longitude,
      };

      await FirebaseFirestore.instance.collection('orders').doc(orderId).set(orderData);

      // Process payment
      if (_paymentMethod == 'razorpay') {
        _openRazorpay(orderId, cart.total);
      } else {
        _completeOrder(orderId);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _loading = false);
    }
  }

  void _openRazorpay(String orderId, double amount) {
    var options = {
      'key': 'rzp_test_YOUR_KEY_HERE',
      'amount': (amount * 100).toInt(),
      'name': 'LocalBite',
      'description': 'Order #$orderId',
      'prefill': {'contact': _phoneController.text, 'email': 'customer@localbite.com'},
    };
    try {
      _razorpay.open(options);
    } catch (e) {
      _completeOrder(orderId);
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    _completeOrder('PAID');
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _completeOrder('FAILED');
  }

  void _completeOrder(String orderId) {
    context.read<CartProvider>().clear();
    setState(() => _loading = false);
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => OrderTrackingScreen(orderId: orderId)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    return Scaffold(
      appBar: AppBar(title: Text(_t(context, 'Checkout', 'चेकआउट', 'चेकआउट'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_t(context, 'Delivery Address', 'डिलीवरी पता', 'डिलिव्हरी पत्ता'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: _t(context, 'Full address with landmark', 'पूरा पता', 'पूर्ण पत्ता लँडमार्कसह'),
                prefixIcon: const Padding(
                  padding: EdgeInsets.only(left: 12, top: 14),
                  child: Icon(Icons.location_on, color: AppTheme.primaryColor),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              decoration: InputDecoration(
                labelText: _t(context, 'Phone Number', 'फोन नंबर', 'फोन नंबर'),
                prefixIcon: const Icon(Icons.phone, color: AppTheme.primaryColor),
                counterText: '',
              ),
            ),
            const SizedBox(height: 24),
            Text(_t(context, 'Payment Method', 'भुगतान का तरीका', 'पेमेंट पद्धत'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _paymentOption('cod', '💵', _t(context, 'Cash on Delivery', 'कैश ऑन डिलीवरी', 'कॅश ऑन डिलिव्हरी'), 'Pay when you receive'),
            _paymentOption('upi', '📱', _t(context, 'UPI Direct', 'UPI डायरेक्ट', 'UPI थेट'), 'Scan shop owner\'s QR'),
            _paymentOption('razorpay', '💳', _t(context, 'Card / Wallet', 'कार्ड / वॉलेट', 'कार्ड / वॉलेट'), 'Pay online securely'),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(_t(context, 'Items', 'सामान', 'वस्तू')),
                    Text('${cart.items.length}'),
                  ]),
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(_t(context, 'Subtotal', 'उपकुल', 'उपएकूण'), style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('₹${cart.total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _placeOrder,
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(_t(context, 'Place Order', 'ऑर्डर करें', 'ऑर्डर करा')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _paymentOption(String value, String emoji, String label, String desc) {
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _paymentMethod == value ? AppTheme.primaryColor.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _paymentMethod == value ? AppTheme.primaryColor : Colors.grey.shade300,
            width: _paymentMethod == value ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            Radio(value: value, groupValue: _paymentMethod, onChanged: (v) => setState(() => _paymentMethod = v!), activeColor: AppTheme.primaryColor),
          ],
        ),
      ),
    );
  }
}
