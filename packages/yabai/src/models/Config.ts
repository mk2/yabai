import { constants as fsConstants, promises as fs } from 'fs';
import os from 'os';
import path from 'path';

type ConfigContents = {};

const kDefaultConfig: Partial<ConfigContents> = Object.freeze({});

class Config {
  private configContents: ConfigContents = {};

  get dataDirPath() {
    return path.resolve(process.env.BOOSTNOTE_DATA_DIRECTORY ?? '');
  }

  get notesDirPath() {
    return path.resolve(this.dataDirPath, 'notes');
  }

  get folderFilePath() {
    return path.resolve(this.dataDirPath, 'boostnote.json');
  }

  get appLogFilePath() {
    return path.resolve(this.logsDirPath, 'app.log');
  }

  get configDirPath() {
    return path.resolve(os.homedir(), '.yabai');
  }

  get configJsonPath() {
    return path.resolve(this.configDirPath, 'config.json');
  }

  get logsDirPath() {
    return path.resolve(this.configDirPath, 'logs');
  }

  get cachesDirPath() {
    return path.resolve(this.configDirPath, 'caches');
  }

  setConfig(newConfigContents: Partial<ConfigContents>) {
    this.configContents = {
      ...this.configContents,
      ...newConfigContents,
    };
  }

  async loadConfig(): Promise<ConfigContents> {
    const configJson = JSON.parse(await fs.readFile(this.configJsonPath, 'utf-8'));
    return {
      ...kDefaultConfig,
      ...configJson,
      ...this.configContents,
    };
  }

  async saveConfig() {
    await fs.writeFile(
      this.configJsonPath,
      JSON.stringify({
        ...kDefaultConfig,
        ...this.configContents,
      }),
    );
  }

  async init() {
    for (const directory of [this.configDirPath, this.logsDirPath, this.cachesDirPath]) {
      try {
        await fs.access(directory, fsConstants.R_OK | fsConstants.W_OK);
      } catch (e) {
        await fs.mkdir(directory);
      }
    }
    try {
      await fs.access(this.configJsonPath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (e) {
      await fs.writeFile(this.configJsonPath, JSON.stringify(kDefaultConfig, null, 2), { encoding: 'utf-8' });
    }
  }
}

export const config = new Config();

export default Config;
