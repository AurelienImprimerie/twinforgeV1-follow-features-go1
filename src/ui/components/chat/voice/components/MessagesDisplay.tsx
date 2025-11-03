/**
 * Messages Display Component
 * Renders chat messages and transcriptions
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface Message {
  id?: string;
  role: 'user' | 'coach';
  content: string;
  emotion?: string;
}

interface MessagesDisplayProps {
  messages: Message[];
  currentTranscription?: string;
  modeColor: string;
  isTextMode: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessagesDisplay: React.FC<MessagesDisplayProps> = ({
  messages,
  currentTranscription,
  modeColor,
  isTextMode,
  messagesEndRef
}) => {
  if (messages.length === 0 && !currentTranscription) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${modeColor} 35%, transparent) 0%, transparent 70%), rgba(255, 255, 255, 0.1)`,
              border: `2px solid color-mix(in srgb, ${modeColor} 40%, transparent)`,
              boxShadow: `0 0 20px color-mix(in srgb, ${modeColor} 25%, transparent)`
            }}
          >
            <SpatialIcon
              Icon={isTextMode ? ICONS.MessageSquare : ICONS.Mic}
              size={20}
              style={{ color: modeColor }}
            />
          </div>
          <p className="text-sm text-white/70">
            {isTextMode
              ? 'Écrivez votre message pour commencer'
              : 'Parlez pour commencer la conversation'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`message-item mb-3 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          <div
            className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
              message.role === 'user'
                ? 'bg-white/10 text-white'
                : 'bg-gradient-to-br from-white/15 to-white/5 text-white'
            }`}
            style={{
              backdropFilter: 'blur(8px)',
              border:
                message.role === 'coach'
                  ? `1px solid color-mix(in srgb, ${modeColor} 30%, transparent)`
                  : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            {message.emotion && (
              <span className="text-xs text-white/50 mt-1 block">
                {message.emotion}
              </span>
            )}
          </div>
        </motion.div>
      ))}

      {currentTranscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="message-item mb-3 text-right"
        >
          <div
            className="inline-block px-4 py-2 rounded-2xl max-w-[80%] bg-white/10 text-white"
            style={{
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="text-sm leading-relaxed">{currentTranscription}</p>
            <motion.span
              className="inline-block ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
};
