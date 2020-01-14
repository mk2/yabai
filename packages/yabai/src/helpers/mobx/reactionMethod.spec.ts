import applyMixins from '@/helpers/mixin/applyMixins';
import * as mobx from 'mobx';

import ReactableMixin from './ReactableMixin';
import reactionMethod from './reactionMethod';

const dummyMethod = jest.fn();
const reactionMock = jest.spyOn(mobx, 'reaction');

interface TargetClass extends ReactableMixin {}
class TargetClass {
  @reactionMethod(() => ({}))
  dummyMethod(...args: any[]) {
    dummyMethod(args);
  }
}

applyMixins(TargetClass, [ReactableMixin]);

describe('reactionMethod', () => {
  it('必要なメソッドがミックスインされていること', () => {
    const target = new TargetClass();
    expect(target.makeReactable).toEqual(expect.any(Function));
    expect(target.unmakeReactable).toEqual(expect.any(Function));
  });
});
