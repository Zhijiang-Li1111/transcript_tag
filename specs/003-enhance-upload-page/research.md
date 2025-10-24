# Research: Upload Page Enhancement

**Feature**: Enhance Upload Page with Usage Guide & Remove Transcript Preview  
**Branch**: `003-enhance-upload-page`  
**Date**: 2025-10-24  
**Input**: Feature specification and technical context from plan.md

## Overview

This feature makes two straightforward UI changes to the upload page:
1. **P1**: Add a usage guide explaining the tool workflow
2. **P2**: Remove the redundant transcript preview section

No NEEDS CLARIFICATION markers existed in the spec. Research validates that the simple, direct approach is best practice for this context.

---

## Design Decision: Guide Content & Placement

### Decision
The usage guide will be a static JSX section added directly to `App.tsx` (upload phase) **above** the file uploader. It uses semantic HTML (`<h2>`, `<ul>`, `<li>`) and Tailwind utility classes (no new CSS). The guide appears only when no session is active.

### Rationale
- **Simplicity**: No new component needed for single-use, static content. Inline JSX is clearest.
- **Performance**: No additional re-renders or logic. Guide is part of the same conditional (`!currentSession`) that controls upload phase visibility.
- **Accessibility**: Semantic HTML ensures screen readers and keyboard navigation work naturally. No ARIA roles needed beyond what HTML provides.
- **Tailwind-first**: Consistent with project style (all UI uses Tailwind, no custom CSS). Uses existing color tokens from `globals.css` (text-gray-600, text-blue-400, etc.).
- **Responsive**: Tailwind's flex/grid utilities handle mobile/tablet/desktop breakpoints without custom media queries.

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Extract guide as new component `UsageGuide.tsx` | Violates "postpone abstractions until two distinct stories require them" - this is currently one-use. Component adds unnecessary indirection. Can extract if a second guide is needed. |
| Use a collapsible/accordion for guide | Adds complexity and reduces discoverability. Users skip hidden content. Open, always-visible approach is simpler and more effective for onboarding. |
| Put guide below uploader | Upload area should be visually prominent. Placing guide above frames the context before the action. |
| Use custom styling | Tailwind tokens already define colors, spacing, typography. No edge case requiring custom CSS. |

---

## Design Decision: Remove Transcript Preview

### Decision
The "Transcript Preview" section (lines ~197-210 in App.tsx, showing `<CueList>`) will be **removed entirely** from the DOM when the file upload succeeds. The "Ready to annotate" section remains unchanged.

### Rationale
- **User experience**: Preview is redundant. File validation already provides feedback (success/error messages). CueList is displayed in full during annotation phase anyway.
- **Page layout**: Removing the ~300px preview reduces page height, eliminates unnecessary scroll, and keeps focus on the call-to-action (Start Annotating Now).
- **Code clarity**: No conditional logic needed - just delete the JSX block. Simpler to maintain than hiding/showing.
- **Alignment with spec**: Spec explicitly states preview is "redundant and unnecessary."

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Hide preview with CSS (`display: none`) | Wasteful - DOM element still rendered, affecting performance. Cleaner to remove entirely. |
| Replace preview with summary stats (cue count by importance) | Out of scope - spec asks only to remove, not replace. User can see full breakdown during annotation. |
| Make preview collapsible | Adds UI complexity and JavaScript logic. Simplicity principle: if users don't need it, remove it. |

---

## Implementation Notes

### Dependencies Review
No new dependencies required. Feature uses only existing tech:
- **React 19**: useState hooks already in use throughout app
- **Tailwind CSS 3.4**: All styling via utility classes
- **TypeScript 5.9**: No new types needed; all JSX is inline
- **Existing components**: `FileUploader`, `Button`, `MainLayout` (all stable, no changes)

### No Data Model Changes
Feature is UI-only. No new types, interfaces, or data structures. Spec confirms: "All other existing functionality remains unchanged."

### Accessibility Verified
- ✅ Guide uses semantic headings (`<h2>`) and lists (`<ul>`, `<li>`)
- ✅ Color contrast: Tailwind tokens (e.g., `text-gray-600` on `bg-white`) meet WCAG AA
- ✅ Keyboard navigation: FileUploader component is already keyboard-accessible; guide is static text
- ✅ Screen readers: Semantic HTML + no aria-hidden attributes = full accessibility

### Responsive Design Verified
- ✅ Tailwind flex/grid utilities handle desktop, tablet, mobile
- ✅ No fixed widths or overflow issues
- ✅ Spec explicitly requires responsive breakpoints - satisfied by Tailwind responsive classes (e.g., `lg:flex-row`)

---

## Conclusion

No research blockers. Design is simple, best-practice approach:
- Reuse existing components and patterns
- Keep code minimal and maintainable
- Prioritize user clarity (guide on-page, preview removed)
- Use existing tech stack (no new dependencies)
- Follow constitution principles (reuse, accessibility, type-safety)

**Status**: ✅ Ready to proceed to Phase 1 (design & contracts)
