import { promises as fs, constants as fsConstants } from 'fs';
import os from 'os';
import path from 'path';

import applyMixins from '@/helpers/applyMixins';
import Loggable from '@/traits/Loggable';

interface Config extends Loggable {}

class Config {
  private yabaiConfigDir = path.resolve(os.homedir(), '.yabai');
  private yabaiConfig = path.resolve(os.homedir(), '.yabai', 'config.json');

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

applyMixins(Config, [Loggable]);

export default Config;
