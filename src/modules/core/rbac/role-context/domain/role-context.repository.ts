
import { RoleContext } from '@prisma/client';

export const ROLE_CONTEXT_REPOSITORY = 'IRoleContextRepository';

export interface IRoleContextRepository {
    findFirst(options: {
        where?: any;
    }): Promise<RoleContext | null>;
}
