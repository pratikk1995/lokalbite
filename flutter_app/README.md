# LokaBite Flutter App

A Flutter WebView wrapper for the LokaBite web application.
Generates: Android APK, iOS App, and Web from a single codebase.

## Setup

### Prerequisites
- Flutter SDK (installed via Homebrew: `brew install --cask flutter`)
- For Android: Android SDK command-line tools
- For iOS: Xcode (Mac only)

### Run

```bash
cd flutter_app
flutter pub get

# Run on Android device/emulator
flutter run -d android

# Run on iOS simulator
flutter run -d ios

# Run as Web
flutter run -d chrome

# Build Android APK
flutter build apk --release
# APK location: build/app/outputs/flutter-apk/app-release.apk

# Build iOS
flutter build ios --release
```

## Configuration

Edit `lib/config.dart` to switch between prod and dev URLs.
