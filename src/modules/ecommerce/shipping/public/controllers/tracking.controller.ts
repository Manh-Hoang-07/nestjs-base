import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { TrackingService } from '../services/tracking.service';

@Controller('public/tracking')
export class PublicTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('order/:orderId')
  @Permission('public')
  async getOrderTracking(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.trackingService.getTrackingHistory(orderId);
  }

  @Get('number/:trackingNumber')
  @Permission('public')
  async getTrackingByNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.trackingService.getTrackingHistoryByNumber(trackingNumber);
  }

  @Get('live/:trackingNumber')
  @Permission('public')
  async getLiveTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.trackingService.getTracking(trackingNumber);
  }

  @Post('webhook/:provider')
  @Permission('public')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
  ) {
    return this.trackingService.handleWebhook(provider, payload);
  }
}