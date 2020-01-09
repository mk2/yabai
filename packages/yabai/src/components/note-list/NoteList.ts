import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { store } from '@/models/AppStore';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { observable, reaction } from 'mobx';
import { action } from 'mobx';
import { SetRequired } from 'type-fest';

type NoteListOptions = SetRequired<blessed.Widgets.ListOptions<any>, 'parent'>;

const kDefaultNoteListOption: Partial<NoteListOptions> = Object.freeze({
  keys: true,
  mouse: false,
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
});

interface NoteList extends LoggableMixin, ReactableMixin {}

class NoteList {
  private noteList: blessed.Widgets.ListElement;

  constructor(options: NoteListOptions) {
    this.noteList = blessed.list({
      ...kDefaultNoteListOption,
      ...options,
    });
    this.noteList.key(['up'], this.onUpKeyPressed);
    this.noteList.key(['down'], this.onDownKeyPressed);
    this.noteList.key(['f'], this.onFolderKeyPressed);
    this.makeReactable();
  }

  focus() {
    this.noteList.focus();
  }

  @boundMethod
  onUpKeyPressed() {
    if (0 < store.currentShowDocumentIndex) {
      store.setCurrentShowDocumentIndex(store.currentShowDocumentIndex - 1);
    }
  }

  @boundMethod
  onDownKeyPressed() {
    if (store.currentShowDocumentIndex < store.currentFolderDocuments.length - 1) {
      store.setCurrentShowDocumentIndex(store.currentShowDocumentIndex + 1);
    }
  }

  @boundMethod
  onFolderKeyPressed() {
    store.setUIState('SELECT_FOLDER');
  }

  @reactionMethod(() => [store.isInitialized, store.currentFolder])
  reloadItems() {
    this.noteList.setItems(store.currentFolderDocuments.map(({ document }) => document.title) as any[]);
    this.noteList.select(store.currentShowDocumentIndex);
    this.noteList.screen.render();
  }

  @reactionMethod(() => store.currentShowDocumentIndex)
  setCurrentDocument() {
    store.setCurrentDocument(
      store.currentFolderDocuments.find(({ index }) => index === store.currentShowDocumentIndex)?.document.id,
    );
  }
}

applyMixins(NoteList, [LoggableMixin, ReactableMixin]);

export default NoteList;
