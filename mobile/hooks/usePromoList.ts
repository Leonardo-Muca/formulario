import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { PromoItem } from '../components/PromoCard';

const API_URL = Platform.select({
  ios: 'http://localhost:3000/api/items',
  android: 'http://10.0.2.2:3000/api/items',
  default: 'http://localhost:3000/api/items',
});

export type FilterType = 'Todos' | 'Descuento en dinero' | 'Descuento en porcentaje';

export function usePromoList() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('Todos');

  const fetchPromos = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query string params
      const params: string[] = [];
      if (searchQuery.trim().length > 0) {
        params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (filterType !== 'Todos') {
        params.push(`offerType=${encodeURIComponent(filterType)}`);
      }

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const response = await fetch(`${API_URL}${queryString}`);
      const result = await response.json();

      if (result.success && result.data) {
        setPromos(result.data);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron recuperar las promociones.');
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
      // Only alert on initial load, not refreshing/typing to prevent annoying spam
      if (!isRefresh && searchQuery === '') {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterType]);

  // Refetch when filters/search query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPromos();
    }, 300); // Debounce typing search queries

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filterType]);

  const onRefresh = useCallback(() => {
    fetchPromos(true);
  }, [fetchPromos]);

  const deletePromo = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
        Alert.alert('Éxito', 'La promoción ha sido eliminada correctamente.');
        return true;
      } else {
        Alert.alert('Error', result.message || 'No se pudo eliminar la promoción.');
        return false;
      }
    } catch (error) {
      console.error('Error deleting promo:', error);
      Alert.alert('Error', 'No se pudo realizar la eliminación. Inténtalo de nuevo.');
      return false;
    }
  };

  return {
    promos,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    onRefresh,
    refetch: fetchPromos,
    deletePromo,
  };
}
