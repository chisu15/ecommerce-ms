import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'

import { AUTH_ROLES_KEY } from './auth.const'
import { JwtAuthGuard } from './auth.guard'

export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata(AUTH_ROLES_KEY, roles),
    UseGuards(JwtAuthGuard),
  )
}
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
