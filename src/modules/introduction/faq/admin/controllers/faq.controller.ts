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
import { FaqService } from '@/modules/introduction/faq/admin/services/faq.service';
import { CreateFaqDto } from '@/modules/introduction/faq/admin/dtos/create-faq.dto';
import { UpdateFaqDto } from '@/modules/introduction/faq/admin/dtos/update-faq.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';

@Controller('admin/faqs')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FaqController {
  constructor(private readonly faqService: FaqService) { }

  @LogRequest()
  @Post()
  @Permission('faq.manage')
  create(@Body(ValidationPipe) createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  @Permission('faq.manage')
  findAll(@Query(ValidationPipe) query: any) {
    return this.faqService.getList(query);
  }

  @Get(':id')
  @Permission('faq.manage')
  findOne(@Param('id') id: string) {
    return this.faqService.getOne(+id);
  }

  @Put(':id')
  @Permission('faq.manage')
  update(@Param('id') id: string, @Body(ValidationPipe) updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(+id, updateFaqDto);
  }

  @Delete(':id')
  @Permission('faq.manage')
  remove(@Param('id') id: string) {
    return this.faqService.delete(+id);
  }
}

