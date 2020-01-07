import LoggerAdaptor from '@/adaptors/LoggerAdaptor';

export default class Loggable {
  get logger() {
    return LoggerAdaptor.getLogger({ module: this.constructor.name });
  }
}
