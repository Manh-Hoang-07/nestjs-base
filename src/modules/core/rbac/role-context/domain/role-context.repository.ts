
import { RoleContext } from '@prisma/client';

export const ROLE_CONTEXT_REPOSITORY = 'IRoleContextRepository';

export interface IRoleContextRepository {
    findFirst(options: {
        where?: any;
    }): Promise<RoleContext | null>;

    // [C2] Thêm findMany để support batch validation thay vì N+1 queries
    findMany(options: {
        where?: any;
    }): Promise<RoleContext[]>;
}


