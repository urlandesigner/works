import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { spacing } from '../theme/spacing';

const MAX_CONTENT_WIDTH = 560;

export function useContentFrame() {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const gutter = spacing.screenPadding;
    const maxWidth = Math.min(MAX_CONTENT_WIDTH, width - gutter * 2);

    return {
      gutter,
      maxWidth,
      isWide: width >= MAX_CONTENT_WIDTH + gutter * 2,
    };
  }, [width]);
}
