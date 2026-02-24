import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export type CurrentUserType = {
  userId: string
  phone?: string
  name?: string
  tokenType?: string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user
  },
)
