# Universal Theme Class Replacements

## Apply these replacements to all remaining pages:

### Background Colors:
- `bg-[#F0F2F5]` → `bg-background transition-colors duration-200`
- `bg-white` → `bg-card border border-border`
- `bg-gray-50` → `bg-accent`
- `bg-gray-100` → `bg-muted`

### Text Colors:
- `text-gray-800` → `text-foreground`
- `text-gray-900` → `text-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`

### Purple/Primary Colors:
- `bg-[#6A0DAD]` → `bg-primary`
- `text-[#6A0DAD]` → `text-primary`
- `bg-purple-100` → `bg-primary/10`
- `text-purple-600` → `text-primary`
- `border-purple-600` → `border-primary`
- `hover:bg-purple-800` → `hover:bg-primary/90`

### Status Colors:
- `text-green-500` → `text-success`
- `text-red-500` → `text-destructive`
- `text-blue-500` → `text-info`
- `text-yellow-400` → `text-warning`
- `bg-green-600` → `bg-success`
- `bg-red-600` → `bg-destructive`

### Borders:
- `border-gray-300` → `border-border`
- `border-gray-200` → `border-border`

### Loading Spinners:
- `border-purple-600` → `border-primary`

### White Text:
- `text-white` (when used with colored backgrounds) → `text-primary-foreground` or appropriate foreground color

## Pages to Update:
- Progress.jsx
- SessionHistory.jsx  
- Profile.jsx
- TutorSessions.jsx

## Quick Search/Replace Pattern:
1. Main containers: Add `transition-colors duration-200`
2. Cards: Add `border border-border`
3. All hardcoded colors → theme variables