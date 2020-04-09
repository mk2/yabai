import blessed from 'blessed';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';
import { ReactableMixin, reactionMethod } from 'mobx-method-decorators';
import { SetRequired } from 'type-fest';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { appStore } from '@/models/AppStore';

type TextPreviewOptions = SetRequired<blessed.Widgets.BoxOptions, 'parent'>;

interface TextPreview extends LoggableMixin, ReactableMixin {}

class TextPreview {
  textView: blessed.Widgets.BoxElement;

  constructor(options: TextPreviewOptions) {
    this.textView = blessed.box({
      ...options,
    });
    marked.setOptions({
      renderer: new TerminalRenderer({
        tab: 2,
      }),
    });
    this.makeReactable();
  }

  show() {
    this.textView.show();
  }

  hide() {
    this.textView.hide();
  }

  @reactionMethod(() => [appStore.isInitialized, appStore.currentDocument?.content])
  setContent() {
    if (!appStore.currentDocument?.content) return;
    this.textView.setContent(marked(appStore.currentDocument.content));
    this.textView.screen.render();
  }
}

applyMixins(TextPreview, [LoggableMixin, ReactableMixin]);

export default TextPreview;
