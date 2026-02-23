import { ForbiddenException } from '@nestjs/common';
import { verifyGroupOwnership, getGroupFilter } from '@/common/shared/utils/group-ownership.util';
import { RequestContext } from '@/common/shared/utils';

describe('GroupOwnershipUtil', () => {
    describe('verifyGroupOwnership', () => {
        it('should allow access if contextId is 1 (system)', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'contextId') return 1;
                if (key === 'groupId') return 123;
                return null;
            });

            expect(() => verifyGroupOwnership({ group_id: 456 })).not.toThrow();
        });

        it('should allow access if entity group_id matches current groupId', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'contextId') return 2;
                if (key === 'groupId') return 123;
                return null;
            });

            expect(() => verifyGroupOwnership({ group_id: 123 })).not.toThrow();
            expect(() => verifyGroupOwnership({ group_id: BigInt(123) })).not.toThrow();
        });

        it('should throw ForbiddenException if group_id does not match', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'contextId') return 2;
                if (key === 'groupId') return 123;
                return null;
            });

            expect(() => verifyGroupOwnership({ group_id: 456 })).toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if entity has no group_id and not system context', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'contextId') return 2;
                if (key === 'groupId') return 123;
                return null;
            });

            expect(() => verifyGroupOwnership({ group_id: null })).toThrow(ForbiddenException);
        });
    });

    describe('getGroupFilter', () => {
        it('should return empty object for system context', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'context') return { type: 'system' };
                if (key === 'groupId') return 123;
                return null;
            });

            expect(getGroupFilter()).toEqual({});
        });

        it('should return group_id filter for non-system context', () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key: string) => {
                if (key === 'context') return { type: 'branch' };
                if (key === 'groupId') return 123;
                return null;
            });

            expect(getGroupFilter()).toEqual({ group_id: 123 });
        });
    });
});



