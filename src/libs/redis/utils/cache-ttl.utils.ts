export class CacheTTL {
  static readonly SECOND = 1000;
  static readonly MINUTE = this.SECOND * 60;
  static readonly HOUR = this.MINUTE * 60;
  static readonly DAY = this.HOUR * 24;
  static readonly WEEK = this.DAY * 7;
  static readonly MONTH = this.DAY * 30;

  static seconds(n: number): number {
    return n * this.SECOND;
  }

  static minutes(n: number): number {
    return n * this.MINUTE;
  }

  static hours(n: number): number {
    return n * this.HOUR;
  }

  static days(n: number): number {
    return n * this.DAY;
  }

  static weeks(n: number): number {
    return n * this.WEEK;
  }

  static months(n: number): number {
    return n * this.MONTH;
  }
}
