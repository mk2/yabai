import applyMixins from '@/helpers/applyMixins';
import { store } from '@/models/AppStore';
import Loggable from '@/traits/Loggable';
import blessed from 'blessed';
import { reaction } from 'mobx';
import TextBuffer from 'text-buffer';
import { SetRequired } from 'type-fest';

type TextEditorOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextEditor extends Loggable {}

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

applyMixins(TextEditor, [Loggable]);

export default TextEditor;
