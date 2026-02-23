import { Injectable, Inject } from '@nestjs/common';
import { IContextRepository, CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { IGroupRepository, GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { IUserGroupRepository, USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';

@Injectable()
export class UserContextService {
  constructor(
    @Inject(CONTEXT_REPOSITORY)
    private readonly contextRepo: IContextRepository,
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: IGroupRepository,
    @Inject(USER_GROUP_REPOSITORY)
    private readonly userGroupRepo: IUserGroupRepository,
  ) { }

  async getUserContexts(userId: number) {
    const userGroups = await this.userGroupRepo.findByUserId(userId);

    if (!userGroups.length) return [];

    const groupIds = Array.from(new Set(userGroups.map((ug) => ug.group_id)));

    const groups = await this.groupRepo.findActiveByIds(groupIds);

    const contextIds = Array.from(new Set(groups.map((g) => g.context_id)));
    if (!contextIds.length) return [];

    const contexts = await this.contextRepo.findActiveByIds(contextIds);

    return contexts.map(ctx => this.transform(ctx));
  }

  async getUserContextsForTransfer(userId: number) {
    // ID 1 should be system context as per business logic
    const systemContext = await this.contextRepo.findById(1);

    const userContexts = await this.getUserContexts(userId);

    const allContexts: any[] = [];
    if (systemContext && systemContext.status === 'active') {
      allContexts.push(this.transform(systemContext));
    }
    allContexts.push(...userContexts);

    // Filter unique by ID
    const uniqueContexts = allContexts.filter(
      (ctx, index, self) => index === self.findIndex((c) => Number(c.id) === Number(ctx.id)),
    );

    return uniqueContexts;
  }

  private transform(context: any) {
    if (!context) return context;
    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }
}

