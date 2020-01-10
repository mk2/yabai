import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import CSON from 'cson-parser';
import { DateTime } from 'luxon';
import { action, computed, observable } from 'mobx';
import uuidv4 from 'uuid/v4';

import { config } from './Config';

type Folder = {
  key: string;
  color: string;
  name: string;
};

type Document = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: 'MARKDOWN_NOTE';
  folder: string;
  title: string;
  tags: string[];
  content: string;
  lignesHighlighted: string[];
  isStarred: boolean;
  isTrashed: boolean;
};

type UIState = 'SELECT_NOTE' | 'SELECT_FOLDER' | 'EDIT_NOTE';

interface AppStore extends LoggableMixin {}

class AppStore {
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
   * Folders
   */

  @observable
  private _folders: Folder[] = [];

  @computed
  get folders() {
    return this._folders;
  }

  @action.bound
  async loadFolders() {
    this._folders = JSON.parse(await fs.readFile(config.folderFilePath, { encoding: 'utf8' })).folders;
  }

  /**
   * documents
   */

  @observable
  private _documents: Document[] = [];

  @computed
  get documents() {
    return this._documents;
  }

  @action.bound
  async loadDocuments() {
    const files = await fs.readdir(config.notesDirPath);
    return Promise.all(
      files.map(async file => {
        const document = CSON.parse(await fs.readFile(path.resolve(config.notesDirPath, file), { encoding: 'utf8' }));
        document.id = file;
        this.documents?.push(document);
      }),
    );
  }

  /**
   * currentFolder
   */

  @observable
  private _currentFolderIndex = 0;

  @computed
  get currentFolderIndex() {
    return this._currentFolderIndex;
  }

  @computed
  get currentFolder(): Folder | undefined {
    if (this.folders.length <= this.currentFolderIndex) return undefined;
    return this.folders?.[this.currentFolderIndex];
  }

  @action.bound
  setCurrentFolder(currentFolderIndex: number) {
    this._currentFolderIndex = currentFolderIndex;
  }

  /**
   * currentDocument
   */

  @observable
  private _currentDocumentId: string | undefined;

  @observable
  private _currentShowDocumentIndex = 0;

  @computed
  get currentShowDocumentIndex() {
    return this._currentShowDocumentIndex;
  }

  @action.bound
  setCurrentShowDocumentIndex(currentShowDocumentIndex: number) {
    this._currentShowDocumentIndex = currentShowDocumentIndex;
  }

  @computed
  get currentDocument(): Document | undefined {
    return this.documents?.find(document => document.id === this._currentDocumentId);
  }

  @action.bound
  setCurrentDocument(documentId: string | undefined) {
    this._currentDocumentId = documentId;
  }

  /**
   * currentEditingCache
   */

  @observable
  private _currentEditingCachePath: string | undefined;

  @computed
  get currentEditingCache() {
    return this._currentEditingCachePath;
  }

  async openCurrentEditingCache() {
    const datePrefix = DateTime.utc().toFormat('yyyyMMddHHmmss');
    const uid = uuidv4();
    const cacheFileName = `${datePrefix}-${uid}.md`;
    const currentEditingCachePath = path.resolve(config.cachesDirPath, cacheFileName);
    try {
      await fs.access(currentEditingCachePath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (e) {
      await fs.writeFile(currentEditingCachePath, this.currentDocument?.content, { encoding: 'utf8' });
    }
    this._currentEditingCachePath = currentEditingCachePath;
  }

  /**
   * currentFolderDocuments
   */

  @computed
  get currentFolderDocuments(): { document: Document; index: number }[] {
    const currentFolder = this.currentFolder;
    return this.documents
      .filter(document => !document.isTrashed && document.folder === currentFolder?.key)
      .map((d, i) => ({ document: d, index: i }));
  }

  /**
   * initialized
   */

  @observable
  private _isInitialized = false;

  @computed
  get isInitialized() {
    return this._isInitialized;
  }

  @action.bound
  async init() {
    try {
      await this.loadFolders();
      await this.loadDocuments();
      this._currentFolderIndex = 0;
      this._currentDocumentId = this.currentFolderDocuments[0]?.document.id;
      this._isInitialized = true;
    } catch (e) {
      this.logger.error(`Error: ${e.toString()}`);
    }
  }
}

applyMixins(AppStore, [LoggableMixin]);

export const store = new AppStore();

export default AppStore;
