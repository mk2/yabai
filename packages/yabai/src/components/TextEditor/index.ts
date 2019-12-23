import blessed from 'blessed';
import TextBufferAdaptor from '@/adaptors/TextBufferAdaptor';

export default class TextEditor {
  textBuf: TextBufferAdaptor;
  textView: blessed.Widgets.BoxElement;

  constructor(parent: blessed.Widgets.Screen) {
    this.textBuf = new TextBufferAdaptor();
    this.textView = blessed.box({
      parent,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
    this.textView.setContent('hoge');
  }
}
