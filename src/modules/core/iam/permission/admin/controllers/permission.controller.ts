import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { Auth } from '@/common/auth/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { PermissionService } from '@/modules/core/iam/permission/admin/services/permission.service';

@Controller('admin/permissions')
export class PermissionController {
  constructor(private readonly service: PermissionService) { }

  @Permission('permission.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.service.getList(query);
  }

  @Permission('permission.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    return this.service.getSimpleList(query);
  }

  @Permission('permission.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Post()
  async create(@Body() dto: any) {
    const userId = Auth.id() as number;
    return this.service.createWithAudit(dto, userId);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    const userId = Auth.id() as number;
    return this.service.updateWithAudit(id, dto, userId);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }
}



