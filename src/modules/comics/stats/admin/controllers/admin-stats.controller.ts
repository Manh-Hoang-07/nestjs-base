import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminStatsService } from '../services/admin-stats.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly analyticsService: AdminStatsService) { }

  @Permission('comic.manage')
  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Permission('comic.manage')
  @Get('comics')
  async getTopComics(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('sortBy') sortBy: 'views' | 'follows' | 'rating' = 'views',
  ) {
    return this.analyticsService.getTopComics(limit, sortBy);
  }

  @Permission('comic.manage')
  @Get('views')
  async getViewsOverTime(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getViewsOverTime(
      new Date(startDate),
      new Date(endDate),
    );
  }
}



