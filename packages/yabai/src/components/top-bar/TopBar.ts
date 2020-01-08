import applyMixins from '@/helpers/applyMixins';
import { store } from '@/models/AppStore';
import Loggable from '@/traits/Loggable';
import blessed from 'blessed';
import { reaction } from 'mobx';

type TopBarOptions = {
  parent: blessed.Widgets.Node;
};

interface TopBar extends Loggable {}

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

applyMixins(TopBar, [Loggable]);

export default TopBar;
