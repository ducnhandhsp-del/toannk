/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * LỚP TOÁN NK - VERSION 13.0 PRO
 * Updates: Dashboard mới (thông tin TT, TKB, hoạt động), Bảng điểm GK/HK,
 *          TKB giờ chuẩn, Tài chính lọc tháng, Chi phí thống kê, Phiếu thu tự động
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, LayoutDashboard, Users, UserCheck,
  FileText, Save, Printer, X, Check,
  Plus, Calendar, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  History, BarChart2, LayoutGrid, List, PhoneCall, Search,
  BookText, DollarSign, Send, Award, FileBarChart, School, Eye, Edit3,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return isoDate;
}

// So sánh ngày dạng DD/MM/YYYY
function parseDMY(dateStr: string): number {
  if (!dateStr) return 0;
  const clean = dateStr.includes(' - ') ? dateStr.split(' - ')[1] : dateStr;
  const p = clean.split('/');
  if (p.length === 3) return parseInt(p[2]) * 10000 + parseInt(p[1]) * 100 + parseInt(p[0]);
  return 0;
}

// Parse cột Thứ + Giờ học (hỗ trợ cả format 1 dòng/buổi lẫn Buổi1/2/3)
function parseScheduleSlots(cls: any): { thu: string; gio: string }[] {
  const results: { thu: string; gio: string }[] = [];
  const val = (cls['Thứ'] || '').trim();
  const gio = (cls['Giờ học'] || '').trim();
  if (val && gio) results.push({ thu: val, gio });
  return results;
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzyZxSW_HBBbrjCTDLYLB6Qfk4N8nsUHZDf8r0G2oWGEgHueXrxnVd2NoHM_tyXFjFo6Q/exec';

type Screen = 'overview' | 'teaching' | 'diary' | 'students' | 'classes' | 'finance' | 'fees' | 'expenses' | 'grades';

interface Student {
  id: string; name: string; dob: string; branch: string; grade: string; school: string; teacher: string;
  parentName: string; parentPhone: string; studentPhone: string; address: string; academicLevel: string;
  goal: string; supportNeeded: string; classId: string; startDate: string; endDate: string;
}
interface S1aRecord {
  id: string; date: string; docNum: string; description: string; studentId: string;
  studentName: string; payer: string; method: string; amount: number; note?: string;
}
interface ExpenseRecord {
  id: string; date: string; docNum: string; description: string; category: string; amount: number; spender: string;
}
interface GradeRecord {
  studentId: string; studentName: string; classId: string; teacher: string;
  scores: Record<string, number | string>;
}

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #invoice-print-area, #invoice-print-area *,
      #report-print-area, #report-print-area * { visibility: visible; }
      #invoice-print-area, #report-print-area {
        position: fixed; left: 50%; top: 10mm; transform: translateX(-50%);
        width: 140mm !important; background: white !important;
        padding: 10mm !important; border-radius: 20px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4 portrait; margin: 0; }
      .print\\:hidden { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// =========================================================================
// NAVBAR
// =========================================================================
const Navbar = ({ activeScreen, setActiveScreen }: {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
}) => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm print:hidden">
    <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center overflow-x-auto scrollbar-hide">
      <div className="flex items-center text-teal-600 shrink-0 mr-6">
        <GraduationCap size={38} className="mr-3" />
        <div className="flex flex-col">
          <span className="font-black text-xl uppercase leading-none">Lớp Toán NK</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Version 13.0 Pro</span>
        </div>
      </div>
      <div className="flex space-x-1 shrink-0">
        {[
          { id: 'overview',  label: 'Tổng quan', icon: LayoutDashboard, color: 'text-teal-600' },
          { id: 'teaching',  label: 'Giảng dạy', icon: UserCheck,       color: 'text-green-600' },
          { id: 'diary',     label: 'Nhật ký',   icon: BookText,        color: 'text-indigo-600' },
          { id: 'students',  label: 'Học sinh',  icon: Users,           color: 'text-blue-600' },
          { id: 'classes',   label: 'Lớp học',   icon: School,          color: 'text-cyan-600' },
          { id: 'finance',   label: 'Tài chính', icon: PieChartIcon,    color: 'text-emerald-600' },
          { id: 'fees',      label: 'Thu phí',   icon: DollarSign,      color: 'text-orange-500' },
          { id: 'expenses',  label: 'Chi phí',   icon: TrendingDown,    color: 'text-red-500' },
          { id: 'grades',    label: 'Điểm số',   icon: Award,           color: 'text-purple-600' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id as Screen)}
            className={cn(
              'flex flex-col items-center px-3 py-2 rounded-2xl transition-all',
              activeScreen === item.id ? 'bg-gray-100 ' + item.color : 'text-gray-400 hover:bg-gray-50'
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  </nav>
);

// =========================================================================
// CSS tiêu đề bảng đồng bộ
// =========================================================================
const TH = "px-5 py-4 text-xs font-black uppercase tracking-wider whitespace-nowrap";
const TD = "px-5 py-4";

// Timetable constants
const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const TIME_SLOTS   = ['07:30', '09:00', '14:00', '15:30', '17:30', '19:30'];
const GRADE_COLS   = ['GK1', 'HK1', 'GK2', 'HK2', 'TỔNG KẾT'];
// chuẩn hóa giờ bắt đầu từ chuỗi "7:30–9:00"
function normalizeStartTime(timeRange: string) {
  let start = timeRange.split('–')[0]

  if (start.length === 4) {
    start = '0' + start
  }

  return start
}
// =========================================================================
// APP COMPONENT CHÍNH
// =========================================================================
export default function App() {

  // --- STATES DỮ LIỆU ---
  const [activeScreen, setActiveScreen]       = useState<Screen>('overview');
  const [loading, setLoading]                 = useState(true);
  const [isSaving, setIsSaving]               = useState(false);
  const [students, setStudents]               = useState<Student[]>([]);
  const [classes, setClasses]                 = useState<any[]>([]);  // toàn bộ dòng (timetable)
  const [uniqueClasses, setUniqueClasses]     = useState<any[]>([]);  // dedup theo Mã Lớp
  const [payments, setPayments]               = useState<S1aRecord[]>([]);
  const [expenses, setExpenses]               = useState<ExpenseRecord[]>([]);
  const [grades, setGrades]                   = useState<GradeRecord[]>([]);
  const [teachingLogs, setTeachingLogs]       = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs]   = useState<any[]>([]);
  const [financeSummary, setFinanceSummary]   = useState<any>(null);

  // --- STATES BỘ LỌC ---
  const [searchTerm, setSearchTerm]                   = useState('');
  const [studentViewMode, setStudentViewMode]         = useState<'table' | 'grid'>('table');
  const [filterClass, setFilterClass]                 = useState('');
  const [diaryFilterClass, setDiaryFilterClass]       = useState('');
  const [gradeFilterClass, setGradeFilterClass]       = useState('');
  const [financeFilterMonth, setFinanceFilterMonth]   = useState(
    `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`
  );
  const [financeFilterTeacher, setFinanceFilterTeacher] = useState('');
  const [financeFilterClass, setFinanceFilterClass]     = useState('');
  const [financeFilterStatus, setFinanceFilterStatus]   = useState('');
  const [classFilterTeacher, setClassFilterTeacher]     = useState('');

  // --- STATES MODALS ---
  const [selectedClassId, setSelectedClassId]           = useState('');
  const [showInvoice, setShowInvoice]                   = useState<S1aRecord | null>(null);
  const [showReportCard, setShowReportCard]             = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail]       = useState<Student | null>(null);
  const [showAddHSModal, setShowAddHSModal]             = useState(false);
  const [showAddFeeModal, setShowAddFeeModal]           = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal]   = useState(false);
  const [editingStudent, setEditingStudent]             = useState<Student | null>(null);
  const [showDiaryDetail, setShowDiaryDetail]           = useState<any>(null);
  const [showFinanceDetail, setShowFinanceDetail]       = useState<Student | null>(null);
  const [showAddClassModal, setShowAddClassModal]       = useState(false);
  const [editingClass, setEditingClass]                 = useState<any>(null);
  const [formClass, setFormClass]                       = useState<any>({});

  // --- STATES GIẢNG DẠY ---
  const [teachingDate, setTeachingDate]         = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]             = useState<Record<string, string>>({});
  const [attendanceNotes, setAttendanceNotes]   = useState<Record<string, string>>({});
  const [journalContent, setJournalContent]     = useState('');
  const [journalHomework, setJournalHomework]   = useState('');

  // --- STATES BIỂU MẪU ---
  const [formHS, setFormHS]           = useState<any>({ branch: 'Đào Tấn', academicLevel: 'Khá' });
  const [formFee, setFormFee]         = useState<any>({ method: 'Chuyển khoản', date: new Date().toISOString().split('T')[0] });
  const [formExpense, setFormExpense] = useState<any>({ date: new Date().toISOString().split('T')[0], category: 'Vận hành' });

  // --- STATES ĐIỂM SỐ BATCH ---
  const [pendingGrades, setPendingGrades] = useState<Record<string, Record<string, string>>>({});
  const [hasUnsavedGrades, setHasUnsavedGrades] = useState(false);

  useEffect(() => { loadData(); }, []);

  // =========================================================================
  // HÀM TẢI DỮ LIỆU
  // =========================================================================
  const loadData = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${SCRIPT_URL}?t=${new Date().getTime()}`, { method: 'GET', redirect: 'follow' });
      if (!res.ok) throw new Error('Không thể kết nối Script URL');
      const data = await res.json();

      const mappedHS = (data.students || []).map((s: any) => ({
        id:             s['Mã HS']                              || '',
        name:           s['Họ và tên học sinh']                 || '---',
        dob:            s['Ngày tháng năm sinh']                || '---',
        branch:         s['Cơ sở học tập']                     || '---',
        grade:          s['Khối lớp hiện tại']                 || '---',
        school:         s['Trường đang học']                   || '---',
        teacher:        s['Giáo viên trực tiếp giảng dạy']    || '---',
        parentName:     s['Họ và tên phụ huynh']               || '---',
        parentPhone:    s['Số điện thoại phụ huynh (Zalo)']   || '---',
        studentPhone:   s['Số điện thoại học sinh']            || '---',
        address:        s['Địa chỉ thường trú']                || '---',
        academicLevel:  s['Học lực môn Toán hiện tại']        || '---',
        goal:           s['Mục tiêu điểm số học kỳ tới']      || '---',
        supportNeeded:  s['Kiến thức em cần hỗ trợ thêm']     || '---',
        classId:        s['Mã Lớp']                            || '---',
        startDate:      s['Ngày bắt đầu']                      || '---',
        endDate:        s['Ngày kết thúc']                     || '---',
      }));

      const mappedPayments = (data.payments || []).map((p: any, i: number) => {
        const foundStudent = mappedHS.find((s: Student) => s.id === p['Mã HS']);
        return {
          id:          i.toString(),
          date:        p['Ngày CT']           || '---',
          docNum:      p['Số hiệu CT']        || '---',
          studentId:   p['Mã HS']             || '---',
          studentName: foundStudent ? foundStudent.name : 'HS KHÔNG TỒN TẠI',
          payer:       p['Người thanh toán']  || '---',
          method:      p['Hình thức']         || '---',
          description: p['Diễn giải']         || '---',
          amount:      Number(p['Số tiền'])   || 0,
        };
      });

      const mappedExpenses = (data.expenses || []).map((e: any, i: number) => ({
        id:          i.toString(),
        date:        e['Ngày CT']      || '---',
        docNum:      e['Số hiệu CT']   || '---',
        description: e['Nội dung chi'] || '---',
        category:    e['Hạng mục']     || '---',
        amount:      Number(e['Số tiền']) || 0,
        spender:     e['Người chi']    || '---',
      }));

      const mappedGrades: GradeRecord[] = mappedHS.map((student: Student) => {
        const gradeRow = (data.grades || []).find((g: any) => g['Mã HS'] === student.id) || {};
        const scores: Record<string, number | string> = {};
        ['GK1','HK1','GK2','HK2','TỔNG KẾT'].forEach(k => { scores[k] = gradeRow[k] ?? ''; });
        return { studentId: student.id, studentName: student.name, classId: student.classId, teacher: student.teacher, scores };
      });

      const chartMap: Record<string, any> = {};
      for (let i = 1; i <= 12; i++) { chartMap[`${i}/26`] = { month: `${i}/26`, Thu: 0, Chi: 0, LoiNhuan: 0 }; }
      mappedPayments.forEach((p: S1aRecord) => {
        const datePart = p.date.includes(' - ') ? p.date.split(' - ')[1] : p.date;
        const parts = datePart.split('/');
        if (parts.length === 3) {
          const key = `${parseInt(parts[1], 10)}/${parts[2].substring(2)}`;
          if (chartMap[key]) chartMap[key].Thu += p.amount / 1000000;
        }
      });
      mappedExpenses.forEach((e: ExpenseRecord) => {
        const parts = e.date.split('/');
        if (parts.length === 3) {
          const key = `${parseInt(parts[1], 10)}/${parts[2].substring(2)}`;
          if (chartMap[key]) chartMap[key].Chi += e.amount / 1000000;
        }
      });
      const finalChartData = Object.values(chartMap).map((item: any) => ({
        ...item, LoiNhuan: Number((item.Thu - item.Chi).toFixed(2)),
      }));

      // Deduplicate classes theo Mã Lớp (vì 1 lớp nhiều dòng = nhiều buổi)
      const uniqueClassMap = new Map<string, any>();
      (data.classes || []).forEach((c: any) => {
        if (!uniqueClassMap.has(c['Mã Lớp'])) uniqueClassMap.set(c['Mã Lớp'], c);
      });
      const uniqueClasses = Array.from(uniqueClassMap.values());

      const classStats = uniqueClasses.map((c: any) => {
        const stds = mappedHS.filter((s: Student) => s.classId === c['Mã Lớp']);
        return { id: c['Mã Lớp'], studentCount: stds.length, teacher: stds.length > 0 ? stds[0].teacher : (c['Giáo viên'] || '---') };
      });

      const processedDiary = (data.teachingLogs || []).map((log: any) => {
        const date    = log['Ngày'];
        const classId = log['Mã Lớp'];
        const atts    = (data.attendanceLogs || []).filter((a: any) => a['Ngày'] === date && a['Mã Lớp'] === classId);
        return {
          date, classId,
          content:     log['Nội dung bài dạy'] || '---',
          homework:    log['Bài tập về nhà']   || '---',
          present:     atts.filter((a: any) => a['Trạng thái'] === 'Có mặt').length,
          absent:      atts.filter((a: any) => a['Trạng thái'] === 'Vắng').length,
          late:        atts.filter((a: any) => a['Trạng thái'] === 'Muộn').length,
          teacherName: log['Giáo viên'] || '---',
          attendanceList: atts,
        };
      });

      setStudents(mappedHS);
      setClasses(data.classes || []);          // toàn bộ dòng (dùng cho timetable)
      setUniqueClasses(uniqueClasses);          // dedup (dùng cho đếm, dropdown, select)
      setPayments(mappedPayments);
      setExpenses(mappedExpenses);
      setGrades(mappedGrades);
      setTeachingLogs(processedDiary);
      setAttendanceLogs(data.attendanceLogs || []);
      setFinanceSummary({
        totalRevenue:        mappedPayments.reduce((s: number, p: S1aRecord) => s + p.amount, 0),
        totalExpense:        mappedExpenses.reduce((s: number, e: ExpenseRecord) => s + e.amount, 0),
        netProfit:           mappedPayments.reduce((s: number, p: S1aRecord) => s + p.amount, 0) - mappedExpenses.reduce((s: number, e: ExpenseRecord) => s + e.amount, 0),
        classStats,
        monthlyRevenueChart: finalChartData,
      });
      if (data.classes?.length > 0 && !selectedClassId) setSelectedClassId(data.classes[0]['Mã Lớp']);
      setPendingGrades({});
      setHasUnsavedGrades(false);
    } catch (e) {
      console.error(e);
      alert('Không thể đồng bộ dữ liệu. Hãy kiểm tra SCRIPT_URL hoặc kết nối mạng.');
    } finally { setLoading(false); }
  };

  // =========================================================================
  // CÁC HÀM LƯU
  // =========================================================================
  const handleSaveTeaching = async () => {
    if (isSaving) return;
    const currentClassStudents = students.filter(s => s.classId === selectedClassId);
    const teacherName = currentClassStudents.length > 0 ? currentClassStudents[0].teacher : '---';
    const attRecords  = currentClassStudents.map(s => ({
      maHS: s.id, tenHS: s.name,
      trangThai: attendance[s.id] || 'Có mặt',
      ghiChu: attendanceNotes[s.id] || '',
    }));
    setIsSaving(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'saveDaily', date: teachingDate, maLop: selectedClassId, teacherName, attendance: attRecords, content: journalContent || '---', homework: journalHomework || '---' }),
      });
      setJournalContent(''); setJournalHomework(''); setAttendance({}); setAttendanceNotes({});
      alert('Đã lưu Nhật ký & Điểm danh!');
      loadData();
    } catch (e) { alert('Lỗi khi lưu!'); } finally { setIsSaving(false); }
  };

  const handleSaveFee = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const now      = new Date();
      const saveTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${formatDisplayDate(formFee.date)}`;
      const docNum   = `PT-${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${formFee.maHS}`;
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'savePayment', timeStamp: saveTime, soCT: docNum, ...formFee }) });
      setShowAddFeeModal(false);
      setFormFee({ method: 'Chuyển khoản', date: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (e) { alert('Lỗi!'); } finally { setIsSaving(false); }
  };

  const handleSaveExpense = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const now      = new Date();
      const saveTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${formatDisplayDate(formExpense.date)}`;
      const docNum   = `PC-${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'saveExpense', timeStamp: saveTime, soCT: docNum, ...formExpense }) });
      setShowAddExpenseModal(false);
      setFormExpense({ date: new Date().toISOString().split('T')[0], category: 'Vận hành' });
      loadData();
    } catch (e) { alert('Lỗi!'); } finally { setIsSaving(false); }
  };

  const handleSaveHS = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: editingStudent ? 'updateHS' : 'saveHS', ...formHS }) });
      setShowAddHSModal(false); setEditingStudent(null);
      loadData();
    } catch (e) { alert('Lỗi!'); } finally { setIsSaving(false); }
  };

  // Lưu tất cả điểm đang chờ
  const handleSaveAllGrades = async () => {
    if (isSaving || !hasUnsavedGrades) return;
    setIsSaving(true);
    try {
      const saveList: { studentId: string; month: string; score: string }[] = [];
      for (const [studentId, months] of Object.entries(pendingGrades)) {
        for (const [month, score] of Object.entries(months)) {
          saveList.push({ studentId, month, score });
        }
      }
      // Gọi từng entry (vì server cũ dùng action saveGrade đơn lẻ)
      for (const entry of saveList) {
        await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'saveGrade', ...entry }) });
      }
      setPendingGrades({}); setHasUnsavedGrades(false);
      alert(`Đã lưu ${saveList.length} điểm thành công!`);
      loadData();
    } catch (e) { alert('Lỗi lưu điểm!'); } finally { setIsSaving(false); }
  };

  const handleGradeChange = (studentId: string, month: string, value: string) => {
    setPendingGrades(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [month]: value } }));
    setHasUnsavedGrades(true);
  };

  const handleSaveClass = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: editingClass ? 'updateClass' : 'saveClass', ...formClass }) });
      setShowAddClassModal(false); setEditingClass(null); setFormClass({});
      loadData();
    } catch (e) { alert('Lỗi!'); } finally { setIsSaving(false); }
  };

  // --- Kiểm tra học phí theo tháng ---
  const checkPaidMonth = (studentId: string, month: number): boolean => {
    return payments.some(p => {
      if (p.studentId !== studentId) return false;
      const datePart  = p.date.includes(' - ') ? p.date.split(' - ')[1] : p.date;
      const parts     = datePart.split('/');
      const matchDate = parts.length === 3 && parseInt(parts[1], 10) === month && parts[2] === '2026';
      const matchDesc = p.description.includes(`Tháng ${month}`);
      return matchDate || matchDesc;
    });
  };

  if (loading && !isSaving) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-50 text-teal-600">
      <GraduationCap size={80} className="animate-bounce mb-4" />
      <h1 className="text-xl font-black uppercase italic tracking-widest text-center px-4">Đang đồng bộ dữ liệu hệ thống...</h1>
    </div>
  );

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass  = filterClass === '' || s.classId === filterClass;
    return matchSearch && matchClass;
  });

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans selection:bg-teal-100 print:bg-white print:pb-0">
      <Navbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />

      <main className="max-w-7xl mx-auto px-4 py-8 print:p-0">

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: TỔNG QUAN */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'overview' && (() => {
          // Hoạt động gần đây: gộp payments + expenses + diary rồi sort theo ngày mới nhất
          const recentActivities: { date: string; text: string; color: string; icon: string }[] = [
            ...payments.slice(-20).map(p => ({
              date: p.date, color: 'emerald',
              icon: '💰', text: `Thu học phí ${p.amount.toLocaleString()}đ — ${p.studentName}`
            })),
            ...expenses.slice(-20).map(e => ({
              date: e.date, color: 'red',
              icon: '📤', text: `Chi phí ${e.amount.toLocaleString()}đ — ${e.description}`
            })),
            ...teachingLogs.slice(-20).map(l => ({
              date: l.date, color: 'indigo',
              icon: '📚', text: `Dạy lớp ${l.classId} — ${l.content?.substring(0, 50)}${l.content?.length > 50 ? '...' : ''}`
            })),
          ].sort((a, b) => parseDMY(b.date) - parseDMY(a.date)).slice(0, 12);

          // Nhóm theo ngày
          const today = new Date();
          const todayStr = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
          const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
          const yStr = `${yesterday.getDate().toString().padStart(2,'0')}/${(yesterday.getMonth()+1).toString().padStart(2,'0')}/${yesterday.getFullYear()}`;

          const groupedActivities: Record<string, typeof recentActivities> = {};
          recentActivities.forEach(a => {
            const dateKey = a.date.includes(' - ') ? a.date.split(' - ')[1] : a.date;
            if (!groupedActivities[dateKey]) groupedActivities[dateKey] = [];
            groupedActivities[dateKey].push(a);
          });

          // Build timetable slots helper for dashboard (reuse classes state)
          const getSlotForDashboard = (teacherKeyword: string, day: string, time: string) =>
            classes.find(c => {
              const teacher = c['Giáo viên'] || students.find((s: Student) => s.classId === c['Mã Lớp'])?.teacher || '';
              if (!teacher.toLowerCase().includes(teacherKeyword.toLowerCase())) return false;
              const slots = parseScheduleSlots(c);
              return slots.some(s => s.thu === day && s.gio === time);
            }) || null;

          return (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'HỌC SINH', value: students.length, icon: Users, bg: 'bg-blue-100', text: 'text-blue-600' },
                  { label: 'LỚP HỌC',  value: uniqueClasses.length, icon: School, bg: 'bg-cyan-100', text: 'text-cyan-600' },
                  { label: 'TỔNG THU', value: (financeSummary?.totalRevenue||0).toLocaleString()+'đ', icon: TrendingUp, bg: 'bg-emerald-100', text: 'text-emerald-600' },
                  { label: 'TỔNG CHI', value: (financeSummary?.totalExpense||0).toLocaleString()+'đ', icon: TrendingDown, bg: 'bg-red-100', text: 'text-red-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                    <div className={`p-3 ${item.bg} ${item.text} rounded-2xl group-hover:scale-110 transition-transform`}><item.icon size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p><p className="text-xl font-black text-gray-900 mt-0.5">{item.value}</p></div>
                  </div>
                ))}
              </div>

              {/* Thông tin trung tâm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cơ sở */}
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><School size={14} className="text-teal-500" /> CƠ SỞ</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'CƠ SỞ 1', value: '15/80 ĐÀO TẤN', color: 'bg-teal-50 border-teal-100 text-teal-700' },
                      { label: 'CƠ SỞ 2', value: '30 NGUYỄN QUANG BÍCH', color: 'bg-blue-50 border-blue-100 text-blue-700' },
                    ].map((cs, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${cs.color}`}>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{cs.label}</span>
                        <span className="font-black text-sm">{cs.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Giáo viên */}
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><UserCheck size={14} className="text-indigo-500" /> GIÁO VIÊN</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'LÊ ĐỨC NHÂN', phone: '038 363 4949', color: 'bg-blue-50 border-blue-100', nameColor: 'text-blue-700', title: 'THẦY' },
                      { name: 'NGUYỄN THỊ KIÊN', phone: '036 476 0584', color: 'bg-pink-50 border-pink-100', nameColor: 'text-pink-700', title: 'CÔ' },
                    ].map((gv, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${gv.color}`}>
                        <div>
                          <p className={`font-black text-sm ${gv.nameColor}`}>{gv.title} {gv.name}</p>
                        </div>
                        <a href={`tel:${gv.phone.replace(/\s/g,'')}`} className={`flex items-center gap-1.5 text-[11px] font-black ${gv.nameColor} hover:opacity-70 transition-opacity`}>
                          <PhoneCall size={13} /> {gv.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Thời khoá biểu tóm tắt - 2 cột */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { name: 'THẦY NHÂN', keyword: 'Nhân', hdBg: 'bg-blue-600', cellBg: 'bg-blue-100 text-blue-800', emptyBg: 'bg-gray-50' },
                  { name: 'CÔ KIÊN',   keyword: 'Kiên', hdBg: 'bg-pink-600',  cellBg: 'bg-pink-100 text-pink-800',  emptyBg: 'bg-gray-50' },
                ].map(teacher => (
                  <div key={teacher.name} className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className={`${teacher.hdBg} px-5 py-3 flex items-center justify-between`}>
                      <h4 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2"><Calendar size={15} /> THỜI KHÓA BIỂU {teacher.name}</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-gray-500 font-black uppercase border border-gray-100 text-left">GIỜ</th>
                            {DAYS_OF_WEEK.map(d => <th key={d} className="px-2 py-2 text-gray-600 font-black uppercase border border-gray-100 text-center min-w-[60px]">{d}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {TIME_SLOTS.map(time => (
                            <tr key={time}>
                              <td className="px-3 py-2 font-black text-gray-400 border border-gray-100 whitespace-nowrap">{time}</td>
                              {DAYS_OF_WEEK.map(day => {
                                const cls = getSlotForDashboard(teacher.keyword, day, time);
                                return (
                                  <td key={day} className="px-1 py-1 border border-gray-100 text-center">
                                    {cls ? (
                                      <div className={`${teacher.cellBg} px-1.5 py-1 rounded-lg font-black text-[10px] uppercase`}>{cls['Mã Lớp']}</div>
                                    ) : <span className="text-gray-200">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hoạt động gần đây */}
              <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><History size={14} className="text-gray-400" /> HOẠT ĐỘNG GẦN ĐÂY</h3>
                {Object.keys(groupedActivities).length === 0 ? (
                  <p className="text-gray-400 italic text-sm text-center py-6">Chưa có hoạt động nào...</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedActivities).map(([date, acts]) => (
                      <div key={date}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          {date === todayStr ? '🟢 HÔM NAY' : date === yStr ? '⚪ HÔM QUA' : `📅 ${date}`}
                        </p>
                        <div className="space-y-1.5 pl-3 border-l-2 border-gray-100">
                          {acts.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="mt-0.5 text-base leading-none">{a.icon}</span>
                              <span className="text-gray-700 font-medium">{a.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: GIẢNG DẠY */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'teaching' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8">
            <div className="bg-green-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 border-b-8 border-green-700">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sổ giảng dạy trực tuyến</h2>
                <p className="text-green-100 text-sm font-bold italic">Mặc định hệ thống: Có mặt</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-white/20 px-5 py-3 rounded-2xl flex items-center shadow-inner">
                  <Calendar size={20} className="mr-2" />
                  <input type="date" value={teachingDate} onChange={e => setTeachingDate(e.target.value)} className="bg-transparent text-white outline-none font-black text-base [color-scheme:dark]" />
                </div>
                <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="bg-white text-gray-800 px-6 py-3 rounded-2xl font-black text-sm outline-none shadow-2xl border-none cursor-pointer appearance-none min-w-[150px]">
                  {uniqueClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>Mã lớp: {c['Mã Lớp'] || '---'}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-[40px] border border-green-100 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-green-50 text-green-700 border-b border-green-100">
                      <tr>
                        <th className={TH}>Học sinh</th>
                        <th className={cn(TH, "text-center")}>Trạng thái</th>
                        <th className={TH}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.filter(s => s.classId === selectedClassId).length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center text-gray-400 font-bold italic">Chưa có học sinh nào trong lớp này...</td></tr>
                      ) : (
                        students.filter(s => s.classId === selectedClassId).map(s => (
                          <tr key={s.id} className="hover:bg-green-50/30 transition-all group">
                            <td className={TD}>
                              <p className="font-black text-gray-900 uppercase text-base group-hover:text-green-700 transition-colors">{s.name}</p>
                              <p className="text-xs text-teal-600 font-black tracking-widest">{s.id}</p>
                            </td>
                            <td className={TD}>
                              <div className="flex justify-center space-x-2">
                                {[
                                  { id: 'Có mặt', l: 'Có mặt', c: 'bg-green-500' },
                                  { id: 'Muộn',   l: 'Muộn',   c: 'bg-amber-500' },
                                  { id: 'Vắng',   l: 'Vắng',   c: 'bg-red-500'   },
                                ].map(opt => (
                                  <button key={opt.id} onClick={() => setAttendance(p => ({ ...p, [s.id]: opt.id }))}
                                    className={cn('px-4 py-2.5 rounded-2xl text-xs font-black uppercase transition-all shadow-sm active:scale-95',
                                      (attendance[s.id] === opt.id || (!attendance[s.id] && opt.id === 'Có mặt'))
                                        ? opt.c + ' text-white shadow-md ring-2 ring-white border border-black/10'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}>
                                    {opt.l}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className={TD}>
                              <input placeholder="Ghi chú buổi học..." className="w-full bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-green-500 shadow-inner" value={attendanceNotes[s.id] || ''} onChange={e => setAttendanceNotes({ ...attendanceNotes, [s.id]: e.target.value })} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                  <button onClick={handleSaveTeaching} disabled={isSaving} className={cn('text-white px-8 py-4 rounded-[20px] font-black uppercase text-sm tracking-widest shadow-xl transition-all flex items-center active:scale-95', isSaving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700')}>
                    <Save size={20} className="mr-3" /> {isSaving ? 'Đang xử lý...' : 'Lưu dữ liệu dạy học'}
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-green-100 space-y-8 shadow-xl">
                <h3 className="font-black text-green-700 text-xl uppercase flex items-center border-b-2 border-green-100 pb-5">
                  <FileText size={24} className="mr-3" /> Ghi chép bài dạy
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Nội dung giảng dạy</p>
                    <textarea placeholder="Hôm nay các em học gì?" className="w-full p-5 bg-gray-50 rounded-[32px] h-48 text-sm font-bold outline-none border-none focus:ring-2 ring-green-500 shadow-inner leading-relaxed resize-none" value={journalContent} onChange={e => setJournalContent(e.target.value)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Bài tập về nhà</p>
                    <input placeholder="Giao bài tập về nhà..." className="w-full p-5 bg-gray-50 rounded-[24px] text-sm font-bold border-none outline-none focus:ring-2 ring-green-500 shadow-inner" value={journalHomework} onChange={e => setJournalHomework(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: NHẬT KÝ */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'diary' && (() => {
          const filteredDiary = [...teachingLogs]
            .filter(log => diaryFilterClass === '' || log.classId === diaryFilterClass)
            .sort((a, b) => parseDMY(b.date) - parseDMY(a.date)); // Mới nhất lên trên
          return (
            <div className="space-y-6 animate-in slide-in-from-bottom-8">
              <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 border-b-8 border-indigo-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Nhật ký giảng dạy</h2>
                  <p className="text-indigo-100 text-sm font-bold italic">Thống kê điểm danh & Bài học</p>
                </div>
                <select className="bg-white text-gray-800 px-6 py-3 rounded-2xl font-black text-sm outline-none shadow-xl border-none appearance-none cursor-pointer hover:bg-gray-50 min-w-[180px]" value={diaryFilterClass} onChange={e => setDiaryFilterClass(e.target.value)}>
                  <option value="">Lọc theo: Tất cả lớp</option>
                  {uniqueClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>Mã lớp: {c['Mã Lớp']}</option>)}
                </select>
              </div>
              <div className="bg-white rounded-[40px] border border-indigo-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-indigo-50 text-indigo-700 border-b-2 border-indigo-100">
                      <tr>
                        <th className={TH}>NGÀY DẠY</th>
                        <th className={cn(TH, "text-center")}>LỚP</th>
                        <th className={TH}>GIÁO VIÊN</th>
                        <th className={cn(TH, "text-center")}>CÓ MẶT</th>
                        <th className={cn(TH, "text-center")}>VẮNG</th>
                        <th className={cn(TH, "text-center")}>MUỘN</th>
                        <th className={TH} style={{minWidth: 180}}>NỘI DUNG</th>
                        <th className={TH} style={{minWidth: 160}}>BÀI TẬP VỀ NHÀ</th>
                        <th className={cn(TH, "text-center")}>CHI TIẾT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDiary.length === 0 ? (
                        <tr><td colSpan={9} className="p-12 text-center text-gray-400 font-bold italic">Không có dữ liệu nhật ký phù hợp...</td></tr>
                      ) : (
                        filteredDiary.map((log: any, i: number) => (
                          <tr key={i} className="hover:bg-indigo-50/20 transition-all">
                            <td className={cn(TD, "font-bold text-gray-500 whitespace-nowrap")}>{log.date}</td>
                            <td className={cn(TD, "text-center font-black text-indigo-600 uppercase text-base")}>{log.classId}</td>
                            <td className={cn(TD, "font-black text-gray-600")}>{log.teacherName}</td>
                            <td className={cn(TD, "text-center font-black text-green-600 text-lg")}>{log.present}</td>
                            <td className={cn(TD, "text-center font-black text-red-600 text-lg")}>{log.absent}</td>
                            <td className={cn(TD, "text-center font-black text-amber-500 text-lg")}>{log.late}</td>
                            <td className={cn(TD, "text-gray-700 font-bold italic max-w-[200px] truncate")}>{log.content}</td>
                            <td className={cn(TD, "text-gray-500 max-w-[160px] truncate")}>{log.homework}</td>
                            <td className={cn(TD, "text-center")}>
                              <button onClick={() => setShowDiaryDetail(log)} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl font-black text-[11px] uppercase hover:bg-indigo-200 transition-all shadow-sm flex items-center mx-auto">
                                <Eye size={14} className="mr-1.5" /> Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: HỌC SINH */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'students' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-6 border-b-8 border-blue-700">
              <div className="w-full lg:w-auto">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Học sinh NK</h2>
                <p className="text-blue-100 text-sm font-bold italic">Quản lý hồ sơ chi tiết</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-white/20 px-5 py-3 rounded-2xl flex items-center shadow-inner">
                  <Search size={18} className="mr-3 text-blue-200" />
                  <input type="text" placeholder="Tìm tên, mã HS..." className="bg-transparent text-white placeholder-blue-200 outline-none font-bold text-sm w-40" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="bg-white text-gray-800 px-6 py-3 rounded-2xl font-black text-sm outline-none shadow-xl border-none appearance-none cursor-pointer hover:bg-gray-50 min-w-[120px]" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                  <option value="">Lọc: Tất cả</option>
                  {uniqueClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>Lớp: {c['Mã Lớp']}</option>)}
                </select>
                <div className="flex bg-black/20 p-1 rounded-2xl">
                  <button onClick={() => setStudentViewMode('table')} className={cn('p-2.5 rounded-xl transition-all', studentViewMode === 'table' ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:text-white')}><List size={20} /></button>
                  <button onClick={() => setStudentViewMode('grid')}  className={cn('p-2.5 rounded-xl transition-all', studentViewMode === 'grid'  ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:text-white')}><LayoutGrid size={20} /></button>
                </div>
                <button onClick={() => { setEditingStudent(null); setFormHS({}); setShowAddHSModal(true); }} className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-blue-50 transition-all flex items-center active:scale-95">
                  <Plus size={20} className="mr-2" /> Thêm HS
                </button>
              </div>
            </div>

            {studentViewMode === 'table' && (
              <div className="bg-white rounded-[40px] border border-blue-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-blue-50 text-blue-700 border-b-2 border-blue-100">
                      <tr>
                        <th className={TH}>MÃ HS</th>
                        <th className={TH}>HỌ VÀ TÊN</th>
                        <th className={cn(TH, "text-center")}>KHỐI</th>
                        <th className={cn(TH, "text-center")}>HỌC LỰC</th>
                        <th className={cn(TH, "text-center")}>MÃ LỚP</th>
                        <th className={cn(TH, "text-center")}>HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.length === 0
                        ? <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">Không tìm thấy học sinh nào...</td></tr>
                        : filteredStudents.map(s => (
                          <tr key={s.id} className="hover:bg-blue-50/30 transition-all group">
                            <td className={cn(TD, "font-black text-blue-600 text-base tracking-tighter")}>{s.id}</td>
                            <td className={TD}>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-black text-xs shadow-inner">{s.name ? s.name.charAt(0).toUpperCase() : '?'}</div>
                                <span className="font-black text-gray-900 uppercase text-sm group-hover:text-blue-700 transition-colors">{s.name}</span>
                              </div>
                            </td>
                            <td className={cn(TD, "text-center font-bold text-gray-600")}>{s.grade}</td>
                            <td className={cn(TD, "text-center font-bold text-teal-600")}>{s.academicLevel}</td>
                            <td className={cn(TD, "text-center font-black text-indigo-600 bg-gray-50/50")}>{s.classId}</td>
                            <td className={cn(TD, "text-center")}>
                              <div className="flex justify-center space-x-2">
                                <button onClick={() => setShowStudentDetail(s)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-gray-200 transition-all shadow-sm">Hồ sơ</button>
                                <button onClick={() => { setEditingStudent(s); setFormHS(s); setShowAddHSModal(true); }} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-orange-200 transition-all shadow-sm">Sửa</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {studentViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length === 0
                  ? <div className="col-span-full p-12 text-center text-gray-400 font-bold italic bg-white rounded-3xl">Không tìm thấy học sinh nào...</div>
                  : filteredStudents.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-[32px] border border-blue-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col group">
                      <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 px-4 py-2 rounded-bl-2xl font-black text-[10px] uppercase">{s.classId}</div>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">{s.name ? s.name.charAt(0).toUpperCase() : '?'}</div>
                        <div><p className="font-black text-gray-900 uppercase text-base leading-tight">{s.name}</p><p className="text-xs font-bold text-teal-600 mt-1">{s.id} • Khối {s.grade}</p></div>
                      </div>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100"><p className="flex justify-between items-center"><span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Học lực:</span> <span className="font-black text-teal-600 text-sm">{s.academicLevel}</span></p></div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100"><p className="flex justify-between items-center"><span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Mục tiêu:</span> <span className="font-black text-orange-600 text-sm text-right max-w-[150px] truncate">{s.goal}</span></p></div>
                      </div>
                      <div className="flex space-x-2 border-t border-gray-50 pt-4">
                        <button onClick={() => setShowStudentDetail(s)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-black text-xs uppercase hover:bg-gray-200 transition-colors">Hồ sơ</button>
                        <button onClick={() => { setEditingStudent(s); setFormHS(s); setShowAddHSModal(true); }} className="flex-1 bg-orange-100 text-orange-700 py-3 rounded-xl font-black text-xs uppercase hover:bg-orange-200 transition-colors">Sửa</button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: LỚP HỌC */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'classes' && (() => {
          const filteredClasses = uniqueClasses.filter(c => {
            if (classFilterTeacher === '') return true;
            const teacher = c['Giáo viên'] || students.find(s => s.classId === c['Mã Lớp'])?.teacher || '';
            return teacher.toLowerCase().includes(classFilterTeacher.toLowerCase());
          });

          const getClassesForTimetable = (teacherKeyword: string) =>
            classes.filter(c => {
              const teacher = c['Giáo viên'] || students.find(s => s.classId === c['Mã Lớp'])?.teacher || '';
              return teacher.toLowerCase().includes(teacherKeyword.toLowerCase());
            });

          const getSlotClass = (teacherKeyword: string, day: string, time: string) => {
            return getClassesForTimetable(teacherKeyword).find(c => {
              const slots = parseScheduleSlots(c);
              return slots.some(s => s.thu === day && normalizeStartTime(s.gio) === time);
            }) || null;
          };

          const TimetableGrid = ({ teacherName, color }: { teacherName: string; color: string }) => (
            <div className={`bg-white rounded-[32px] border overflow-hidden shadow-xl ${color}`}>
              <div className={`p-5 border-b flex items-center justify-between ${color}`}>
                <h4 className="font-black text-base uppercase flex items-center gap-2">
                  <Calendar size={18} /> Thời khoá biểu: {teacherName}
                </h4>
                <span className="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full">
                  {getClassesForTimetable(teacherName.includes('Nhân') ? 'Nhân' : 'Kiên').length} lớp
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 font-black text-gray-500 uppercase border border-gray-100 text-left whitespace-nowrap">Giờ học</th>
                      {DAYS_OF_WEEK.map(d => (
                        <th key={d} className="px-4 py-3 font-black text-gray-700 uppercase border border-gray-100 text-center min-w-[100px]">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map(time => (
                      <tr key={time} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-4 py-3 font-black text-gray-400 border border-gray-100 whitespace-nowrap">{time}</td>
                        {DAYS_OF_WEEK.map(day => {
                          const cls = getSlotClass(teacherName.includes('Nhân') ? 'Nhân' : 'Kiên', day, time);
                          return (
                            <td key={day} className="px-3 py-3 border border-gray-100 text-center">
                              {cls ? (
                                <div className="bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded-lg font-black text-[11px] uppercase shadow-sm">
                                  {cls['Mã Lớp']}
                                  {cls['Khối'] && <div className="text-[9px] text-indigo-400 mt-0.5">Khối {cls['Khối']}</div>}
                                </div>
                              ) : (
                                <span className="text-gray-200 text-lg">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

          return (
            <div className="space-y-6 animate-in slide-in-from-bottom-8">
              {/* Header */}
              <div className="bg-cyan-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-4 border-b-8 border-cyan-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Quản lý lớp học</h2>
                  <p className="text-cyan-100 text-sm font-bold italic">Danh sách lớp & Thời khoá biểu</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center justify-center">
                  {/* Filter buttons */}
                  {[
                    { label: 'Tất cả',     value: '' },
                    { label: 'Thầy Nhân',  value: 'Nhân' },
                    { label: 'Cô Kiên',    value: 'Kiên' },
                  ].map(btn => (
                    <button key={btn.value} onClick={() => setClassFilterTeacher(btn.value)}
                      className={cn('px-5 py-2.5 rounded-2xl font-black text-sm uppercase transition-all shadow-sm',
                        classFilterTeacher === btn.value ? 'bg-white text-cyan-700 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30')}>
                      {btn.label}
                    </button>
                  ))}
                  <button onClick={() => { setEditingClass(null); setFormClass({}); setShowAddClassModal(true); }}
                    className="bg-white text-cyan-700 px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-cyan-50 transition-all flex items-center active:scale-95">
                    <Plus size={20} className="mr-2" /> Thêm lớp
                  </button>
                </div>
              </div>

              {/* Danh sách lớp */}
              <div className="bg-white rounded-[40px] border border-cyan-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-cyan-50 text-cyan-700 border-b-2 border-cyan-100">
                      <tr>
                        <th className={TH}>MÃ LỚP</th>
                        <th className={TH}>GIÁO VIÊN</th>
                        <th className={cn(TH, "text-center")}>KHỐI</th>
                        <th className={cn(TH, "text-center")}>SĨ SỐ</th>
                        <th className={TH}>LỊCH HỌC</th>
                        <th className={TH}>GIỜ HỌC</th>
                        <th className={cn(TH, "text-center")}>HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredClasses.length === 0 ? (
                        <tr><td colSpan={7} className="p-12 text-center text-gray-400 font-bold italic">Không có lớp nào phù hợp...</td></tr>
                      ) : filteredClasses.map((c: any, i: number) => {
                        const classStudents = students.filter(s => s.classId === c['Mã Lớp']);
                        const teacher = c['Giáo viên'] || (classStudents.length > 0 ? classStudents[0].teacher : '---');
                        return (
                          <tr key={i} className="hover:bg-cyan-50/20 transition-all group">
                            <td className={cn(TD, "font-black text-cyan-700 text-base uppercase")}>{c['Mã Lớp']}</td>
                            <td className={cn(TD, "font-black text-gray-800")}>{teacher}</td>
                            <td className={cn(TD, "text-center font-bold text-gray-600")}>{c['Khối'] || '---'}</td>
                            <td className={cn(TD, "text-center")}>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">{classStudents.length} HS</span>
                            </td>
                            <td className={cn(TD, "font-bold text-gray-500")}>{c['Thứ'] || '---'}</td>
                            <td className={cn(TD, "font-bold text-gray-500")}>{c['Giờ học'] || '---'}</td>
                            <td className={cn(TD, "text-center")}>
                              <button onClick={() => { setEditingClass(c); setFormClass(c); setShowAddClassModal(true); }}
                                className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-xl font-black text-[11px] uppercase hover:bg-cyan-200 transition-all shadow-sm flex items-center mx-auto">
                                <Edit3 size={13} className="mr-1.5" /> Sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hai bảng thời khoá biểu */}
              <div className="grid grid-cols-1 gap-6">
                <TimetableGrid teacherName="Thầy Nhân" color="border-blue-100 text-blue-700 bg-blue-50" />
                <TimetableGrid teacherName="Cô Kiên"   color="border-pink-100 text-pink-700 bg-pink-50" />
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 6: TÀI CHÍNH - MA TRẬN CÔNG NỢ */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'finance' && (() => {
          const FEE_AMOUNT = 600000;
          // Tháng hiển thị: 07/2025 → 05/2026
          const FINANCE_MONTHS = [
            { label: '7/2025', m: 7, y: 2025 }, { label: '8/2025', m: 8, y: 2025 },
            { label: '9/2025', m: 9, y: 2025 }, { label: '10/2025', m: 10, y: 2025 },
            { label: '11/2025', m: 11, y: 2025 }, { label: '12/2025', m: 12, y: 2025 },
            { label: '1/2026', m: 1, y: 2026 }, { label: '2/2026', m: 2, y: 2026 },
            { label: '3/2026', m: 3, y: 2026 }, { label: '4/2026', m: 4, y: 2026 },
            { label: '5/2026', m: 5, y: 2026 },
          ];

          const checkPaidMonthYear = (studentId: string, month: number, year: number): boolean => {
            return payments.some(p => {
              if (p.studentId !== studentId) return false;
              const datePart = p.date.includes(' - ') ? p.date.split(' - ')[1] : p.date;
              const parts = datePart.split('/');
              if (parts.length === 3) {
                const fullYear = parseInt(parts[2], 10);
                const pYear = fullYear < 100 ? 2000 + fullYear : fullYear;
                if (parseInt(parts[1], 10) === month && pYear === year) return true;
              }
              if (p.description.includes(`Tháng ${month}`) && p.description.includes(String(year))) return true;
              return false;
            });
          };

          const summaryData = students.filter(s => {
            const matchTeacher = financeFilterTeacher === '' || s.teacher.includes(financeFilterTeacher);
            const matchClass   = financeFilterClass   === '' || s.classId === financeFilterClass;
            return matchTeacher && matchClass;
          });

          const [fMonth] = (financeFilterMonth || '01/2026').split('/');
          const paidThisMonth  = summaryData.filter(s => checkPaidMonth(s.id, parseInt(fMonth))).length;
          const totalExpected  = summaryData.length * FEE_AMOUNT;
          const totalCollected = paidThisMonth * FEE_AMOUNT;
          const totalDebt      = totalExpected - totalCollected;

          const tableData = summaryData.filter(s => {
            if (financeFilterStatus === '') return true;
            const paid = checkPaidMonth(s.id, parseInt(fMonth, 10));
            return financeFilterStatus === 'paid' ? paid : !paid;
          });

          return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-6 border-b-8 border-emerald-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">MA TRẬN CÔNG NỢ</h2>
                  <p className="text-emerald-100 text-sm font-bold italic">07/2025 → 05/2026 • Đối soát & Nhắc phí tự động</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
                  <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center shadow-inner">
                    <Calendar size={18} className="mr-2 text-emerald-200" />
                    <input type="text" placeholder="MM/YYYY" className="bg-transparent text-white outline-none font-black text-sm w-28 placeholder-emerald-200" value={financeFilterMonth} onChange={e => setFinanceFilterMonth(e.target.value)} />
                  </div>
                  <select className="bg-white text-gray-800 px-5 py-3 rounded-2xl font-black text-sm outline-none shadow-xl border-none cursor-pointer hover:bg-gray-50 appearance-none min-w-[140px]" value={financeFilterClass} onChange={e => setFinanceFilterClass(e.target.value)}>
                    <option value="">TẤT CẢ LỚP</option>
                    {uniqueClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>Lớp {c['Mã Lớp']}</option>)}
                  </select>
                  <select className="bg-white text-gray-800 px-5 py-3 rounded-2xl font-black text-sm outline-none shadow-xl border-none cursor-pointer hover:bg-gray-50 appearance-none min-w-[140px]" value={financeFilterTeacher} onChange={e => setFinanceFilterTeacher(e.target.value)}>
                    <option value="">TẤT CẢ GV</option>
                    <option value="Nhân">THẦY NHÂN</option>
                    <option value="Kiên">CÔ KIÊN</option>
                  </select>
                  <select className="bg-white text-gray-800 px-5 py-3 rounded-2xl font-black text-sm outline-none shadow-xl border-none cursor-pointer hover:bg-gray-50 appearance-none min-w-[160px]" value={financeFilterStatus} onChange={e => setFinanceFilterStatus(e.target.value)}>
                    <option value="">TẤT CẢ TRẠNG THÁI</option>
                    <option value="paid">✅ ĐÃ ĐÓNG PHÍ</option>
                    <option value="unpaid">❌ CHƯA ĐÓNG PHÍ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center shadow-sm">
                  <div className="p-4 bg-gray-100 text-gray-500 rounded-3xl mr-4"><Users size={28} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TỔNG DỰ THU</p><p className="text-2xl font-black text-gray-900">{totalExpected.toLocaleString()}đ</p></div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-emerald-100 flex items-center shadow-sm">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl mr-4"><DollarSign size={28} /></div>
                  <div><p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">ĐÃ THU ({financeFilterMonth})</p><p className="text-2xl font-black text-emerald-600">{totalCollected.toLocaleString()}đ</p></div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-red-100 flex items-center shadow-sm">
                  <div className="p-4 bg-red-100 text-red-600 rounded-3xl mr-4"><TrendingDown size={28} /></div>
                  <div><p className="text-[10px] font-black text-red-400 uppercase tracking-widest">CÒN THẤT THU</p><p className="text-2xl font-black text-red-600">{totalDebt.toLocaleString()}đ</p></div>
                </div>
              </div>

              {/* Ma trận 11 tháng + cột TỔNG */}
              <div className="bg-white rounded-[40px] border border-emerald-100 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-50 text-emerald-700 border-b-2 border-emerald-100">
                      <tr>
                        <th className={TH} style={{minWidth: 180}}>HỌC SINH</th>
                        <th className={cn(TH, "text-center")} style={{minWidth: 90}}>LỚP</th>
                        {FINANCE_MONTHS.map(fm => (
                          <th key={fm.label} className={cn(TH, "text-center")} style={{minWidth: 72}}>{fm.label}</th>
                        ))}
                        <th className={cn(TH, "text-center bg-emerald-100")} style={{minWidth: 100}}>TỔNG ĐÃ NỘP</th>
                        <th className={cn(TH, "text-center")} style={{minWidth: 120}}>HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableData.length === 0
                        ? <tr><td colSpan={15} className="p-12 text-center text-gray-400 font-bold italic">Không tìm thấy dữ liệu phù hợp...</td></tr>
                        : tableData.map((s: any, i: number) => {
                          const paidCount = FINANCE_MONTHS.filter(fm => checkPaidMonthYear(s.id, fm.m, fm.y)).length;
                          return (
                          <tr key={i} className="hover:bg-emerald-50/20 transition-all group">
                            <td className={TD}>
                              <p className="font-black text-gray-900 uppercase text-sm group-hover:text-emerald-700 transition-colors">{s.name}</p>
                              <p className="text-xs text-emerald-600 font-black tracking-widest">{s.id}</p>
                            </td>
                            <td className={cn(TD, "text-center font-bold text-gray-600 bg-gray-50/50")}>{s.classId}</td>
                            {FINANCE_MONTHS.map((fm) => {
                              const paid = checkPaidMonthYear(s.id, fm.m, fm.y);
                              return (
                                <td key={fm.label} className={cn(TD, "text-center")}>
                                  {paid
                                    ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600" title="Đã nộp"><Check size={12} /></span>
                                    : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-300" title="Chưa nộp"><X size={12} /></span>
                                  }
                                </td>
                              );
                            })}
                            <td className={cn(TD, "text-center bg-emerald-50/50")}>
                              <span className="font-black text-emerald-700 text-sm">{(paidCount * FEE_AMOUNT).toLocaleString()}đ</span>
                              <p className="text-[10px] text-gray-400 font-bold">{paidCount}/{FINANCE_MONTHS.length} tháng</p>
                            </td>
                            <td className={cn(TD, "text-center")}>
                              <div className="flex flex-col gap-2 items-center">
                                <button onClick={() => setShowFinanceDetail(s)}
                                  className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-200 transition-all shadow-sm flex items-center">
                                  <Eye size={12} className="mr-1" /> CHI TIẾT
                                </button>
                                {!checkPaidMonth(s.id, parseInt(fMonth, 10)) && (
                                  <button
                                    onClick={() => {
                                      const message = `Dạ chào anh/chị, Lớp Toán NK xin phép thông báo: Học phí tháng ${financeFilterMonth} của cháu ${s.name} (Lớp ${s.classId}) là ${FEE_AMOUNT.toLocaleString()}đ. Anh/chị vui lòng kiểm tra và chuyển khoản giúp trung tâm nhé. Trân trọng!`;
                                      window.open(`https://zalo.me/${(s.parentPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-700 transition-all shadow-sm flex items-center">
                                    <Send size={12} className="mr-1" /> NHẮC ZALO
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 7: SỔ THU PHÍ */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'fees' && (() => {
          const filteredPayments = payments.filter(p =>
            p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.date.includes(searchTerm)
          );
          return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-orange-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-8 border-orange-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sổ thu học phí S1a</h2>
                  <p className="text-orange-100 text-sm font-bold italic">Ghi chép chính xác dòng tiền vào</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-white/20 px-5 py-3 rounded-2xl flex items-center shadow-inner">
                    <Search size={18} className="mr-3 text-orange-200" />
                    <input type="text" placeholder="Tìm tên, mã, người nộp..." className="bg-transparent text-white placeholder-orange-200 outline-none font-bold text-sm w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => setShowAddFeeModal(true)} className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-orange-50 transition-all whitespace-nowrap active:scale-95 flex items-center">
                    <Plus size={20} className="mr-2" /> Ghi thu mới
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-[40px] border border-orange-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-orange-50 text-orange-700 border-b-2 border-orange-100">
                      <tr>
                        <th className={TH}>NGÀY CT</th>
                        <th className={TH}>MÃ CT</th>
                        <th className={TH}>NGƯỜI NỘP</th>
                        <th className={TH}>HỌC SINH</th>
                        <th className={TH} style={{minWidth: 160}}>DIỄN GIẢI</th>
                        <th className={cn(TH, "text-right")}>SỐ TIỀN</th>
                        <th className={cn(TH, "text-center")}>BIÊN LAI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.length === 0
                        ? <tr><td colSpan={7} className="p-12 text-center text-gray-400 font-bold italic">Không tìm thấy giao dịch nào...</td></tr>
                        : filteredPayments.map((r, i) => (
                          <tr key={i} className="hover:bg-orange-50/30 transition-all group">
                            <td className={cn(TD, "font-bold text-gray-500 whitespace-nowrap")}>{r.date}</td>
                            <td className={cn(TD, "font-black text-orange-500 italic text-[10px]")}>{r.docNum}</td>
                            <td className={cn(TD, "font-black text-gray-900 uppercase")}>{r.payer}</td>
                            <td className={cn(TD, "font-black text-teal-700 uppercase group-hover:text-teal-500 transition-colors")}>{r.studentName}</td>
                            <td className={cn(TD, "text-gray-500 italic max-w-[180px] truncate")}>{r.description}</td>
                            <td className={cn(TD, "text-right font-black text-gray-900 text-base")}>+{r.amount?.toLocaleString()}đ</td>
                            <td className={cn(TD, "text-center")}>
                              <button onClick={() => setShowInvoice(r)} className="text-orange-500 hover:text-white hover:bg-orange-500 p-2.5 rounded-xl transition-all shadow-sm border border-orange-100">
                                <Printer size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 8: SỔ CHI PHÍ */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'expenses' && (() => {
          const filteredExpenses = expenses.filter(e =>
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.spender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-red-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-8 border-red-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">SỔ CHI PHÍ S1b</h2>
                  <p className="text-red-100 text-sm font-bold italic">Quản lý dòng tiền ra & Vận hành</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-white/20 px-5 py-3 rounded-2xl flex items-center shadow-inner">
                    <Search size={18} className="mr-3 text-red-200" />
                    <input type="text" placeholder="Tìm lý do, người chi..." className="bg-transparent text-white placeholder-red-200 outline-none font-bold text-sm w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => setShowAddExpenseModal(true)} className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-red-50 transition-all whitespace-nowrap active:scale-95 flex items-center">
                    <Plus size={20} className="mr-2" /> GHI CHI MỚI
                  </button>
                </div>
              </div>

              {/* Thống kê chi phí */}
              {(() => {
                const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
                const cats = ['Vận hành', 'In ấn', 'Trang thiết bị', 'Lương', 'Khác'];
                const catTotals = cats.map(cat => ({
                  name: cat,
                  total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
                }));
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="bg-red-600 text-white p-5 rounded-[24px] col-span-2 lg:col-span-1 flex flex-col justify-center shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-200">TỔNG CHI PHÍ</p>
                      <p className="text-xl font-black mt-1">{totalExp.toLocaleString()}đ</p>
                      <p className="text-[10px] text-red-200 mt-1">{expenses.length} phiếu chi</p>
                    </div>
                    {catTotals.map(cat => (
                      <div key={cat.name} className="bg-white p-4 rounded-[20px] border border-red-50 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{cat.name}</p>
                        <p className="text-base font-black text-red-600">{cat.total.toLocaleString()}đ</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {totalExp > 0 ? Math.round(cat.total / totalExp * 100) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="bg-white rounded-[40px] border border-red-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-red-50 text-red-700 border-b-2 border-red-100">
                      <tr>
                        <th className={TH}>NGÀY CT</th>
                        <th className={TH}>MÃ CT</th>
                        <th className={TH}>NGƯỜI CHI</th>
                        <th className={TH}>HẠNG MỤC</th>
                        <th className={TH} style={{minWidth: 180}}>LÝ DO CHI</th>
                        <th className={cn(TH, "text-right")}>SỐ TIỀN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExpenses.length === 0
                        ? <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">Không tìm thấy giao dịch nào...</td></tr>
                        : filteredExpenses.map((r, i) => (
                          <tr key={i} className="hover:bg-red-50/20 transition-all group">
                            <td className={cn(TD, "font-bold text-gray-500 whitespace-nowrap")}>{r.date}</td>
                            <td className={cn(TD, "font-black text-red-500 italic text-[10px]")}>{r.docNum}</td>
                            <td className={cn(TD, "font-black text-gray-900 uppercase")}>{r.spender}</td>
                            <td className={TD}><span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">{r.category}</span></td>
                            <td className={cn(TD, "text-gray-500 italic max-w-[200px] truncate")}>{r.description}</td>
                            <td className={cn(TD, "text-right font-black text-red-600 text-base")}>-{r.amount?.toLocaleString()}đ</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 9: ĐIỂM SỐ KSCL */}
        {/* ------------------------------------------------------------------ */}
        {activeScreen === 'grades' && (() => {
          const filteredGrades = grades.filter(g => gradeFilterClass === '' || g.classId === gradeFilterClass);
          return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-purple-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-8 border-purple-700">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Bảng Điểm KSCL</h2>
                  <p className="text-purple-100 text-sm font-bold italic">Theo dõi lộ trình 12 tháng — Nhập & Lưu hàng loạt</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <select className="bg-white text-gray-800 px-6 py-4 rounded-2xl font-black text-sm outline-none shadow-xl border-none cursor-pointer hover:bg-gray-50 appearance-none min-w-[160px]" value={gradeFilterClass} onChange={e => setGradeFilterClass(e.target.value)}>
                    <option value="">Lọc theo: Tất cả lớp</option>
                    {uniqueClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>Lớp {c['Mã Lớp']}</option>)}
                  </select>
                  {hasUnsavedGrades && (
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-black text-xs uppercase animate-pulse">
                      Có thay đổi chưa lưu
                    </span>
                  )}
                  <button onClick={handleSaveAllGrades} disabled={isSaving || !hasUnsavedGrades}
                    className={cn('px-8 py-4 text-white rounded-2xl font-black uppercase text-sm shadow-xl transition-all flex items-center active:scale-95',
                      isSaving ? 'bg-gray-400 cursor-not-allowed' : hasUnsavedGrades ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-2xl' : 'bg-white/30 cursor-not-allowed')}>
                    <Save size={18} className="mr-2" />
                    {isSaving ? 'Đang lưu...' : 'Lưu điểm'}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-[40px] border border-purple-100 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-50 text-purple-700 border-b-2 border-purple-100">
                      <tr>
                        <th className={cn(TH, "sticky left-0 bg-purple-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]")} style={{minWidth: 180}}>HỌC SINH</th>
                        <th className={cn(TH, "text-center whitespace-nowrap")} style={{minWidth: 80}}>LỚP</th>
                        {GRADE_COLS.map(col => (
                          <th key={col} className={cn(TH, "text-center whitespace-nowrap")} style={{minWidth: 90}}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredGrades.length === 0
                        ? <tr><td colSpan={7} className="p-12 text-center text-gray-400 font-bold italic">Không có dữ liệu...</td></tr>
                        : filteredGrades.map((g, i) => (
                          <tr key={i} className="hover:bg-purple-50/30 transition-all group">
                            <td className={cn(TD, "sticky left-0 bg-white group-hover:bg-purple-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors")}>
                              <p className="font-black text-gray-900 uppercase text-sm group-hover:text-purple-700 whitespace-nowrap">{g.studentName}</p>
                              <p className="text-[10px] text-purple-500 font-black tracking-widest">{g.studentId}</p>
                            </td>
                            <td className={cn(TD, "text-center font-bold text-gray-600 bg-gray-50/50")}>{g.classId}</td>
                            {GRADE_COLS.map((col, j) => {
                              const savedScore = String(g.scores[col] ?? '');
                              const currentVal = pendingGrades[g.studentId]?.[col] ?? savedScore;
                              const isDirty = pendingGrades[g.studentId]?.[col] !== undefined;
                              return (
                                <td key={j} className="px-2 py-3 text-center">
                                  <input
                                    value={currentVal}
                                    onChange={e => handleGradeChange(g.studentId, col, e.target.value)}
                                    className={cn(
                                      'w-14 p-2 text-center font-black text-sm rounded-lg outline-none transition-all placeholder-gray-300',
                                      isDirty
                                        ? 'bg-yellow-50 ring-2 ring-yellow-400 text-yellow-700'
                                        : 'bg-transparent hover:bg-purple-50 focus:bg-purple-100 focus:ring-2 ring-purple-400'
                                    )}
                                    placeholder="-"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {hasUnsavedGrades && (
                  <div className="p-6 bg-yellow-50 border-t border-yellow-100 flex justify-between items-center">
                    <p className="text-yellow-700 font-black text-sm">⚠️ Có thay đổi chưa được lưu. Nhấn "Lưu điểm" để đồng bộ lên hệ thống.</p>
                    <button onClick={handleSaveAllGrades} disabled={isSaving}
                      className={cn('px-8 py-3 text-white rounded-2xl font-black uppercase text-sm shadow-xl transition-all flex items-center active:scale-95', isSaving ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700')}>
                      <Save size={18} className="mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu tất cả điểm'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>

      {/* ================================================================= */}
      {/* MODALS */}
      {/* ================================================================= */}

      {/* MODAL: HỒ SƠ HỌC SINH 360° */}
      {showStudentDetail && (() => {
        const studentAtt    = attendanceLogs.filter((a: any) => a['Mã HS'] === showStudentDetail.id);
        const totalSessions = studentAtt.length;
        const presentCount  = studentAtt.filter((a: any) => a['Trạng thái'] === 'Có mặt').length;
        const lateCount     = studentAtt.filter((a: any) => a['Trạng thái'] === 'Muộn').length;
        const absentCount   = studentAtt.filter((a: any) => a['Trạng thái'] === 'Vắng').length;
        const attRate       = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in print:hidden">
            <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="bg-blue-600 p-8 text-white flex justify-between items-start shrink-0">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-3xl shadow-lg">{showStudentDetail.name ? showStudentDetail.name.charAt(0).toUpperCase() : '?'}</div>
                  <div>
                    <h3 className="text-3xl font-black uppercase leading-none tracking-tight">{showStudentDetail.name}</h3>
                    <p className="text-blue-100 text-sm mt-2 font-black tracking-widest uppercase"><span className="bg-blue-700 px-3 py-1 rounded-lg mr-2">{showStudentDetail.id}</span> Lớp: {showStudentDetail.classId}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { setShowReportCard(showStudentDetail); setShowStudentDetail(null); }} className="bg-white text-blue-600 px-5 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-50 transition-all shadow-lg flex items-center active:scale-95">
                    <FileBarChart size={16} className="mr-2" /> Phiếu báo cáo
                  </button>
                  <button onClick={() => setShowStudentDetail(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                    <h4 className="font-black text-gray-400 uppercase tracking-widest text-xs mb-4 flex items-center"><UserCheck size={16} className="mr-2" /> Cá nhân & Học thuật</h4>
                    {[
                      { l: 'Ngày sinh',           v: showStudentDetail.dob },
                      { l: 'Trường học',           v: showStudentDetail.school },
                      { l: 'Địa chỉ',             v: showStudentDetail.address },
                      { l: 'Học lực',             v: showStudentDetail.academicLevel, c: 'text-teal-600 font-black' },
                      { l: 'Mục tiêu',            v: showStudentDetail.goal },
                      { l: 'SĐT Học sinh',        v: showStudentDetail.studentPhone },
                      { l: 'Bắt đầu học',         v: showStudentDetail.startDate, c: 'text-green-600' },
                      { l: 'Dự kiến kết thúc',    v: showStudentDetail.endDate,   c: 'text-red-600' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-xs font-bold text-gray-500">{item.l}</span>
                        <span className={cn('text-sm font-black text-gray-600 text-right max-w-[150px] truncate', item.c)}>{item.v || '---'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                    <h4 className="font-black text-gray-400 uppercase tracking-widest text-xs mb-4 flex items-center"><PhoneCall size={16} className="mr-2" /> Phụ huynh & Liên hệ</h4>
                    {[
                      { l: 'Tên phụ huynh',  v: showStudentDetail.parentName },
                      { l: 'SĐT (Zalo)',     v: showStudentDetail.parentPhone, c: 'text-blue-600 font-black' },
                      { l: 'Cơ sở đào tạo', v: showStudentDetail.branch },
                      { l: 'Giáo viên',      v: showStudentDetail.teacher },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-xs font-bold text-gray-500">{item.l}</span>
                        <span className={cn('text-sm font-black text-gray-600 text-right max-w-[150px] truncate', item.c)}>{item.v || '---'}</span>
                      </div>
                    ))}
                    <button onClick={() => window.open(`https://zalo.me/${showStudentDetail.parentPhone?.replace(/\D/g, '')}`, '_blank')} className="w-full mt-4 py-3 bg-blue-100 text-blue-700 rounded-2xl font-black uppercase text-xs hover:bg-blue-200 transition-colors flex justify-center items-center"><PhoneCall size={16} className="mr-2" /> Mở Zalo Phụ Huynh</button>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4 flex flex-col">
                    <h4 className="font-black text-gray-400 uppercase tracking-widest text-xs mb-4 flex items-center"><PieChartIcon size={16} className="mr-2" /> Thống kê Chuyên cần</h4>
                    <div className="flex-1 flex flex-col justify-center items-center mb-4">
                      <div className={cn('w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4', attRate >= 80 ? 'border-green-500 text-green-600' : attRate >= 50 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600')}>
                        <span className="text-3xl font-black">{attRate}%</span>
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">TỶ LỆ ĐI HỌC</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-gray-50 p-2 rounded-xl"><p className="text-xs font-bold text-gray-500">Tổng buổi</p><p className="font-black text-gray-900">{totalSessions}</p></div>
                      <div className="bg-green-50 p-2 rounded-xl"><p className="text-xs font-bold text-green-600">Có mặt</p><p className="font-black text-green-700">{presentCount}</p></div>
                      <div className="bg-amber-50 p-2 rounded-xl"><p className="text-xs font-bold text-amber-600">Muộn</p><p className="font-black text-amber-700">{lateCount}</p></div>
                      <div className="bg-red-50 p-2 rounded-xl"><p className="text-xs font-bold text-red-600">Vắng</p><p className="font-black text-red-700">{absentCount}</p></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                  <h4 className="font-black text-gray-400 uppercase tracking-widest text-xs mb-4 flex items-center"><History size={16} className="mr-2" /> Lịch sử nộp học phí</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-gray-400 font-bold uppercase border-b"><tr><th className="pb-2">Ngày CT</th><th className="pb-2">Diễn giải</th><th className="pb-2 text-right">Số tiền</th></tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {payments.filter(p => p.studentId === showStudentDetail.id).length === 0
                          ? <tr><td colSpan={3} className="py-4 text-center text-gray-400 italic">Chưa có dữ liệu đóng học phí.</td></tr>
                          : payments.filter(p => p.studentId === showStudentDetail.id).map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="py-3 font-bold">{p.date}</td>
                              <td className="py-3 italic truncate max-w-[300px]">{p.description}</td>
                              <td className="py-3 text-right font-black text-orange-600">+{p.amount?.toLocaleString()}đ</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: PHIẾU BÁO CÁO HỌC TẬP */}
      {showReportCard && (() => {
        const studentGrades = grades.find(g => g.studentId === showReportCard.id)?.scores || {};
        const studentAtt    = attendanceLogs.filter((a: any) => a['Mã HS'] === showReportCard.id);
        const totalSessions = studentAtt.length;
        const presentCount  = studentAtt.filter((a: any) => a['Trạng thái'] === 'Có mặt').length;
        const lateCount     = studentAtt.filter((a: any) => a['Trạng thái'] === 'Muộn').length;
        const absentCount   = studentAtt.filter((a: any) => a['Trạng thái'] === 'Vắng').length;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative flex flex-col my-4 print:shadow-none print:my-0 print:w-full">
              <div id="report-print-area" className="p-8 pb-8 relative bg-white rounded-[32px] print:rounded-none">
                <div className="absolute top-0 left-0 w-full h-3 bg-purple-600 rounded-t-[32px] print:rounded-none"></div>
                <div className="text-center mb-6 mt-2">
                  <Award className="mx-auto text-purple-600 mb-2" size={40} />
                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Lớp Toán NK</h4>
                  <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">Phiếu Báo Cáo Học Tập</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl mb-6 border border-purple-100">
                  <p className="text-center font-black text-purple-700 text-lg uppercase">{showReportCard.name}</p>
                  <p className="text-center text-xs font-bold text-gray-500 mt-1">Mã HS: {showReportCard.id} • Lớp: {showReportCard.classId}</p>
                </div>
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">1. Chuyên cần & Ý thức</h5>
                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                  <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[9px] font-bold text-gray-500">Tổng buổi</p><p className="font-black text-gray-900">{totalSessions}</p></div>
                  <div className="bg-green-50 p-2 rounded-xl"><p className="text-[9px] font-bold text-green-600">Có mặt</p><p className="font-black text-green-700">{presentCount}</p></div>
                  <div className="bg-amber-50 p-2 rounded-xl"><p className="text-[9px] font-bold text-amber-600">Muộn</p><p className="font-black text-amber-700">{lateCount}</p></div>
                  <div className="bg-red-50 p-2 rounded-xl"><p className="text-[9px] font-bold text-red-600">Vắng</p><p className="font-black text-red-700">{absentCount}</p></div>
                </div>
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">2. Kết quả Khảo sát (2026)</h5>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-6">
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = `Tháng ${i + 1}`;
                    const s = studentGrades[m] ?? '-';
                    return (
                      <div key={i} className="flex justify-between items-center border-b border-dashed border-gray-200 py-1.5">
                        <span className="text-[10px] font-bold text-gray-500">{m}</span>
                        <span className={cn('text-xs font-black', s !== '-' && s !== '' ? 'text-purple-600' : 'text-gray-300')}>{s !== '' ? s : '-'}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-end italic mt-8">
                  <div className="text-[8px] text-gray-400 max-w-[150px] leading-tight">* Dữ liệu được trích xuất tự động từ hệ thống quản lý Lớp Toán NK.</div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-[9px] font-black text-gray-800 uppercase mb-4">Giáo viên phụ trách</p>
                    <p className="text-sm font-bold text-gray-700 italic">{showReportCard.teacher || '---'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 shrink-0 print:hidden flex flex-col gap-2">
                <button onClick={() => window.print()} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center hover:bg-purple-700 transition-all active:scale-95">
                  <Printer className="mr-2" size={16} /> In / Xuất PDF Gửi Phụ Huynh
                </button>
                <button onClick={() => setShowReportCard(null)} className="w-full text-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 mt-2">Đóng lại</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: CHI TIẾT NHẬT KÝ */}
      {showDiaryDetail && (() => {
        const log = showDiaryDetail;
        const atts = log.attendanceList || [];
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in print:hidden">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="bg-indigo-600 p-8 text-white flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Chi tiết buổi dạy</h3>
                  <p className="text-indigo-100 text-sm font-bold mt-1">{log.date} — Lớp {log.classId} — {log.teacherName}</p>
                </div>
                <button onClick={() => setShowDiaryDetail(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={22} /></button>
              </div>
              <div className="p-8 overflow-y-auto space-y-6">
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl text-center"><p className="text-xs font-bold text-green-600 uppercase tracking-wider">Có mặt</p><p className="text-3xl font-black text-green-700">{log.present}</p></div>
                  <div className="bg-red-50 p-4 rounded-2xl text-center"><p className="text-xs font-bold text-red-600 uppercase tracking-wider">Vắng</p><p className="text-3xl font-black text-red-700">{log.absent}</p></div>
                  <div className="bg-amber-50 p-4 rounded-2xl text-center"><p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Muộn</p><p className="text-3xl font-black text-amber-700">{log.late}</p></div>
                </div>
                {/* Nội dung */}
                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Nội dung bài dạy</p>
                  <p className="text-gray-800 font-bold text-sm leading-relaxed whitespace-pre-wrap">{log.content}</p>
                </div>
                {/* Bài tập */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bài tập về nhà</p>
                  <p className="text-gray-800 font-bold text-sm leading-relaxed whitespace-pre-wrap">{log.homework}</p>
                </div>
                {/* Danh sách điểm danh */}
                {atts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Danh sách điểm danh</p>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left font-black text-xs uppercase">Học sinh</th>
                            <th className="px-4 py-3 text-left font-black text-xs uppercase">Mã HS</th>
                            <th className="px-4 py-3 text-center font-black text-xs uppercase">Trạng thái</th>
                            <th className="px-4 py-3 text-left font-black text-xs uppercase">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {atts.map((a: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-black text-gray-800 uppercase text-sm">{a['Tên HS'] || a['tenHS'] || '---'}</td>
                              <td className="px-4 py-3 text-indigo-600 font-black text-xs">{a['Mã HS'] || a['maHS'] || '---'}</td>
                              <td className="px-4 py-3 text-center">
                                {a['Trạng thái'] === 'Có mặt' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">✓ Có mặt</span>}
                                {a['Trạng thái'] === 'Vắng'   && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">✗ Vắng</span>}
                                {a['Trạng thái'] === 'Muộn'   && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">⏰ Muộn</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 italic text-sm">{a['Ghi chú'] || a['ghiChu'] || '---'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: CHI TIẾT TÀI CHÍNH */}
      {showFinanceDetail && (() => {
        const s = showFinanceDetail;
        const studentPayments = payments.filter(p => p.studentId === s.id);
        const studentAtt = attendanceLogs.filter((a: any) => a['Mã HS'] === s.id);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in print:hidden">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="bg-emerald-600 p-8 text-white flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Chi tiết học phí</h3>
                  <p className="text-emerald-100 text-sm font-bold mt-1">{s.name} — {s.id} — Lớp {s.classId}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setShowFinanceDetail(null); setEditingStudent(s); setFormHS(s); setShowAddHSModal(true); }}
                    className="bg-white text-emerald-700 px-4 py-2.5 rounded-2xl font-black text-xs uppercase hover:bg-emerald-50 transition-all flex items-center">
                    <Edit3 size={14} className="mr-1.5" /> Sửa hồ sơ
                  </button>
                  <button onClick={() => setShowFinanceDetail(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={22} /></button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto space-y-6">
                {/* Thông tin học sinh */}
                <div className="grid grid-cols-2 gap-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  {[
                    { l: 'Giáo viên',    v: s.teacher },
                    { l: 'Học lực',      v: s.academicLevel },
                    { l: 'SĐT PH',       v: s.parentPhone },
                    { l: 'Tên PH',       v: s.parentName },
                    { l: 'Ngày bắt đầu', v: s.startDate },
                    { l: 'Tổng buổi HĐ',v: `${studentAtt.length} buổi` },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-emerald-100 pb-2">
                      <span className="text-xs font-bold text-emerald-600">{item.l}</span>
                      <span className="text-sm font-black text-gray-700">{item.v || '---'}</span>
                    </div>
                  ))}
                </div>
                {/* Trạng thái 12 tháng */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Trạng thái học phí 2026</p>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const paid = checkPaidMonth(s.id, i + 1);
                      return (
                        <div key={i} className={cn('p-3 rounded-xl text-center', paid ? 'bg-green-100 border border-green-200' : 'bg-gray-50 border border-gray-100')}>
                          <p className={cn('text-[10px] font-black uppercase', paid ? 'text-green-600' : 'text-gray-400')}>T.{i + 1}</p>
                          <p className="text-lg">{paid ? '✅' : '⬜'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Lịch sử nộp phí */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lịch sử nộp học phí ({studentPayments.length} lần)</p>
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-black text-xs uppercase">Ngày CT</th>
                          <th className="px-4 py-3 text-left font-black text-xs uppercase">Diễn giải</th>
                          <th className="px-4 py-3 text-left font-black text-xs uppercase">Người nộp</th>
                          <th className="px-4 py-3 text-right font-black text-xs uppercase">Số tiền</th>
                          <th className="px-4 py-3 text-center font-black text-xs uppercase">Biên lai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {studentPayments.length === 0
                          ? <tr><td colSpan={5} className="py-6 text-center text-gray-400 italic">Chưa có lịch sử nộp phí.</td></tr>
                          : studentPayments.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-500 whitespace-nowrap text-xs">{p.date}</td>
                              <td className="px-4 py-3 italic text-gray-600 text-xs">{p.description}</td>
                              <td className="px-4 py-3 font-black text-gray-800 uppercase text-xs">{p.payer}</td>
                              <td className="px-4 py-3 text-right font-black text-orange-600">+{p.amount?.toLocaleString()}đ</td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => { setShowFinanceDetail(null); setShowInvoice(p); }}
                                  className="text-orange-500 hover:bg-orange-100 p-1.5 rounded-lg transition-all">
                                  <Printer size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: THÊM / SỬA LỚP HỌC */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in print:hidden">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-cyan-700 uppercase italic tracking-tighter">
                {editingClass ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button onClick={() => { setShowAddClassModal(false); setEditingClass(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              {[
                { n: 'Mã Lớp',    l: 'Mã lớp (*)' },
                { n: 'Giáo viên', l: 'Giáo viên phụ trách' },
                { n: 'Khối',      l: 'Khối lớp (vd: 8, 9)' },
                { n: 'Thứ',       l: 'Thứ học (vd: Thứ 2, Thứ 5)' },
                { n: 'Giờ học',   l: 'Giờ học (vd: 18:00–19:30)' },
                { n: 'Cơ sở',    l: 'Cơ sở' },
              ].map(f => (
                <div key={f.n} className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.l}</p>
                  <input
                    value={formClass[f.n] || ''}
                    readOnly={!!(editingClass && f.n === 'Mã Lớp')}
                    className={cn('w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-cyan-500 text-sm font-bold text-gray-800 shadow-inner transition-all', editingClass && f.n === 'Mã Lớp' && 'opacity-50 cursor-not-allowed')}
                    onChange={e => setFormClass({ ...formClass, [f.n]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button onClick={() => { setShowAddClassModal(false); setEditingClass(null); }} className="flex-1 py-4 bg-gray-100 rounded-3xl font-black uppercase text-xs text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
              <button onClick={handleSaveClass} disabled={isSaving} className={cn('flex-1 py-4 text-white rounded-3xl font-black uppercase text-xs shadow-xl transition-all active:scale-95', isSaving ? 'bg-gray-400' : 'bg-cyan-600 hover:bg-cyan-700')}>
                {isSaving ? 'Đang lưu...' : editingClass ? 'Cập nhật lớp' : 'Thêm lớp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA HỌC SINH */}
      {showAddHSModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in print:hidden">
          <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl p-12 space-y-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-black text-blue-600 uppercase italic tracking-tighter">
                {editingStudent ? 'Cập nhật hồ sơ học sinh' : 'Hồ sơ học sinh NK mới'}
              </h3>
              <button onClick={() => setShowAddHSModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { n: 'id',            l: 'Mã học sinh (*)' },
                { n: 'name',          l: 'Họ tên học sinh' },
                { n: 'dob',           l: 'Ngày sinh' },
                { n: 'branch',        l: 'Cơ sở' },
                { n: 'grade',         l: 'Khối lớp' },
                { n: 'school',        l: 'Trường học' },
                { n: 'teacher',       l: 'Giáo viên' },
                { n: 'classId',       l: 'Mã lớp tham chiếu' },
                { n: 'parentName',    l: 'Tên phụ huynh' },
                { n: 'parentPhone',   l: 'SĐT Phụ huynh' },
                { n: 'studentPhone',  l: 'SĐT Học sinh' },
                { n: 'address',       l: 'Địa chỉ' },
                { n: 'academicLevel', l: 'Học lực' },
                { n: 'goal',          l: 'Mục tiêu' },
                { n: 'supportNeeded', l: 'Cần hỗ trợ' },
                { n: 'startDate',     l: 'Ngày bắt đầu (DD/MM/YYYY)' },
                { n: 'endDate',       l: 'Ngày kết thúc (DD/MM/YYYY)' },
              ].map(f => (
                <div key={f.n} className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.l}</p>
                  <input value={formHS[f.n] || ''} readOnly={!!(editingStudent && f.n === 'id')}
                    className={cn('w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-gray-800 shadow-inner transition-all', editingStudent && f.n === 'id' && 'opacity-50 cursor-not-allowed')}
                    onChange={e => setFormHS({ ...formHS, [f.n]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex space-x-4 pt-6 border-t border-gray-100">
              <button onClick={() => setShowAddHSModal(false)} className="flex-1 py-4 bg-gray-100 rounded-3xl font-black uppercase text-xs tracking-widest text-gray-500 hover:bg-gray-200 transition-all">Hủy bỏ</button>
              <button onClick={handleSaveHS} disabled={isSaving} className={cn('flex-1 py-4 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95', isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700')}>
                {isSaving ? 'Đang xử lý...' : 'Lưu vào hệ thống'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GHI THU PHÍ */}
      {showAddFeeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-10 space-y-6 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-orange-600 uppercase border-b-2 border-orange-100 pb-4 italic tracking-tighter">Ghi phiếu thu S1a</h3>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Ngày ghi chứng từ</p>
                <input type="date" value={formFee.date} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-base outline-none shadow-inner focus:ring-2 ring-orange-500 transition-all" onChange={e => setFormFee({ ...formFee, date: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Người nộp</p>
                <input placeholder="Tên phụ huynh nộp phí..." className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm outline-none font-bold shadow-inner focus:ring-2 ring-orange-500 transition-all" onChange={e => setFormFee({ ...formFee, payer: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Học sinh thụ hưởng</p>
                <input
                  list="student-search-list-fee"
                  placeholder="Gõ tên hoặc mã HS..."
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-sm outline-none shadow-inner text-teal-700 focus:ring-2 ring-orange-500 transition-all"
                  value={formFee._displayHS || ''}
                  onChange={e => {
                    const val         = e.target.value;
                    const extractedId = val.includes(' - ') ? val.split(' - ')[0] : val;
                    setFormFee({ ...formFee, maHS: extractedId, _displayHS: val });
                  }}
                />
                <datalist id="student-search-list-fee">
                  {students.map(s => <option key={s.id} value={`${s.id} - ${s.name}`} />)}
                </datalist>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Số tiền đóng (VNĐ)</p>
                <input type="number" placeholder="Ví dụ: 600000" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-orange-600 text-xl outline-none shadow-inner focus:ring-2 ring-orange-500 transition-all placeholder-orange-200" onChange={e => setFormFee({ ...formFee, soTien: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Diễn giải</p>
                <input placeholder="Học phí khóa học / Tháng..." className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm outline-none font-bold shadow-inner focus:ring-2 ring-orange-500 transition-all" onChange={e => setFormFee({ ...formFee, description: e.target.value })} />
              </div>
            </div>
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAddFeeModal(false)} className="flex-1 py-4 bg-gray-100 rounded-3xl font-black uppercase text-xs text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
              <button onClick={handleSaveFee} disabled={isSaving} className={cn('flex-1 py-4 text-white rounded-3xl font-black uppercase text-xs shadow-xl transition-all active:scale-95', isSaving ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700')}>
                {isSaving ? 'Đang lưu...' : 'Ghi sổ thu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GHI CHI PHÍ */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-10 space-y-6 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-red-600 uppercase border-b-2 border-red-100 pb-4 italic tracking-tighter">Ghi phiếu chi S1b</h3>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Ngày chi</p>
                <input type="date" value={formExpense.date} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-base outline-none shadow-inner focus:ring-2 ring-red-500 transition-all" onChange={e => setFormExpense({ ...formExpense, date: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Người chi</p>
                <input placeholder="Ai là người cầm tiền chi?..." className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm outline-none font-bold shadow-inner focus:ring-2 ring-red-500 transition-all" onChange={e => setFormExpense({ ...formExpense, spender: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Hạng mục</p>
                <select className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm outline-none font-black shadow-inner focus:ring-2 ring-red-500 transition-all text-red-700 appearance-none" value={formExpense.category || 'Vận hành'} onChange={e => setFormExpense({ ...formExpense, category: e.target.value })}>
                  <option value="Vận hành">Phí vận hành (Mặt bằng, điện nước)</option>
                  <option value="In ấn">In ấn tài liệu, giáo trình</option>
                  <option value="Trang thiết bị">Mua sắm trang thiết bị</option>
                  <option value="Lương">Lương giáo viên, trợ giảng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Số tiền chi (VNĐ)</p>
                <input type="number" placeholder="Ví dụ: 150000" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-red-600 text-xl outline-none shadow-inner focus:ring-2 ring-red-500 transition-all placeholder-red-200" onChange={e => setFormExpense({ ...formExpense, amount: e.target.value })} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest ml-1">Lý do chi chi tiết</p>
                <input placeholder="Mua bút viết, in đề thi lớp 9..." className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm outline-none font-bold shadow-inner focus:ring-2 ring-red-500 transition-all" onChange={e => setFormExpense({ ...formExpense, description: e.target.value })} />
              </div>
            </div>
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAddExpenseModal(false)} className="flex-1 py-4 bg-gray-100 rounded-3xl font-black uppercase text-xs text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
              <button onClick={handleSaveExpense} disabled={isSaving} className={cn('flex-1 py-4 text-white rounded-3xl font-black uppercase text-xs shadow-xl transition-all active:scale-95', isSaving ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700')}>
                {isSaving ? 'Đang lưu...' : 'Ghi sổ chi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BIÊN LAI */}
      {showInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto print:p-0 print:bg-transparent">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative flex flex-col my-4 print:shadow-none print:my-0 print:w-full">
            <div id="invoice-print-area" className="p-8 pb-8 relative bg-white rounded-[32px] print:rounded-none print:p-6">
              <div className="absolute top-0 left-0 w-full h-3 bg-orange-600 rounded-t-[32px] print:rounded-none"></div>
              <div className="text-center mb-4 mt-2">
                <GraduationCap className="mx-auto text-orange-600 mb-1" size={36} />
                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Lớp Toán NK</h4>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">Biên lai thu tiền điện tử</p>
              </div>
              <div className="space-y-2 mb-6 bg-orange-50 p-5 rounded-2xl border border-orange-100">
                {[
                  { l: 'Ngày lập',           v: showInvoice.date },
                  { l: 'Mã chứng từ',        v: showInvoice.docNum,                        c: 'text-orange-600 font-bold italic' },
                  { l: 'Mã học sinh',        v: showInvoice.studentId },
                  { l: 'Học sinh thụ hưởng', v: showInvoice.studentName.toUpperCase(),      c: 'text-sm text-teal-700 font-bold' },
                  { l: 'Người nộp tiền',     v: showInvoice.payer       || '---' },
                  { l: 'Nội dung',           v: showInvoice.description || '---' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-orange-200/40 pb-1.5 gap-4">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest shrink-0 mt-1">{item.l}</span>
                    <span className={cn('text-sm font-medium text-gray-900 text-right break-words max-w-[200px]', item.c)}>{item.v || '---'}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Số tiền thu</span>
                  <span className="text-xl font-black text-orange-600 tracking-tighter">{showInvoice.amount?.toLocaleString()}đ</span>
                </div>
              </div>
              <div className="flex justify-between items-end italic">
                <div className="text-[8px] text-gray-400 max-w-[170px] leading-tight">* Biên lai điện tử có giá trị xác nhận học phí tại hệ thống Lớp Toán NK.</div>
                <div className="text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-gray-800 uppercase mb-4">Người lập phiếu</p>
                  {(() => {
                    const s = students.find(st => st.id === showInvoice.studentId);
                    const t = s?.teacher || '';
                    const name = t.toLowerCase().includes('nhân') ? 'Lê Đức Nhân' : t.toLowerCase().includes('kiên') ? 'Nguyễn Thị Kiên' : t || '---';
                    return <p className="text-sm font-bold text-gray-700 italic">{name}</p>;
                  })()}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 shrink-0 print:hidden flex flex-col gap-2 border-t border-gray-50 mt-2">
              <button onClick={() => window.print()} className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center hover:bg-orange-700 active:scale-95 transition-all">
                <Printer className="mr-2" size={16} /> In màu / Xuất PDF (1 Trang)
              </button>
              <button onClick={() => setShowInvoice(null)} className="w-full text-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 py-2">Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center mt-12 pb-12 opacity-30 tracking-[0.4em] font-black uppercase text-[10px] text-gray-500 print:hidden">
        LỚP TOÁN NK • 2026 • HỆ THỐNG QUẢN LÝ TRUNG TÂM PRO v13
      </footer>

    </div>
  );
}
