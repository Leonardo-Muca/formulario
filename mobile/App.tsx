import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PromoList } from './components/PromoList';
import { PromoDetail } from './components/PromoDetail';
import { OfferForm } from './components/OfferForm';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'LIST' | 'CREATE' | 'DETAIL' | 'EDIT'>('LIST');
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const triggerRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const handlePromoPress = (id: string) => {
    setSelectedPromoId(id);
    setCurrentScreen('DETAIL');
  };

  const handleEditPress = (id: string) => {
    setSelectedPromoId(id);
    setCurrentScreen('EDIT');
  };

  const handleCreatePress = () => {
    setSelectedPromoId(null);
    setCurrentScreen('CREATE');
  };

  const handleBackToList = () => {
    setSelectedPromoId(null);
    setCurrentScreen('LIST');
  };

  const handleBackToDetail = () => {
    setCurrentScreen('DETAIL');
  };

  const handleSuccess = () => {
    triggerRefetch();
    setSelectedPromoId(null);
    setCurrentScreen('LIST');
  };

  const handleDeleteSuccess = () => {
    triggerRefetch();
    setSelectedPromoId(null);
    setCurrentScreen('LIST');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LIST':
        return (
          <PromoList
            onPromoPress={handlePromoPress}
            onCreatePress={handleCreatePress}
            refetchTrigger={refetchTrigger}
          />
        );
      case 'DETAIL':
        return selectedPromoId ? (
          <PromoDetail
            promoId={selectedPromoId}
            onBack={handleBackToList}
            onEdit={handleEditPress}
            onDeleted={handleDeleteSuccess}
          />
        ) : null;
      case 'CREATE':
        return (
          <OfferForm
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        );
      case 'EDIT':
        return selectedPromoId ? (
          <OfferForm
            promoId={selectedPromoId}
            onBack={handleBackToDetail}
            onSuccess={handleSuccess}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );
}
