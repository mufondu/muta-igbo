// Cross-platform Alert. React Native's Alert.alert is a silent no-op on web,
// so buttons (confirm/destructive flows) never fire. This mirrors its signature:
// native delegates to RN, web uses window.alert / window.confirm.
import { Alert as RNAlert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';

function webAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const text = message ? `${title}\n\n${message}` : title;
  const g = globalThis as unknown as {
    alert?: (m: string) => void;
    confirm?: (m: string) => boolean;
  };

  if (!buttons || buttons.length <= 1) {
    g.alert?.(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const cancel = buttons.find(b => b.style === 'cancel');
  const action = buttons.find(b => b.style !== 'cancel') ?? buttons[buttons.length - 1];
  const ok = g.confirm ? g.confirm(text) : true;
  if (ok) action.onPress?.();
  else cancel?.onPress?.();
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS === 'web') webAlert(title, message, buttons);
    else RNAlert.alert(title, message, buttons);
  },
};
