import { promises as fs } from 'fs';
import path from 'path';

import LoggableMixin from '@/helpers/logger/LoggableMixin';
import applyMixins from '@/helpers/mixin/applyMixins';
import CSON from 'cson-parser';
import { action, computed, observable } from 'mobx';

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
  @observable
  uiState: UIState = 'SELECT_NOTE';

  @action.bound
  setUIState(uiState: UIState) {
    this.uiState = uiState;
  }

  @observable
  folders: Folder[] = [];

  @observable
  documents: Document[] = [];

  @observable
  currentFolderIndex = 0;

  @computed
  get currentFolder(): Folder | undefined {
    if (this.folders.length <= this.currentFolderIndex) return undefined;
    return this.folders?.[this.currentFolderIndex];
  }

  @action.bound
  setCurrentFolder(currentFolderIndex: number) {
    this.currentFolderIndex = currentFolderIndex;
  }

  @observable
  currentDocumentId: string | undefined;

  @computed
  get currentDocument(): Document | undefined {
    return this.documents?.find(document => document.id === this.currentDocumentId);
  }

  @action.bound
  setCurrentDocument(documentId: string | undefined) {
    this.currentDocumentId = documentId;
  }

  @computed
  get currentFolderDocuments(): { document: Document; index: number }[] {
    const currentFolder = this.currentFolder;
    return this.documents
      .filter(document => !document.isTrashed && document.folder === currentFolder?.key)
      .map((d, i) => ({ document: d, index: i }));
  }

  @observable
  isInitialized = false;

  @action.bound
  async loadFolders() {
    this.folders = JSON.parse(await fs.readFile(config.folderFilePath, { encoding: 'utf8' })).folders;
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

  @action.bound
  async init() {
    try {
      await this.loadFolders();
      await this.loadDocuments();
      this.currentFolderIndex = 0;
      this.currentDocumentId = this.currentFolderDocuments[0]?.document.id;
      this.isInitialized = true;
    } catch (e) {
      this.logger.error(`Error: ${e.toString()}`);
    }
  }
}

applyMixins(AppStore, [LoggableMixin]);

export const store = new AppStore();

export default AppStore;
