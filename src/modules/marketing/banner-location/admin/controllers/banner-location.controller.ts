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
import { BannerLocationService } from '@/modules/marketing/banner-location/admin/services/banner-location.service';
import { CreateBannerLocationDto } from '@/modules/marketing/banner-location/admin/dtos/create-banner-location.dto';
import { UpdateBannerLocationDto } from '@/modules/marketing/banner-location/admin/dtos/update-banner-location.dto';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';

@Controller('admin/banner-locations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BannerLocationController {
    constructor(private readonly bannerLocationService: BannerLocationService) { }

    @LogRequest()
    @Post()
    @Permission('banner_location.manage')
    create(@Body(ValidationPipe) createBannerLocationDto: CreateBannerLocationDto) {
        return this.bannerLocationService.create(createBannerLocationDto);
    }

    @Get()
    @Permission('banner_location.manage')
    findAll(@Query(ValidationPipe) query: any) {
        return this.bannerLocationService.getList(query);
    }

    @Get('simple')
    @Permission('banner_location.manage')
    getSimpleList(@Query(ValidationPipe) query: any) {
        return this.bannerLocationService.getSimpleList(query);
    }

    @Get(':id')
    @Permission('banner_location.manage')
    findOne(@Param('id') id: string) {
        return this.bannerLocationService.getOne(+id);
    }

    @LogRequest()
    @Put(':id')
    @Permission('banner_location.manage')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerLocationDto: UpdateBannerLocationDto,
    ) {
        return this.bannerLocationService.update(+id, updateBannerLocationDto);
    }

    @LogRequest()
    @Delete(':id')
    @Permission('banner_location.manage')
    remove(@Param('id') id: string) {
        return this.bannerLocationService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    @Permission('banner_location.manage')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerLocationService.changeStatus(+id, status);
    }
}
