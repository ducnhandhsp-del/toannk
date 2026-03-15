/**
 * design-system/src/index.ts — Barrel export
 *
 * Dùng trong app:
 *   import { Button, DataTable, Badge, StatCard } from './design-system/src';
 *   import { colors, radius, shadows }            from './design-system/src/styles/theme';
 */

/* ── Theme & Tokens ── */
export { colors, typography, spacing, radius, shadows, transition, zIndex, intent } from './styles/theme';
export type { IntentType, ThemeRadius } from './styles/theme';

/* ── Types ── */
export type {
  Size, Intent, Variant, Align,
  ButtonProps, IconButtonProps,
  InputProps, SelectProps, SelectOption,
  RadioGroupProps, RadioOption,
  SearchBarProps, FilterChipProps,
  FilterTabsProps, TabItem,
  NavBarProps, NavItem,
  StatCardProps,
  DataTableProps, ColumnDef,
  TableActionsProps, TableAction,
  AttendancePickerProps, AttendanceStudent, AttendanceStatus,
  BadgeProps, BadgeColor,
  ConnectionStatusProps, ConnectionState,
  QuickActionGroupProps, QuickAction,
  PagerProps,
} from './types';

/* ── Form ── */
export { Button, IconButton, Input, Select, RadioGroup, SearchBar } from './components/form';

/* ── Data Display ── */
export { StatCard, DataTable, TableActions, AttendancePicker } from './components/data-display';

/* ── Navigation ── */
export { NavBar, FilterTabs, FilterChip } from './components/navigation';

/* ── Feedback ── */
export { Badge, ConnectionStatus, QuickActionGroup, Pager } from './components/feedback';
