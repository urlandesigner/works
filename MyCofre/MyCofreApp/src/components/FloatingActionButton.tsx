import { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useFloatingActionButtonHost } from './FloatingActionButtonHost';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  bottomOffset?: number;
};

export function FloatingActionButton({
  onPress,
  accessibilityLabel,
  bottomOffset,
}: Props) {
  const host = useFloatingActionButtonHost();
  const isFocused = useIsFocused();
  const fabIdRef = useRef(Symbol('floating-action-button'));

  useEffect(() => {
    if (!host || !isFocused) {
      return;
    }

    host.setFab({
      id: fabIdRef.current,
      onPress,
      accessibilityLabel,
      bottomOffset,
    });

    return () => {
      host.clearFab(fabIdRef.current);
    };
  }, [accessibilityLabel, bottomOffset, host, isFocused, onPress]);

  return null;
}
