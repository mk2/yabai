import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import CSON from 'cson-parser';
import { DateTime } from 'luxon';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
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

interface AppStore extends LoggableMixin {}

class AppStore {
  /**
   * Folders
   */

  @observable
  private _folders: Folder[] = [];

  @computed
  get folders() {
    return this._folders;
  }

  @actionAsync
  async loadFolders() {
    this._folders = JSON.parse(await task(fs.readFile(config.folderFilePath, { encoding: 'utf8' }))).folders;
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

  @actionAsync
  async loadDocuments() {
    const files = (await task(fs.readdir(config.notesDirPath))).filter(e => /(\.cson)$/.test(e));
    this._documents = await task(
      Promise.all(
        files.map(async file => {
          const content = await fs.readFile(path.resolve(config.notesDirPath, file), { encoding: 'utf8' });
          try {
            const document = CSON.parse(content);
            document.id = file;
            return document;
          } catch (e) {
            this.logger.error(`File: ${file}`);
            throw e;
          }
        }),
      ),
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

  @actionAsync
  async setCurrentDocumentContent(content: string) {
    if (!this._currentDocumentId || !this.currentDocument) return;
    this.currentDocument.content = content;
    this.currentDocument.updatedAt = DateTime.utc().toISO();
    await task(
      fs.writeFile(
        path.resolve(config.notesDirPath, `${this._currentDocumentId}`),
        CSON.stringify(this.currentDocument, null, 2),
        {
          encoding: 'utf8',
        },
      ),
    );
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

  @actionAsync
  async openCurrentEditingCache() {
    const datePrefix = DateTime.utc().toFormat('yyyyMMddHHmmss');
    const uid = uuidv4();
    const cacheFileName = `${datePrefix}-${uid}.md`;
    const currentEditingCachePath = path.resolve(config.cachesDirPath, cacheFileName);
    try {
      await task(fs.access(currentEditingCachePath, fsConstants.R_OK | fsConstants.W_OK));
    } catch (e) {
      await task(fs.writeFile(currentEditingCachePath, this.currentDocument?.content, { encoding: 'utf8' }));
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

  @actionAsync
  async init() {
    try {
      await task(this.loadFolders());
      this._currentFolderIndex = 0;
    } catch (e) {
      this.logger.error(`Error(read folders): ${e.toString()}`);
    }

    try {
      await task(this.loadDocuments());
      this._currentDocumentId = this.currentFolderDocuments[0]?.document.id;
    } catch (e) {
      this.logger.error(`Error(read documents): ${e.toString()}`);
    }

    this._isInitialized = true;
  }
}

applyMixins(AppStore, [LoggableMixin]);

export const appStore = new AppStore();

export default AppStore;
