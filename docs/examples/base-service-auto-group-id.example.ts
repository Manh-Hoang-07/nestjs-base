/**
 * EXAMPLE: Cách sử dụng autoAddGroupId trong BaseService
 * 
 * File này chỉ là ví dụ minh họa, không phải code thực tế
 */

import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services';

// ============================================
// VÍ DỤ 1: Service đơn giản - không override beforeCreate
// ============================================

@Injectable()
export class SimpleExampleService extends BaseService<Entity, IRepository> {
    constructor(
        @Inject(REPOSITORY_TOKEN)
        protected readonly repository: IRepository,
    ) {
        super(repository);

        // ✅ Chỉ cần bật flag này
        // Khi gọi create(), group_id sẽ tự động được thêm vào payload
        this.autoAddGroupId = true;
    }

    // ✅ Không cần override beforeCreate
    // BaseService sẽ tự động xử lý
}

// ============================================
// VÍ DỤ 2: Service phức tạp - có override beforeCreate
// ============================================

@Injectable()
export class ComplexExampleService extends BaseService<Comic, IComicRepository> {
    constructor(
        @Inject(COMIC_REPOSITORY)
        protected readonly comicRepository: IComicRepository,
    ) {
        super(comicRepository);

        // ✅ Bật tự động thêm group_id
        this.autoAddGroupId = true;
    }

    protected override async beforeCreate(data: CreateComicDto): Promise<any> {
        // ✅ QUAN TRỌNG: Gọi super.beforeCreate() để kích hoạt auto add group_id
        const payload = await super.beforeCreate(data);

        // ✅ Xử lý logic riêng của service
        if (!payload.slug) {
            payload.slug = StringUtil.toSlug(payload.title);
        }

        // Check duplicate slug
        const existing = await this.comicRepository.findBySlug(payload.slug);
        if (existing) {
            payload.slug = `${payload.slug}-${Date.now()}`;
        }

        // Remove fields không cần thiết
        if (payload.category_ids !== undefined) {
            delete payload.category_ids;
        }

        return payload;
    }
}

// ============================================
// VÍ DỤ 3: Service KHÔNG cần auto add group_id
// ============================================

@Injectable()
export class NoGroupIdExampleService extends BaseService<User, IUserRepository> {
    constructor(
        @Inject(USER_REPOSITORY)
        protected readonly userRepository: IUserRepository,
    ) {
        super(userRepository);

        // ✅ Không set autoAddGroupId (hoặc set = false)
        // Service này không cần group_id
    }

    protected override async beforeCreate(data: CreateUserDto): Promise<any> {
        const payload = { ...data };

        // Xử lý logic riêng
        payload.password = await this.hashPassword(data.password);

        return payload;
    }
}

// ============================================
// SO SÁNH: TRƯỚC VÀ SAU KHI REFACTOR
// ============================================

// ❌ TRƯỚC (Code lặp lại):
class OldWayService extends BaseService<Entity, IRepository> {
    protected override async beforeCreate(data: any): Promise<any> {
        const payload = { ...data };

        // Logic riêng
        if (!payload.slug) {
            payload.slug = StringUtil.toSlug(payload.name);
        }

        // ❌ Code lặp lại ở nhiều service
        const groupId = RequestContext.get<number | null>('groupId');
        if (groupId) {
            (payload as any).group_id = groupId;
        }

        return payload;
    }
}

// ✅ SAU (Clean & DRY):
class NewWayService extends BaseService<Entity, IRepository> {
    constructor(repository: IRepository) {
        super(repository);
        this.autoAddGroupId = true; // ✅ Bật tính năng
    }

    protected override async beforeCreate(data: any): Promise<any> {
        const payload = await super.beforeCreate(data); // ✅ Gọi super

        // ✅ Chỉ giữ lại logic riêng
        if (!payload.slug) {
            payload.slug = StringUtil.toSlug(payload.name);
        }

        return payload;
    }
}

// ============================================
// LƯU Ý QUAN TRỌNG
// ============================================

/**
 * 1. Luôn gọi `await super.beforeCreate(data)` nếu override beforeCreate
 *    - Nếu không gọi, group_id sẽ KHÔNG được thêm vào
 * 
 * 2. Thứ tự thực thi:
 *    - super.beforeCreate() thêm group_id
 *    - Logic riêng của service con
 *    - Return payload
 * 
 * 3. RequestContext phải được set trước:
 *    - Thông qua GroupInterceptor hoặc middleware
 *    - Nếu không có groupId trong context, field sẽ không được thêm
 * 
 * 4. Tương thích ngược:
 *    - Service cũ không bật autoAddGroupId vẫn hoạt động bình thường
 *    - Không ảnh hưởng đến các service không cần group_id
 */
