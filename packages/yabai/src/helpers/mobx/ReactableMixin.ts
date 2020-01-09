export const kReactableMethodNames = Symbol('ReactableMethodNames');
export const kShouldDispose = Symbol('ShouldDispose');

export default class ReactableMixin {
  makeReactable() {
    const reactableMethodNames = (this as any)[kReactableMethodNames] as string[];
    for (const methodName of reactableMethodNames) {
      (this as any)[methodName]();
    }
  }

  unmakeReactable() {
    const reactableMethodNames = (this as any)[kReactableMethodNames] as string[];
    for (const methodName of reactableMethodNames) {
      (this as any)[methodName](kShouldDispose);
    }
  }
}
