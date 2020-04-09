import blessed from 'blessed';
import { Point, Range } from 'text-buffer';

import { calcUnicodeStrWidth } from '@/helpers/blessed/unicode';
import LoggableMixin from '@/helpers/logger/LoggableMixin';
import { uiStore } from '@/models/UIStore';

interface CursorMovableMixin extends LoggableMixin {
  cursorPosition: Point;
  scrollAmount: Point;
  readonly program: blessed.BlessedProgram;
  readonly textBuf: TextBuffer.TextBuffer;
  readonly textView: blessed.Widgets.BoxElement;
}

class CursorMovableMixin {
  get viewColumnSize() {
    return parseInt('' + this.textView.width);
  }

  get viewRowSize() {
    return parseInt('' + this.textView.height);
  }

  get contentRowSize() {
    return this.textBuf.getLineCount();
  }

  resetCursorPosition() {
    this.cursorPosition = new Point(0, 0);
  }

  resetScrollAmount() {
    this.scrollAmount = new Point(0, 0);
  }

  updateCursorPosition(_diff: IPoint) {
    const diff = Point.fromObject(_diff, false);
    const nPos = this.cursorPosition.translate(diff);

    if (this.contentRowSize < nPos.row) return;
    if (nPos.row < 0 || nPos.column < 0) return;

    const nextRowMaxColumn = this.textBuf.lineLengthForRow(nPos.row);
    nPos.column = nextRowMaxColumn < nPos.column ? nextRowMaxColumn : nPos.column;

    if (nPos.row < this.scrollAmount.row) {
      this.scrollAmount.row = nPos.row;
    }

    if (nPos.column < this.scrollAmount.column) {
      this.scrollAmount.column = nPos.column;
    }

    if (this.scrollAmount.row + this.viewRowSize < nPos.row) {
      this.scrollAmount.row += diff.row;
    }

    if (this.scrollAmount.column + this.viewColumnSize < nPos.column) {
      this.scrollAmount.column += diff.column;
    }

    this.cursorPosition = nPos;
    this.applyCursorPos(this.cursorPosition);
  }

  applyCursorPos(pos: Point) {
    const offsetCursorPosition = this.getVisiblePos(pos);
    this.program?.cursorPos(offsetCursorPosition.row, offsetCursorPosition.column);
  }

  private getVisiblePos(pos: Point) {
    const startPos = new Point(pos.row, 0);
    const curPos = pos;

    const row = pos.translate(this.scrollAmount.negate()).row;
    const column = calcUnicodeStrWidth(this.textBuf.getTextInRange(new Range(startPos, curPos)));
    return new Point(row, column).translate({
      row: parseInt('' + this.textView.position.top),
      column: Math.round(parseInt('' + this.textView.screen.width) * (uiStore.noteListViewWidthPercentage / 100)),
    });
  }
}

export default CursorMovableMixin;
