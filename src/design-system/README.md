# 🎨 Lớp Toán NK — Design System v1.0

Bộ component library chuẩn, tái sử dụng cao cho ứng dụng quản lý lớp học.

---

## 📁 Cấu trúc thư mục

```
design-system/
├── src/
│   ├── index.ts                          ← Barrel export (import từ đây)
│   │
│   ├── styles/
│   │   ├── variables.css                 ← CSS custom properties
│   │   └── theme.ts                      ← TypeScript theme object (mirror của CSS)
│   │
│   ├── types/
│   │   └── index.ts                      ← Tất cả TypeScript interfaces
│   │
│   └── components/
│       ├── form/
│       │   └── index.tsx                 ← Button · IconButton · Input · Select
│       │                                    RadioGroup · SearchBar
│       ├── data-display/
│       │   └── index.tsx                 ← StatCard · DataTable · TableActions
│       │                                    AttendancePicker
│       ├── navigation/
│       │   └── index.tsx                 ← NavBar · FilterTabs · FilterChip
│       └── feedback/
│           └── index.tsx                 ← Badge · ConnectionStatus
│                                            QuickActionGroup · Pager
└── README.md
```

---

## 🎨 Bảng màu (Design Tokens)

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `primary.500` | `#6366f1` | CTA chính, active state, link |
| `secondary.600` | `#7c3aed` | Diary, secondary actions |
| `success.600` | `#059669` | Có mặt, đã đóng phí, thu tiền |
| `warning.600` | `#d97706` | Muộn, cảnh báo nhẹ |
| `danger.600` | `#e11d48` | Vắng, xóa, lỗi |
| `teal.600` | `#0d9488` | Học liệu, teal accent |
| `neutral.900` | `#0f172a` | Text heading |
| `neutral.500` | `#64748b` | Text muted, label |
| `neutral.200` | `#e2e8f0` | Border |
| `neutral.50` | `#f8fafc` | Background card |

---

## 🔤 Typography Scale

| Token | Size | Dùng cho |
|-------|------|----------|
| `font-size-xs` | 10px | Badge, label uppercase |
| `font-size-sm` | 12px | Caption, hint |
| `font-size-base` | 13px | Body text, table cell |
| `font-size-md` | 14px | Subheading |
| `font-size-lg` | 16px | Section heading |
| `font-size-2xl` | 22px | Page title |
| `font-size-3xl` | 28px | Stat value |

Font: **Be Vietnam Pro** (400 · 500 · 600 · 700 · 800)

---

## 📐 Spacing System (base 4px)

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |

---

## 🧩 Component Quick Reference

### Form
```tsx
// Nút với icon và trạng thái loading
<Button intent="primary" icon={<Plus size={14}/>} loading={saving}>
  Thêm mới
</Button>

// Nút hủy
<Button intent="neutral" variant="outline">Hủy</Button>

// Nút xóa
<Button intent="danger" variant="outline" size="sm">Xóa</Button>

// Icon button trong bảng
<IconButton icon={<Eye size={13}/>} label="Xem" intent="primary" tooltip="Xem chi tiết"/>
<IconButton icon={<Edit3 size={13}/>} label="Sửa" intent="warning"/>
<IconButton icon={<Trash2 size={13}/>} label="Xóa" intent="danger"/>

// Input có validation
<Input label="Họ và tên" value={name} onChange={setName} required
  error={!name ? 'Vui lòng nhập tên' : undefined}/>

// Select dropdown
<Select label="Lớp học" value={classId} onChange={setClassId}
  options={classes.map(c=>({value:c.id, label:c.name}))}
  placeholder="Chọn lớp"/>

// Radio group — Ca dạy
<RadioGroup label="Ca dạy" value={caDay} onChange={setCaDay} direction="horizontal"
  options={CA_SLOTS.map(v=>({value:v, label:v}))}/>

// Search bar
<SearchBar value={q} onChange={setQ} placeholder="Tìm tên, mã HS..." width={240}/>
```

### Data Display
```tsx
// Stat card (clickable)
<StatCard icon={Users} label="Học sinh đang học" value={42} sub="3 lớp"
  gradient={colors.primary.grad} trend={3} onClick={()=>goScreen('students')}/>

// Generic data table
const columns: ColumnDef<Student>[] = [
  { key: 'name', label: 'Học sinh', sortable: true,
    render: (v, row) => (
      <div>
        <p style={{fontWeight:700}}>{v}</p>
        <p style={{fontSize:11, color:'#94a3b8'}}>{row.id}</p>
      </div>
    )},
  { key: 'classId', label: 'Lớp', align: 'center',
    render: v => <Badge color="indigo">{v}</Badge> },
  { key: '_', label: '', align: 'center',
    render: (_, row) => (
      <TableActions actions={[
        { icon: <Eye size={13}/>, label: 'Xem', intent: 'primary', onClick: () => onView(row) },
        { icon: <Edit3 size={13}/>, label: 'Sửa', intent: 'warning', onClick: () => onEdit(row) },
        { icon: <Trash2 size={13}/>, label: 'Xóa', intent: 'danger', onClick: () => onDelete(row) },
      ]}/>
    )},
];

<DataTable columns={columns} data={students} rowKey="id" striped hoverable
  page={page} perPage={10} total={students.length} onPageChange={setPage}
  emptyText="Chưa có học sinh" emptyAction={{label:'+ Thêm đầu tiên', onClick:onAdd}}/>

// Attendance picker
<AttendancePicker
  students={attendanceList}
  onChange={setAttendanceList}
/>
```

### Navigation
```tsx
// Sidebar (desktop)
<NavBar items={NAV_ITEMS} active={screen} onNavigate={setScreen}
  variant="sidebar" centerName="Lớp Toán NK"/>

// Bottom nav (mobile)
<NavBar items={NAV_ITEMS} active={screen} onNavigate={setScreen} variant="bottom"/>

// Sub-tab switcher (segment style)
<FilterTabs variant="segment" active={sub} onChange={setSub} tabs={[
  { id: 'diary', label: 'Nhật ký', icon: <BookOpen size={13}/> },
  { id: 'schedule', label: 'Lịch dạy', icon: <Calendar size={13}/> },
]}/>

// Filter chips
<div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
  <FilterChip label="Tất cả" count={materials.length}
    active={filter===''} onClick={()=>setFilter('')} color="indigo"/>
  {GRADES.map(g => (
    <FilterChip key={g} label={`Khối ${g}`} count={byGrade[g]} color="teal"
      active={filter===g} onClick={()=>setFilter(g)}
      onRemove={filter===g ? ()=>setFilter('') : undefined}/>
  ))}
</div>
```

### Feedback
```tsx
// Badge
<Badge color="indigo" variant="subtle">9A</Badge>
<Badge color="emerald" dot variant="solid">Đang học</Badge>
<Badge color="amber" onRemove={()=>removeFilter()}>T3/2026 ×</Badge>

// Connection indicator
<ConnectionStatus state={gsOk ? 'connected' : 'disconnected'}
  lastSynced={lastSync} onSync={loadData} onRetry={loadData}/>

// Quick actions grid
<QuickActionGroup actions={[
  { label: 'Thêm nhật ký', icon: BookOpen, color: '#7c3aed',
    shadow: 'rgba(124,58,237,0.5)', onClick: () => onAddDiary() },
  { label: 'Thu phí mới', icon: CreditCard, color: '#059669',
    shadow: 'rgba(5,150,105,0.5)', onClick: onAddFee },
]}/>

// Pagination
<Pager page={page} total={total} perPage={10} setPage={setPage} showTotal/>
```

---

## 🚀 Cài đặt và sử dụng

```tsx
// 1. Import global CSS (trong main.tsx hoặc App.tsx)
import './design-system/src/styles/variables.css';

// 2. Import components theo nhu cầu
import { Button, DataTable, Badge, StatCard, NavBar } from './design-system/src';

// 3. Sử dụng theme tokens trong inline style
import { colors, radius, shadows } from './design-system/src/styles/theme';

<div style={{
  background: colors.primary[50],
  borderRadius: radius.lg,
  boxShadow: shadows.md,
}}>...</div>
```

---

## 📝 Quy tắc đặt tên

| Category | Convention | Example |
|----------|-----------|---------|
| Component | PascalCase | `DataTable`, `FilterChip` |
| Props interface | `ComponentNameProps` | `DataTableProps` |
| CSS variable | `--color-primary-500` | kebab-case |
| TS token | `colors.primary[500]` | camelCase object |
| Intent | lowercase string | `'primary'`, `'danger'` |

---

## ♿ Accessibility

- Tất cả interactive elements có `aria-label`
- Active nav items có `aria-current="page"`
- Disabled state rõ ràng (`opacity: 0.4`, `cursor: not-allowed`)
- Focus ring với `box-shadow: 0 0 0 3px ${color.50}` thay vì `outline:none`
- Color contrast đạt WCAG AA (4.5:1 minimum)
