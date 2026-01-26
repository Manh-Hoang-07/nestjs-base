import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators';
import { AuthService } from '@/common/auth/services';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { CreateMenuDto } from '@/modules/core/menu/admin/dtos/create-menu.dto';
import { UpdateMenuDto } from '@/modules/core/menu/admin/dtos/update-menu.dto';
import { QueryMenuDto } from '@/modules/core/menu/admin/dtos/query-menu.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';

@Controller('admin/menus')
export class AdminMenuController {
  constructor(
    private readonly service: MenuService,
    private readonly auth: AuthService,
  ) { }

  @Permission('menu.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: QueryMenuDto) {
    return this.service.getList(query);
  }

  @Permission('menu.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: QueryMenuDto) {
    return this.service.getSimpleList(query);
  }

  @Permission('menu.manage')
  @Get('tree')
  async getTree() {
    return this.service.getTree();
  }

  @Permission('menu.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    const userId = this.auth.id();
    return this.service.createWithUser(dto, userId ?? undefined);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto
  ) {
    const userId = this.auth.id();
    return this.service.updateById(id, dto, userId ?? undefined);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }
}

