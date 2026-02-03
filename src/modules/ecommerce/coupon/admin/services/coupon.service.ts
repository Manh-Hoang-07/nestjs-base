import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Coupon } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { ICouponRepository, COUPON_REPOSITORY } from '../../domain/coupon.repository';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class AdminCouponService extends BaseService<Coupon, ICouponRepository> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    protected readonly couponRepository: ICouponRepository,
  ) {
    super(couponRepository);
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  async getCouponStats(id: number | bigint) {
    const coupon = await this.getOne(id);
    // Placeholder logic for stats
    return {
      used_count: coupon.used_count,
      usage_limit: coupon.usage_limit,
      remaining: coupon.usage_limit ? coupon.usage_limit - Number(coupon.used_count) : null,
    };
  }

  async softDelete(id: number | bigint) {
    return this.delete(id);
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }
    return prepared;
  }

  override async getOne(id: string | number | bigint): Promise<Coupon> {
    const coupon = await super.getOne(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    verifyGroupOwnership(coupon);
    return coupon;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const coupon = await this.repository.findById(id);
    if (coupon) verifyGroupOwnership(coupon);
    return true;
  }
}

