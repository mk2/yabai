import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import { store } from '@/App';
import blessed from 'blessed';
import { reaction } from 'mobx';
import TextBuffer from 'text-buffer';
import { SetRequired } from 'type-fest';

type TextEditorOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

export default class TextEditor {
  get logger() {
    return LoggerAdaptor.getLogger({ module: this.constructor.name });
  }
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
