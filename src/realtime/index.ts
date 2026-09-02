// ============================================================
// Realtime abstraction — transport-agnostic subscriptions
// ============================================================
import type { WidgetProgressEvent, AgentLogEntry } from '@/types';

type RealtimeEventMap = {
  'widget.progress': WidgetProgressEvent;
  'agent.log': AgentLogEntry;
};

type Handler<K extends keyof RealtimeEventMap> = (data: RealtimeEventMap[K]) => void;
type UnsubscribeFn = () => void;

const subscribers: { [K in keyof RealtimeEventMap]?: Set<Handler<K>> } = {};
let ws: WebSocket | null = null;
let wsUrl: string | null = null;

function connect(url: string) {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  wsUrl = url;
  ws = new WebSocket(url);
  ws.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data) as { event: keyof RealtimeEventMap; data: unknown };
      const handlers = subscribers[payload.event];
      if (handlers) {
        (handlers as Set<Handler<keyof RealtimeEventMap>>).forEach((h) => h(payload.data as never));
      }
    } catch { /* ignore malformed */ }
  };
  ws.onclose = () => {
    ws = null;
  };
}

function disconnect() {
  ws?.close();
  ws = null;
}

function on<K extends keyof RealtimeEventMap>(event: K, handler: Handler<K>): UnsubscribeFn {
  if (!subscribers[event]) {
    (subscribers as Record<string, Set<unknown>>)[event] = new Set();
  }
  (subscribers[event] as Set<Handler<K>>).add(handler);
  return () => {
    (subscribers[event] as Set<Handler<K>>).delete(handler);
  };
}

// Emit (for mock/testing purposes)
function emit<K extends keyof RealtimeEventMap>(event: K, data: RealtimeEventMap[K]) {
  const handlers = subscribers[event];
  if (handlers) {
    (handlers as Set<Handler<K>>).forEach((h) => h(data));
  }
}

export const realtime = { connect, disconnect, on, emit };
