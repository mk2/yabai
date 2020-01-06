import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import { store } from '@/App';
import blessed from 'blessed';
import { reaction } from 'mobx';
import { SetRequired } from 'type-fest';

type NoteTreeOptions = SetRequired<blessed.Widgets.ListOptions<any>, 'parent'>;

const defaultNoteListOption: Partial<NoteTreeOptions> = {
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
};
export default class NoteTree {
  private logger = LoggerAdaptor.getLogger({ module: 'NoteTree' });
  private noteList: blessed.Widgets.ListElement;

  constructor(options: NoteTreeOptions) {
    this.noteList = blessed.list({
      ...defaultNoteListOption,
      ...options,
    });
    reaction(
      () => store.isInitialized,
      () => {
        this.noteList.setItems(store.currentFolderDocuments.map(({ document }) => document.title) as any[]);
        this.noteList.select(0);
        this.noteList.screen.render();
      },
    );
  }

  focus() {
    this.noteList.focus();
  }
}
