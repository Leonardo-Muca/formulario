import React from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../styles/theme';
import { FormField } from './FormField';
import { DatePicker } from './DatePicker';
import { MediaPicker } from './MediaPicker';
import { useOfferForm } from '../hooks/useOfferForm';
import { styles } from './OfferForm.styles';

export const OfferForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    loading,
    successMessage,
    showDropdown,
    setShowDropdown,
    handleSelectOfferType,
    onSubmit,
  } = useOfferForm();

  const selectedOfferType = watch('offerType');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Crear Oferta</Text>
            <Text style={styles.subtitle}>Completa los datos para registrar un nuevo item</Text>
          </View>

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>✓ {successMessage}</Text>
            </View>
          )}

          {/* Nombre */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Nombre del Item *" error={errors.name?.message}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Zapatillas Deportivas Pro"
                  placeholderTextColor={theme.colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardAppearance="dark"
                />
              </FormField>
            )}
          />

          {/* Descripción */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Descripción *" error={errors.description?.message}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Escribe detalles del item, características, etc."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={4}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardAppearance="dark"
                />
              </FormField>
            )}
          />

          {/* Precio */}
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Precio Original ($) *" error={errors.price?.message}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardAppearance="dark"
                />
              </FormField>
            )}
          />

          {/* Tipo de Oferta */}
          <Controller
            control={control}
            name="offerType"
            render={({ field: { value } }) => (
              <FormField label="Tipo de Oferta *" error={errors.offerType?.message}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>{value}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </FormField>
            )}
          />

          {/* Cantidad / Porcentaje Descuento (Campo Dinámico) */}
          <Controller
            control={control}
            name="discountValue"
            render={({ field: { onChange, onBlur, value } }) => {
              const label = selectedOfferType === 'Descuento en dinero'
                ? 'Cantidad a descontar ($) *'
                : 'Porcentaje de descuento (%) *';
              const placeholder = selectedOfferType === 'Descuento en dinero'
                ? '0.00'
                : '0';

              return (
                <FormField label={label} error={errors.discountValue?.message}>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardAppearance="dark"
                  />
                </FormField>
              );
            }}
          />

          {/* Fechas: Inicio y Fin */}
          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <FormField label="Fecha Inicio *" error={errors.startDate?.message}>
                    <DatePicker value={value} onChange={onChange} label="Fecha de Inicio" />
                  </FormField>
                )}
              />
            </View>
            <View style={styles.dateCol}>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <FormField label="Fecha Fin *" error={errors.endDate?.message}>
                    <DatePicker value={value} onChange={onChange} label="Fecha de Fin" />
                  </FormField>
                )}
              />
            </View>
          </View>

          {/* Multimedia (Cámara / Galería) */}
          <Controller
            control={control}
            name="multimedia"
            render={({ field: { onChange, value } }) => (
              <FormField label="Archivos Multimedia (Imágenes/Videos) *" error={errors.multimedia?.message}>
                <MediaPicker value={value} onChange={onChange} />
              </FormField>
            )}
          />

          {/* Botón de Envío */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Guardar Item</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dropdown Options Bottom Sheet Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona Tipo de Oferta</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedOfferType === 'Descuento en dinero' && styles.modalOptionSelected,
              ]}
              onPress={() => handleSelectOfferType('Descuento en dinero')}
            >
              <Text style={styles.modalOptionText}>Descuento en dinero ($)</Text>
              {selectedOfferType === 'Descuento en dinero' && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedOfferType === 'Descuento en porcentaje' && styles.modalOptionSelected,
              ]}
              onPress={() => handleSelectOfferType('Descuento en porcentaje')}
            >
              <Text style={styles.modalOptionText}>Descuento en porcentaje (%)</Text>
              {selectedOfferType === 'Descuento en porcentaje' && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
