import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { store } from '@/models/AppStore';
import blessed from 'blessed';
import { reaction } from 'mobx';
import { SetRequired } from 'type-fest';

type TextPreviewOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextPreview extends LoggableMixin {}

class TextPreview {
  textView: blessed.Widgets.BoxElement;

  constructor(options: TextPreviewOptions) {
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

applyMixins(TextPreview, [LoggableMixin]);

export default TextPreview;
