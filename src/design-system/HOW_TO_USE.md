# ✅ Hướng dẫn cài vào app LOPTOANNK_PRO

## Bước 1 — Đặt thư mục vào đúng chỗ

Sau khi giải nén, bạn sẽ có thư mục `design-system/`.

Kéo thả thư mục đó vào:
```
C:\Users\Admin\Desktop\LOPTOANNK_PRO\src\
```

Kết quả mong muốn:
```
LOPTOANNK_PRO\src\
├── design-system\          ← dán vào đây
│   └── src\
│       ├── index.ts
│       ├── styles\
│       │   ├── variables.css
│       │   └── theme.ts
│       ├── types\
│       │   └── index.ts
│       └── components\
│           ├── form\
│           ├── data-display\
│           ├── navigation\
│           └── feedback\
├── App.tsx
├── helpers.ts
├── UIComponents.tsx
└── ...
```

---

## Bước 2 — Import CSS vào main.tsx

Mở file `main.tsx`, thêm 1 dòng **trước** `import './index.css'`:

```tsx
// main.tsx
import './design-system/src/styles/variables.css'  // ← THÊM DÒNG NÀY
import './index.css'
import App from './App.tsx'
```

---

## Bước 3 — Dùng ngay trong bất kỳ file nào

```tsx
import { Button, Badge, SearchBar, Pager, FilterTabs } from './design-system/src';

// Hoặc import tokens:
import { colors, radius, shadows } from './design-system/src/styles/theme';
```

---

## Ví dụ thay thế nhanh nhất (ModalDelete.tsx)

```tsx
// TRƯỚC
import { cn, BTN_S } from './helpers';
<button className={cn(BTN_S,'flex-1')}>Hủy bỏ</button>
<button className="...bg-red-600...">Xóa vĩnh viễn</button>

// SAU
import { Button } from './design-system/src';
<Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Hủy bỏ</Button>
<Button intent="danger" fullWidth loading={isSaving} onClick={onConfirm}>Xóa vĩnh viễn</Button>
```

---

Xem README.md trong thư mục design-system/src để có đầy đủ ví dụ.
