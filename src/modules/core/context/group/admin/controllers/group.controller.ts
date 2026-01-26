import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, ForbiddenException, Query } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators';
import { AuthService } from '@/common/auth/services';
import { AdminGroupService } from '../services/group.service';
import { prepareQuery } from '@/common/core/utils';

/**
 * Controller cho System Admin quản lý Groups
 * Routes: /api/admin/groups
 */
@Controller('admin/groups')
export class AdminGroupController {
  constructor(
    private readonly groupService: AdminGroupService,
    private readonly auth: AuthService,
  ) { }

  /**
   * Tạo group mới (chỉ system admin)
   */
  @Permission('group.manage')
  @Post()
  async createGroup(@Body() body: {
    type: string;
    code: string;
    name: string;
    description?: string;
    metadata?: any;
    context_id: number;
  }) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.groupService.createGroup(
      {
        ...body,
        owner_id: userId, // Tự động set owner là user hiện tại
      },
      userId, // Pass requester user ID để check system admin
    );
  }

  /**
   * Lấy danh sách tất cả groups (chuẩn phân trang hệ thống)
   * - Hỗ trợ query chuẩn: page, limit, sort
   * - Hỗ trợ filters[type], filters[status], ...
   */
  @Permission('public')
  @Get()
  async getGroups(@Query() query: any) {
    return this.groupService.getList(query);
  }

  /**
   * Lấy danh sách groups theo type
   */
  @Permission('public')
  @Get('type/:type')
  async getGroupsByType(@Param('type') type: string, @Query() query: any) {
    return this.groupService.getList({ ...query, type });
  }

  /**
   * Lấy group theo ID
   */
  @Permission('public')
  @Get(':id')
  async getGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findById(id);
  }

  /**
   * Update group (chỉ system admin)
   */
  @Permission('group.manage')
  @Put(':id')
  async updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ name: string; description: string; metadata: any }>,
  ) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Check system admin
    const isAdmin = await this.groupService.isSystemAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can update group');
    }

    return this.groupService.updateGroup(id, body);
  }

  /**
   * Xóa group (chỉ system admin)
   */
  @Permission('group.manage')
  @Delete(':id')
  async deleteGroup(@Param('id', ParseIntPipe) id: number) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Check system admin
    const isAdmin = await this.groupService.isSystemAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can delete group');
    }

    await this.groupService.deleteGroup(id);
    return { message: 'Group deleted successfully' };
  }
}

