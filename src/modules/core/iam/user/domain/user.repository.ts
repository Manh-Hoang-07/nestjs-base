
import { User, Profile, Prisma } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const USER_REPOSITORY = 'IUserRepository';

export interface UserFilter {
    search?: string;
    email?: string;
    phone?: string;
    username?: string;
    groupId?: number; // For filtering users within a group
    contextId?: number; // For system vs context logic
    status?: string; // If applicable
    NOT?: any;
}

export interface IUserRepository extends IRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByEmailForAuth(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByIdForAuth(id: number | bigint): Promise<User | null>;

    // Aggregate methods
    upsertProfile(userId: number | bigint, data: Prisma.ProfileUncheckedCreateInput): Promise<Profile>;

    // Check existence excluding ID (for update validation)
    checkUnique(field: 'email' | 'phone' | 'username', value: string, excludeUserId?: number | bigint): Promise<boolean>;

    upsert(id: string | number | bigint, data: any): Promise<User>;
    updateLastLogin(userId: number | bigint): Promise<void>;

    // For JWT strategy - load basic user info
    findByIdWithBasicInfo(userId: number | bigint): Promise<{
        id: bigint;
        username: string | null;
        email: string | null;
        phone: string | null;
        status: string;
        email_verified_at: Date | null;
        phone_verified_at: Date | null;
        last_login_at: Date | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
}
