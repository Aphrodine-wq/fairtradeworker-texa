# Brutalist Design Update Patterns

This document contains find-and-replace patterns for updating components to brutalist design.

## Common Patterns to Replace

### Rounded Corners
- `rounded-xl` → `rounded-none`
- `rounded-2xl` → `rounded-none`
- `rounded-lg` → `rounded-none`
- `rounded-md` → `rounded-none`
- `rounded-full` → `rounded-none` (or keep for avatars if needed)
- `rounded-sm` → `rounded-none` (or keep minimal if absolutely necessary)

### Shadows
- `shadow-sm` → `shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]`
- `shadow-md` → `shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]`
- `shadow-lg` → `shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]`
- `shadow-xl` → `shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_#fff]`
- `shadow-[0_4px_20px_rgba(0,0,0,0.04)]` → `shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]`
- `hover:shadow-md` → `hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff]`
- `hover:shadow-lg` → `hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff]`
- `hover:shadow-xl` → `hover:shadow-[8px_8px_0_#000] dark:hover:shadow-[8px_8px_0_#fff]`

### Borders
- `border` → `border-2 border-black dark:border-white`
- `border border-black/10` → `border-2 border-black dark:border-white`
- `border border-white/10` → `border-2 border-black dark:border-white`
- `border-2 border-black/10` → `border-2 border-black dark:border-white`
- `border-2 border-white/10` → `border-2 border-black dark:border-white`

### Transparency
- `bg-black/20` → `bg-black`
- `bg-white/10` → `bg-white dark:bg-black`
- `bg-background/50` → `bg-white dark:bg-black`
- `bg-background/95` → `bg-white dark:bg-black`
- `backdrop-blur-sm` → (remove)
- `backdrop-blur-md` → (remove)
- `opacity-70` → `opacity-100` (or remove if not needed)
- `opacity-90` → `opacity-100` (or remove if not needed)
- `text-black/50` → `text-black dark:text-white`
- `text-white/70` → `text-white dark:text-black`

### Typography
- `font-semibold` → `font-black uppercase` (for buttons, badges, important text)
- `font-medium` → `font-black` (for emphasis)
- Add `font-mono` to: numbers, stats, codes, IDs, timestamps
- Add `uppercase tracking-tight` to: buttons, badges, labels

### Colors
- Use pure colors: `#FFFFFF`, `#000000`, `#00FF00`, `#FF0000`, `#FFFF00`
- No opacity variants
- No gradients

### Component-Specific Patterns

#### Cards
```tsx
// Before
<Card className="rounded-xl shadow-lg">

// After
<Card className="rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
```

#### Buttons
```tsx
// Before
<Button className="rounded-lg shadow-md">

// After
<Button className="rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] font-black uppercase">
```

#### Inputs
```tsx
// Before
<Input className="rounded-lg border border-black/10">

// After
<Input className="rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] font-mono">
```

## Files Remaining to Update

### UI Components (22 files)
- calendar.tsx
- chart.tsx
- PhotoUploader.tsx
- navigation-menu.tsx
- GlassCard.tsx
- progress.tsx
- SkeletonCard.tsx
- alert-dialog.tsx
- LoadingSkeleton.tsx
- scroll-area.tsx
- switch.tsx
- radio-group.tsx
- Confetti.tsx
- drawer.tsx
- sidebar.tsx
- slider.tsx
- carousel.tsx
- avatar.tsx
- command.tsx
- Lightbox.tsx
- tabs.tsx
- sheet.tsx

### Contractor Components (29 files)
- All files in src/components/contractor/

### Job Components (15 files)
- All files in src/components/jobs/

### Page Components (13 files)
- All files in src/pages/

## Priority Order

1. ✅ Core UI (card, button, input, badge, textarea, select, dialog, alert) - DONE
2. ✅ Header - DONE
3. ⏳ Most visible pages (Home, ContractorDashboard, HomeownerDashboard)
4. ⏳ Job browsing and posting components
5. ⏳ Contractor tools (CRM, invoicing)
6. ⏳ Remaining UI components
7. ⏳ Remaining pages
