import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicStaffService } from '@/modules/introduction/staff/public/services/staff.service';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('staff')
export class PublicStaffController {
  constructor(private readonly staffService: PublicStaffService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.staffService.getList(query);
  }

  @Permission('public')
  @Get('department/:department')
  findByDepartment(@Param('department') department: string) {
    return this.staffService.findByDepartment(department);
  }

  @Permission('public')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.getOne(+id);
  }
}

