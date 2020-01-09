import { kReactableMethodNames } from '@/traits/reactable';
import { IReactionPublic, reaction } from 'mobx';

export default function reactionMethod<T>(expression: (r: IReactionPublic) => T): MethodDecorator {
  return (target: any, methodName, descriptor: TypedPropertyDescriptor<any>) => {
    if (!target[kReactableMethodNames]) target[kReactableMethodNames] = [];
    target[kReactableMethodNames].push(methodName);

    const effectFn = descriptor.value as Function;
    return {
      configurable: true,
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return (() => {
          reaction(expression, v => {
            effectFn.apply(self, [v]);
          });
        }) as any;
      },
      set() {
        // do nothing
      },
    };
  };
}
