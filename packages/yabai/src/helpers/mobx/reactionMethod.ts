import { kReactableMethodNames, kShouldDispose } from '@/helpers/mobx/ReactableMixin';
import { IReactionDisposer, IReactionPublic, reaction } from 'mobx';

export default function reactionMethod<T>(expression: (r: IReactionPublic) => T): MethodDecorator {
  return (target: any, methodName, descriptor: TypedPropertyDescriptor<any>) => {
    if (!target[kReactableMethodNames]) target[kReactableMethodNames] = [];
    target[kReactableMethodNames].push(methodName);

    const effectFn = descriptor.value as Function;
    let disposer: IReactionDisposer | undefined;
    return {
      configurable: true,
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return ((...args: any[]) => {
          if (args[0] === kShouldDispose) {
            disposer?.();
            disposer = undefined;
            return;
          }

          if (disposer) {
            // 既にreactionの登録が終わっていた場合は、普通のメソッド呼び出しなので、オリジナルのメソッドを呼び出す
            effectFn.apply(self, args);
          } else {
            disposer = reaction(expression, v => {
              effectFn.apply(self, [v]);
            });
          }
        }) as any;
      },
    };
  };
}
