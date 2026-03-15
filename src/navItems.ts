import {
  LayoutDashboard, BookOpen,
  Users, School, GraduationCap, Library, Wallet, BarChart3, Settings,
} from 'lucide-react';
import type { Screen } from './types';
import React from 'react';

export const NAV_ITEMS: {
  id: Screen;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}[] = [
  { id: 'overview',    label: 'Tổng quan',  shortLabel: 'Tổng quan', icon: LayoutDashboard, color: 'text-indigo-400' },
  { id: 'operations',  label: 'Vận hành',   shortLabel: 'Vận hành',  icon: BookOpen,        color: 'text-violet-400' },
  { id: 'teachers',    label: 'Giáo viên',  shortLabel: 'GV',        icon: Users,           color: 'text-amber-400' },
  { id: 'classes',     label: 'Lớp học',    shortLabel: 'Lớp học',   icon: School,          color: 'text-sky-400' },
  { id: 'students',    label: 'Học sinh',   shortLabel: 'Học sinh',  icon: GraduationCap,   color: 'text-teal-400' },
  { id: 'materials',   label: 'Học liệu',   shortLabel: 'Học liệu',  icon: Library,         color: 'text-emerald-400' },
  { id: 'finance',     label: 'Tài chính',  shortLabel: 'Tài chính', icon: Wallet,          color: 'text-orange-400' },
  { id: 'reports',     label: 'Báo cáo',    shortLabel: 'Báo cáo',   icon: BarChart3,       color: 'text-rose-400' },
  { id: 'settings',    label: 'Cài đặt',    shortLabel: 'Cài đặt',   icon: Settings,        color: 'text-slate-400' },
];
