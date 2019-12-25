import blessed from 'blessed';

type NoteTreeOptions = blessed.Widgets.ListOptions<any>;

export default class NoteTree {
  private noteList: blessed.Widgets.ListElement;

  constructor(parent: blessed.Widgets.Screen, options?: NoteTreeOptions) {
    this.noteList = blessed.list({
      ...options,
      parent,
    });
  }
}
