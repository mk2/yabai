import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';
import { uiStore } from '@/models/UIStore';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';
import { SetRequired } from 'type-fest';

type NoteListOptions = SetRequired<blessed.Widgets.ListOptions<any>, 'parent'>;

const kDefaultNoteListOption: Readonly<Partial<NoteListOptions>> = Object.freeze({
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
    this.noteList.key(['c'], this.onCKeyPressed);
    this.noteList.on('select', this.onSelect);
    this.makeReactable();
  }

  focus() {
    this.noteList.focus();
  }

  @boundMethod
  onUpKeyPressed() {
    if (0 < appStore.currentShowDocumentIndex) {
      appStore.setCurrentShowDocumentIndex(appStore.currentShowDocumentIndex - 1);
    }
  }

  @boundMethod
  onDownKeyPressed() {
    if (appStore.currentShowDocumentIndex < appStore.currentFolderDocuments.length - 1) {
      appStore.setCurrentShowDocumentIndex(appStore.currentShowDocumentIndex + 1);
    }
  }

  @boundMethod
  async onCKeyPressed() {
    await appStore.openNewDocument();
    uiStore.setUIState('EDIT_NOTE');
  }

  @boundMethod
  onFolderKeyPressed() {
    uiStore.setUIState('SELECT_FOLDER');
  }

  @boundMethod
  async onSelect() {
    await appStore.openCurrentEditingCache();
    uiStore.setUIState('EDIT_NOTE');
  }

  @reactionMethod(() => [appStore.isInitialized, appStore.currentFolder, uiStore.uiState])
  reloadItems() {
    this.noteList.setItems(appStore.currentFolderDocuments.map(({ document }) => document.title));
    this.noteList.select(appStore.currentShowDocumentIndex);
    this.noteList.screen.render();
  }

  @reactionMethod(() => appStore.currentShowDocumentIndex)
  setCurrentDocument() {
    appStore.setCurrentDocument(
      appStore.currentFolderDocuments.find(({ index }) => index === appStore.currentShowDocumentIndex)?.document.id,
    );
  }
}

applyMixins(NoteList, [LoggableMixin, ReactableMixin]);

export default NoteList;
