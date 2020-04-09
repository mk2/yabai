import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';
import { uiStore } from '@/models/UIStore';

type FolderListOptions = {
  parent: blessed.Widgets.Node;
};

interface FolderList extends LoggableMixin, ReactableMixin {}

class FolderList {
  private folderList: blessed.Widgets.ListElement;

  constructor(options: FolderListOptions) {
    this.folderList = blessed.list({
      top: 'center',
      left: 'center',
      width: '50%',
      height: '90%',
      keys: true,
      mouse: false,
      border: {
        type: 'line',
      },
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan',
        },
        style: {
          inverse: true,
        },
      },
      style: {
        item: {
          hover: {
            bg: 'blue',
          },
        },
        selected: {
          bg: 'blue',
          bold: true,
        },
      },
      parent: options.parent,
    });
    this.folderList.on('select', this.onSelect);
    this.makeReactable();
  }

  show() {
    this.folderList.show();
  }

  hide() {
    this.folderList.hide();
  }

  focus() {
    this.show();
    this.folderList.focus();
  }

  @boundMethod
  onSelect(_item: blessed.Widgets.BoxElement, index: number) {
    appStore.setCurrentFolder(index);
    uiStore.setUIState('SELECT_NOTE');
  }

  @reactionMethod(() => appStore.isInitialized)
  reloadItems() {
    this.folderList.setItems(appStore.folders.map(folder => folder.name));
    this.folderList.select(appStore.currentFolderIndex);
    this.folderList.screen.render();
  }
}

applyMixins(FolderList, [LoggableMixin, ReactableMixin]);

export default FolderList;
