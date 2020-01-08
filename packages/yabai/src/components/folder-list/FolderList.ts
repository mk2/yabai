import applyMixins from '@/helpers/applyMixins';
import { store } from '@/models/AppStore';
import Loggable from '@/traits/Loggable';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { reaction } from 'mobx';

type FolderListOptions = {
  parent: blessed.Widgets.Node;
};

interface FolderList extends Loggable {}

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

    reaction(
      () => store.isInitialized,
      () => {
        this.folderList.setItems(store.folders.map(folder => folder.name) as any[]);
        this.folderList.select(store.currentFolderIndex);
        this.folderList.screen.render();
      },
    );
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
    store.setCurrentFolder(index);
    store.setUIState('SELECT_NOTE');
  }
}

applyMixins(FolderList, [Loggable]);

export default FolderList;
