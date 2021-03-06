import { action, computed, observable } from 'mobx';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';

type UIState = 'SELECT_NOTE' | 'SELECT_FOLDER' | 'EDIT_NOTE';

interface UIStore extends LoggableMixin {}

class UIStore {
  /**
   * UIState
   */

  @observable
  private _uiState: UIState = 'SELECT_NOTE';

  @computed
  get uiState() {
    return this._uiState;
  }

  @action.bound
  setUIState(uiState: UIState) {
    this._uiState = uiState;
  }

  /**
   * centerSeparateRatio
   */

  @observable
  private _centerSeparateRatio = 0.2;

  @computed
  get noteListViewWidthPercentage() {
    return Math.round(100 * this._centerSeparateRatio);
  }

  @computed
  get textViewWidthPercentage() {
    return 100 - this.noteListViewWidthPercentage;
  }
}

applyMixins(UIStore, [LoggableMixin]);

export const uiStore = new UIStore();

export default UIStore;
