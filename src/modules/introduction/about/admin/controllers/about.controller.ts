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
import { AboutService } from '@/modules/introduction/about/admin/services/about.service';
import { CreateAboutDto } from '@/modules/introduction/about/admin/dtos/create-about.dto';
import { UpdateAboutDto } from '@/modules/introduction/about/admin/dtos/update-about.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';

@Controller('admin/about-sections')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AboutController {
  constructor(private readonly aboutService: AboutService) { }

  @LogRequest()
  @Post()
  @Permission('about.manage')
  create(@Body(ValidationPipe) createAboutDto: CreateAboutDto) {
    return this.aboutService.create(createAboutDto);
  }

  @Get()
  @Permission('about.manage')
  findAll(@Query(ValidationPipe) query: any) {
    return this.aboutService.getList(query);
  }

  @Get(':id')
  @Permission('about.manage')
  findOne(@Param('id') id: string) {
    return this.aboutService.getOne(+id);
  }

  @Put(':id')
  @Permission('about.manage')
  update(@Param('id') id: string, @Body(ValidationPipe) updateAboutDto: UpdateAboutDto) {
    return this.aboutService.update(+id, updateAboutDto);
  }

  @Delete(':id')
  @Permission('about.manage')
  remove(@Param('id') id: string) {
    return this.aboutService.delete(+id);
  }
}

