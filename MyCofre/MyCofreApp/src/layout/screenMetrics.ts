export const TAB_BAR_BASE_HEIGHT = 68;
export const SCREEN_BOTTOM_SPACING = 24;

export function getTabbedScreenBottomPadding(safeAreaBottom: number) {
  return TAB_BAR_BASE_HEIGHT + safeAreaBottom + SCREEN_BOTTOM_SPACING;
}
