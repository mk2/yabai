import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';
import { uiStore } from '@/models/UIStore';
import { boundMethod } from 'autobind-decorator';
import blessed from 'blessed';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';
import TextBuffer, { Point, Range } from 'text-buffer';
import { SetRequired } from 'type-fest';

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
  cursorPosition = new Point(0, 0);
  scrollAmount = new Point(0, 0);

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
    this.applyCursorPos(this.cursorPosition);
  }

  @reactionMethod(() => appStore.currentEditingCache)
  reloadContent() {
    if (!appStore.currentEditingCache) return;
    this.resetCursorPosition();
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
    } else if (key?.ch) {
      this.textBuf.insert(this.cursorPosition, key.ch);
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
    const startLine = new Point(this.scrollAmount.row, 0);
    const endLine = new Point(this.scrollAmount.row + this.viewRowSize, 0);
    this.textView.setContent(this.textBuf.getTextInRange(new Range(startLine, endLine)));
  }
}

applyMixins(TextEditor, [LoggableMixin, ReactableMixin, CursorMovableMixin]);

export default TextEditor;
