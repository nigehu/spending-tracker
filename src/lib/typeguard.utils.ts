export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }
  if (itemGuard) {
    return value.every(itemGuard);
  }
  return true;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, unknown> {
  return isObject(obj) && key in obj;
}
