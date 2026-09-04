import { toast as hotToast, ToastOptions } from 'react-hot-toast';

export const toast = {
  success: (message: string, options?: ToastOptions) => hotToast.success(message, {
    iconTheme: { primary: '#22C55E', secondary: '#1A1A1A' },
    ...options
  }),
  error: (message: string, options?: ToastOptions) => hotToast.error(message, {
    iconTheme: { primary: '#EF4444', secondary: '#1A1A1A' },
    ...options
  }),
  loading: (message: string, options?: ToastOptions) => hotToast.loading(message, options),
  dismiss: hotToast.dismiss
};
