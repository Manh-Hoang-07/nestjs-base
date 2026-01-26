import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisUtil } from '@/core/utils/redis.util';
import { IPostRepository, POST_REPOSITORY } from '@/modules/post/post/domain/post.repository';

@Injectable()
export class PostViewCronService {
    private readonly logger = new Logger(PostViewCronService.name);
    private readonly BUFFER_KEY = 'post:views:buffer';

    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepo: IPostRepository,
        private readonly redis: RedisUtil,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async syncViews() {
        if (!this.redis.isEnabled()) return;

        const lockKey = `${this.BUFFER_KEY}:lock`;
        const lockToken = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const isLocked = await this.redis.lock(lockKey, 280, lockToken); // Lock for slightly less than 5 mins
        if (!isLocked) return;

        try {
            const stuckKeys = await this.redis.scan(`${this.BUFFER_KEY}:syncing:*`);
            for (const key of stuckKeys) {
                this.logger.debug(`Recovering stuck sync key: ${key}`);
                await this.processSyncKey(key);
            }

            const workingKey = `${this.BUFFER_KEY}:syncing:${Date.now()}`;

            await this.redis.rename(this.BUFFER_KEY, workingKey);

            await this.processSyncKey(workingKey);
        } catch (error) {
            this.logger.error('Error in post view cron service:', error);
        } finally {
            await this.redis.unlock(lockKey, lockToken);
        }
    }

    private async processSyncKey(workingKey: string) {
        const data = await this.redis.hgetall(workingKey);
        if (Object.keys(data).length === 0) {
            await this.redis.del(workingKey);
            return;
        }

        const entries = Object.entries(data)
            .map(([postIdStr, countStr]) => {
                try {
                    return {
                        postId: BigInt(postIdStr),
                        postIdStr, // Keep string for hdel
                        count: parseInt(countStr, 10),
                    };
                } catch (e) {
                    return null;
                }
            })
            .filter((entry): entry is { postId: bigint; postIdStr: string; count: number } =>
                entry !== null && !isNaN(entry.count) && entry.count > 0
            );

        if (entries.length === 0) {
            await this.redis.del(workingKey);
            return;
        }

        const vncDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        vncDate.setHours(0, 0, 0, 0);

        const CHUNK_SIZE = 100;
        for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
            const chunk = entries.slice(i, i + CHUNK_SIZE);

            try {
                // Process each item in the chunk using repository methods
                for (const item of chunk) {
                    await this.postRepo.batchIncrementViewCount(item.postId, item.count);
                    await this.postRepo.upsertViewStats(item.postId, vncDate, item.count);
                }

                // SUCCESS: Remove processed fields from Redis to ensure idempotency if next chunk fails
                const processedFields = chunk.map(item => item.postIdStr);
                await this.redis.hdel(workingKey, ...processedFields);

            } catch (error) {
                this.logger.error(`Failed to process chunk in ${workingKey}:`, error);
                // Stop processing this key, will retry in next cron cycle
                return;
            }
        }

        // Cleanup Redis only after all chunks are successful
        await this.redis.del(workingKey);
        this.logger.log(`Successfully synced ${entries.length} posts from ${workingKey}`);
    }
}
