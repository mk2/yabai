import FolderList from '@/components/folder-list/FolderList';
import NoteList from '@/components/note-list/NoteList';
import TextEditor from '@/components/text-editor/TextEditor';
import TopBar from '@/components/top-bar/TopBar';
import applyMixins from '@/helpers/applyMixins';
import { store } from '@/models/AppStore';
import { config } from '@/models/Config';
import Loggable from '@/traits/Loggable';
import blessed from 'blessed';
import { reaction } from 'mobx';

interface App extends Loggable {}

class App {
  private rootScreen: blessed.Widgets.Screen;
  private program: blessed.BlessedProgram;

  private noteList?: NoteList;
  private textEditor?: TextEditor;
  private textPreview?: TextEditor;
  private topBar?: TopBar;
  private folderList?: FolderList;

  constructor() {
    this.program = blessed.program();
    this.program.disableMouse();
    this.rootScreen = blessed.screen({
      program: this.program,
      smartCSR: true,
      fullUnicode: true,
    });
  }

  async init() {
    await config.init();
    this.rootScreen.title = 'bce';

    this.noteList = new NoteList({
      parent: this.rootScreen,
      top: 1,
      bottom: 0,
      left: 0,
      right: 0,
      width: '20%',
    });
    this.textEditor = new TextEditor({
      parent: this.rootScreen,
      top: 1,
      bottom: 0,
      right: 0,
      width: '80%',
    });
    this.textPreview = new TextEditor({
      parent: this.rootScreen,
      top: 1,
      bottom: 0,
      right: 0,
      width: '80%',
      content: 'プレビュー',
    });
    this.textPreview.hide();
    this.topBar = new TopBar({
      parent: this.rootScreen,
    });
    this.folderList = new FolderList({
      parent: this.rootScreen,
    });
    this.folderList.hide();

    this.rootScreen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });
    this.rootScreen.key(['s'], () => {
      this.logger.info('hide textEditor');
      this.textEditor?.hide();
      this.textPreview?.show();
      this.rootScreen.render();
    });
    this.noteList.focus();

    store.init();

    reaction(
      () => store.uiState,
      () => {
        if (store.uiState === 'SELECT_NOTE') {
          this.folderList?.hide();
          this.noteList?.focus();
        } else if (store.uiState === 'SELECT_FOLDER') {
          this.folderList?.focus();
        } else if (store.uiState === 'EDIT_NOTE') {
          this.folderList?.hide();
          this.textPreview?.hide();
          this.textEditor?.show();
        }
        this.rootScreen.render();
      },
    );
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }
}

applyMixins(App, [Loggable]);

export default App;
