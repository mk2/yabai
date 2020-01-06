import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import NoteTree from '@/components/note-tree/NoteTree';
import TextEditor from '@/components/text-editor/TextEditor';
import AppState from '@/models/AppStore';
import blessed from 'blessed';

export const store = new AppState();

export default class App {
  private logger = LoggerAdaptor.getLogger({ module: 'App' });
  private rootScreen: blessed.Widgets.Screen;
  private program: blessed.BlessedProgram;

  private noteTree?: NoteTree;
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

    this.noteTree = new NoteTree({
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
      content: 'エディター',
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
    this.noteTree.focus();

    store.init();
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }
}
