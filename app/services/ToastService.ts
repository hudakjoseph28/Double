import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastService {
  private static instance: ToastService;

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  show(options: ToastOptions): void {
    const { title, message, type } = options;
    
    // For now, use React Native's Alert
    // In a production app, you'd use a proper toast library like react-native-toast-message
    const alertTitle = title || this.getDefaultTitle(type);
    
    Alert.alert(alertTitle, message, [
      { text: 'OK', style: type === 'error' ? 'destructive' : 'default' }
    ]);
  }

  success(message: string, title?: string): void {
    this.show({ message, type: 'success', title });
  }

  error(message: string, title?: string): void {
    this.show({ message, type: 'error', title });
  }

  info(message: string, title?: string): void {
    this.show({ message, type: 'info', title });
  }

  warning(message: string, title?: string): void {
    this.show({ message, type: 'warning', title });
  }

  private getDefaultTitle(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
      default:
        return 'Info';
    }
  }
}

export default ToastService; 