/**
 * hooks/useAlerts.ts — Lớp Toán NK v24.1
 * BUG FIX v24.1: Sửa date parsing trong toàn bộ file.
 * Lỗi cũ: new Date("13/03/2026") → Invalid Date (JS không hiểu DD/MM/YYYY).
 * Fix: dùng parseDMY() từ helpers.ts — đã xử lý đúng DD/MM/YYYY.
 * Hậu quả của lỗi cũ: hasDiaryToday và thisWeekLogs luôn = false/empty
 * → alert "Chưa có nhật ký hôm nay" và "Chưa ghi nhật ký tuần này" hiện liên tục dù đã có log.
 */

import { useMemo } from 'react';
import type { Student, Payment, Expense } from '../types';
import type { Screen } from '../types';
import { parseDMY, isStudentActive } from '../helpers';

export type AlertType     = 'attendance' | 'payment' | 'class-size' | 'general';
export type AlertSeverity = 'high' | 'medium' | 'low';

export interface AlertAction {
  label:   string;
  handler: () => void;
}

export interface SmartAlert {
  id:          string;
  type:        AlertType;
  severity:    AlertSeverity;
  title:       string;
  description: string;
  actions:     AlertAction[];
}

interface UseAlertsParams {
  students:     Student[];
  tlogs:        any[];
  payments:     Payment[];
  uClasses:     any[];
  curMo:        number;
  curYr:        number;
  isPaid:       (sid: string, mo: number, yr: number) => boolean;
  goScreen:     (s: Screen) => void;
  onAddStudent: () => void;
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = { high: 0, medium: 1, low: 2 };

export function useAlerts({
  students, tlogs, uClasses,
  curMo, curYr, isPaid, goScreen,
}: UseAlertsParams): SmartAlert[] {

  return useMemo<SmartAlert[]>(() => {
    const alerts: SmartAlert[] = [];

    /* ── 1. Chuyên cần: vắng >= 2 buổi gần nhất ── */
    const absentList: { name: string; classId: string; count: number }[] = [];

    students
      .filter(isStudentActive)
      .forEach(s => {
        const classLogs = tlogs
          .filter(l => l.classId === s.classId)
          .slice()
          .sort((a: any, b: any) => {
            // BUG FIX v24.1: new Date("DD/MM/YYYY") → NaN. Dùng parseDMY() thay thế.
            return parseDMY(b.rawDate || b.date) - parseDMY(a.rawDate || a.date);
          })
          .slice(0, 5);

        let streak = 0;
        for (const log of classLogs) {
          const att = (log.attendanceList || []).find(
            (a: any) => (a.maHS || a['Mã HS']) === s.id
          );
          if (att && att['Trạng thái'] === 'Vắng') {
            streak++;
          } else if (att) {
            break;
          }
        }
        if (streak >= 2) {
          absentList.push({ name: s.name, classId: s.classId, count: streak });
        }
      });

    if (absentList.length > 0) {
      const sorted = absentList.sort((a, b) => b.count - a.count);
      const preview = sorted.slice(0, 3).map(x => `${x.name} (${x.classId}): ${x.count} buổi`).join(' · ');
      const extra   = sorted.length > 3 ? ` +${sorted.length - 3} khác` : '';
      alerts.push({
        id:          'attendance-streak',
        type:        'attendance',
        severity:    sorted.length >= 3 ? 'high' : 'medium',
        title:       `${sorted.length} HS vắng liên tiếp ≥2 buổi`,
        description: preview + extra,
        actions:     [{ label: 'Xem nhật ký', handler: () => goScreen('operations') }],
      });
    }

    /* ── 2. Học phí: chưa đóng tháng hiện tại ── */
    const unpaid = students.filter(s =>
      isStudentActive(s) && !isPaid(s.id, curMo, curYr)
    );

    if (unpaid.length > 0) {
      const preview = unpaid.slice(0, 3).map(s => s.name).join(', ');
      const extra   = unpaid.length > 3 ? ` và ${unpaid.length - 3} khác` : '';
      alerts.push({
        id:          'payment-unpaid',
        type:        'payment',
        severity:    unpaid.length > 10 ? 'high' : unpaid.length > 5 ? 'medium' : 'low',
        title:       `${unpaid.length} HS chưa đóng học phí T${curMo}`,
        description: preview + extra,
        actions:     [{ label: 'Xem tài chính', handler: () => goScreen('finance') }],
      });
    }

    /* ── 3. Sĩ số lớp bất thường ── */
    const smallClasses = uClasses.filter(c => {
      const n = students.filter(s => s.classId === c['Mã Lớp'] && isStudentActive(s)).length;
      return n > 0 && n < 3;
    });
    const largeClasses = uClasses.filter(c => {
      const n = students.filter(s => s.classId === c['Mã Lớp'] && isStudentActive(s)).length;
      return n > 20;
    });

    // BUG FIX v24.1: Dùng parseDMY() thay new Date() để parse DD/MM/YYYY đúng cách.
    // Lỗi cũ: todayStr.split('-')[2] + '/' + ... → so sánh string fragile & dễ sai.
    const todayMidnight = (() => {
      const t = new Date();
      return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
    })();
    const hasDiaryToday = tlogs.some(l => {
      const ts = parseDMY(l.rawDate || l.date || '');
      if (!ts) return false;
      const d = new Date(ts);
      const logMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      return logMidnight === todayMidnight;
    });
    if (uClasses.length > 0 && !hasDiaryToday) {
      alerts.push({
        id:          'quick-diary',
        type:        'general',
        severity:    'low',
        title:       'Chưa có nhật ký hôm nay',
        description: `${uClasses.length} lớp đang hoạt động · Nhấn để ghi buổi dạy ngay`,
        actions:     [{ label: 'Thêm nhật ký', handler: () => goScreen('operations') }],
      });
    }

    if (smallClasses.length > 0) {
      alerts.push({
        id:          'class-small',
        type:        'class-size',
        severity:    'low',
        title:       `${smallClasses.length} lớp sĩ số thấp (<3 HS)`,
        description: smallClasses.map(c => c['Mã Lớp']).join(', '),
        actions:     [{ label: 'Xem lớp', handler: () => goScreen('classes') }],
      });
    }
    if (largeClasses.length > 0) {
      alerts.push({
        id:          'class-large',
        type:        'class-size',
        severity:    'medium',
        title:       `${largeClasses.length} lớp đông (>20 HS)`,
        description: largeClasses.map(c => c['Mã Lớp']).join(', '),
        actions:     [{ label: 'Xem lớp', handler: () => goScreen('classes') }],
      });
    }

    /* ── 4. Không có buổi dạy nào tuần này ── */
    const today      = new Date();
    const weekStart  = new Date(today); weekStart.setDate(today.getDate() - today.getDay() + 1); weekStart.setHours(0,0,0,0);
    const weekEnd    = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
    // BUG FIX v24.1: new Date("DD/MM/YYYY") → NaN → filter luôn trả về empty array.
    // Dùng parseDMY() để parse đúng format DD/MM/YYYY từ GAS.
    const thisWeekLogs = tlogs.filter(l => {
      const ts = parseDMY(l.rawDate || l.date || '');
      return ts >= weekStart.getTime() && ts <= weekEnd.getTime();
    });
    if (uClasses.length > 0 && thisWeekLogs.length === 0) {
      alerts.push({
        id:          'no-diary-this-week',
        type:        'general',
        severity:    'low',
        title:       'Chưa ghi nhật ký tuần này',
        description: 'Nhớ ghi chép buổi dạy sau mỗi tiết học.',
        actions:     [{ label: 'Ghi ngay', handler: () => goScreen('operations') }],
      });
    }

    return alerts
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
      .slice(0, 4);
  // NOTE: goScreen excluded from deps — it's a useCallback ref, stable across renders.
  // Including it would cause infinite re-render loop if caller forgets useCallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, tlogs, uClasses, curMo, curYr, isPaid]);
}
