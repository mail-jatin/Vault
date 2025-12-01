# Design Guidelines: Password Vault Application

## Design Approach

**Primary Reference**: Proton Pass design system
**Rationale**: Security-focused password manager requiring trust, clarity, and efficiency. Proton's minimal, professional aesthetic with strong visual hierarchy perfectly suits this utility-focused application.

**Core Principles**:
- Security-first visual language (professional, trustworthy)
- Information density with breathing room
- Efficient workflows with minimal friction
- Clean, modern interface with subtle depth

---

## Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for passwords/codes)

**Hierarchy**:
- Headings: font-semibold, text-2xl to text-lg
- Body: font-normal, text-base
- Labels: font-medium, text-sm
- Passwords/Codes: font-mono, text-sm
- Metadata: font-normal, text-xs, reduced opacity

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Margins: m-2, m-4, m-8

**Grid Structure**:
- Main layout: Sidebar (280px fixed) + Main content (flex-1)
- Vault grid: grid-cols-1 (mobile) → grid-cols-2 (lg) → grid-cols-3 (xl)
- Forms: Single column, max-w-md

---

## Component Library

### Authentication Screens
**Login/Register Pages**:
- Centered card (max-w-md) on full-screen background
- Split form design: Fingerprint option (primary) + Username/Password (secondary)
- Large fingerprint icon with scan animation
- Clean input fields with subtle borders
- Prominent CTA buttons (rounded-lg, py-3)

### Main Application Layout
**Sidebar Navigation**:
- Fixed left sidebar with sections: All Items, Folders, Favorites, Trash
- Vault count badges next to categories
- Settings/profile at bottom
- Search bar at top of sidebar

**Top Bar**:
- Breadcrumb navigation
- Quick actions: Add Item, Generate Password, Settings
- User avatar/menu (right-aligned)

### Vault Display
**Password Entry Cards**:
- Compact card design with icon, title, username, and URL
- Favicon/website icon on left
- Copy password button (icon-only, appears on hover)
- Star for favorites
- Three-dot menu for actions (Edit, Delete, Move)
- Subtle hover state with elevated shadow

**List View Alternative**:
- Table-like rows with columns: Icon, Title, Username, Website, Modified
- Hover reveals action buttons
- Striped rows for readability

### Forms & Modals
**Add/Edit Password Modal**:
- Overlay with backdrop blur
- Large modal (max-w-2xl)
- Sections: Website, Credentials, Notes
- Password field with show/hide toggle and strength indicator
- Generate Password button with inline generator options
- Folder/category dropdown
- Save/Cancel buttons at bottom

**Password Generator**:
- Slider for length (8-64 characters)
- Checkboxes for: Uppercase, Lowercase, Numbers, Symbols
- Live preview of generated password
- Regenerate button
- Copy button

### Detail View
**Password Detail Sidebar**:
- Slide-in panel from right (w-96)
- Large website icon/favicon
- Title and URL
- Copy buttons for username and password
- Last modified timestamp
- Edit and Delete actions
- Notes section (expandable)

---

## Specific Screens

### Dashboard/Vault View
- Search bar with real-time filtering
- Filter tags: All, Logins, Credit Cards, Notes
- Grid/List view toggle
- Empty state with illustration and "Add First Password" CTA

### Folders View
- Folder cards with item count
- Create new folder button (prominent)
- Drag-and-drop sorting (visual indicator)

### Settings
- Tabbed interface: Account, Security, Preferences
- Security: Fingerprint management, timeout settings, 2FA
- Export/Import vault functionality
- Dark mode toggle

---

## Visual Enhancements

**Icons**: Heroicons (outline for navigation, solid for actions)

**Illustrations**: Use simple, abstract security-themed illustrations for:
- Empty states
- Onboarding/welcome screen
- Error states

**Animations**: Minimal and purposeful
- Fingerprint scan pulse animation
- Card hover lift (subtle translateY)
- Modal fade-in
- Success checkmarks for copy actions

---

## Security Visual Language

- Lock icons for encrypted items
- Shield badges for security status
- Green checkmarks for verified/strong passwords
- Yellow/red warnings for weak/reused passwords
- Blur password fields by default
- Timeout indicator (subtle progress bar when session about to expire)

---

## Mobile Responsive Behavior

- Sidebar collapses to bottom navigation
- Cards stack to single column
- Swipe gestures for card actions
- Full-screen modals on mobile
- Floating action button for "Add Password"

This design creates a professional, trustworthy password management experience that prioritizes usability and security while maintaining visual polish.