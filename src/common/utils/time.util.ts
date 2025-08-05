/**
 * Utility functions for time conversion
 */
export class TimeUtil {
  /**
   * Parse expiration time string to seconds
   * @param expiresIn - Time string like '15m', '7d', '1h', '30s'
   * @returns Number of seconds
   */
  static parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return value;
    }
  }

  /**
   * Convert seconds to human readable format
   * @param seconds - Number of seconds
   * @returns Human readable string
   */
  static secondsToHumanReadable(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minutes`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hours`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days} days`;
    }
  }

  /**
   * Get current timestamp in seconds
   * @returns Current timestamp in seconds
   */
  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Check if timestamp is expired
   * @param timestamp - Timestamp to check
   * @param expirySeconds - Expiry duration in seconds
   * @returns True if expired
   */
  static isExpired(timestamp: number, expirySeconds: number): boolean {
    return this.getCurrentTimestamp() > (timestamp + expirySeconds);
  }
}