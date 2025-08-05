export interface ITokenService {
  generateAccessToken(payload: { sub: string }): string;
  generateRefreshToken(payload: { sub: string }): string;
  generateTokenPair(payload: { sub: string }): {
    accessToken: string;
    refreshToken: string;
  };
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  parseExpirationTime(expiresIn: string): number;
}