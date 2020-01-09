import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { store } from '@/models/AppStore';
import blessed from 'blessed';
import { reaction } from 'mobx';
import TextBuffer from 'text-buffer';
import { SetRequired } from 'type-fest';

type TextEditorOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextEditor extends LoggableMixin {}

class TextEditor {
  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;

  constructor(options: TextEditorOptions) {
    this.textBuf = new TextBuffer();
    this.textView = blessed.box({
      ...options,
    });
    this.textView.setContent(options?.content || '');

    reaction(
      () => store.isInitialized,
      () => this.setContent(),
    );
    reaction(
      () => store.currentDocument,
      () => this.setContent(),
    );
  }

  show() {
    this.textView.show();
  }

  hide() {
    this.textView.hide();
  }

  setContent() {
    this.textView.setContent(store.currentDocument?.content || '');
    this.textView.screen.render();
  }
}

applyMixins(TextEditor, [LoggableMixin]);

export default TextEditor;
