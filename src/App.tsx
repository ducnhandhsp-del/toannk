import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  SCRIPT_URL_DEFAULT, FEE_DEFAULT, IPP,
  formatDate, parseDMY, parseMonthFromDesc, loadSettings,
  CA_DAY_DEFAULT, TEACHER_LIST_DEFAULT,
  fetchWithTimeout, FETCH_TIMEOUT, sanitizeObject, sanitizeAttendance,
  parseCaDayToHours, resolveTeacher, isStudentActive,
} from './helpers';

import type {
  Screen,
  Student, Payment, Expense,
  SummaryData, DeleteTarget,
  Teacher, LeaveRequest, Material,
} from './types';

import { Sidebar, MobileHeader, BottomNav } from './Layout';
import { ErrorBoundary } from './AppComponents';
import CommandPalette from './CommandPalette';

import { useCommands } from './useCommands';

import { StudentModal, StudentDetailModal } from './ModalStudent';
import { ClassModal, BulkTransferModal } from './ModalClass';
import { FABModal, InvoiceModal, FinanceDetailModal } from './ModalFinance';
import { DiaryModal, DiaryDetailModal } from './ModalDiary';
import { DeleteModal } from './UIComponents';

import OverviewTab    from './OverviewTab';
import OperationsTab  from './OperationsTab';
import StudentsTab    from './StudentsTab';
import ClassesTab     from './ClassesTab';
import FinanceTab     from './FinanceTab';
import SettingsTab    from './SettingsTab';
import TeachersTab    from './TeachersTab';
import MaterialsTab   from './MaterialsTab';
import ReportsTab     from './ReportsTab';

export default function App() {

  
  const [screen,  setScreen]  = useState<Screen>('overview');
  

  
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [fabInitialTab, setFabInitialTab] = useState<'income'|'expense'>('income');
  const [students,  setStudents]  = useState<Student[]>([]);
  const [uClasses,  setUClasses]  = useState<any[]>([]);
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [expenses,  setExpenses]  = useState<Expense[]>([]);
  const [tlogs,     setTlogs]     = useState<any[]>([]);
  const [summary,   setSummary]   = useState<SummaryData | null>(null);
  const [gsOk,      setGsOk]      = useState<boolean | null>(null);

  
  const [teachers,      setTeachers]      = useState<Teacher[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [materials,     setMaterials]     = useState<Material[]>([]);

  
  const loadingRef = useRef(false);
  const silentRef  = useRef(false);
  const savingRef  = useRef(false);

  
  const [cmdOpen, setCmdOpen] = useState(false);

  
  const _savedRef = useRef(loadSettings());
  const [baseTuition,  setBaseTuition]  = useState<number>(_savedRef.current?.baseTuition  ?? FEE_DEFAULT);
  const [schoolYear,   setSchoolYear]   = useState<string>(_savedRef.current?.schoolYear   ?? '2025-2026');
  const [zaloTpl,      setZaloTpl]      = useState<string>(_savedRef.current?.zaloTpl ?? 'Chào anh/chị, học phí tháng [Thang] của cháu [Ten] là [SoTien]. Xin cảm ơn.');
  const [scriptUrl,    setScriptUrl]    = useState<string>(_savedRef.current?.scriptUrl    ?? SCRIPT_URL_DEFAULT);
  const [centerName,   setCenterName]   = useState<string>(_savedRef.current?.centerName   ?? 'Lớp Toán NK');
  const [teacher,      setTeacher]      = useState<string>(_savedRef.current?.teacher      ?? 'LÊ ĐỨC NHÂN');
  const [addr1,        setAddr1]        = useState<string>(_savedRef.current?.addr1        ?? '15/80 Đào Tấn');
  const [addr2,        setAddr2]        = useState<string>(_savedRef.current?.addr2        ?? '30 Nguyễn Quang Bích');
  const [phone,        setPhone]        = useState<string>(_savedRef.current?.phone        ?? '0383634949');
  const [bankId,       setBankId]       = useState<string>(_savedRef.current?.bankId       ?? 'VCB');
  const [accountNo,    setAccountNo]    = useState<string>(_savedRef.current?.accountNo    ?? '1234567890');
  const [accountName,  setAccountName]  = useState<string>(_savedRef.current?.accountName  ?? 'LOP TOAN NK');
  const [accentColor,  setAccentColor]  = useState<'teal'|'indigo'|'rose'|'orange'>(_savedRef.current?.accentColor ?? 'teal');
  const [showId,       setShowId]       = useState<boolean>(_savedRef.current?.showId       ?? true);
  const [hideInactive, setHideInactive] = useState<boolean>(_savedRef.current?.hideInactive ?? false);
  const [caDayOptions, setCaDayOptions] = useState<string[]>(_savedRef.current?.caDayOptions ?? CA_DAY_DEFAULT);
  const [teacherList,  setTeacherList]  = useState<string[]>(_savedRef.current?.teacherList  ?? TEACHER_LIST_DEFAULT);

  
  const [showStudent,  setShowStudent]  = useState(false);
  const [editStudent,  setEditStudent]  = useState<Student | null>(null);
  const [showClass,    setShowClass]    = useState(false);
  const [editClass,    setEditClass]    = useState<any>(null);
  const [showFAB,      setShowFAB]      = useState(false);
  const [editPayment,  setEditPayment]  = useState<Payment | null>(null);
  const [editExpense,  setEditExpense]  = useState<Expense | null>(null);
  const [showDiary,    setShowDiary]    = useState(false);
  const [editDiary,    setEditDiary]    = useState<any>(null);
  const [showBulkXfer, setShowBulkXfer] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<Student[]>([]);
  const [preselectedDiaryClass, setPreselectedDiaryClass] = useState('');
  const [vStudent,  setVStudent]  = useState<Student | null>(null);
  const [vDiary,    setVDiary]    = useState<any>(null);
  const [vInvoice,  setVInvoice]  = useState<Payment | null>(null);
  const [vFinance,  setVFinance]  = useState<Student | null>(null);
  const [delTarget, setDelTarget] = useState<DeleteTarget | null>(null);

  
  const [qS,          setQS]    = useState('');
  const [qF,          setQF]    = useState('');
  const [qD,          setQD]    = useState('');
  const [fCls,        setFCls]  = useState('');
  const [dCls,        setDCls]  = useState('');
  const [fMo,         setFMo]   = useState(`${(new Date().getMonth()+1).toString().padStart(2,'0')}/${new Date().getFullYear()}`);
  const [fTch,        setFTch]  = useState('');
  const [fFC,         setFFC]   = useState('');
  const [fSt,         setFSt]   = useState('unpaid');
  const [qCls,        setQCls]  = useState('');
  const [fClsTeacher, setFClsTeacher] = useState('');
  const [pgS, setPgS] = useState(1);
  const [pgF, setPgF] = useState(1);
  const [pgD, setPgD] = useState(1);

  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!silentRef.current) setLoading(true);

    try {
      const res = await fetchWithTimeout(`${scriptUrl}?t=${Date.now()}`, { method: 'GET', redirect: 'follow', timeout: FETCH_TIMEOUT });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      const hs: Student[] = (data.students || []).map((s: any) => ({
        id:             String(s['Mã HS'] || ''),
        name:           String(s['Họ và tên học sinh'] || '---'),
        dob:            String(s['Ngày tháng năm sinh'] || ''),
        branch:         String(s['Cơ sở học tập'] || ''),
        grade:          String(s['Khối lớp hiện tại'] || ''),
        school:         String(s['Trường đang học'] || ''),
        teacher:        resolveTeacher(s['Giáo viên trực tiếp giảng dạy'], teacherList),
        parentName:     String(s['Họ và tên phụ huynh'] || ''),
        parentPhone:    String(s['Số điện thoại phụ huynh (Zalo)'] || ''),
        studentPhone:   String(s['Số điện thoại học sinh'] || ''),
        address:        String(s['Địa chỉ thường trú'] || ''),
        academicLevel:  String(s['Học lực môn Toán hiện tại'] || ''),
        goal:           String(s['Mục tiêu điểm số học kỳ tới'] || ''),
        supportNeeded:  String(s['Kiến thức em cần hỗ trợ thêm'] || ''),
        classId:        String(s['Mã Lớp'] || ''),
        startDate:      String(s['Ngày bắt đầu'] || ''),
        endDate:        String(s['Ngày kết thúc'] || ''),
        status:         String(s['Trạng thái'] || ''),
      }));

      const py: Payment[] = (data.payments || []).map((p: any, i: number) => {
        const rawDate = String(p['Ngày CT'] || '').replace(/\//g, '').replace(/\s.*/,'');
        const maHS    = String(p['Mã HS'] || 'X').trim();
        const fallbackId = `PT-${rawDate || '0'}-${maHS}-${i}`;
        const d = p['Số hiệu CT'] || fallbackId;
        return {
          id: String(d), date: String(p['Ngày CT'] || ''), docNum: String(d),
          studentId: String(p['Mã HS'] || ''),
          studentName: hs.find(s => s.id === String(p['Mã HS'] || ''))?.name || '?',
          payer: String(p['Người thanh toán'] || '---'), method: String(p['Hình thức'] || '---'),
          description: String(p['Diễn giải'] || ''), amount: Number(p['Số tiền']) || 0,
          note: String(p['Ghi chú'] || ''),
        };
      });

      const ex: Expense[] = (data.expenses || []).map((e: any, i: number) => {
        const rawDate = String(e['Ngày CT'] || '').replace(/\//g, '').replace(/\s.*/,'');
        const desc    = String(e['Nội dung chi'] || '').slice(0, 6).replace(/\s/g, '');
        const fallbackId = `PC-${rawDate || '0'}-${desc || 'X'}-${i}`;
        const d = e['Số hiệu CT'] || fallbackId;
        return {
          id: String(d), date: String(e['Ngày CT'] || ''), docNum: String(d),
          description: String(e['Nội dung chi'] || ''), category: String(e['Hạng mục'] || ''),
          amount: Number(e['Số tiền']) || 0, spender: String(e['Người chi'] || ''),
        };
      });

      const now = new Date();
      const cmap: Record<string, any> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = `${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`;
        cmap[k] = { month: k, Thu: 0, Chi: 0 };
      }
      const toChartKey = (raw: string): string | null => {
        if (!raw) return null;
        let s = raw.includes(' - ') ? raw.split(' - ')[1] : raw;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) { const p = s.split('/'); return `${parseInt(p[1])}/${p[2].slice(2)}`; }
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const d = new Date(s.slice(0,10)); if (!isNaN(d.getTime())) return `${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`; }
        return null;
      };
      py.forEach(p => { const k = toChartKey(p.date); if (k && cmap[k]) cmap[k].Thu += p.amount/1e6; });
      ex.forEach(e => { const k = toChartKey(e.date); if (k && cmap[k]) cmap[k].Chi += e.amount/1e6; });

      const clsMap = new Map<string, any>();
      (data.classes || []).forEach((c: any) => {
        if (!clsMap.has(c['Mã Lớp'])) clsMap.set(c['Mã Lớp'], { ...c, 'Giáo viên': resolveTeacher(c['Giáo viên'], teacherList) });
      });

      const logs = (data.teachingLogs || []).map((l: any) => {
        const dt = l['Ngày']; const ci = l['Mã Lớp']; const caVal = String(l['Ca dạy'] || '');
        const dtTs = parseDMY(dt);
        const atts = (data.attendanceLogs || []).filter((a: any) => {
          if (parseDMY(a['Ngày']) !== dtTs) return false;
          if (a['Mã Lớp'] !== ci) return false;
          if (caVal && a['Ca dạy'] && a['Ca dạy'] !== caVal) return false;
          return true;
        });
        return {
          rawDate: String(dt || ''), date: String(dt || ''),
          originalDate: String(dt || ''), originalClassId: String(ci || ''), originalCaDay: String(l['Ca dạy'] || ''),
          classId: String(ci || ''), content: String(l['Nội dung bài dạy'] || '---'),
          homework: String(l['Bài tập về nhà'] || '---'), teacherNote: String(l['Ghi chú GV'] || ''),
          teacherName: String(l['Giáo viên'] || '---'), caDay: String(l['Ca dạy'] || ''),
          present: atts.filter((a: any) => a['Trạng thái'] === 'Có mặt').length,
          absent:  atts.filter((a: any) => a['Trạng thái'] === 'Vắng').length,
          late:    atts.filter((a: any) => a['Trạng thái'] === 'Muộn').length,
          attendanceList: atts,
        };
      }).sort((a: any, b: any) => parseDMY(b.date) - parseDMY(a.date));

      const newTeachers = (data.teachers || []).map((t: any) => ({ ...t, classes: t.classes || [] }));
      const newLeaves   = (data.leaveRequests || []).map((r: any) => ({ ...r }));
      const newMaterials= (data.materials || []).map((m: any) => ({ ...m, tags: m.tags || [] }));

      setStudents(hs); setPayments(py); setExpenses(ex);
      setUClasses(Array.from(clsMap.values())); setTlogs(logs);
      if (newTeachers.length > 0) setTeachers(newTeachers);
      if (newLeaves.length > 0)   setLeaveRequests(newLeaves);
      if (newMaterials.length > 0) setMaterials(newMaterials);
      setSummary({ totalRevenue: py.reduce((s,p)=>s+p.amount,0), totalExpense: ex.reduce((s,e)=>s+e.amount,0), chart: Object.values(cmap) });
      setGsOk(true);
      try { localStorage.setItem('ltn-cache', JSON.stringify({ hs, py, ex, uCls: Array.from(clsMap.values()), logs })); } catch {}
    } catch (err: any) {
      setGsOk(false);
      toast.error(err.message?.includes('timeout') ? '⏱️ Kết nối quá lâu. Đang dùng cache.' : '⚠️ Lỗi tải dữ liệu. Đang dùng cache.');
      try {
        const c = localStorage.getItem('ltn-cache');
        if (c) {
          const { hs, py, ex, uCls, logs } = JSON.parse(c);
          setStudents(hs||[]); setPayments(py||[]); setExpenses(ex||[]); setUClasses(uCls||[]); setTlogs(logs||[]);
          setSummary({ totalRevenue: (py||[]).reduce((s:number,p:any)=>s+p.amount,0), totalExpense: (ex||[]).reduce((s:number,e:any)=>s+e.amount,0), chart: [] });
        }
      } catch {}
    } finally {
      setLoading(false); loadingRef.current = false; silentRef.current = false;
    }
  }, [scriptUrl, teacherList]);

  useEffect(() => { loadData(); }, [loadData]);

  const lastLoadTimeRef = useRef(0);
  useEffect(() => {
    const reload = () => {
      if (Date.now() - lastLoadTimeRef.current > 2 * 60 * 1000) {
        silentRef.current = true; loadData(); lastLoadTimeRef.current = Date.now();
      }
    };
    const handleOnline = () => { silentRef.current = true; loadData(); lastLoadTimeRef.current = Date.now(); };
    const handleVis = () => { if (document.visibilityState === 'visible' && navigator.onLine) reload(); };
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVis);
    const iv = setInterval(() => { if (document.visibilityState === 'visible' && navigator.onLine) reload(); }, 5*60*1000);
    return () => { window.removeEventListener('online', handleOnline); document.removeEventListener('visibilitychange', handleVis); clearInterval(iv); };
  }, [loadData]);

  
  const curMo = new Date().getMonth()+1;
  const curYr = new Date().getFullYear();

  const paidMap = useMemo(() => {
    const m = new Map<string, Set<string>>();
    payments.forEach(p => {
      if (!m.has(p.studentId)) m.set(p.studentId, new Set());
      let mo: number|null = (p as any).thangHP ? Number((p as any).thangHP) : null;
      if (!mo) mo = parseMonthFromDesc(p.description);
      if (!mo || mo < 1 || mo > 12) {
        const raw = p.date||''; const s = raw.includes(' - ') ? raw.split(' - ')[1] : raw;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) mo = parseInt(s.split('/')[1]);
        else if (/^\d{4}-\d{2}-\d{2}/.test(s)) mo = parseInt(s.slice(5,7));
        else { try { const d = new Date(raw); if (!isNaN(d.getTime())) mo = d.getMonth()+1; } catch {} }
      }
      if (!mo || mo < 1 || mo > 12) return;
      let yr: number = (p as any).namHP ? Number((p as any).namHP) : curYr;
      if (!(p as any).namHP) {
        const raw = p.date||''; const s = raw.includes(' - ') ? raw.split(' - ')[1] : raw;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) yr = parseInt(s.split('/')[2]);
        else if (/^\d{4}-\d{2}-\d{2}/.test(s)) yr = parseInt(s.slice(0,4));
      }
      m.get(p.studentId)!.add(`${mo}/${yr}`);
    });
    return m;
  }, [payments, curYr]);

  const isPaid = useCallback((sid: string, mo: number, yr: number) => paidMap.get(sid)?.has(`${mo}/${yr}`) ?? false, [paidMap]);

  
  const activeStudents  = useMemo(() => students.filter(isStudentActive), [students]);
  const paidNow         = useMemo(() => activeStudents.filter(s => isPaid(s.id, curMo, curYr)).length, [activeStudents, isPaid, curMo, curYr]);
  const paidPct         = useMemo(() => activeStudents.length > 0 ? Math.round(paidNow/activeStudents.length*100) : 0, [activeStudents.length, paidNow]);

  const prevMo = curMo === 1 ? 12 : curMo-1;
  const prevYr = curMo === 1 ? curYr-1 : curYr;
  const prevPaidNow = useMemo(() => activeStudents.filter(s => isPaid(s.id, prevMo, prevYr)).length, [activeStudents, isPaid, prevMo, prevYr]);
  const prevStudentCount = useMemo(() => {
    const thisMonthStart = new Date(curYr, curMo-1, 1).getTime();
    return students.filter(s => { const ts = parseDMY(s.startDate||''); return ts > 0 && ts < thisMonthStart; }).length;
  }, [students, curMo, curYr]);
  const prevTlogCount = useMemo(() => tlogs.filter(l => { const d = new Date(parseDMY(l.date||'')); return d.getMonth()+1 === prevMo && d.getFullYear() === prevYr; }).length, [tlogs, prevMo, prevYr]);
  const uniqueBranches = useMemo(() => [...new Set(students.map(s=>s.branch).filter(Boolean))].sort(), [students]);

  const goScreen = useCallback((s: Screen) => { setScreen(s); setPgS(1); setPgF(1); setPgD(1); }, []);

  
  const handleAddDiaryWithClass = useCallback((classId?: string) => {
    setPreselectedDiaryClass(classId||''); setEditDiary(null); setShowDiary(true);
  }, []);

  const commands = useCommands({
    students, uClasses, goScreen,
    onAddStudent: () => { setEditStudent(null); setShowStudent(true); },
    onAddClass: () => { setEditClass(null); setShowClass(true); },
    onAddDiary: handleAddDiaryWithClass,
    onAddPayment: () => { setEditPayment(null); setEditExpense(null); setShowFAB(true); },
  });

  
  const api = useCallback((body: object) => fetchWithTimeout(scriptUrl, { method: 'POST', body: JSON.stringify(body), timeout: FETCH_TIMEOUT }), [scriptUrl]);

  const withSave = useCallback(async (fn: () => Promise<void>, msg?: string) => {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try { await fn(); if (msg) toast.success(msg); }
    catch (err: any) { toast.error('❌ ' + (err.message || 'Lỗi khi lưu')); }
    finally { savingRef.current = false; setSaving(false); }
  }, []);

  const mkTs = (d: string) => { const n = new Date(); return `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')} - ${formatDate(d)}`; };

  
  const handleSaveStudent = useCallback(async (form: any) => withSave(async () => {
    if (!form.id?.trim()||!form.name?.trim()) throw new Error('⚠️ Mã HS và Tên là bắt buộc!');
    const normalizedId = form.id.trim().replace(/\s+/g,'');
    if (!editStudent && students.some(s=>s.id===normalizedId)) throw new Error(`⚠️ Mã HS "${normalizedId}" đã tồn tại!`);
    form = { ...form, id: normalizedId };
    const formToSend = sanitizeObject({ ...form, startDate: form.startDate ? formatDate(form.startDate) : '' });
    await api({ action: editStudent ? 'updateHS' : 'saveHS', ...formToSend });
    setShowStudent(false); setEditStudent(null); silentRef.current=true; loadData();
  }, editStudent ? '✅ Đã cập nhật học sinh!' : '✅ Đã thêm học sinh mới!'), [withSave, editStudent, students, api, loadData]);

  const handleSaveClass = useCallback(async (form: any) => withSave(async () => {
    if (!form['Mã Lớp']?.trim()) throw new Error('⚠️ Mã lớp là bắt buộc!');
    await api({ action: editClass ? 'updateClass' : 'saveClass', ...sanitizeObject(form) });
    setShowClass(false); setEditClass(null); silentRef.current=true; loadData();
  }, editClass ? '✅ Đã cập nhật lớp!' : '✅ Đã thêm lớp mới!'), [withSave, editClass, api, loadData]);

  const handleSaveFee = useCallback(async (form: any) => withSave(async () => {
    const rawId=(form.maHS||'').trim(); const maHS=rawId.includes(' - ')?rawId.split(' - ')[0].trim():rawId;
    if (!maHS) throw new Error('⚠️ Vui lòng nhập mã HS!');
    if (!form.date) throw new Error('⚠️ Vui lòng chọn ngày thu!');
    if (!form.soTien||Number(form.soTien)<=0) throw new Error('⚠️ Số tiền không hợp lệ!');
    if (!form.thangHP) throw new Error('⚠️ Vui lòng chọn tháng học phí!');
    const thangHP=Number(form.thangHP); const namHP=Number(form.namHP||new Date().getFullYear());
    const t=mkTs(form.date); const n=new Date(); const yy=n.getFullYear().toString().slice(2); const mm=(n.getMonth()+1).toString().padStart(2,'0'); const dd=n.getDate().toString().padStart(2,'0');
    const soCT=form.docNum||`PT-${yy}${mm}${dd}-${maHS.toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const dateFormatted=formatDate(form.date);
    const description=`Học phí tháng ${thangHP} năm ${namHP}`;
    const clean=sanitizeObject({ ...form, maHS, soTien: Number(form.soTien), date: dateFormatted, description, thangHP, namHP });
    await api({ action: editPayment ? 'updatePayment' : 'savePayment', timeStamp:t, soCT, ...clean });
    setShowFAB(false); setEditPayment(null);
    const previewPayment: Payment = {
      id: soCT, docNum: soCT, date: dateFormatted,
      studentId: maHS,
      studentName: students.find(s=>s.id===maHS)?.name || maHS,
      payer: form.nguoiNop||'',
      method: form.method||'Chuyển khoản',
      description,
      amount: Number(form.soTien),
      note: form.note||'',
      thangHP, namHP,
    };
    setVInvoice(previewPayment);
    silentRef.current=true; loadData();
  }, editPayment ? '✅ Đã cập nhật phiếu thu!' : '✅ Đã ghi phiếu thu!'), [withSave, editPayment, students, api, loadData, setVInvoice]);

  const handleSaveExpense = useCallback(async (form: any) => withSave(async () => {
    if (!form.description?.trim()) throw new Error('⚠️ Vui lòng nhập lý do!');
    if (!form.amount||Number(form.amount)<=0) throw new Error('⚠️ Số tiền không hợp lệ!');
    if (!form.date) throw new Error('⚠️ Vui lòng chọn ngày chi!');
    const t=mkTs(form.date); const n=new Date(); const yy=n.getFullYear().toString().slice(2); const mm=(n.getMonth()+1).toString().padStart(2,'0'); const dd=n.getDate().toString().padStart(2,'0');
    const soCT=form.docNum||`PC-${yy}${mm}${dd}-${n.getTime().toString(36).slice(-4).toUpperCase()}`;
    await api({ action: editExpense ? 'updateExpense' : 'saveExpense', timeStamp:t, soCT, ...sanitizeObject({ ...form, amount: Number(form.amount), date: formatDate(form.date) }) });
    setShowFAB(false); setEditExpense(null); silentRef.current=true; loadData();
  }, editExpense ? '✅ Đã cập nhật phiếu chi!' : '✅ Đã ghi phiếu chi!'), [withSave, editExpense, api, loadData]);

  const handleSaveDiary = useCallback(async (form: any) => {
    const isEdit = !!form.originalDate;
    return withSave(async () => {
      if (!form.content?.trim()) throw new Error('⚠️ Vui lòng nhập nội dung bài dạy!');
      const clean=sanitizeObject(form);
      const dateForGAS = formatDate(clean.date);
      await api({ action: isEdit?'updateDaily':'saveDaily', date:dateForGAS, maLop:clean.classId, caDay:clean.caDay||'', teacherName:clean.teacherName, attendance:sanitizeAttendance(form.attendance), content:clean.content, homework:clean.homework||'---', ...(isEdit&&{ originalDate:clean.originalDate, originalClassId:clean.originalClassId, originalCaDay:clean.originalCaDay||'' }) });
      setShowDiary(false); setEditDiary(null); setPreselectedDiaryClass(''); silentRef.current=true; loadData();
    }, isEdit ? '✅ Đã cập nhật buổi dạy!' : '✅ Đã ghi buổi dạy!');
  }, [withSave, api, loadData]);

  const handleDelete = useCallback(async () => {
    if (!delTarget) return;
    const actionMap: any = { student:'deleteHS', payment:'deletePayment', expense:'deleteExpense' };

    if (delTarget.type === 'teacher') {
      setTeachers(p => p.filter(t => t.id !== delTarget.id));
      setDelTarget(null); toast.success('✅ Đã xóa thành công!'); return;
    }
    if (delTarget.type === 'material') {
      setMaterials(p => p.filter(m => m.id !== delTarget.id));
      setDelTarget(null); toast.success('✅ Đã xóa thành công!'); return;
    }

    await withSave(async () => {
      await api({ action: actionMap[delTarget.type], [delTarget.type==='student'?'id':'docNum']: delTarget.id });
      setDelTarget(null); silentRef.current=true; loadData();
    }, '✅ Đã xóa thành công!');
  }, [withSave, delTarget, api, loadData]);

  const handleToggleStudentStatus = useCallback(async (s: Student, chosenEndDate?: string) => {
    const isInactive = s.status==='inactive'||(s.endDate&&s.endDate!=='---'&&s.endDate!=='');
    return withSave(async () => {
      let endDateStr='';
      if (!isInactive) {
        if (chosenEndDate) { const [y,m,d]=chosenEndDate.split('-'); endDateStr=`${d}/${m}/${y}`; }
        else { const today=new Date(); const dd=today.getDate().toString().padStart(2,'0'); const mm=(today.getMonth()+1).toString().padStart(2,'0'); endDateStr=`${dd}/${mm}/${today.getFullYear()}`; }
      }
      await api({ action:'updateHS', id:s.id, name:s.name, dob:s.dob, branch:s.branch, grade:s.grade, school:s.school, teacher:s.teacher, parentName:s.parentName, parentPhone:s.parentPhone, studentPhone:s.studentPhone, address:s.address, academicLevel:s.academicLevel, goal:s.goal, supportNeeded:s.supportNeeded, classId:s.classId, startDate:s.startDate, endDate:isInactive?'':endDateStr, status:isInactive?'active':'inactive' });
      setVStudent(null); silentRef.current=true; loadData();
    }, isInactive ? '✅ Đã kích hoạt lại!' : '✅ Đã đánh dấu nghỉ học!');
  }, [withSave, api, loadData]);

  const handleBulkTransfer = useCallback((ss: Student[]) => { setBulkStudents(ss); setShowBulkXfer(true); }, []);
  const handleConfirmBulkTransfer = useCallback(async (newClassId: string, transferDate: string) => withSave(async () => {
    const [ty,tm,td]=transferDate.split('-');
    await Promise.all(bulkStudents.map(s => api({ action:'updateHS', ...s, classId:newClassId, fromClassId:s.classId, transferDate:`${td}/${tm}/${ty}` })));
    setShowBulkXfer(false); setBulkStudents([]); silentRef.current=true; loadData();
  }, `✅ Đã chuyển ${bulkStudents.length} học sinh!`), [withSave, bulkStudents, api, loadData]);

  
  const handleSaveTeacher = useCallback((form: any) => {
    const isEdit = !!(form.id?.trim()) && teachers.some(t => t.id === form.id.trim());
    if (isEdit) {
      setTeachers(prev => prev.map(t => t.id === form.id.trim() ? { ...t, ...form } : t));
    } else {
      setTeachers(prev => [...prev, { ...form, id: `T${Date.now()}`, classes: form.classes || [], createdAt: new Date().toISOString() }]);
    }
    toast.success('✅ Đã lưu giáo viên!');
  }, [teachers]);

  const handleSaveMaterial = useCallback((form: any) => {
    setMaterials(prev => [...prev, { ...form, id: `M${Date.now()}`, uploadedAt: new Date().toISOString(), tags: form.tags || [] }]);
    toast.success('✅ Đã tải lên!');
  }, []);

  const handleApproveLeave = useCallback((id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'approved', approvedAt: new Date().toISOString() } : l));
    toast.success('✅ Đã duyệt đơn!');
  }, []);

  const handleRejectLeave = useCallback((id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
    toast.success('Đã từ chối đơn!');
  }, []);

  
  const [fM, fY] = (fMo||'01/2026').split('/').map(Number);

  const filtS = useMemo(() => students.filter(s =>
    (!hideInactive || isStudentActive(s)) &&
    (s.name.toLowerCase().includes(qS.toLowerCase()) || s.id.toLowerCase().includes(qS.toLowerCase())) &&
    (!fCls || s.classId === fCls)
  ), [students, qS, fCls, hideInactive]);

  const filtD = useMemo(() => [...tlogs].filter(l =>
    (!dCls || l.classId === dCls) &&
    (!qD || l.classId.toLowerCase().includes(qD.toLowerCase()) || (l.content||'').toLowerCase().includes(qD.toLowerCase()))
  ).sort((a, b) => { const dd = parseDMY(b.date)-parseDMY(a.date); return dd !== 0 ? dd : parseCaDayToHours(a.caDay)-parseCaDayToHours(b.caDay); }), [tlogs, dCls, qD]);

  const filtFin = useMemo(() => {
    const q = qF.toLowerCase().trim();
    return students.filter(s => {
      if (hideInactive && !isStudentActive(s)) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      if (fTch && !s.teacher.includes(fTch)) return false;
      if (fFC && s.classId !== fFC) return false;
      if (fSt === 'paid')   return  isPaid(s.id, fM, fY);
      if (fSt === 'unpaid') return !isPaid(s.id, fM, fY);
      return true;
    });
  }, [students, qF, fTch, fFC, fSt, fM, fY, isPaid, hideInactive]);

  
  if (loading) return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', gap:16 }}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl">
        <GraduationCap size={32} className="text-white animate-bounce" />
      </div>
      <p className="font-bold text-slate-900 uppercase tracking-widest text-lg">Đang tải dữ liệu...</p>
      <p className="text-slate-400 text-base">Lớp Toán NK — v26.2</p>
    </div>
  );

  
  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex' }}>
        {/* Sidebar desktop */}
        <Sidebar active={screen} set={goScreen} centerName={centerName} />

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

          {/* Mobile header */}
          <MobileHeader active={screen} set={goScreen} centerName={centerName} />

          <main
            style={{
              flex: 1, width: '100%',
              padding: '20px 24px 32px',
              boxSizing: 'border-box',
            }}
            className="print:p-0 mobile-main-content"
          >

            {screen === 'overview' && (
              <ErrorBoundary fallbackLabel="Tổng quan">
                <OverviewTab
                  students={students} payments={payments} expenses={expenses}
                  tlogs={tlogs} uClasses={uClasses} summary={summary}
                  curMo={curMo} curYr={curYr} paidNow={paidNow}
                  goScreen={goScreen} isPaid={isPaid}
                  onAddDiary={handleAddDiaryWithClass}
                  onAddPayment={() => { setFabInitialTab('income'); setEditPayment(null); setEditExpense(null); setShowFAB(true); }}
                  onAddStudent={() => { setEditStudent(null); setShowStudent(true); }}
                  onViewMaterials={() => goScreen('materials')}
                  materialCount={materials.length}
                  prevPaidNow={prevPaidNow} prevStudentCount={prevStudentCount} prevTlogCount={prevTlogCount}
                />
              </ErrorBoundary>
            )}

            {screen === 'operations' && (
              <ErrorBoundary fallbackLabel="Vận hành">
                <OperationsTab
                  filtD={filtD} pgD={pgD} setPgD={setPgD} qD={qD} setQD={setQD}
                  dCls={dCls} setDCls={setDCls} uClasses={uClasses} IPP={IPP}
                  students={students} tlogs={tlogs} leaveRequests={leaveRequests}
                  onViewDiary={log=>setVDiary(log)}
                  onEditDiary={log=>{setEditDiary(log);setShowDiary(true);}}
                  onAddDiary={()=>{setEditDiary(null);setPreselectedDiaryClass('');setShowDiary(true);}}
                  onApproveLeave={handleApproveLeave} onRejectLeave={handleRejectLeave}
                />
              </ErrorBoundary>
            )}

            {screen === 'teachers' && (
              <ErrorBoundary fallbackLabel="Giáo viên">
                <TeachersTab teachers={teachers} uClasses={uClasses} tlogs={tlogs} onSave={handleSaveTeacher} isSaving={saving} />
              </ErrorBoundary>
            )}

            {screen === 'classes' && (
              <ErrorBoundary fallbackLabel="Lớp học">
                <ClassesTab
                  uClasses={uClasses} students={students} tlogs={tlogs}
                  curMo={curMo} curYr={curYr} paidNow={paidNow} paidPct={paidPct}
                  qCls={qCls} setQCls={setQCls} fClsTeacher={fClsTeacher} setFClsTeacher={setFClsTeacher}
                  isPaid={isPaid}
                  onEditClass={c=>{setEditClass(c);setShowClass(true);}}
                  onAddClass={()=>{setEditClass(null);setShowClass(true);}}
                  uniqueBranches={uniqueBranches}
                />
              </ErrorBoundary>
            )}

            {screen === 'students' && (
              <ErrorBoundary fallbackLabel="Học sinh">
                <StudentsTab
                  filtS={filtS} pgS={pgS} setPgS={setPgS} students={students}
                  qS={qS} setQS={setQS} fCls={fCls} setFCls={setFCls} uClasses={uClasses}
                  onViewStudent={s=>setVStudent(s)}
                  onEditStudent={s=>{setEditStudent(s);setShowStudent(true);}}
                  onDeleteStudent={t=>setDelTarget(t)}
                  onAddStudent={()=>{setEditStudent(null);setShowStudent(true);}}
                  onBulkTransfer={handleBulkTransfer}
                  curMo={curMo} curYr={curYr} isPaid={isPaid}
                  zaloTpl={zaloTpl} baseTuition={baseTuition}
                />
              </ErrorBoundary>
            )}

            {screen === 'materials' && (
              <ErrorBoundary fallbackLabel="Học liệu">
                <MaterialsTab
                  materials={materials} uClasses={uClasses}
                  onSave={handleSaveMaterial}
                  onDelete={id=>setMaterials(p=>p.filter(m=>m.id!==id))}
                  isSaving={saving}
                />
              </ErrorBoundary>
            )}

            {screen === 'finance' && (
              <ErrorBoundary fallbackLabel="Tài chính">
                {}
                <FinanceTab
                  summary={summary} payments={payments} expenses={expenses}
                  students={students} uClasses={uClasses} tlogs={tlogs}
                  curMo={curMo} curYr={curYr}
                  qF={qF} setQF={setQF} fMo={fMo} setFMo={setFMo}
                  fTch={fTch} setFTch={setFTch} fFC={fFC} setFFC={setFFC}
                  fSt={fSt} setFSt={setFSt} pgF={pgF} setPgF={setPgF}
                  filtFin={filtFin} isPaid={isPaid}
                  zaloTpl={zaloTpl} baseTuition={baseTuition} schoolYear={schoolYear}
                  onViewInvoice={p=>setVInvoice(p)}
                  onViewFinance={s=>setVFinance(s)}
                  onShowFAB={()=>{setFabInitialTab('income');setEditPayment(null);setEditExpense(null);setShowFAB(true);}}
                  onEditPayment={p=>{setFabInitialTab('income');setEditPayment(p);setEditExpense(null);setShowFAB(true);}}
                  onDeletePayment={p=>setDelTarget({type:'payment',id:p.docNum,name:`${p.studentName} (${p.docNum})`})}
                  onEditExpense={e=>{setFabInitialTab('expense');setEditExpense(e);setEditPayment(null);setShowFAB(true);}}
                  onDeleteExpense={e=>setDelTarget({type:'expense',id:e.docNum,name:`${e.description} (${e.docNum})`})}
                />
              </ErrorBoundary>
            )}

            {screen === 'reports' && (
              <ErrorBoundary fallbackLabel="Báo cáo">
                <ReportsTab
                  students={students} payments={payments} expenses={expenses}
                  tlogs={tlogs} uClasses={uClasses} summary={summary}
                  curMo={curMo} curYr={curYr} isPaid={isPaid}
                />
              </ErrorBoundary>
            )}

            {screen === 'settings' && (
              <ErrorBoundary fallbackLabel="Cài đặt">
                <SettingsTab
                  baseTuition={baseTuition} setBaseTuition={setBaseTuition}
                  schoolYear={schoolYear} setSchoolYear={setSchoolYear}
                  zaloTpl={zaloTpl} setZaloTpl={setZaloTpl}
                  bankId={bankId} setBankId={setBankId}
                  accountNo={accountNo} setAccountNo={setAccountNo}
                  accountName={accountName} setAccountName={setAccountName}
                  scriptUrl={scriptUrl} setScriptUrl={setScriptUrl}
                  gsOk={gsOk} centerName={centerName} setCenterName={setCenterName}
                  teacher={teacher} setTeacher={setTeacher}
                  addr1={addr1} setAddr1={setAddr1} addr2={addr2} setAddr2={setAddr2}
                  phone={phone} setPhone={setPhone}
                  accentColor={accentColor} setAccentColor={setAccentColor}
                  showId={showId} setShowId={setShowId}
                  hideInactive={hideInactive} setHideInactive={setHideInactive}
                  caDayOptions={caDayOptions} setCaDayOptions={setCaDayOptions}
                  teacherList={teacherList} setTeacherList={setTeacherList}
                  uniqueBranches={uniqueBranches} saving={saving} loadData={loadData}
                />
              </ErrorBoundary>
            )}

          </main>

          <footer
            style={{ textAlign: 'center', paddingBottom: 20, paddingTop: 12, fontSize: 11, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.3em' }}
            className="print:hidden"
          >
            LỚP TOÁN NK • 2026 • v26.2
          </footer>
        </div>
      </div>

      {}
      <BottomNav active={screen} set={goScreen} />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} commands={commands} />

      {}
      <StudentModal
        open={showStudent} onClose={()=>{setShowStudent(false);setEditStudent(null);}}
        editing={editStudent} uniqueClasses={uClasses} uniqueBranches={uniqueBranches}
        isSaving={saving} onSave={handleSaveStudent}
      />
      <ClassModal
        open={showClass} onClose={()=>{setShowClass(false);setEditClass(null);}}
        editing={editClass} isSaving={saving} onSave={handleSaveClass}
        uniqueBranches={uniqueBranches} teacherList={teacherList}
      />
      <FABModal
        open={showFAB} onClose={()=>{setShowFAB(false);setEditPayment(null);setEditExpense(null);}}
        students={students} baseTuition={baseTuition} isSaving={saving}
        onSaveFee={handleSaveFee} onSaveExpense={handleSaveExpense}
        editingPayment={editPayment} editingExpense={editExpense} initialTab={fabInitialTab}
      />
      <DiaryModal
        open={showDiary} onClose={()=>{setShowDiary(false);setEditDiary(null);setPreselectedDiaryClass('');}}
        uniqueClasses={uClasses} students={students} isSaving={saving}
        onSave={handleSaveDiary} editingLog={editDiary}
        caDayOptions={caDayOptions} preselectedClassId={preselectedDiaryClass}
      />
      <BulkTransferModal
        open={showBulkXfer} onClose={()=>{setShowBulkXfer(false);setBulkStudents([]);}}
        selectedStudents={bulkStudents} uniqueClasses={uClasses}
        isSaving={saving} onConfirm={handleConfirmBulkTransfer}
      />
      {vStudent && <StudentDetailModal student={vStudent} onClose={()=>setVStudent(null)} tlogs={tlogs} payments={payments} onToggleStatus={handleToggleStudentStatus} />}
      {vDiary && <DiaryDetailModal log={vDiary} onClose={()=>setVDiary(null)} />}
      {vInvoice && <InvoiceModal payment={vInvoice} onClose={()=>setVInvoice(null)} centerName={centerName} bankId={bankId} accountNo={accountNo} accountName={accountName} />}
      {vFinance && <FinanceDetailModal student={vFinance} payments={payments} onClose={()=>setVFinance(null)} isPaid={isPaid} />}
      {delTarget && <DeleteModal target={delTarget} onClose={()=>setDelTarget(null)} onConfirm={handleDelete} isSaving={saving} />}
    </div>
  );
}
