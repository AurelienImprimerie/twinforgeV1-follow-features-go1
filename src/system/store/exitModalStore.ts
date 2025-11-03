/**
 * Exit Modal Store - Global state for exit confirmation modal
 * Manages exit modal state independently of component lifecycle
 */

import { create } from 'zustand';
import logger from '../../lib/utils/logger';

interface DirtyFieldInfo {
  section: string;
  fields: string[];
}

interface ExitModalState {
  isOpen: boolean;
  title: string;
  message: string;
  processName: string;
  dirtyFields: DirtyFieldInfo[];
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  onSaveAndExit: (() => void | Promise<void>) | null;

  // Actions
  showModal: (config: {
    title: string;
    message: string;
    processName: string;
    onConfirm: () => void;
    onCancel: () => void;
    onSaveAndExit?: () => void | Promise<void>;
    dirtyFields?: DirtyFieldInfo[];
  }) => void;
  hideModal: () => void;
  confirmExit: () => void;
  cancelExit: () => void;
  saveAndExit: () => Promise<void>;
}

/**
 * Global store for exit modal management
 * Ensures modal state is independent of component re-renders
 */
export const useExitModalStore = create<ExitModalState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  processName: '',
  dirtyFields: [],
  onConfirm: null,
  onCancel: null,
  onSaveAndExit: null,

  showModal: (config) => {
    logger.info('EXIT_MODAL_STORE', 'Showing exit modal', {
      title: config.title,
      processName: config.processName,
      hasSaveAndExit: !!config.onSaveAndExit,
      dirtyFieldsCount: config.dirtyFields?.length || 0,
      timestamp: new Date().toISOString()
    });

    set({
      isOpen: true,
      title: config.title,
      message: config.message,
      processName: config.processName,
      dirtyFields: config.dirtyFields || [],
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      onSaveAndExit: config.onSaveAndExit || null,
    });

    // Force immediate DOM update check
    setTimeout(() => {
      const modalElement = document.querySelector('.global-exit-modal');
      logger.info('EXIT_MODAL_STORE', 'Modal DOM check after show', {
        modalExists: !!modalElement,
        modalVisible: modalElement ? getComputedStyle(modalElement).display !== 'none' : false,
        timestamp: new Date().toISOString()
      });
    }, 10);
  },

  hideModal: () => {
    logger.info('EXIT_MODAL_STORE', 'Hiding exit modal', {
      wasOpen: get().isOpen,
      timestamp: new Date().toISOString()
    });

    set({
      isOpen: false,
      title: '',
      message: '',
      processName: '',
      dirtyFields: [],
      onConfirm: null,
      onCancel: null,
      onSaveAndExit: null,
    });
  },

  saveAndExit: async () => {
    const { onSaveAndExit } = get();
    logger.info('EXIT_MODAL_STORE', 'Save and exit triggered', {
      hasOnSaveAndExit: !!onSaveAndExit,
      timestamp: new Date().toISOString()
    });

    if (onSaveAndExit) {
      try {
        await onSaveAndExit();
        logger.info('EXIT_MODAL_STORE', 'Save and exit completed successfully', {
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('EXIT_MODAL_STORE', 'Save and exit failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    }
    get().hideModal();
  },

  confirmExit: () => {
    const { onConfirm } = get();
    logger.info('EXIT_MODAL_STORE', 'Exit confirmed', {
      hasOnConfirm: !!onConfirm,
      timestamp: new Date().toISOString()
    });

    if (onConfirm) {
      onConfirm();
    }
    get().hideModal();
  },

  cancelExit: () => {
    const { onCancel } = get();
    logger.info('EXIT_MODAL_STORE', 'Exit cancelled', {
      hasOnCancel: !!onCancel,
      timestamp: new Date().toISOString()
    });

    if (onCancel) {
      onCancel();
    }
    get().hideModal();
  },
}));