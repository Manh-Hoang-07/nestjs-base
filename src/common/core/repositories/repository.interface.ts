import { PaginationMeta } from '@/common/core/utils';

export interface IPaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    // Generic filter object, implementation specific but kept abstract here
    filter?: Record<string, any>;
}

export interface IPaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface IRepository<T> {
    findAll(options?: IPaginationOptions): Promise<IPaginatedResult<T>>;
    findById(id: string | number | bigint): Promise<T | null>;
    findManyByIds(ids: (string | number | bigint)[]): Promise<T[]>;
    findOne(filter: Record<string, any>): Promise<T | null>;
    findMany(filter?: Record<string, any>, options?: IPaginationOptions): Promise<T[]>;

    create(data: any): Promise<T>;
    update(id: string | number | bigint, data: any): Promise<T>;
    updateMany(filter: Record<string, any>, data: any): Promise<{ count: number }>;
    upsert(id: string | number | bigint, data: any): Promise<T>;
    delete(id: string | number | bigint): Promise<boolean>;

    exists(filter: Record<string, any>): Promise<boolean>;
    count(filter?: Record<string, any>): Promise<number>;

    deleteMany(filter: Record<string, any>): Promise<{ count: number }>;

    // Các phương thức low-level cho trường hợp đặc biệt (vẫn giữ nhưng khuyến khích hạn chế dùng trực tiếp ở Service)
    findFirstRaw(options: any): Promise<T | null>;
    findManyRaw(options: any): Promise<T[]>;
}

