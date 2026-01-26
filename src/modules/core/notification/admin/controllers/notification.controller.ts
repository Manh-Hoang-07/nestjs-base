import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';
import { Permission } from '@/common/auth/decorators';
import { NotificationService } from '@/modules/core/notification/admin/services/notification.service';
import { CreateNotificationDto } from '@/modules/core/notification/admin/dtos/create-notification.dto';
import { UpdateNotificationDto } from '@/modules/core/notification/admin/dtos/update-notification.dto';
import { GetNotificationsDto } from '@/modules/core/notification/admin/dtos/get-notifications.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @LogRequest()
  @Post()
  @Permission('notification.manage')
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  @Permission('notification.manage')
  async getList(@Query() query: GetNotificationsDto) {
    return this.notificationService.getList(query);
  }

  @Get('simple')
  @Permission('notification.manage')
  async getSimpleList(@Query() query: GetNotificationsDto) {
    return this.notificationService.getSimpleList(query);
  }

  @Get(':id')
  @Permission('notification.manage')
  async getOne(@Param('id') id: string) {
    return this.notificationService.getOne(+id);
  }

  @LogRequest()
  @Patch(':id')
  @Permission('notification.manage')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(+id, dto);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('notification.manage')
  async delete(@Param('id') id: string) {
    return this.notificationService.delete(+id);
  }

  @LogRequest()
  @Patch(':id/restore')
  @Permission('notification.manage')
  async restore(@Param('id') id: string) {
    return this.notificationService.restore(+id);
  }
}
