export class CalculateScoreUtil {
  isCorrect: boolean;
  baseScore: number = 100;
  startTime: number; // timestamp
  timeLimit: number; // unit of seconds
  responseTime: number; // timestamp
  pointMultiplier: number;

  constructor(data: Partial<CalculateScoreUtil>) {
    Object.assign(this, data);
  }

  get score(): number {
    if (!this.isCorrect) {
      return 0;
    }

    const maxTime = this.startTime + this.timeLimit * 1000;
    if (this.responseTime > maxTime) {
      return 0;
    }

    const timePercentage =
      (this.timeLimit - (maxTime - this.responseTime) / 1000) / this.timeLimit;
    const score = this.baseScore * timePercentage * this.pointMultiplier;

    return Math.round(score);
  }
}
