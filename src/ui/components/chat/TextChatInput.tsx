/**
 * Text Chat Input Component
 * Input textuel pour communiquer avec le coach en mode texte
 * Avec boutons micro pour voice-to-text et live voice
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface TextChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  color?: string;
  className?: string;
  onVoiceToText?: () => void;
  onLiveVoice?: () => void;
  isRecording?: boolean;
  isProcessing?: boolean;
  processingText?: string;
}

const TextChatInput: React.FC<TextChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Tapez votre message...',
  color = '#3B82F6',
  className = '',
  onVoiceToText,
  onLiveVoice,
  isRecording = false,
  isProcessing = false,
  processingText = 'Traitement en cours...'
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Envoyer avec Enter (sans Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`text-chat-input-wrapper ${className}`}>
      {/* Processing Status Bar - En haut avec marge réduite */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '6px 16px',
              borderBottom: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
              background: `
                linear-gradient(180deg,
                  rgba(11, 14, 23, 0.8) 0%,
                  rgba(11, 14, 23, 0.6) 100%
                )
              `,
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '12px',
                height: '12px',
                border: `2px solid ${color}`,
                borderTopColor: 'transparent',
                borderRadius: '50%'
              }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {processingText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="text-chat-input"
        style={{
          padding: '12px 16px',
          borderTop: isProcessing ? 'none' : `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
          background: `
            linear-gradient(180deg,
              rgba(11, 14, 23, 0.6) 0%,
              rgba(11, 14, 23, 0.8) 100%
            )
          `,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
      {/* Textarea */}
      <div
        className="textarea-container flex-1"
        style={{
          position: 'relative',
          minHeight: '40px'
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{
            width: '100%',
            minHeight: '40px',
            maxHeight: '120px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: isFocused
              ? `2px solid color-mix(in srgb, ${color} 50%, transparent)`
              : '2px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Voice-to-Text Button (Micro enregistrement) */}
      {onVoiceToText && (
        <motion.button
          type="button"
          onClick={onVoiceToText}
          disabled={disabled}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isRecording
              ? `
                radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.4) 0%, transparent 70%),
                linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(220, 38, 38, 0.95))
              `
              : 'rgba(255, 255, 255, 0.08)',
            border: isRecording
              ? '2px solid rgba(239, 68, 68, 0.6)'
              : '2px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            position: 'relative',
            overflow: 'visible',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1
          }}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          aria-label="Enregistrement vocal"
        >
          <SpatialIcon
            Icon={ICONS.Mic}
            size={18}
            style={{
              color: isRecording ? 'white' : 'rgba(255, 255, 255, 0.7)',
              filter: isRecording ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))' : 'none'
            }}
          />
          {/* Animation de pulsation pendant l'enregistrement */}
          {isRecording && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.6)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3
                }}
              />
            </>
          )}
        </motion.button>
      )}

      {/* Live Voice Button (Communication vocale live) */}
      {onLiveVoice && (
        <motion.button
          type="button"
          onClick={onLiveVoice}
          disabled={disabled}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${color} 30%, transparent) 0%, transparent 70%),
              rgba(255, 255, 255, 0.1)
            `,
            border: `2px solid color-mix(in srgb, ${color} 40%, transparent)`,
            boxShadow: `0 0 20px color-mix(in srgb, ${color} 25%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1
          }}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          aria-label="Communication vocale live"
        >
          <SpatialIcon
            Icon={ICONS.Phone}
            size={18}
            style={{
              color: color,
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </motion.button>
      )}

      {/* Send Button */}
      <motion.button
        type="submit"
        disabled={!canSend}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: canSend
            ? `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${color} 40%, transparent) 0%, transparent 50%),
              rgba(255, 255, 255, 0.15)
            `
            : 'rgba(255, 255, 255, 0.05)',
          border: canSend
            ? `2px solid color-mix(in srgb, ${color} 50%, transparent)`
            : '2px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canSend ? 'pointer' : 'not-allowed',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          opacity: canSend ? 1 : 0.5
        }}
        whileHover={canSend ? { scale: 1.05 } : {}}
        whileTap={canSend ? { scale: 0.95 } : {}}
        aria-label="Envoyer le message"
      >
        <SpatialIcon
          Icon={ICONS.Send}
          size={18}
          style={{
            color: canSend ? color : 'rgba(255, 255, 255, 0.4)',
            filter: canSend ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
        />
      </motion.button>
      </form>
    </div>
  );
};

export default TextChatInput;
