/**
 * types/index.ts — Tất cả TypeScript interfaces cho Design System
 */
import type React from 'react';

export type Size    = 'xs'|'sm'|'md'|'lg'|'xl';
export type Intent  = 'primary'|'secondary'|'success'|'warning'|'danger'|'neutral';
export type Variant = 'solid'|'outline'|'ghost'|'text';
export type Align   = 'left'|'center'|'right';

export interface ButtonProps {
  children:      React.ReactNode;
  intent?:       Intent;
  variant?:      Variant;
  size?:         Size;
  icon?:         React.ReactNode;
  iconPosition?: 'left'|'right';
  loading?:      boolean;
  disabled?:     boolean;
  fullWidth?:    boolean;
  onClick?:      (e: React.MouseEvent) => void;
  type?:         'button'|'submit'|'reset';
  style?:        React.CSSProperties;
}

export interface IconButtonProps {
  icon:      React.ReactNode;
  label:     string;
  intent?:   'default'|'primary'|'warning'|'danger'|'success';
  size?:     Size;
  onClick?:  (e: React.MouseEvent) => void;
  disabled?: boolean;
  tooltip?:  string;
  style?:    React.CSSProperties;
}

export type BadgeColor = 'indigo'|'teal'|'emerald'|'amber'|'rose'|'sky'|'violet'|'slate';

export interface BadgeProps {
  children:  React.ReactNode;
  color?:    BadgeColor;
  variant?:  'solid'|'subtle'|'outline';
  size?:     'sm'|'md';
  dot?:      boolean;
  onRemove?: () => void;
}

export interface InputProps {
  label?:       string;
  placeholder?: string;
  value:        string;
  onChange:     (value: string) => void;
  type?:        'text'|'email'|'password'|'number'|'date'|'month'|'search';
  error?:       string;
  hint?:        string;
  disabled?:    boolean;
  required?:    boolean;
  prefix?:      React.ReactNode;
  suffix?:      React.ReactNode;
  clearable?:   boolean;
  size?:        'sm'|'md'|'lg';
  style?:       React.CSSProperties;
}

export interface SelectOption { value:string; label:string; disabled?:boolean; }

export interface SelectProps {
  label?:       string;
  value:        string;
  onChange:     (value: string) => void;
  options:      SelectOption[];
  placeholder?: string;
  error?:       string;
  disabled?:    boolean;
  size?:        'sm'|'md'|'lg';
  style?:       React.CSSProperties;
}

export interface RadioOption  { value:string; label:string; description?:string; disabled?:boolean; }

export interface RadioGroupProps {
  label?:     string;
  value:      string;
  onChange:   (value: string) => void;
  options:    RadioOption[];
  direction?: 'horizontal'|'vertical';
  error?:     string;
}

export interface SearchBarProps {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
  onClear?:     () => void;
  width?:       number|string;
  size?:        'sm'|'md';
  style?:       React.CSSProperties;
}

export interface FilterChipProps {
  label:     string;
  count?:    number|string;
  active?:   boolean;
  onClick?:  () => void;
  onRemove?: () => void;
  color?:    BadgeColor;
}

export interface TabItem { id:string; label:string; icon?:React.ReactNode; count?:number; disabled?:boolean; }

export interface FilterTabsProps {
  tabs:     TabItem[];
  active:   string;
  onChange: (id: string) => void;
  variant?: 'pill'|'underline'|'segment';
  size?:    'sm'|'md';
}

export interface NavItem {
  id:          string;
  label:       string;
  shortLabel?: string;
  icon:        React.ComponentType<{size?:number; className?:string}>;
  color?:      string;
  badge?:      number;
}

export interface NavBarProps {
  items:       NavItem[];
  active:      string;
  onNavigate:  (id: string) => void;
  variant?:    'sidebar'|'bottom'|'topbar';
  centerName?: string;
}

export interface StatCardProps {
  label:       string;
  value:       string|number;
  sub?:        string;
  gradient:    string;
  icon:        React.ComponentType<{size?:number; color?:string}>;
  trend?:      number|null;
  trendLabel?: string;
  onClick?:    () => void;
  clickable?:  boolean;
}

export interface ColumnDef<T> {
  key:          keyof T|string;
  label:        string;
  width?:       number|string;
  align?:       Align;
  sortable?:    boolean;
  render?:      (value:any, row:T, index:number) => React.ReactNode;
  headerStyle?: React.CSSProperties;
  cellStyle?:   React.CSSProperties;
}

export interface DataTableProps<T extends Record<string,any>> {
  columns:       ColumnDef<T>[];
  data:          T[];
  rowKey:        keyof T;
  loading?:      boolean;
  emptyIcon?:    string;
  emptyText?:    string;
  emptyAction?:  {label:string; onClick:()=>void};
  striped?:      boolean;
  hoverable?:    boolean;
  page?:         number;
  perPage?:      number;
  total?:        number;
  onPageChange?: (page:number) => void;
  scrollX?:      boolean;
  style?:        React.CSSProperties;
}

export interface TableAction {
  icon:      React.ReactNode;
  label:     string;
  onClick:   () => void;
  intent?:   'default'|'primary'|'warning'|'danger';
  disabled?: boolean;
  hidden?:   boolean;
}

export interface TableActionsProps { actions:TableAction[]; compact?:boolean; }

export type AttendanceStatus = 'present'|'absent'|'late';

export interface AttendanceStudent {
  id:       string;
  name:     string;
  classId?: string;
  status:   AttendanceStatus;
  note?:    string;
}

export interface AttendancePickerProps {
  students:  AttendanceStudent[];
  onChange:  (students: AttendanceStudent[]) => void;
  readOnly?: boolean;
}

export type ConnectionState = 'connected'|'disconnected'|'loading'|'error';

export interface ConnectionStatusProps {
  state:       ConnectionState;
  lastSynced?: string;
  onRetry?:    () => void;
  onSync?:     () => void;
  compact?:    boolean;
}

export interface QuickAction {
  label:   string;
  icon:    React.ComponentType<{size?:number; color?:string}>;
  color:   string;
  shadow:  string;
  onClick: () => void;
}

export interface QuickActionGroupProps {
  actions:   QuickAction[];
  columns?:  number;
  minWidth?: number;
}

export interface PagerProps {
  page:       number;
  total:      number;
  perPage:    number;
  setPage:    (page:number) => void;
  showTotal?: boolean;
}
