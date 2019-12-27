import { promises as fs, constants as fsConstants } from 'fs';
import os from 'os';
import path from 'path';

import Model from './Model';

export default class Config extends Model {
  yabaiConfigDir = path.resolve(os.homedir(), '.yabai');
  yabaiConfig = path.resolve(os.homedir(), '.yabai', 'config.json');

  async init() {
    try {
      await fs.access(this.yabaiConfigDir, fsConstants.R_OK | fsConstants.W_OK);
    } catch (e) {
      await fs.mkdir(this.yabaiConfigDir);
    }
    try {
      await fs.access(this.yabaiConfig, fsConstants.R_OK | fsConstants.W_OK);
    } catch (e) {
      await fs.mkdir(this.yabaiConfig);
    }
  }
}
