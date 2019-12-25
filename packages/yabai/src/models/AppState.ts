import { observable } from 'mobx';
import path from 'path';
import { promises as fs } from 'fs';
import LoggerAdapter from '@/adaptors/LoggerAdaptor';
import CSON from 'cson-parser';

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

export default class AppState {
  private logger = LoggerAdapter.getLogger({ module: 'AppState' });

  @observable
  dataDirPath?: string;

  @observable
  folders: Folder[] = [];

  @observable
  currentFolder?: Folder;

  @observable
  documents: Document[] = [];

  @observable
  currentDocument?: Document;

  @observable
  isInitialized = false;

  loadDataDirPath() {
    this.dataDirPath = path.resolve(process.env.BOOSTNOTE_DATA_DIRECTORY ?? '');
  }

  async loadFolders() {
    if (!this.dataDirPath) return;
    this.folders = JSON.parse(
      await fs.readFile(path.resolve(this.dataDirPath, 'boostnote.json'), { encoding: 'utf8' }),
    );
  }

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

  async init() {
    try {
      this.loadDataDirPath();
      await this.loadFolders();
      await this.loadDocuments();
      this.currentFolder = this.folders?.[0];
      this.isInitialized = true;
    } catch (e) {
      this.logger.error(`Error: ${e.toString()}`);
    }
  }
}
