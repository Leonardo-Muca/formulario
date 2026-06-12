import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { PromoCard, PromoItem } from './PromoCard';
import { usePromoList, FilterType } from '../hooks/usePromoList';

interface PromoListProps {
  onPromoPress: (id: string) => void;
  onCreatePress: () => void;
  // This refetchTrigger allows the parent to force a reload when returning from form/detail screen
  refetchTrigger?: number;
}

export const PromoList: React.FC<PromoListProps> = ({
  onPromoPress,
  onCreatePress,
  refetchTrigger = 0,
}) => {
  const {
    promos,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    onRefresh,
    refetch,
  } = usePromoList();

  // Reload when refetchTrigger updates
  React.useEffect(() => {
    refetch();
  }, [refetchTrigger]);

  const renderFilterChip = (type: FilterType, label: string) => {
    const isSelected = filterType === type;
    return (
      <TouchableOpacity
        key={type}
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => setFilterType(type)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ofertas Activas</Text>
        <Text style={styles.subtitle}>Gestiona tus promociones y descuentos</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar promoción por nombre o descripción..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilterChip('Todos', '✨ Todas')}
        {renderFilterChip('Descuento en dinero', '💵 Dinero')}
        {renderFilterChip('Descuento en porcentaje', '🏷️ Porcentaje')}
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
          <Text style={styles.loadingText}>Cargando promociones...</Text>
        </View>
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PromoCard promo={item} onPress={() => onPromoPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Sin promociones</Text>
              <Text style={styles.emptySubtitle}>
                No se encontraron promociones que coincidan con tu búsqueda.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onCreatePress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.h1,
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingLeft: theme.spacing.lg,
    paddingRight: 40,
    height: 48,
    ...theme.typography.body,
    fontSize: 14,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100, // Safe padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    ...theme.typography.caption,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2, // Center the plus vertically
  },
});
