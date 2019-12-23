import TextBuffer from 'text-buffer';

export default class TextBufferAdaptor {
  private textBuffer: TextBuffer.TextBuffer;

  constructor() {
    this.textBuffer = new TextBuffer();
  }
}
