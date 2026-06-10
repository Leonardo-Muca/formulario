import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfferForm } from './components/OfferForm';

export default function App() {
  return (
    <SafeAreaProvider>
      <OfferForm />
    </SafeAreaProvider>
  );
}
