export type TokenType = 'access' | 'refresh'

export interface AccessTokenPayload {
  sub: string
  phone: string
  name: string
  role: 'USER' | 'ADMIN'
  tokenType: 'access'
}

export interface RefreshTokenPayload {
  sub: string
  tokenType: 'refresh'
}

export interface JwtUser {
  userId: string
  phone: string
  name: string
  role: 'USER' | 'ADMIN'
  tokenType: TokenType
}
