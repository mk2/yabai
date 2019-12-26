import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import NoteTree from '@/components/note-tree/NoteTree';
import TextEditor from '@/components/text-editor/TextEditor';
import AppState from '@/models/AppStore';
import blessed from 'blessed';

export const store = new AppState();

export default class App {
  private logger = LoggerAdaptor.getLogger({ module: 'App' });
  private rootScreen: blessed.Widgets.Screen;

  private noteTree?: NoteTree;
  private textEditor?: TextEditor;

  constructor() {
    this.rootScreen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
    });
  }

  async init() {
    this.rootScreen.title = 'bce';
    store.init();

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
