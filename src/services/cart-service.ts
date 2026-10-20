import { signal, computed } from '../../packages/signals/index.js';
import type { Online3DModel } from './online-discovery.js';

export interface CartItem {
  model: Online3DModel;
  addedAt: number;
}

export const cartItems = signal<CartItem[]>([]);
export const isCartOpen = signal<boolean>(false);

export const cartCount = computed<number>(() => cartItems.value.length);

export function addToCart(model: Online3DModel): void {
  const existing = cartItems.value.find(item => item.model.id === model.id);
  if (!existing) {
    cartItems.value = [...cartItems.value, { model, addedAt: Date.now() }];
  }
}

export function removeFromCart(modelId: string): void {
  cartItems.value = cartItems.value.filter(item => item.model.id !== modelId);
}

export function clearCart(): void {
  cartItems.value = [];
}

export function isInCart(modelId: string): boolean {
  return cartItems.value.some(item => item.model.id === modelId);
}
