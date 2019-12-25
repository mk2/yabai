import blessed from 'blessed';
import TextBuffer from 'text-buffer';

type TextEditorOptions = blessed.Widgets.BoxOptions;

export default class TextEditor {
  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;

  constructor(parent: blessed.Widgets.Screen, options?: TextEditorOptions) {
    this.textBuf = new TextBuffer();
    this.textView = blessed.box({
      ...options,
      parent,
    });
    this.textView.setContent('日本語');
  }
}
