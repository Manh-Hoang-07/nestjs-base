import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { CreateUserDto } from '@/modules/core/iam/user/admin/dtos/create-user.dto';
import { UpdateUserDto } from '@/modules/core/iam/user/admin/dtos/update-user.dto';
import { ChangePasswordDto } from '@/modules/core/iam/user/admin/dtos/change-password.dto';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { prepareQuery } from '@/common/core/utils';

@Controller('admin/users')
export class UserController {
  constructor(private readonly service: UserService) { }

  @Permission('user.manage')
  @Get()
  getList(@Query() query: any) {
    return this.service.getList(query);
  }

  @Permission('user.manage')
  @Get('simple')
  getSimpleList(@Query() query: any) {
    return this.service.getSimpleList(query);
  }

  @Permission('user.manage')
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(Number(id));
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_create' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    // Dto không map 1-1 với entity (profile payload khác type), service đã xử lý trong hook
    return this.service.create(dto as any);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_update' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // Dto không map 1-1 với entity, service sẽ chuẩn hóa trong hooks
    return this.service.updateById(Number(id), dto as any);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_change_password' })
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(Number(id), dto);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_delete' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteById(Number(id));
  }
}


