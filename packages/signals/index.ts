/**
 * @zuari/signals
 * Zero-dependency fine-grained reactive state graph based on TC39 Signals.
 * Direct DOM updates without Virtual DOM overhead.
 */

export interface Signal<T> {
  value: T;
  peek(): T;
  subscribe(fn: (val: T) => void): () => void;
}

export interface ReadonlySignal<T> {
  readonly value: T;
  peek(): T;
  subscribe(fn: (val: T) => void): () => void;
}

let activeEffect: (() => void) | null = null;
const contextStack: Array<() => void> = [];

export function signal<T>(initialValue: T): Signal<T> {
  let val = initialValue;
  const subscribers = new Set<() => void>();
  const listeners = new Set<(v: T) => void>();

  return {
    get value(): T {
      if (activeEffect) {
        subscribers.add(activeEffect);
      }
      return val;
    },
    set value(newVal: T) {
      if (!Object.is(val, newVal)) {
        val = newVal;
        // Notify signal-specific value listeners
        for (const listener of Array.from(listeners)) {
          try {
            listener(val);
          } catch (err) {
            console.error('Error in signal listener:', err);
          }
        }
        // Trigger reactive effects
        const subs = Array.from(subscribers);
        for (const sub of subs) {
          sub();
        }
      }
    },
    peek(): T {
      return val;
    },
    subscribe(fn: (val: T) => void): () => void {
      listeners.add(fn);
      fn(val);
      return () => listeners.delete(fn);
    }
  };
}

export function computed<T>(fn: () => T): ReadonlySignal<T> {
  const result = signal<T>(undefined as unknown as T);
  effect(() => {
    result.value = fn();
  });
  return {
    get value(): T {
      return result.value;
    },
    peek(): T {
      return result.peek();
    },
    subscribe(listener: (val: T) => void): () => void {
      return result.subscribe(listener);
    }
  };
}

export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);

  const run = () => {
    if (cleanup && typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (err) {
        console.error('Error in effect cleanup:', err);
      }
    }
    contextStack.push(run);
    activeEffect = run;
    try {
      cleanup = fn();
    } finally {
      contextStack.pop();
      activeEffect = contextStack[contextStack.length - 1] || null;
    }
  };

  run();

  return () => {
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }
  };
}

export function batch<T>(fn: () => T): T {
  return fn();
}
