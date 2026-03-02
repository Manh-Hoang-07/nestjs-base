import { NotFoundException } from '@nestjs/common';
import { IRepository, IPaginatedResult, IPaginationOptions } from '../repositories/repository.interface';
import { createPaginationMeta, prepareQuery } from '../utils';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { getGroupFilter, assignGroupOwnership } from '@/common/shared/utils/group-ownership.util';

/**
 * Base Service DB-agnostic.
 * Làm việc thông qua Repository Interface thay vì trực tiếp với ORM.
 */
export abstract class BaseService<T, R extends IRepository<T>> {
    /**
     * Tự động thêm group_id vào payload khi tạo mới.
     * Service con có thể set = true trong constructor để bật tính năng này.
     */
    protected autoAddGroupId: boolean = false;

    constructor(protected readonly repository: R) { }

    /**
     * Helper to get group filter based on context
     */
    protected getGroupFilter(): any {
        return getGroupFilter();
    }

    /**
     * Hook: Xử lý dữ liệu trước khi tạo mới
     */
    protected async beforeCreate(data: any): Promise<any> {
        const payload = { ...data };

        // Tự động thêm group_id nếu được bật
        if (this.autoAddGroupId) {
            assignGroupOwnership(payload);
        }

        return payload;
    }

    /**
     * Hook: Xử lý thực thể sau khi tạo mới
     */
    protected async afterCreate(entity: T, _data: any): Promise<void> { }

    /**
     * Hook: Xử lý dữ liệu trước khi cập nhật
     */
    protected async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
        return data;
    }

    /**
     * Hook: Xử lý thực thể sau khi cập nhật
     */
    protected async afterUpdate(entity: T, _data: any): Promise<void> { }

    /**
     * Hook: Xử lý trước khi xóa
     */
    protected async beforeDelete(id: string | number | bigint): Promise<boolean> {
        return true;
    }

    /**
     * Hook: Xử lý sau khi xóa
     */
    protected async afterDelete(id: string | number | bigint, entity?: any): Promise<void> { }

    /**
     * Hook: Chuẩn bị/Chỉnh sửa options (page, limit, sort) trước khi truy vấn.
     * Kế thừa logic giới hạn limit từ PrismaListService.
     */
    protected async prepareOptions(options: IPaginationOptions): Promise<IPaginationOptions> {
        const page = Math.max(Number(options.page) || 1, 1);
        const maxLimit = (options as any).maxLimit ?? 100;
        const limit = Math.min(Math.max(Number(options.limit) || 10, 1), maxLimit);
        const sort = options.sort || (this as any).defaultSort || 'id:DESC';

        return { ...options, page, limit, sort };
    }

    /**
     * Hook: Chuẩn bị filters.
     * Trả về filters đã xử lý, hoặc false để trả về kết quả rỗng ngay lập tức (Early Exit).
     * Tham khảo logic từ PrismaListService.
     */
    protected async prepareFilters(filters?: Record<string, any>, _options?: any): Promise<Record<string, any> | boolean | undefined> {
        return filters;
    }

    /**
     * Hook: Xử lý tập kết quả sau khi getList
     */
    protected async afterGetList(result: IPaginatedResult<T>): Promise<IPaginatedResult<T>> {
        return result;
    }

    /**
     * Hook: Xử lý item sau khi getOne (ngoài transform)
     */
    protected async afterGetOne(entity: T | null): Promise<T | null> {
        return entity;
    }

    /**
     * Lấy danh sách không phân trang hoặc có giới hạn lớn (thường dùng cho dropdown)
     */
    async getSimpleList(query: any = {}) {
        const limit = Number((query as any).limit) || 1000;
        return this.getList({
            ...query,
            limit,
            maxLimit: (query as any).maxLimit || Math.max(limit, 1000),
            skipCount: true // Optimization: skip total count for simple list
        });
    }

    /**
     * Lấy danh sách phân trang.
     * Chấp nhận raw query từ controller hoặc IPaginationOptions đã chuẩn hóa.
     */
    async getList(queryOrOptions: any = {}): Promise<IPaginatedResult<T>> {
        // 1. Chuẩn hóa query thành filter và options
        const { filter, options } = prepareQuery(queryOrOptions);

        // 2. Chuẩn hóa options (page, limit, sort)
        const normalized = await this.prepareOptions(options);

        // 3. Xử lý filters qua hook
        const preparedFilters = await this.prepareFilters(filter, normalized);

        if (preparedFilters === false) {
            return {
                data: [],
                meta: createPaginationMeta(normalized.page as number, normalized.limit as number, 0)
            };
        }

        // Gán filter đã xử lý vào options để repository thực thi
        normalized.filter = preparedFilters && typeof preparedFilters === 'object'
            ? preparedFilters
            : filter;

        // 4. Gọi repository
        const result = await this.repository.findAll(normalized);

        // 5. Transform kết quả - Optimize: Avoid Promise.all if transform is synchronous
        // and avoid creating new promises for every item.
        const transformedData = new Array(result.data.length);
        for (let i = 0; i < result.data.length; i++) {
            const transformed = this.transform(result.data[i]);
            // Nếu transform trả về Promise (hiếm khi), thì mới dùng await
            transformedData[i] = transformed instanceof Promise ? await transformed : transformed;
        }
        result.data = transformedData as T[];

        return this.afterGetList(result);
    }


    /**
     * Lấy một bản ghi theo ID
     */
    async getOne(id: string | number | bigint, _options: IPaginationOptions = {}): Promise<T> {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }

        const transformed = this.transform(entity) as T;
        const final = await this.afterGetOne(transformed);

        if (!final) {
            throw new NotFoundException(`Resource with ID ${id} not found after processing`);
        }

        return final;
    }

    /**
     * Tạo mới
     */
    async create(data: any): Promise<T> {
        const payload = await this.beforeCreate(data);
        const entity = await this.repository.create(payload);
        await this.afterCreate(entity, data);
        return this.transform(entity) as T;
    }

    /**
     * Cập nhật
     */
    async update(id: string | number | bigint, data: any): Promise<T> {
        const payload = await this.beforeUpdate(id, data);
        const entity = await this.repository.update(id, payload);
        if (!entity) {
            throw new NotFoundException(`Resource with ID ${id} not found to update`);
        }
        await this.afterUpdate(entity, data);
        return this.transform(entity) as T;
    }

    /**
     * Xóa
     */
    async delete(id: string | number | bigint): Promise<any> {
        const canDelete = await this.beforeDelete(id);
        if (!canDelete) return false;

        const result = await this.repository.delete(id);
        if (result) {
            await this.afterDelete(id);
        }
        return result;
    }

    /**
     * Transform dữ liệu trả về (ví dụ: xử lý BigInt, ẩn field nhạy cảm)
     */
    protected transform(entity: T | null): T | null {
        if (!entity) return null;
        return this.deepConvertBigInt(entity);
    }

    /**
     * Helper để convert BigInt sang number trong object
     */
    protected deepConvertBigInt(obj: any): any {
        if (obj === null || obj === undefined) return obj;

        const type = typeof obj;

        // Chuyển đổi BigInt sang Number (Trường hợp hay gặp nhất ở các field đơn)
        if (type === 'bigint') return Number(obj);

        // Nếu không phải object hoặc array thì giữ nguyên
        if (type !== 'object') return obj;

        // Xử lý Date: Trả về đối tượng Date để JSON.stringify tự xử lý sang chuỗi ISO
        if (obj instanceof Date) return obj;

        // Xử lý Array: Dùng loop thay vì map để nhanh hơn một chút ở mảng lớn
        if (Array.isArray(obj)) {
            const res = new Array(obj.length);
            for (let i = 0; i < obj.length; i++) {
                res[i] = this.deepConvertBigInt(obj[i]);
            }
            return res;
        }

        // Xử lý Object: Chỉ xử lý sâu các plain object ({})
        const constructor = obj.constructor;
        const isPlainObject = constructor === undefined || constructor.name === 'Object';
        if (!isPlainObject) {
            return obj;
        }

        const res: any = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            res[key] = this.deepConvertBigInt(obj[key]);
        }
        return res;
    }
}
