import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { store } from '@/models/AppStore';
import blessed from 'blessed';
import { reaction } from 'mobx';

type TopBarOptions = {
  parent: blessed.Widgets.Node;
};

interface TopBar extends LoggableMixin {}

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
}

applyMixins(TopBar, [LoggableMixin]);

export default TopBar;
