// src/store/useToastStore.ts
import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  imageUrl?: string;
  duration?: number;
  linkUrl?: string; // 🌟 잘 들어있습니다!
}

// 🌟 옵션 타입을 따로 정의해두는 게 깔끔합니다.
interface ToastOptions {
  title?: string;
  imageUrl?: string;
  duration?: number;
  linkUrl?: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (
    message: string,
    type: ToastType,
    // 🌟 1. 여기서 정의한 ToastOptions를 사용하도록 교체!
    options?: ToastOptions
  ) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);

    // 🌟 2. 여기서 linkUrl도 꺼내줘야 합니다!
    const { title, imageUrl, duration = 5000, linkUrl } = options;

    set((state) => ({
      // 🌟 3. 이제 꺼낸 linkUrl을 객체에 담아줍니다.
      toasts: [...state.toasts, { id, message, type, title, imageUrl, duration, linkUrl }]
    }));

  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));