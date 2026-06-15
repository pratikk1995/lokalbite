import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, BackHandler, ActivityIndicator, View, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { CONFIG } from './config';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);

  // Target URL configuration (Vercel vs Localhost)
  const targetUrl = CONFIG.USE_DEV ? CONFIG.DEV_URL : CONFIG.PROD_URL;

  // Intercept hardware Back Button on Android devices
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Stop app exit, go back in web history
      }
      return false; // Let default action close the app
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35', // Matches brand orange header
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
