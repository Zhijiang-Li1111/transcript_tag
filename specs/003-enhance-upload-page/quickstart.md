# Quickstart: Test Upload Page Enhancement

**Feature**: Enhance Upload Page with Usage Guide & Remove Transcript Preview  
**Branch**: `003-enhance-upload-page`  
**Date**: 2025-10-24  

This document guides manual testing of both P1 (add guide) and P2 (remove preview) stories.

---

## Setup

1. Ensure you're on branch `003-enhance-upload-page`
2. Run: `yarn install` (no new dependencies)
3. Run: `yarn build` to verify no TypeScript errors
4. Run: `yarn dev` to start dev server (typically http://localhost:5173)

---

## Test: P1 - Usage Guide Addition

### Test Environment
- **Browser**: Chromium-based (Chrome, Edge) or Firefox
- **Breakpoints**: Test at least desktop (1280px) and tablet (768px)

### Test Case 1.1: Guide Visibility on Fresh Load
**Given**: Application loads with no session active  
**When**: User views the upload page  
**Then**:
1. ✅ A usage guide is visible above or adjacent to the FileUploader
2. ✅ Guide includes heading "How to use this tool" (or similar)
3. ✅ Guide explains file upload (drag & drop / browse)
4. ✅ Guide explains workflow (rating scale 0-3)
5. ✅ Guide mentions progress saves automatically
6. ✅ Guide mentions export functionality
7. ✅ Guide states estimated time commitment (5-10 minutes)

**Acceptance**: All 7 guide elements are visible and readable.

### Test Case 1.2: Guide Does Not Block Interaction
**Given**: Usage guide is displayed  
**When**: User clicks "Browse Files" button in FileUploader  
**Then**:
1. ✅ File browser opens normally
2. ✅ No JavaScript errors in console
3. ✅ Guide does not overlap or obstruct the FileUploader

**Acceptance**: FileUploader is fully accessible and functional.

### Test Case 1.3: Guide Responsive on Tablet
**Given**: Browser resized to tablet width (768px)  
**When**: User views the upload page  
**Then**:
1. ✅ Guide text wraps appropriately (no horizontal scrolling)
2. ✅ Guide remains readable (font size adequate)
3. ✅ FileUploader is still accessible below guide
4. ✅ Layout uses flexbox/grid, not fixed widths

**Acceptance**: No layout breakage or unwanted scrolling.

### Test Case 1.4: Keyboard Navigation
**Given**: Usage guide is displayed  
**When**: User navigates using Tab key  
**Then**:
1. ✅ Focus outline visible on "Browse Files" button
2. ✅ Tab order is logical (guide text → button → form elements)
3. ✅ Shift+Tab works to navigate backwards
4. ✅ Enter/Space activates buttons

**Acceptance**: Keyboard navigation works smoothly.

### Test Case 1.5: Screen Reader Announcement
**Given**: Using a screen reader (e.g., NVDA, JAWS, macOS VoiceOver)  
**When**: Screen reader reaches the usage guide  
**Then**:
1. ✅ Heading is announced as heading
2. ✅ Bullet points are announced as a list
3. ✅ No excessive announcements or aria-hidden sections
4. ✅ Guide text is clear and flows naturally

**Acceptance**: All guide content is accessible via screen reader.

---

## Test: P2 - Transcript Preview Removal

### Test Case 2.1: Upload Success Removes Preview
**Given**: A valid VTT file with multiple cues (test-sample.vtt recommended)  
**When**: User uploads the file  
**Then**:
1. ✅ File validation succeeds (no errors shown)
2. ✅ "Ready to annotate" section appears with cue count
3. ✅ **NO** "Transcript Preview" section is visible
4. ✅ **NO** CueList component is rendered in the upload phase
5. ✅ "Start Annotating Now" button is the only call-to-action on page

**Acceptance**: Preview section is completely absent.

### Test Case 2.2: Start Annotating Still Works
**Given**: File upload succeeds (no preview shown)  
**When**: User clicks "Start Annotating Now"  
**Then**:
1. ✅ Annotation phase loads
2. ✅ Full CueList is shown with all cues (now that preview is removed, we trust the annotation phase displays correctly)
3. ✅ User can begin rating cues
4. ✅ No errors in console

**Acceptance**: Annotation flow is unaffected; full CueList visible during annotation.

### Test Case 2.3: Page Height Improvement
**Given**: File uploaded, no preview rendered  
**When**: Inspecting page layout (browser DevTools)  
**Then**:
1. ✅ Page height reduced compared to before (estimate: 30% reduction, from ~800px to ~550px)
2. ✅ No excessive white space
3. ✅ Content feels focused and streamlined

**Acceptance**: Layout is visually improved.

### Test Case 2.4: Single-Cue File Upload
**Given**: A VTT file with only 1 cue  
**When**: User uploads and proceeds  
**Then**:
1. ✅ "Ready to annotate" displays correctly
2. ✅ No preview shown (even for single cue)
3. ✅ "Start Annotating Now" works as expected

**Acceptance**: Edge case handled correctly.

### Test Case 2.5: Back to Upload After Session
**Given**: User has started annotation, then clicked "Back to upload"  
**When**: Upload page reloads  
**Then**:
1. ✅ Usage guide is visible again
2. ✅ Previous file is cleared
3. ✅ No errors in state management

**Acceptance**: Navigation cycle works smoothly.

---

## Test: Browser Compatibility

### Desktop Browsers
- [ ] Chrome 120+ (Chromium)
- [ ] Firefox 121+
- [ ] Safari 17+ (if applicable)

### Tablet Browsers
- [ ] iPad Safari (768px minimum width)
- [ ] Android Chrome

### Verify for Each Browser
1. Guide displays and is readable
2. FileUploader accepts drag & drop and click-to-browse
3. No layout broken or console errors
4. Preview is absent after upload

---

## Test: Build & Lint

```bash
# In repo root
yarn lint          # Should pass with no errors
yarn build         # TypeScript should compile cleanly (tsc -b && vite build)
```

**Acceptance**: No lint warnings/errors, no TypeScript errors.

---

## Rollback & Cleanup

If testing on the feature branch, changes can be reverted:
```bash
git checkout main       # Switch back to main
git branch -d 003-enhance-upload-page  # Delete feature branch locally
```

---

## Sign-Off Checklist

- [ ] P1 Guide visible, readable, non-blocking
- [ ] P1 Guide responsive (desktop, tablet)
- [ ] P1 Guide keyboard/screen-reader accessible
- [ ] P2 Preview section fully removed
- [ ] P2 Annotation phase works correctly
- [ ] P2 Layout improved (no excessive scroll)
- [ ] No TypeScript errors or lint warnings
- [ ] All tests passed
- [ ] Ready for code review

**Overall Status**: ✅ Manual testing guide complete. Implement, test, and proceed to code review.
