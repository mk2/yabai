import { Class } from 'type-fest';

export default function applyMixins<T>(derivedCtor: Class<T>, baseCtors: Class[]): Class<T> {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (name === 'constructor') return;
      const propertyDescriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
      if (!propertyDescriptor) return;
      Object.defineProperty(derivedCtor.prototype, name, propertyDescriptor);
    });
  });
  return derivedCtor;
}
