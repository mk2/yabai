import NoteList from '@/components/note-list/NoteList';
import TextEditor from '@/components/text-editor/TextEditor';
import applyMixins from '@/helpers/applyMixins';
import AppState from '@/models/AppStore';
import Loggable from '@/traits/Loggable';
import blessed from 'blessed';

export const store = new AppState();

interface App extends Loggable {}

class App {
  private rootScreen: blessed.Widgets.Screen;
  private program: blessed.BlessedProgram;

  private noteList?: NoteList;
  private textEditor?: TextEditor;
  private textPreview?: TextEditor;

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
    this.rootScreen.title = 'bce';

    this.noteList = new NoteList({
      parent: this.rootScreen,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 20,
    });
    this.textEditor = new TextEditor({
      parent: this.rootScreen,
      top: 0,
      bottom: 0,
      left: 21,
      right: 0,
    });
    this.textPreview = new TextEditor({
      parent: this.rootScreen,
      top: 0,
      bottom: 0,
      left: 21,
      right: 0,
      content: 'プレビュー',
    });
    this.textPreview.hide();

    this.rootScreen.key(['escape', 'q', 'C-c'], (ch, key) => {
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
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }
}

applyMixins(App, [Loggable]);

export default App;
