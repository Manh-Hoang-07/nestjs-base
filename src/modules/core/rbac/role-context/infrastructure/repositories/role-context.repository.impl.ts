
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RoleContext } from '@prisma/client';
import { IRoleContextRepository } from '../../domain/role-context.repository';

@Injectable()
export class RoleContextRepositoryImpl implements IRoleContextRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findFirst(options: {
        where?: any;
    }): Promise<RoleContext | null> {
        return this.prisma.roleContext.findFirst(options);
    }
}
