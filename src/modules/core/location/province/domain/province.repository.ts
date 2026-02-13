import { IRepository } from '@/common/core/repositories/repository.interface';
import { Province } from '@prisma/client';

export interface IProvinceRepository extends IRepository<Province> { }
