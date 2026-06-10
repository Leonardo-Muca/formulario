import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={error ? styles.childContainerError : styles.childContainer}>
        {children}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  label: {
    color: theme.colors.text,
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
  },
  childContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  childContainerError: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
    overflow: 'hidden',
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
});
