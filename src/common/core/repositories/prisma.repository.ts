
import { IRepository, IPaginationOptions, IPaginatedResult } from './repository.interface';
import { createPaginationMeta } from '@/common/core/utils';

// Generic Delegate to cover most Prisma Client Delegates
export type PrismaDelegate = {
    findMany: (args: any) => Promise<any[]>;
    findFirst: (args: any) => Promise<any | null>;
    findUnique?: (args: any) => Promise<any | null>; // Some models use findUnique
    count: (args: any) => Promise<number>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    updateMany: (args: any) => Promise<{ count: number }>;
    upsert: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    deleteMany: (args: any) => Promise<{ count: number }>;
};

export abstract class PrismaRepository<
    Model,
    WhereInput = any,
    CreateInput = any,
    UpdateInput = any,
    OrderByInput = any
> implements IRepository<Model> {

    protected isSoftDelete = true;
    protected defaultSelect: any = undefined;
    protected defaultInclude: any = undefined;

    constructor(
        protected readonly delegate: PrismaDelegate,
        protected readonly defaultSort: string = 'created_at:desc'
    ) { }

    /**
     * Must be implemented by subclasses to transform abstract filters to Prisma WhereInput
     */
    protected abstract buildWhere(filter: Record<string, any>): WhereInput;

    /**
     * Helper to parse sort string "field:dir" to Prisma OrderBy
     */
    protected parseSort(sortStr: string): OrderByInput[] {
        const sorts = sortStr.split(',');
        return sorts.map((s) => {
            const [field, dir] = s.split(':');
            return { [field]: dir ? dir.toLowerCase() : 'desc' } as any;
        });
    }

    /**
     * Helper to convert input to primary key type (default BigInt)
     */
    protected toPrimaryKey(id: string | number | bigint): any {
        if (typeof id === 'bigint') return id;
        try {
            return BigInt(id);
        } catch {
            return id;
        }
    }

    async findAll(options: IPaginationOptions = {}): Promise<IPaginatedResult<Model>> {
        const page = Math.max(Number(options.page) || 1, 1);
        const limit = Math.max(Number(options.limit) || 10, 1);
        const sort = options.sort || this.defaultSort;
        const filter = options.filter || {};

        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
        }
        const orderBy = this.parseSort(sort);

        const [data, total] = await Promise.all([
            this.delegate.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: this.defaultSelect,
                include: this.defaultInclude,
            }),
            this.delegate.count({ where }),
        ]);

        return {
            data,
            meta: createPaginationMeta(page, limit, total),
        };
    }

    async findById(id: string | number | bigint): Promise<Model | null> {
        return this.delegate.findFirst({
            where: { id: this.toPrimaryKey(id) } as any,
            select: this.defaultSelect,
            include: this.defaultInclude,
        });
    }

    async findManyByIds(ids: (string | number | bigint)[]): Promise<Model[]> {
        return this.delegate.findMany({
            where: { id: { in: ids.map(id => this.toPrimaryKey(id)) } } as any,
            select: this.defaultSelect,
            include: this.defaultInclude,
        });
    }

    async findOne(filter: Record<string, any>): Promise<Model | null> {
        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
        }
        return this.delegate.findFirst({
            where,
            select: this.defaultSelect,
            include: this.defaultInclude,
        });
    }

    async findMany(filter: Record<string, any> = {}, options: IPaginationOptions = {}): Promise<Model[]> {
        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
        }
        const orderBy = options.sort ? this.parseSort(options.sort) : undefined;

        return this.delegate.findMany({
            where,
            orderBy,
            take: options.limit,
            skip: options.page && options.limit ? (options.page - 1) * options.limit : undefined,
            select: this.defaultSelect,
            include: this.defaultInclude,
        });
    }

    async create(data: CreateInput): Promise<Model> {
        return this.delegate.create({ data });
    }

    async update(id: string | number | bigint, data: UpdateInput): Promise<Model> {
        return this.delegate.update({
            where: { id: this.toPrimaryKey(id) } as any,
            data,
        });
    }

    async updateMany(filter: Record<string, any>, data: UpdateInput): Promise<{ count: number }> {
        const where = this.buildWhere(filter);
        return this.delegate.updateMany({ where, data });
    }

    async upsert(id: string | number | bigint, data: any): Promise<Model> {
        const pk = this.toPrimaryKey(id);
        return this.delegate.upsert({
            where: { id: pk } as any,
            create: { ...data, id: pk },
            update: data,
        });
    }

    async delete(id: string | number | bigint): Promise<boolean> {
        try {
            const pk = this.toPrimaryKey(id);
            if (this.isSoftDelete) {
                await this.delegate.update({
                    where: { id: pk } as any,
                    data: { deleted_at: new Date() } as any,
                });
            } else {
                await this.delegate.delete({ where: { id: pk } as any });
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    async exists(filter: Record<string, any>): Promise<boolean> {
        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
        }
        const count = await this.delegate.count({ where });
        return count > 0;
    }

    async count(filter: Record<string, any> = {}): Promise<number> {
        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
        }
        return this.delegate.count({ where });
    }

    async deleteMany(filter: Record<string, any>): Promise<{ count: number }> {
        const where: any = this.buildWhere(filter);
        if (this.isSoftDelete) {
            where.deleted_at = null;
            return this.delegate.updateMany({
                where,
                data: { deleted_at: new Date() } as any,
            });
        }
        return this.delegate.deleteMany({ where });
    }

    async findFirstRaw(options: any): Promise<Model | null> {
        return this.delegate.findFirst(options);
    }

    async findManyRaw(options: any): Promise<Model[]> {
        return this.delegate.findMany(options);
    }
}
