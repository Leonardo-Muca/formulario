import { StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
    fontSize: 14,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  successBannerText: {
    color: theme.colors.success,
    ...theme.typography.bodyBold,
    fontSize: 14,
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  dropdownButton: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  dropdownButtonText: {
    color: theme.colors.text,
    ...theme.typography.body,
  },
  dropdownArrow: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 0.48,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFF',
    ...theme.typography.bodyBold,
    fontSize: 16,
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
    paddingTop: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    ...theme.typography.h2,
    fontSize: 16,
  },
  modalCloseText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  modalOptionText: {
    color: theme.colors.text,
    ...theme.typography.body,
  },
  checkMark: {
    color: theme.colors.primaryLight,
    fontSize: 16,
    fontWeight: 'bold',
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
});
