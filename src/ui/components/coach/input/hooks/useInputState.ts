/**
 * Input State Hook
 * Manages text input state, focus, and textarea resizing
 */

import { useState, useRef, useEffect } from 'react';

export interface InputState {
  message: string;
  setMessage: (msg: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  clearMessage: () => void;
}

export function useInputState(): InputState {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const clearMessage = () => {
    setMessage('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  return {
    message,
    setMessage,
    isFocused,
    setIsFocused,
    inputRef,
    clearMessage
  };
}
