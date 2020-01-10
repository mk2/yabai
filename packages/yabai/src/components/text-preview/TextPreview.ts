import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import ReactableMixin from '@/helpers/mobx/ReactableMixin';
import reactionMethod from '@/helpers/mobx/reactionMethod';
import { appStore } from '@/models/AppStore';
import blessed from 'blessed';
import { SetRequired } from 'type-fest';

type TextPreviewOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextPreview extends LoggableMixin, ReactableMixin {}

class TextPreview {
  textView: blessed.Widgets.BoxElement;

  constructor(options: TextPreviewOptions) {
    this.textView = blessed.box({
      ...options,
    });
    this.makeReactable();
  }

  show() {
    this.textView.show();
  }

  hide() {
    this.textView.hide();
  }

  @reactionMethod(() => [appStore.isInitialized, appStore.currentDocument])
  setContent() {
    this.textView.setContent(appStore.currentDocument?.content || '');
    this.textView.screen.render();
  }
}

applyMixins(TextPreview, [LoggableMixin, ReactableMixin]);

export default TextPreview;
