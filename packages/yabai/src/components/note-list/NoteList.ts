import { store } from '@/App';
import applyMixins from '@/helpers/applyMixins';
import Loggable from '@/traits/Loggable';
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

interface NoteList extends Loggable {}

class NoteList {
  private noteList: blessed.Widgets.ListElement;
  @observable
  private currentShowDocumentIndex = 0;

  constructor(options: NoteListOptions) {
    this.noteList = blessed.list({
      ...kDefaultNoteListOption,
      ...options,
    });
    this.noteList.key(['up'], this.onUpKeyPressed);
    this.noteList.key(['down'], this.onDownKeyPressed);
    reaction(
      () => store.isInitialized,
      () => {
        this.noteList.setItems(store.currentFolderDocuments.map(({ document }) => document.title) as any[]);
        this.noteList.select(this.currentShowDocumentIndex);
        this.noteList.screen.render();
      },
    );
    reaction(
      () => this.currentShowDocumentIndex,
      () => this.setCurrentDocument(),
    );
  }

  focus() {
    this.noteList.focus();
  }

  @boundMethod
  onUpKeyPressed() {
    if (0 < this.currentShowDocumentIndex) {
      this.currentShowDocumentIndex--;
    }
  }

  @boundMethod
  onDownKeyPressed() {
    if (this.currentShowDocumentIndex < store.currentFolderDocuments.length - 1) {
      this.currentShowDocumentIndex++;
    }
  }

  @action.bound
  setCurrentDocument() {
    store.setCurrentDocument(
      store.currentFolderDocuments.find(({ index }) => index === this.currentShowDocumentIndex)?.document.id,
    );
  }
}

applyMixins(NoteList, [Loggable]);

export default NoteList;
