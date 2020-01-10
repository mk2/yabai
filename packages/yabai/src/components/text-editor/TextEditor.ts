import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { store } from '@/models/AppStore';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { observable } from 'mobx';
import TextBuffer, { Point } from 'text-buffer';
import { SetRequired } from 'type-fest';

type Point = TextBuffer.Point;
type Range = TextBuffer.Range;

const textEditorStore = observable({
  cursorPosition: new Point(0, 0),
});

type TextEditorOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextEditor extends LoggableMixin, ReactableMixin {}

class TextEditor {
  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;
  program: blessed.BlessedProgram;

  constructor(program: blessed.BlessedProgram, options: TextEditorOptions) {
    this.textBuf = new TextBuffer();
    this.textView = blessed.box({
      ...options,
    });
    this.textBuf.onDidReload(this.onDidReload);
    this.program = program;
    this.makeReactable();
  }

  show() {
    this.textView.show();
  }

  hide() {
    this.textView.hide();
  }

  focus() {
    this.show();
    this.textView.focus();
  }

  @reactionMethod(() => store.currentEditingCache)
  reloadContent() {
    if (!store.currentEditingCache) return;
    this.textBuf.setPath(store.currentEditingCache);
    this.textBuf.reload();
  }

  @boundMethod
  onDidReload() {
    this.textView.setContent(this.textBuf.getText());
    this.updateCursorPosition();
    this.textView.screen.render();
  }

  updateCursorPosition() {
    const newCursorPosition = this.getVisiblePos(textEditorStore.cursorPosition);
    this.program?.cursorPos(newCursorPosition.row, newCursorPosition.column);
  }

  getVisiblePos(p: Point) {
    return p.translate({
      row: parseInt('' + this.textView.position.top),
      column: parseInt('' + this.textView.position.left),
    });
  }
}

applyMixins(TextEditor, [LoggableMixin, ReactableMixin]);

export default TextEditor;
