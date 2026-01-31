import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from '../services/follows.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('user/follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) { }

  @Permission('authenticated')
  @Get()
  async getList() {
    return this.followsService.getList();
  }

  @Permission('authenticated')
  @Post('comics/:comicId')
  async follow(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.followsService.follow(comicId);
  }

  @Permission('authenticated')
  @Delete('comics/:comicId')
  async unfollow(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.followsService.unfollow(comicId);
  }

  @Permission('authenticated')
  @Get('comics/:comicId/is-following')
  async isFollowing(@Param('comicId', ParseIntPipe) comicId: number) {
    return { is_following: await this.followsService.isFollowing(comicId) };
  }
}



