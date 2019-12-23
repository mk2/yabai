import pino from 'pino';

type Logger = pino.Logger;
type LoggerOptions = pino.Bindings;

export default class LoggerAdaptor {
  private static rootLogger: Logger;

  static getLogger(options?: LoggerOptions) {
    if (this.rootLogger == null) {
      const isProduction = process.env.NODE_ENV === 'production';
      this.rootLogger = pino(
        {
          level: isProduction ? 'info' : 'debug',
        },
        pino.destination('./yabai.log'),
      );
    }

    return options == null ? this.rootLogger : this.rootLogger.child(options);
  }
}
