import { useEffect, useCallback } from 'react';

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'submit',
  'reset',
  'checkbox',
  'radio',
  'file',
  'image',
  'range',
  'color',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
  'hidden',
]);

interface UseKeyboardShortcutsProps {
  onRateImportance?: (level: 0 | 1 | 2 | 3) => void;
  onNextCue?: () => void;
  onPreviousCue?: () => void;
  onNextUnrated?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onRateImportance,
  onNextCue,
  onPreviousCue,
  onNextUnrated,
  enabled = true,
}: UseKeyboardShortcutsProps) => {
  const isTextInputElement = useCallback((element: HTMLElement | null): boolean => {
    if (!element) return false;

    const contentEditableHost = element.closest('[contenteditable="true"]');
    if (contentEditableHost) return true;

    const roleTextboxHost = element.closest('[role="textbox"]');
    if (roleTextboxHost) return true;

    const textareaEl = element.closest('textarea');
    if (textareaEl instanceof HTMLTextAreaElement) return true;

    const selectEl = element.closest('select');
    if (selectEl instanceof HTMLSelectElement) return true;

    const inputEl = element.closest('input');
    if (inputEl instanceof HTMLInputElement) {
      const inputType = inputEl.type?.toLowerCase() ?? 'text';
      return !NON_TEXT_INPUT_TYPES.has(inputType);
    }

    return false;
  }, []);

  const isSpaceRestrictedElement = useCallback((element: HTMLElement | null): boolean => {
    if (!element) return false;
    return Boolean(
      element.closest(
        'button, a, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="option"], [role="switch"], [role="tab"]'
      )
    );
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    const isTyping = isTextInputElement(target);
    if (isTyping) return;

    const spaceRestricted = isSpaceRestrictedElement(target);

    // Prevent default browser behavior for our shortcuts
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (event.key) {
      case '0':
        preventDefault();
        onRateImportance?.(0);
        break;
      case '1':
        preventDefault();
        onRateImportance?.(1);
        break;
      case '2':
        preventDefault();
        onRateImportance?.(2);
        break;
      case '3':
        preventDefault();
        onRateImportance?.(3);
        break;
      case 'ArrowLeft':
        preventDefault();
        onPreviousCue?.();
        break;
      case 'ArrowRight':
        preventDefault();
        onNextCue?.();
        break;
      case 'ArrowUp':
        preventDefault();
        onPreviousCue?.();
        break;
      case 'ArrowDown':
        preventDefault();
        onNextCue?.();
        break;
      case 'n':
      case 'N':
        if (event.shiftKey) {
          preventDefault();
          onNextUnrated?.();
        } else {
          preventDefault();
          onNextCue?.();
        }
        break;
      case 'p':
      case 'P':
        preventDefault();
        onPreviousCue?.();
        break;
      case ' ': // Spacebar
        if (spaceRestricted) {
          return;
        }
        preventDefault();
        onNextCue?.();
        break;
    }
  }, [enabled, isTextInputElement, isSpaceRestrictedElement, onRateImportance, onNextCue, onPreviousCue, onNextUnrated]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [enabled, handleKeyPress]);

  // Return the shortcuts for display purposes
  return {
    shortcuts: [
      { key: '0-3', description: 'Rate current cue importance' },
      { key: '← →', description: 'Navigate previous/next cue' },
      { key: '↑ ↓', description: 'Navigate previous/next cue' },
      { key: 'Space', description: 'Next cue' },
      { key: 'N', description: 'Next cue' },
      { key: 'P', description: 'Previous cue' },
      { key: 'Shift+N', description: 'Next unrated cue' },
    ],
  };
};