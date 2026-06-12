import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { PromoItem } from './PromoCard';

interface PromoDetailProps {
  promoId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDeleted: () => void;
}

const API_URL = Platform.select({
  ios: 'http://localhost:3000/api/items',
  android: 'http://10.0.2.2:3000/api/items',
  default: 'http://localhost:3000/api/items',
});

const UPLOADS_BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

const getMediaUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${UPLOADS_BASE_URL}${cleanUrl}`;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const PromoDetail: React.FC<PromoDetailProps> = ({
  promoId,
  onBack,
  onEdit,
  onDeleted,
}) => {
  const [promo, setPromo] = useState<PromoItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPromoDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${promoId}`);
      const result = await response.json();
      if (result.success && result.data) {
        setPromo(result.data);
      } else {
        Alert.alert('Error', result.message || 'No se pudo cargar la información de la oferta.');
        onBack();
      }
    } catch (error) {
      console.error('Error fetching promo details:', error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoDetails();
  }, [promoId]);

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta promoción de forma permanente? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/${promoId}`, {
                method: 'DELETE',
              });
              const result = await response.json();

              if (result.success) {
                Alert.alert('Eliminado', 'La promoción ha sido eliminada.');
                onDeleted();
              } else {
                Alert.alert('Error', result.message || 'No se pudo eliminar la promoción.');
              }
            } catch (error) {
              console.error('Error deleting promo:', error);
              Alert.alert('Error', 'Error de conexión con el servidor.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!promo) return null;

  const originalPrice = Number(promo.price);
  const discount = Number(promo.discountValue);
  let finalPrice = originalPrice;
  let savings = 0;

  if (promo.offerType === 'Descuento en dinero') {
    finalPrice = Math.max(0, originalPrice - discount);
    savings = discount;
  } else if (promo.offerType === 'Descuento en porcentaje') {
    finalPrice = Math.max(0, originalPrice * (1 - discount / 100));
    savings = originalPrice - finalPrice;
  }

  const isExpired = new Date() > new Date(promo.endDate);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Detalle de Oferta</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Media Gallery Carousel */}
        {promo.multimedia && promo.multimedia.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
          >
            {promo.multimedia.map((file, index) => {
              const isFileVideo = file.mimetype.startsWith('video/') || file.filename.endsWith('.mp4');
              return (
                <View key={file.filename + index} style={styles.galleryItem}>
                  <Image
                    source={{ uri: getMediaUrl(file.url) }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  {isFileVideo && (
                    <View style={styles.videoOverlay}>
                      <View style={styles.playButtonCircle}>
                        <Text style={styles.playButtonText}>▶</Text>
                      </View>
                      <Text style={styles.videoText}>Video clip</Text>
                    </View>
                  )}
                  {/* Indicator count */}
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {index + 1} / {promo.multimedia.length}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.noMediaContainer}>
            <Text style={styles.noMediaText}>Sin archivos multimedia</Text>
          </View>
        )}

        {/* Details Wrapper */}
        <View style={styles.detailsContainer}>
          {/* Header Title & Status */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{promo.name}</Text>
            <View style={[styles.statusBadge, isExpired ? styles.statusExpired : styles.statusActive]}>
              <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextActive]}>
                {isExpired ? 'Vencida' : 'Activa'}
              </Text>
            </View>
          </View>

          {/* Pricing Block */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio de Oferta:</Text>
              <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
            </View>

            {discount > 0 && (
              <View style={styles.originalPriceRow}>
                <Text style={styles.originalPriceLabel}>Precio Original: </Text>
                <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
                <Text style={styles.savingsLabel}>
                  (Ahorras ${savings.toFixed(2)}
                  {promo.offerType === 'Descuento en porcentaje' && ` - ${discount}%`})
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Validity Dates */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🗓️ Validez:</Text>
            <Text style={styles.infoValue}>
              Del {formatDate(promo.startDate)} al {formatDate(promo.endDate)}
            </Text>
          </View>

          {/* Offer Type */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏷️ Tipo de Oferta:</Text>
            <Text style={styles.infoValue}>{promo.offerType}</Text>
          </View>

          {/* Valor descuento */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Valor Descuento:</Text>
            <Text style={styles.infoValue}>
              {promo.offerType === 'Descuento en dinero' ? `$${discount.toFixed(2)}` : `${discount}%`}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{promo.description}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(promo.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>✏️ Editar Oferta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>🗑️ Eliminar Oferta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    ...theme.typography.caption,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    height: 56,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  backButton: {
    width: 80,
    justifyContent: 'center',
  },
  backButtonText: {
    color: theme.colors.primaryLight,
    ...theme.typography.bodyBold,
    fontSize: 14,
  },
  navbarTitle: {
    color: theme.colors.text,
    ...theme.typography.h2,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gallery: {
    height: 250,
    backgroundColor: '#1E293B',
  },
  galleryItem: {
    width: SCREEN_WIDTH,
    height: 250,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  noMediaContainer: {
    height: 180,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  noMediaText: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 3, // nudge arrow to center
  },
  videoText: {
    color: '#FFF',
    ...theme.typography.caption,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
  },
  countBadge: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: theme.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  name: {
    flex: 0.75,
    color: theme.colors.text,
    ...theme.typography.h1,
    fontSize: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusExpired: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: theme.colors.success,
  },
  statusTextExpired: {
    color: theme.colors.error,
  },
  priceSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
  },
  finalPrice: {
    color: theme.colors.success,
    ...theme.typography.h1,
    fontSize: 24,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  originalPriceLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  originalPrice: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
    fontSize: 13,
  },
  savingsLabel: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
    fontSize: 14,
  },
  infoValue: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
    fontSize: 14,
  },
  descriptionSection: {
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  editButtonText: {
    color: '#FFF',
    ...theme.typography.bodyBold,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.error,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: theme.colors.error,
    ...theme.typography.bodyBold,
  },
});
