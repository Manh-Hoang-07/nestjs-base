import { Controller, Get, Put, Delete, Body, Param, Query, ParseIntPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { AdminPostCommentService } from '../services/comment.service';
import { RbacGuard } from '@/common/auth/guards';
import { Permission } from '@/common/auth/decorators';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/post-comments')
@UseGuards(RbacGuard)
export class AdminPostCommentController {
    constructor(private readonly commentService: AdminPostCommentService) { }

    @Get()
    @Permission('post.manage')
    async getList(@Query(ValidationPipe) query: any) {
        return this.commentService.getList(query);
    }

    @Get('simple')
    @Permission('post.manage')
    async getSimpleList(@Query(ValidationPipe) query: any) {
        return this.commentService.getSimpleList(query);
    }

    @Get('statistics')
    @Permission('post.manage')
    async getStatistics() {
        return this.commentService.getStatistics();
    }

    @Get(':id')
    @Permission('post.manage')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return this.commentService.getOne(id);
    }

    @Put(':id')
    @Permission('post.manage')
    @LogRequest({ fileBaseName: 'post_comment_update' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) body: { content?: string; status?: 'visible' | 'hidden' },
    ) {
        return this.commentService.update(id, body);
    }

    @Put(':id/status')
    @Permission('post.manage')
    @LogRequest({ fileBaseName: 'post_comment_status_update' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) body: { status: 'visible' | 'hidden' },
    ) {
        return this.commentService.update(id, { status: body.status });
    }

    @Delete(':id')
    @Permission('post.manage')
    @LogRequest({ fileBaseName: 'post_comment_delete' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.commentService.delete(id);
    }
}
