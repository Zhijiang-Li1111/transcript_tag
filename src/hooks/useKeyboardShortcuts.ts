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
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onRateImportance,
  onNextCue,
  onPreviousCue,
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

  // Note: Removed isSpaceRestrictedElement - we now handle space uniformly with isTextInputElement

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const isTyping = isTextInputElement(target);

    // If user is typing in a text input, don't intercept any shortcuts
    // (except Escape to exit)
    if (isTyping) {
      if (event.key === 'Escape') {
        event.preventDefault();
        (target as any)?.blur?.();
      }
      return;
    }

    // Ignore modifier keys (Ctrl, Cmd, Alt)
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    // Helper to prevent default
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    // Handle all shortcuts
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
      case ' ': // Spacebar
        preventDefault();
        onNextCue?.();
        break;
    }
  }, [enabled, isTextInputElement, onRateImportance, onNextCue, onPreviousCue]);

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
    ],
  };
};