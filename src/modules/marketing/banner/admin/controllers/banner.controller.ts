import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ValidationPipe,
    UseGuards,
} from '@nestjs/common';
import { BannerService } from '@/modules/marketing/banner/admin/services/banner.service';
import { CreateBannerDto } from '@/modules/marketing/banner/admin/dtos/create-banner.dto';
import { UpdateBannerDto } from '@/modules/marketing/banner/admin/dtos/update-banner.dto';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BannerController {
    constructor(private readonly bannerService: BannerService) { }

    @LogRequest()
    @Post()
    @Permission('banner.manage')
    create(@Body(ValidationPipe) createBannerDto: CreateBannerDto) {
        return this.bannerService.create(createBannerDto);
    }

    @Get()
    @Permission('banner.manage')
    findAll(@Query(ValidationPipe) query: any) {
        return this.bannerService.getList(query);
    }

    @Get('simple')
    @Permission('banner.manage')
    getSimpleList(@Query(ValidationPipe) query: any) {
        return this.bannerService.getSimpleList(query);
    }

    @Get(':id')
    @Permission('banner.manage')
    findOne(@Param('id') id: string) {
        return this.bannerService.getOne(+id);
    }

    @LogRequest()
    @Put(':id')
    @Permission('banner.manage')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerDto: UpdateBannerDto,
    ) {
        return this.bannerService.update(+id, updateBannerDto);
    }

    @LogRequest()
    @Delete(':id')
    @Permission('banner.manage')
    remove(@Param('id') id: string) {
        return this.bannerService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    @Permission('banner.manage')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerService.changeStatus(+id, status);
    }

    @LogRequest()
    @Put(':id/sort-order')
    @Permission('banner.manage')
    updateSortOrder(
        @Param('id') id: string,
        @Body('sort_order') sortOrder: number,
    ) {
        return this.bannerService.updateSortOrder(+id, sortOrder);
    }
}
