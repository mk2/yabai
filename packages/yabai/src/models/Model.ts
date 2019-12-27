import LoggerAdaptor from '@/adaptors/LoggerAdaptor';

export default class Model {
  get logger() {
    return LoggerAdaptor.getLogger({ module: this.constructor.name });
  }
}
