import { IRepository } from '@/common/core/repositories/repository.interface';
import { Ward } from '@prisma/client';

export interface IWardRepository extends IRepository<Ward> { }
