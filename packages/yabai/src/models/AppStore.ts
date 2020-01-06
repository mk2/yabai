import { promises as fs } from 'fs';
import path from 'path';

import CSON from 'cson-parser';
import { action, computed, observable } from 'mobx';

import Config from './Config';
import Model from './Model';

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

export default class AppStore extends Model {
  @observable
  dataDirPath?: string;

  @observable
  folders: Folder[] = [];

  @observable
  currentFolderIndex = 0;

  @computed
  get currentFolder(): Folder | undefined {
    return this.folders?.[this.currentFolderIndex];
  }

  @observable
  documents: Document[] = [];

  @observable
  currentDocumentId: string | undefined;

  @computed
  get currentDocument(): Document | undefined {
    return this.documents?.find(document => document.id === this.currentDocumentId);
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
  loadDataDirPath() {
    this.dataDirPath = path.resolve(process.env.BOOSTNOTE_DATA_DIRECTORY ?? '');
  }

  @action.bound
  async loadFolders() {
    if (!this.dataDirPath) return;
    this.folders = JSON.parse(
      await fs.readFile(path.resolve(this.dataDirPath, 'boostnote.json'), { encoding: 'utf8' }),
    ).folders;
  }

  @action.bound
  async loadDocuments() {
    if (!this.dataDirPath) return;
    const files = await fs.readdir(path.resolve(this.dataDirPath, 'notes'));
    return Promise.all(
      files.map(async file => {
        const document = CSON.parse(
          await fs.readFile(path.resolve(this.dataDirPath!, 'notes', file), { encoding: 'utf8' }),
        );
        document.id = file;
        this.documents?.push(document);
      }),
    );
  }

  @action.bound
  async init() {
    try {
      this.loadDataDirPath();
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
