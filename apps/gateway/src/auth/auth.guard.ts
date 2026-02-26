import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { AUTH_ROLES_KEY } from './auth.const'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      AUTH_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException('Insufficient role')
      }
    }

    return user
  }
}
