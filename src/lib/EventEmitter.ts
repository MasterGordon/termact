export type EventMap = {
  [key: string]: any[];
};

type EventArgs<T extends EventMap, event extends keyof T> = T[event];

class EventEmitter<T extends EventMap> {
  private listeners: Map<
    keyof T,
    Set<(...args: EventArgs<T, keyof T>) => void>
  > = new Map();

  on<event extends keyof T>(
    event: event,
    listener: (...args: EventArgs<T, event>) => void
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as any);
  }

  off<event extends keyof T>(event: event, listener: (...args: any[]) => void) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener as any);
    }
  }

  emit<event extends keyof T>(event: event, ...args: EventArgs<T, event>) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((listener) => listener(...args));
    }
  }
}

export default EventEmitter;
