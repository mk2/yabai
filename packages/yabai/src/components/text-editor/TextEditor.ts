import blessed from 'blessed';
import TextBuffer from 'text-buffer';

export default class TextEditor {
  textBuf: TextBuffer.TextBuffer;
  textView: blessed.Widgets.BoxElement;

  constructor(parent: blessed.Widgets.Screen) {
    this.textBuf = new TextBuffer();
    this.textView = blessed.box({
      parent,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
    this.textView.setContent('日本語');
  }
}
