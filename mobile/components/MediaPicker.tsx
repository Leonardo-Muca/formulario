import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';

export interface MediaFile {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

interface MediaPickerProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ value, onChange }) => {
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos o videos.');
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar archivos.');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || `photo-${Date.now()}.jpg`;
      const newFile: MediaFile = {
        uri: asset.uri,
        type: 'image',
        name: filename,
      };
      onChange([...value, newFile]);
    }
  };

  const handleRecordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || `video-${Date.now()}.mp4`;
      const newFile: MediaFile = {
        uri: asset.uri,
        type: 'video',
        name: filename,
      };
      onChange([...value, newFile]);
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newFiles: MediaFile[] = result.assets.map((asset) => {
        const filename = asset.uri.split('/').pop() || (asset.type === 'video' ? `video-${Date.now()}.mp4` : `image-${Date.now()}.jpg`);
        return {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: filename,
        };
      });
      onChange([...value, ...newFiles]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto} activeOpacity={0.7}>
          <Text style={styles.buttonText}>📸 Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleRecordVideo} activeOpacity={0.7}>
          <Text style={styles.buttonText}>🎥 Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSelectFromGallery} activeOpacity={0.7}>
          <Text style={styles.buttonText}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      {value.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewContainer}>
          {value.map((file, index) => (
            <View key={file.uri + index} style={styles.previewItem}>
              <Image source={{ uri: file.uri }} style={styles.imagePreview} />
              
              {file.type === 'video' && (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>▶ Video</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleRemoveMedia(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Ningún archivo multimedia seleccionado</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    ...theme.typography.label,
  },
  previewContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  previewItem: {
    width: 90,
    height: 90,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'visible',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#1E293B',
  },
  videoBadge: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    alignItems: 'center',
  },
  videoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    height: 80,
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
  },
});
