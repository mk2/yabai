import pino from 'pino';

type Logger = pino.Logger;
type LoggerOptions = pino.Bindings & {
  destination: string;
};

export default class LoggerAdaptor {
  private static rootLogger: Logger;

  static getLogger(options?: LoggerOptions) {
    if (this.rootLogger == null) {
      const isProduction = process.env.NODE_ENV === 'production';
      this.rootLogger = pino(
        {
          level: isProduction ? 'info' : 'debug',
        },
        pino.destination(options?.destination),
      );
    }

    return options == null ? this.rootLogger : this.rootLogger.child(options);
  }
}
