import FolderList from '@/components/folder-list/FolderList';
import NoteList from '@/components/note-list/NoteList';
import TextEditor from '@/components/text-editor/TextEditor';
import TextPreview from '@/components/text-preview/TextPreview';
import TopBar from '@/components/top-bar/TopBar';
import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { appStore } from '@/models/AppStore';
import { config } from '@/models/Config';
import { uiStore } from '@/models/UIStore';
import blessed from 'blessed';

interface App extends LoggableMixin, ReactableMixin {}

class App {
  private rootScreen: blessed.Widgets.Screen;
  private program: blessed.BlessedProgram;

  private noteList?: NoteList;
  private textEditor?: TextEditor;
  private textPreview?: TextPreview;
  private topBar?: TopBar;
  private folderList?: FolderList;

  constructor() {
    this.program = blessed.program();
    this.program.disableMouse();
    this.program.cursorShape('block', true);
    this.rootScreen = blessed.screen({
      program: this.program,
      smartCSR: true,
      fullUnicode: true,
    });
    this.makeReactable();
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
    this.textEditor = new TextEditor(this.program, {
      parent: this.rootScreen,
      top: 1,
      bottom: 0,
      right: 0,
      width: '80%',
    });
    this.textEditor.hide();
    this.textPreview = new TextPreview({
      parent: this.rootScreen,
      top: 1,
      bottom: 0,
      right: 0,
      width: '80%',
    });
    this.topBar = new TopBar({
      parent: this.rootScreen,
    });
    this.folderList = new FolderList({
      parent: this.rootScreen,
    });
    this.folderList.hide();

    this.rootScreen.key(['escape', 'q', 'C-c'], () => {
      this.program?.cursorReset();
      return process.exit(0);
    });
    this.rootScreen.key(['s'], () => {
      this.logger.info('hide textEditor');
      this.textEditor?.hide();
      this.textPreview?.show();
      this.rootScreen.render();
    });
    this.noteList.focus();

    appStore.init();
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }

  @reactionMethod(() => uiStore.uiState)
  onUIStateChanged() {
    if (uiStore.uiState === 'SELECT_NOTE') {
      this.program?.hideCursor();
      this.folderList?.hide();
      this.textEditor?.hide();
      this.textPreview?.show();
      this.noteList?.focus();
    } else if (uiStore.uiState === 'SELECT_FOLDER') {
      this.program?.hideCursor();
      this.textEditor?.hide();
      this.textPreview?.show();
      this.folderList?.focus();
    } else if (uiStore.uiState === 'EDIT_NOTE') {
      this.folderList?.hide();
      this.textPreview?.hide();
      this.textEditor?.focus();
      this.program?.showCursor();
    }
    this.rootScreen.render();
  }
}

applyMixins(App, [LoggableMixin, ReactableMixin]);

export default App;
