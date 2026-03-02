import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Headers,
  UnauthorizedException,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { AdminCreateUserDto, AdminUpdateUserDto, ListUsersDto, UpdateMeDto } from '@app/common'
function requireHeader(v?: string) {
  if (!v) throw new UnauthorizedException('Missing user context')
  return v
}
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me')
  me(@Headers('x-user-id') userId?: string) {
    return this.users.me(requireHeader(userId))
  }

  @Patch('me')
  updateMe(@Headers('x-user-id') userId?: string, @Body() dto?: UpdateMeDto) {
    return this.users.updateMe(requireHeader(userId), dto)
  }
  @Post()
  create(@Body() dto: AdminCreateUserDto) {
    return this.users.adminCreate(dto)
  }

  @Patch('/:id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    console.log('update user', id, dto)
    return this.users.adminUpdate(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.adminDelete(id)
  }

  @Get()
  list(@Query() q: ListUsersDto) {
    return this.users.list(q)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.findById(id)
  }
}
