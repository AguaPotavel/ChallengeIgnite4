import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { ThemeProvider } from 'styled-components/native';

import theme from './src/styles/theme';

import Routes from './src/Routes';

export default function App() {
  const [isLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_700Bold
  })
  
  if (!isLoaded) {
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Routes />
    </ThemeProvider>
  );
}
