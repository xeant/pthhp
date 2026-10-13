
import { EventEmitter } from 'events';

// 🌟 핵심: global 객체에 저장해서 서버가 켜져 있는 동안 단 하나만 유지하게 합니다.
const globalForEvents = global as unknown as {
  notificationEvents: EventEmitter
};

export const notificationEvents =
  globalForEvents.notificationEvents || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.notificationEvents = notificationEvents;
}

// 🌟 리스너 제한 해제 (알림이 많아질 경우 대비)
notificationEvents.setMaxListeners(0);