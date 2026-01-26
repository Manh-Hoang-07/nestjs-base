import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { PublicFaqService } from '@/modules/introduction/faq/public/services/faq.service';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('faqs')
export class PublicFaqController {
  constructor(private readonly faqService: PublicFaqService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.faqService.getList(query);
  }

  @Permission('public')
  @Get('popular')
  getPopular(@Query('limit') limit?: number) {
    return this.faqService.getPopular(limit ? Number(limit) : 10);
  }

  @Permission('public')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const faq = await this.faqService.getOne(+id);
    // Increment view count
    await this.faqService.incrementViewCount(Number(id));
    return faq;
  }

  @Permission('public')
  @Post(':id/helpful')
  async markHelpful(@Param('id') id: string) {
    return this.faqService.incrementHelpfulCount(Number(id));
  }
}

