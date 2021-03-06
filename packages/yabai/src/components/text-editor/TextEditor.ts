import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';
import TextBuffer, { Point, Range } from 'text-buffer';
import { SetRequired } from 'type-fest';

import { shrinkStrWidth } from '@/helpers/blessed/unicode';
import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';
import { uiStore } from '@/models/UIStore';

import CursorMovableMixin from './CursorMovableMixin';

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

interface TextEditor extends LoggableMixin, ReactableMixin, CursorMovableMixin {}

class TextEditor {
  private isSaving = false;
  private isLoading = false;
  cursorPosition = new Point(0, 0);
  scrollAmount = new Point(0, 0);

  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;
  program: blessed.BlessedProgram;

  get isBusy() {
    return this.isSaving || this.isLoading;
  }

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
    this.applyCursorPos(this.cursorPosition);
  }

  @reactionMethod(() => appStore.currentEditingCache)
  reloadContent() {
    if (!appStore.currentEditingCache || this.isBusy) return;
    this.isLoading = true;
    this.textBuf.setPath(appStore.currentEditingCache);
    this.textBuf.reload();
  }

  @boundMethod
  onDidReload() {
    this.resetCursorPosition();
    this.resetScrollAmount();
    this.updateContent();
    this.applyCursorPos(this.cursorPosition);
    this.textView.screen.render();
    this.isLoading = false;
  }

  @boundMethod
  onKeypress(ch?: string, key?: Key) {
    if (this.isBusy) return;

    if (key?.name === 'escape') {
      this.save();
      uiStore.setUIState('SELECT_NOTE');
    } else if (key?.name === 'backspace') {
      this.textBuf.delete(new Range(this.cursorPosition.translate({ row: 0, column: -1 }), this.cursorPosition));
      this.updateCursorPosition({ row: 0, column: -1 });
    } else if (key?.name === 'delete') {
      this.textBuf.delete(new Range(this.cursorPosition));
      this.updateCursorPosition({ row: 0, column: -1 });
    } else if (key?.name === 'enter') {
      this.textBuf.insert(this.cursorPosition.translate({ row: 1, column: 0 }), '\n');
      this.updateCursorPosition({ row: 1, column: 0 });
    } else if (key?.name === 'up') {
      this.updateCursorPosition({ row: -1, column: 0 });
    } else if (key?.name === 'down') {
      this.updateCursorPosition({ row: 1, column: 0 });
    } else if (key?.name === 'left') {
      this.updateCursorPosition({ row: 0, column: -1 });
    } else if (key?.name === 'right') {
      this.updateCursorPosition({ row: 0, column: 1 });
    } else if (ch) {
      this.textBuf.insert(this.cursorPosition, ch);
      this.updateCursorPosition({ row: 0, column: 1 });
    }

    this.updateContent();
    this.textView.screen.render();
  }

  async save() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      await this.textBuf.save();
      await appStore.setCurrentDocumentContent(this.textBuf.getText());
    } finally {
      this.isSaving = false;
    }
  }

  @boundMethod
  onBlur() {
    this.logger.info('onBlur');
  }

  updateContent() {
    const startRow = this.scrollAmount.row;
    const startPos = new Point(startRow, 0);
    const endRow = this.scrollAmount.row + this.viewRowSize;
    const endPos = new Point(endRow, this.textBuf.lineLengthForRow(endRow));
    const bufferContent = this.textBuf.getTextInRange(new Range(startPos, endPos));
    const renderContent = [];
    const minColumn = this.scrollAmount.column;
    const maxColumn = this.scrollAmount.column + this.viewColumnSize;
    for (const line of bufferContent.split('\n')) {
      renderContent.push(shrinkStrWidth(line, maxColumn));
    }
    this.textView.setContent(renderContent.join('\n'));
  }
}

applyMixins(TextEditor, [LoggableMixin, ReactableMixin, CursorMovableMixin]);

export default TextEditor;
