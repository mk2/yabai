import { Class } from 'type-fest';

export default function applyMixins<T>(derivedCtor: Class<T>, baseCtors: Class<any>[]): Class<T> {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
      if (!propertyDescriptor) return;
      if (name === 'constructor') return;
      Object.defineProperty(derivedCtor.prototype, name, propertyDescriptor);
    });
  });
  return derivedCtor;
}
