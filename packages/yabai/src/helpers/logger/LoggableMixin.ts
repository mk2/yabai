import LoggerAdaptor from '@/adaptors/LoggerAdaptor';
import { config } from '@/models/Config';

export default class LoggableMixin {
  get logger() {
    return LoggerAdaptor.getLogger({ module: this.constructor.name, destination: config.appLogFilePath });
  }
}
