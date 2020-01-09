import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { store } from '@/models/AppStore';
import blessed from 'blessed';
import { reaction } from 'mobx';

type TopBarOptions = {
  parent: blessed.Widgets.Node;
};

interface TopBar extends LoggableMixin, ReactableMixin {}

class TopBar {
  private view: blessed.Widgets.BoxElement;

  constructor(options: TopBarOptions) {
    this.view = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      parent: options.parent,
    });

    reaction(
      () => store.currentFolder,
      () => this.view.setContent(`>>> ${store.currentFolder?.name || 'NOT SELECTED'}`),
    );
  }

  @reactionMethod(() => store.currentFolder)
  setContent() {
    this.view.setContent(`>>> ${store.currentFolder?.name || 'NOT SELECTED'}`);
  }
}

applyMixins(TopBar, [LoggableMixin, ReactableMixin]);

export default TopBar;
