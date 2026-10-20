import { effect, type Signal, type ReadonlySignal } from '../signals/index.js';

export interface TemplateResult {
  strings: TemplateStringsArray;
  values: unknown[];
}

export interface RenderInstance {
  fragment: DocumentFragment;
  destroy: () => void;
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return { strings, values };
}

const templateCache = new Map<string, HTMLTemplateElement>();

export function render(result: TemplateResult): RenderInstance {
  const { strings, values } = result;
  const rawKey = strings.join('<!--?-->');

  let template = templateCache.get(rawKey);
  if (!template) {
    template = document.createElement('template');
    let markup = '';
    for (let i = 0; i < strings.length; i++) {
      markup += strings[i];
      if (i < values.length) {
        const lastChunk = strings[i] ?? '';
        const isAttr = /=["']?[^"'>]*$/.test(lastChunk);
        if (isAttr) {
          markup += `"__zuari_attr_${i}__"`;
        } else {
          markup += `<!--zuari-hole-${i}-->`;
        }
      }
    }
    template.innerHTML = markup;
    templateCache.set(rawKey, template);
  }

  const clone = template.content.cloneNode(true) as DocumentFragment;
  const cleanups: Array<() => void> = [];

  values.forEach((value, index) => {
    bindHole(clone, index, value, cleanups);
  });

  return {
    fragment: clone,
    destroy: () => {
      cleanups.forEach(c => c());
    }
  };
}

function bindHole(root: DocumentFragment, index: number, value: unknown, cleanups: Array<() => void>): void {
  // 1. Comment node text interpolation
  const commentNode = findComment(root, `zuari-hole-${index}`);
  if (commentNode) {
    const textNode = document.createTextNode('');
    commentNode.parentNode?.replaceChild(textNode, commentNode);

    if (isSignal(value)) {
      cleanups.push(
        (value as Signal<unknown>).subscribe(v => {
          textNode.textContent = v !== null && v !== undefined ? String(v) : '';
        })
      );
    } else if (typeof value === 'function') {
      const dispose = effect(() => {
        const val = (value as () => unknown)();
        textNode.textContent = val !== null && val !== undefined ? String(val) : '';
      });
      cleanups.push(dispose);
    } else if (value instanceof Node) {
      textNode.parentNode?.replaceChild(value, textNode);
    } else {
      textNode.textContent = value !== null && value !== undefined ? String(value) : '';
    }
    return;
  }

  // 2. Element attribute or event binding
  const marker = `__zuari_attr_${index}__`;
  const el = findElementWithAttribute(root, marker);
  if (el) {
    const { element, attrName } = el;
    if (attrName.startsWith('@') || attrName.startsWith('on')) {
      const eventName = (attrName.startsWith('@') ? attrName.slice(1) : attrName.slice(2)).toLowerCase();
      element.removeAttribute(attrName);
      if (typeof value === 'function') {
        const handler = value as EventListener;
        element.addEventListener(eventName, handler);
        cleanups.push(() => element.removeEventListener(eventName, handler));
      }
      return;
    }

    if (isSignal(value)) {
      cleanups.push(
        (value as Signal<unknown>).subscribe(v => {
          setAttr(element, attrName, v);
        })
      );
    } else if (typeof value === 'function') {
      const dispose = effect(() => {
        const v = (value as () => unknown)();
        setAttr(element, attrName, v);
      });
      cleanups.push(dispose);
    } else {
      setAttr(element, attrName, value);
    }
  }
}

function setAttr(el: Element, name: string, val: unknown): void {
  if (name === 'value' && (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
    el.value = val !== null && val !== undefined ? String(val) : '';
    return;
  }
  if (name === 'checked' && el instanceof HTMLInputElement) {
    el.checked = Boolean(val);
    return;
  }
  if (val === null || val === undefined || val === false) {
    el.removeAttribute(name);
  } else if (val === true) {
    el.setAttribute(name, '');
  } else {
    el.setAttribute(name, String(val));
  }
}

function isSignal(val: unknown): boolean {
  return typeof val === 'object' && val !== null && 'subscribe' in val && 'value' in val;
}

function findComment(node: Node, text: string): Comment | null {
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_COMMENT);
  let cur = iterator.nextNode() as Comment | null;
  while (cur) {
    if (cur.data === text) return cur;
    cur = iterator.nextNode() as Comment | null;
  }
  return null;
}

function findElementWithAttribute(root: Node, marker: string): { element: Element; attrName: string } | null {
  const iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
  let cur = iterator.nextNode() as Element | null;
  while (cur) {
    for (let i = 0; i < cur.attributes.length; i++) {
      const attr = cur.attributes[i];
      if (attr && attr.value.includes(marker)) {
        return { element: cur, attrName: attr.name };
      }
    }
    cur = iterator.nextNode() as Element | null;
  }
  return null;
}

export * from '../signals/index.js';
