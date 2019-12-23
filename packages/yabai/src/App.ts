import blessed from 'blessed';
import TextEditor from '@/components/text-editor/TextEditor';
import AppState from '@/models/AppState';
import LoggerAdaptor from '@/adaptors/LoggerAdaptor';

export default class App {
  private logger = LoggerAdaptor.getLogger({ module: 'App' });
  private rootScreen: blessed.Widgets.Screen;
  private state: AppState;

  constructor() {
    this.state = new AppState();
    this.rootScreen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
    });
  }

  async init() {
    this.rootScreen.title = 'bce';
    await this.state.init();

    new TextEditor(this.rootScreen);

    this.rootScreen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
  }

  start() {
    this.rootScreen.render();
    this.logger.info(`Yabai started!`);
  }
}
