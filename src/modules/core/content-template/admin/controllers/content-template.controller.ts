import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ContentTemplateService } from '../services/content-template.service';
import { ContentTemplateExecutionService } from '../../services/content-template-execution.service';
import { CreateContentTemplateDto } from '../dtos/create-content-template.dto';
import { UpdateContentTemplateDto } from '../dtos/update-content-template.dto';
import { ContentTemplateQueryDto } from '../dtos/content-template-query.dto';
import { Permission } from '@/common/auth/decorators';

@Controller('admin/content-templates')
export class ContentTemplateController {
    constructor(
        private readonly service: ContentTemplateService,
        private readonly executionService: ContentTemplateExecutionService,
    ) { }

    @Permission('content_template.manage')
    @Post()
    create(@Body() dto: CreateContentTemplateDto) {
        return this.service.create(dto);
    }

    @Permission('content_template.manage')
    @Get()
    findAll(@Query() query: ContentTemplateQueryDto) {
        return this.service.getList(query);
    }

    @Permission('content_template.manage')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.getOne(id);
    }

    @Permission('content_template.manage')
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateContentTemplateDto,
    ) {
        return this.service.update(id, dto);
    }

    @Permission('content_template.manage')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.delete(id);
    }

    @Permission('content_template.manage')
    @Post(':code/test')
    testExecute(
        @Param('code') code: string,
        @Body() body: { to: string; variables: Record<string, any> },
    ) {
        return this.executionService.execute(code, {
            to: body.to,
            variables: body.variables,
        });
    }
}
