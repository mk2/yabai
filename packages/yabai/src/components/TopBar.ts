import blessed from 'blessed';
import { reaction } from 'mobx';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';

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
      () => appStore.currentFolder,
      () => this.view.setContent(`>>> ${appStore.currentFolder?.name || 'NOT SELECTED'}`),
    );
  }

  @reactionMethod(() => appStore.currentFolder)
  setContent() {
    this.view.setContent(`>>> ${appStore.currentFolder?.name || 'NOT SELECTED'}`);
  }
}

applyMixins(TopBar, [LoggableMixin, ReactableMixin]);

export default TopBar;
