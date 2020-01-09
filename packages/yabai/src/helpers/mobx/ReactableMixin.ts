export const kReactableMethodNames = Symbol('ReactableMethodNames');

export default class ReactableMixin {
  makeReactable() {
    const reactableMethodNames = (this as any)[kReactableMethodNames] as string[];
    for (const methodName of reactableMethodNames) {
      (this as any)[methodName]();
    }
  }
}
