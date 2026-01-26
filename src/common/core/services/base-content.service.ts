import { StringUtil } from '@/core/utils/string.util';
import { BaseService } from './base.service';
import { IRepository } from '../repositories/repository.interface';
import { NotFoundException } from '@nestjs/common';

/**
 * Base Service cho các Content Module (Project, News, Product, etc.)
 * DB-agnostic.
 * Tích hợp sẵn logic: Slug, Status, SortOrder, Featured, ViewCount
 */
export abstract class BaseContentService<T, R extends IRepository<T>> extends BaseService<T, R> {

    /**
     * Helper: Đảm bảo slug luôn được tạo và là duy nhất.
     * Thường gọi trong beforeCreate hoặc beforeUpdate.
     */
    protected async ensureSlug(
        data: any,
        currentId?: number | bigint,
        currentSlug?: string,
        slugField: string = 'slug',
        nameField: string = 'name'
    ): Promise<void> {
        // 1. Tạo slug từ name nếu chưa có
        if (data[nameField] && !data[slugField]) {
            data[slugField] = StringUtil.toSlug(data[nameField]);
        } else if (data[slugField]) {
            // 2. Chuẩn hóa slug nếu người dùng nhập
            data[slugField] = StringUtil.toSlug(data[slugField]);
        } else {
            return;
        }

        const normalizedSlug = data[slugField];

        // 3. Nếu slug không thay đổi so với hiện tại -> Done
        if (currentSlug && normalizedSlug === currentSlug) {
            delete data[slugField];
            return;
        }

        // 4. Kiểm tra trùng lặp trong DB qua repository.findOne
        // Build filter trừ ID hiện tại
        const filter: Record<string, any> = { [slugField]: normalizedSlug };
        // Lưu ý: Repository implementation phải biết xử lý NOT id nếu cần, 
        // hoặc chúng ta dùng findMany/findFirst với where phức tạp hơn.

        let existing = await this.repository.findFirstRaw({
            where: {
                [slugField]: normalizedSlug,
                id: currentId ? { not: currentId } : undefined,
                deleted_at: null,
            }
        });

        if (existing) {
            // 5. Nếu trùng, thêm hậu tố số đếm -1, -2, ...
            let counter = 1;
            let uniqueSlug = `${normalizedSlug}-${counter}`;

            while (await this.repository.findFirstRaw({
                where: { [slugField]: uniqueSlug, deleted_at: null }
            })) {
                counter++;
                uniqueSlug = `${normalizedSlug}-${counter}`;
            }
            data[slugField] = uniqueSlug;
        } else {
            data[slugField] = normalizedSlug;
        }
    }

    /**
     * Thay đổi trạng thái
     */
    async changeStatus(id: number | bigint, status: string) {
        return this.update(id, { status });
    }

    /**
     * Thay đổi thứ tự sắp xếp
     */
    async updateSortOrder(id: number | bigint, sortOrder: number) {
        return this.update(id, { sort_order: sortOrder });
    }

    /**
     * Toggle Featured
     */
    async toggleFeatured(id: number | bigint, featured: boolean) {
        // Thử cập nhật is_featured hoặc featured tùy theo model
        try {
            return await this.update(id, { is_featured: featured });
        } catch (error) {
            try {
                return await this.update(id, { featured: featured });
            } catch (e) {
                throw new Error('Model này không hỗ trợ tính năng Featured.');
            }
        }
    }

    /**
     * Tăng view count (Sử dụng increment logic của repository nếu có, hoặc update tay)
     */
    async incrementViewCount(id: number | bigint, field: string = 'view_count'): Promise<any> {
        // If repository has specialized increment logic (e.g. atomic increment), use it
        if (typeof (this.repository as any).incrementViewCount === 'function') {
            return (this.repository as any).incrementViewCount(id, field);
        }

        const item = await this.repository.findById(id);
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }

        const currentValue = (item as any)[field] || 0;
        return this.repository.update(id, { [field]: currentValue + 1 });
    }
}
