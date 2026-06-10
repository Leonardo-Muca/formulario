import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleAndroidValueChange = (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleIOSValueChange = (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => { 
          setTempDate(value); 
          setShow(true); 
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.inputText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onValueChange={handleAndroidValueChange}
          onDismiss={() => setShow(false)}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShow(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label || 'Seleccionar Fecha'}</Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={styles.confirmText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  textColor={theme.colors.text}
                  onValueChange={handleIOSValueChange}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    height: 50,
  },
  inputText: {
    color: theme.colors.text,
    ...theme.typography.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    ...theme.typography.h2,
    fontSize: 16,
  },
  cancelText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  confirmText: {
    color: theme.colors.primaryLight,
    ...theme.typography.bodyBold,
  },
  pickerContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
});
