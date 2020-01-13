import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { appStore } from '@/models/AppStore';
import { uiStore } from '@/models/UIStore';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import TextBuffer, { Point, Range } from 'text-buffer';
import { SetRequired } from 'type-fest';

type Point = TextBuffer.Point;
type Range = TextBuffer.Range;
type IPoint = TextBuffer.PointCompatible;
type IRange = TextBuffer.RangeCompatible;

type Key = {
  sequence?: string;
  ch?: string;
  full?: string;
  name?: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
};

type TextEditorOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextEditor extends LoggableMixin, ReactableMixin {}

class TextEditor {
  cursorPosition: Point = new Point(0, 0);

  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;
  program: blessed.BlessedProgram;

  constructor(program: blessed.BlessedProgram, options: TextEditorOptions) {
    this.textBuf = new TextBuffer();
    this.textView = blessed.box({
      ...options,
    });
    this.textView.on('keypress', this.onKeypress);
    this.textView.on('blur', this.onBlur);
    this.textBuf.onDidReload(this.onDidReload);
    this.program = program;
    this.makeReactable();
  }

  show() {
    this.textView.show();
  }

  hide() {
    this.textView.screen.grabKeys = false;
    this.textView.hide();
  }

  focus() {
    this.show();
    this.textView.screen.grabKeys = true;
    this.textView.focus();
  }

  @reactionMethod(() => appStore.currentEditingCache)
  reloadContent() {
    if (!appStore.currentEditingCache) return;
    this.textBuf.setPath(appStore.currentEditingCache);
    this.textBuf.reload();
  }

  @boundMethod
  onDidReload() {
    this.textView.setContent(this.textBuf.getText());
    this.cursorPosition = new Point(0, 0);
    this.textView.screen.render();
  }

  @boundMethod
  onKeypress(ch?: string, key?: Key) {
    if (key?.name === 'escape') {
      uiStore.setUIState('SELECT_NOTE');
    } else if (key?.name === 'up') {
      this.updateCursorPosition({ row: -1, column: 0 });
    } else if (key?.name === 'down') {
      this.updateCursorPosition({ row: 1, column: 0 });
    } else if (key?.name === 'left') {
      this.updateCursorPosition({ row: 0, column: -1 });
    } else if (key?.name === 'right') {
      this.updateCursorPosition({ row: 0, column: 1 });
    } else if (key?.ch) {
      this.textBuf.insert(this.cursorPosition, key.ch);
      this.updateCursorPosition({ row: 0, column: 1 });
      this.textView.setContent(this.textBuf.getText());
      this.textView.screen.render();
    }
  }

  @boundMethod
  onBlur() {
    this.logger.info('onBlur');
  }

  updateCursorPosition(diff: IPoint) {
    const nextCursorPosition = this.cursorPosition.translate(diff);
    const nextRow = nextCursorPosition.row;
    const nextColumn = nextCursorPosition.column;
    if (nextRow < 0 || nextColumn < 0) return;
    if (this.textBuf.getLineCount() <= nextRow) return;
    const nextRowMaxColumn = this.textBuf.lineLengthForRow(nextRow);
    nextCursorPosition.column = nextRowMaxColumn < nextColumn ? nextRowMaxColumn : nextColumn;
    this.cursorPosition = nextCursorPosition;
    this.applyCursorPos(this.cursorPosition);
  }

  applyCursorPos(pos: Point) {
    const offsetCursorPosition = this.getVisiblePos(pos);
    this.program?.cursorPos(offsetCursorPosition.row, offsetCursorPosition.column);
  }

  getVisiblePos(p: Point) {
    const col = (blessed as any).unicode.strWidth(this.textBuf.getTextInRange(new Range(new Point(p.row, 0), p)));
    return new Point(p.row, col).translate({
      row: parseInt('' + this.textView.position.top),
      column: Math.round((this.textView.screen.width as number) * (uiStore.noteListViewWidthPercentage / 100)),
    });
  }
}

applyMixins(TextEditor, [LoggableMixin, ReactableMixin]);

export default TextEditor;
