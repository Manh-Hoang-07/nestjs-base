
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RoleHasPermission } from '@prisma/client';
import { IRoleHasPermissionRepository } from '../../domain/role-has-permission.repository';

@Injectable()
export class RoleHasPermissionRepositoryImpl implements IRoleHasPermissionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findMany(options: {
        where?: any;
        include?: any;
    }): Promise<RoleHasPermission[]> {
        return this.prisma.roleHasPermission.findMany(options);
    }
}
