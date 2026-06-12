import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { theme } from '../styles/theme';

export interface PromoItem {
  id: string;
  name: string;
  description: string;
  price: number;
  offerType: 'Descuento en dinero' | 'Descuento en porcentaje';
  discountValue: number;
  startDate: string;
  endDate: string;
  multimedia: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
}

interface PromoCardProps {
  promo: PromoItem;
  onPress: () => void;
}

// API root URL for images, resolving localhost/10.0.2.2 dynamically
const UPLOADS_BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});
const getMediaUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // React Native Image needs absolute URL
  return `${UPLOADS_BASE_URL}${cleanUrl}`;
};

export const PromoCard: React.FC<PromoCardProps> = ({ promo, onPress }) => {
  const { name, description, price, offerType, discountValue, endDate, multimedia } = promo;

  // Calculate discounted price
  const originalPrice = Number(price);
  const discount = Number(discountValue);
  let finalPrice = originalPrice;

  if (offerType === 'Descuento en dinero') {
    finalPrice = Math.max(0, originalPrice - discount);
  } else if (offerType === 'Descuento en porcentaje') {
    finalPrice = Math.max(0, originalPrice * (1 - discount / 100));
  }

  // Formatting dates
  const formatDateString = (dateStr: string) => {
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

  // Get primary thumbnail (first file)
  const primaryMedia = multimedia && multimedia.length > 0 ? multimedia[0] : null;
  const isVideo = primaryMedia?.mimetype.startsWith('video/') || primaryMedia?.filename.endsWith('.mp4');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Media Preview Thumbnail */}
      <View style={styles.mediaContainer}>
        {primaryMedia ? (
          <Image
            source={{ uri: getMediaUrl(primaryMedia.url) }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Text style={styles.placeholderText}>No Media</Text>
          </View>
        )}
        
        {/* Video Icon Badge */}
        {isVideo && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>▶ Video</Text>
          </View>
        )}
      </View>

      {/* Promo Content Info */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {/* Discount Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {offerType === 'Descuento en dinero' ? `-$${discount.toFixed(0)}` : `-${discount}%`}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.footerRow}>
          {/* Prices block */}
          <View style={styles.priceContainer}>
            <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
            {discount > 0 && <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>}
          </View>

          {/* Expiration date */}
          <Text style={styles.dateText}>Vence: {formatDateString(endDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mediaContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#1E293B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  videoBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    ...theme.typography.bodyBold,
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
    lineHeight: 16,
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  finalPrice: {
    color: theme.colors.success,
    ...theme.typography.bodyBold,
    fontSize: 17,
    marginRight: theme.spacing.xs,
  },
  originalPrice: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
    textDecorationLine: 'line-through',
    fontSize: 12,
  },
  dateText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});
