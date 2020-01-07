export default function applyMixins<T extends Record<string, any>>(derivedCtor: T, baseCtors: any[]): T {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!);
    });
  });
  return derivedCtor;
}
