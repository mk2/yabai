import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import { store } from '@/App';
import blessed from 'blessed';
import { reaction } from 'mobx';

type NoteTreeOptions = blessed.Widgets.ListOptions<any>;
export default class NoteTree {
  private logger = LoggerAdaptor.getLogger({ module: 'NoteTree' });
  private noteList: blessed.Widgets.ListElement;

  constructor(parent: blessed.Widgets.Screen, options?: NoteTreeOptions) {
    this.noteList = blessed.list({
      ...options,
      parent,
    });
    reaction(
      () => store.folders,
      () => {
        store.folders.forEach(folder => {
          this.noteList.addItem(folder.name);
          this.logger.info(folder.name);
        });
        this.noteList.screen.render();
      },
    );
  }
}
