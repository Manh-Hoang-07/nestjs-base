import { Controller, Get, Query, Patch, Param, Body, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdminPostCommentService } from '../services/comment.service';
import { RbacGuard } from '@/common/auth/guards';
import { Permission } from '@/common/auth/decorators';
import { prepareQuery } from '@/common/core/utils';

@Controller('admin/post-comments')
@UseGuards(RbacGuard)
export class AdminPostCommentController {
    constructor(private readonly commentService: AdminPostCommentService) { }

    @Get()
    @Permission('post.manage')
    async getList(@Query(ValidationPipe) query: any) {
        return this.commentService.getList(query);
    }

    @Patch(':id/status')
    @Permission('post.manage')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: 'visible' | 'hidden',
    ) {
        return this.commentService.updateCommentStatus(Number(id), status);
    }

    @Delete(':id')
    @Permission('post.manage')
    async deleteComment(@Param('id') id: string) {
        return this.commentService.deleteComment(Number(id));
    }
}
