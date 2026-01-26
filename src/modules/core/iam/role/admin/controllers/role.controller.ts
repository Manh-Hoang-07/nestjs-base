import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators';
import { LogRequest } from '@/common/shared/decorators';
import { AuthService } from '@/common/auth/services';
import { RoleService } from '@/modules/core/iam/role/admin/services/role.service';

@Controller('admin/roles')
export class RoleController {
  constructor(
    private readonly service: RoleService,
    private readonly auth: AuthService,
  ) { }

  @Permission('role.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.service.getList(query);
  }

  @Permission('role.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    return this.service.getSimpleList(query);
  }

  @Permission('role.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @LogRequest()
  @Permission('role.manage')
  @Post()
  async create(@Body() dto: any) {
    // Sử dụng AuthService thay vì @Req() decorator
    const userId = this.auth.id();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.service.createWithAudit(dto, userId);
  }

  @LogRequest()
  @Permission('role.manage')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    // Sử dụng AuthService trong hàm
    if (!this.auth.isLogin()) {
      throw new Error('User not authenticated');
    }
    const userId = this.auth.id();
    return this.service.updateWithAudit(id, dto, userId!);
  }

  @LogRequest()
  @Permission('role.manage')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }

  @LogRequest()
  @Permission('role.manage')
  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { permission_ids: number[] }
  ) {
    return this.service.assignPermissions(roleId, body.permission_ids || []);
  }
}



