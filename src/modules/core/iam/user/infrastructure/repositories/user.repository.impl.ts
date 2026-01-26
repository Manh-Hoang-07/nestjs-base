
import { Injectable } from '@nestjs/common';
import { User, Prisma, Profile } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IUserRepository, UserFilter } from '../../domain/user.repository';

@Injectable()
export class UserRepositoryImpl extends PrismaRepository<
    User,
    Prisma.UserWhereInput,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput,
    Prisma.UserOrderByWithRelationInput
> implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.user as unknown as any);
        this.isSoftDelete = true;
        this.defaultSelect = {
            id: true,
            email: true,
            phone: true,
            username: true,
            name: true,
            image: true,
            created_at: true,
            updated_at: true,
            last_login_at: true,
            status: true,
            profile: true,
            user_role_assignments: true,
        };
    }

    protected buildWhere(filter: UserFilter): Prisma.UserWhereInput {
        const where: Prisma.UserWhereInput = {};

        if (filter.search) {
            where.OR = [
                { email: { contains: filter.search } },
                { username: { contains: filter.search } },
                { phone: { contains: filter.search } },
            ];
        }

        if (filter.email) where.email = filter.email;
        if (filter.phone) where.phone = filter.phone;
        if (filter.username) where.username = filter.username;
        if (filter.status) where.status = filter.status as any;

        if (filter.groupId) {
            where.user_groups = {
                some: {
                    group_id: this.toPrimaryKey(filter.groupId),
                },
            };
        }

        if (filter.NOT) {
            where.NOT = filter.NOT;
        }

        return where;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ email });
    }

    async findByEmailForAuth(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                email,
                deleted_at: null,
            },
        });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.findOne({ phone });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findOne({ username });
    }

    async findByIdForAuth(id: number | bigint): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                id: this.toPrimaryKey(id),
                deleted_at: null,
            },
        });
    }

    async checkUnique(field: 'email' | 'phone' | 'username', value: string, excludeUserId?: number | bigint): Promise<boolean> {
        const filter: Record<string, any> = { [field]: value };
        if (excludeUserId) {
            filter.NOT = { id: this.toPrimaryKey(excludeUserId) };
        }
        return !(await this.exists(filter));
    }

    async upsertProfile(userId: number | bigint, data: Prisma.ProfileUncheckedCreateInput): Promise<Profile> {
        // Đảm bảo userId là number hoặc bigint, không phải object
        const numericId = typeof userId === 'object' ? Number((userId as any).id || userId) : userId;
        const pk = this.toPrimaryKey(numericId);

        // Chỉ lấy các trường hợp lệ của Profile
        const validProfileFields = ['birthday', 'gender', 'address', 'about', 'created_user_id', 'updated_user_id'];
        const dataAny = data as any;

        const createData: any = { user_id: pk };
        const updateData: any = {};

        for (const field of validProfileFields) {
            if (dataAny[field] !== undefined) {
                let value = dataAny[field];

                // Chuyển đổi birthday sang Date object hợp lệ
                if (field === 'birthday') {
                    if (typeof value === 'string' && value.trim() !== '') {
                        const date = new Date(value);
                        value = isNaN(date.getTime()) ? null : date;
                    } else if (!value) {
                        value = null;
                    }
                }

                createData[field] = value;
                updateData[field] = value;
            }
        }

        return this.prisma.profile.upsert({
            where: { user_id: pk },
            create: createData,
            update: updateData,
        });
    }

    async updateLastLogin(userId: number | bigint): Promise<void> {
        await this.update(userId, { last_login_at: new Date() });
    }

    async findByIdWithBasicInfo(userId: number | bigint) {
        return this.findFirstRaw({
            where: { id: this.toPrimaryKey(userId) },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                status: true,
                email_verified_at: true,
                phone_verified_at: true,
                last_login_at: true,
                created_at: true,
                updated_at: true,
            },
        });
    }
}
