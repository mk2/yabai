import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import { action, computed, observable } from 'mobx';

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
}

applyMixins(UIStore, [LoggableMixin]);

export const uiStore = new UIStore();

export default UIStore;
