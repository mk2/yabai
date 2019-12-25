import blessed from 'blessed';
import TextEditor from '@/components/text-editor/TextEditor';
import AppState from '@/models/AppState';
import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import NoteTree from '@/components/note-tree/NoteTree';

export default class App {
  private logger = LoggerAdaptor.getLogger({ module: 'App' });
  private rootScreen: blessed.Widgets.Screen;
  private state: AppState;

  private noteTree?: NoteTree;
  private textEditor?: TextEditor;

  constructor() {
    this.state = new AppState();
    this.rootScreen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
    });
  }

  async init() {
    this.rootScreen.title = 'bce';
    this.state.init();

    this.noteTree = new NoteTree(this.rootScreen, {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 20,
    });
    this.textEditor = new TextEditor(this.rootScreen, {
      top: 0,
      bottom: 0,
      left: 21,
      right: 0,
    });

    this.rootScreen.key(['escape', 'q', 'C-c'], (ch, key) => {
      return process.exit(0);
    });
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }
}
