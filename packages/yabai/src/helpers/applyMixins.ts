import { Class } from 'type-fest';

export default function applyMixins<T>(derivedCtor: Class<T>, baseCtors: Class<any>[]): Class<T> {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!);
    });
  });
  return derivedCtor;
}
