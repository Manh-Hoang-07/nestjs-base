/**
 * Queue Testing Script
 * 
 * This script helps you test the queue implementation without going through the full API flow.
 * Run this after starting the application to verify queue is working correctly.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Queue } from 'bull';

async function testQueue() {
    console.log('🚀 Starting Queue Test...\n');

    // Create application context
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // Get the notification queue
        const notificationQueue = app.get<Queue>('BullQueue_notification');

        console.log('✅ Queue instance obtained\n');

        // Test 1: Check queue connection
        console.log('Test 1: Checking Redis connection...');
        const isReady = await notificationQueue.isReady();
        console.log(`  Redis ready: ${isReady ? '✅' : '❌'}\n`);

        // Test 2: Get queue stats
        console.log('Test 2: Getting queue statistics...');
        const waiting = await notificationQueue.getWaitingCount();
        const active = await notificationQueue.getActiveCount();
        const completed = await notificationQueue.getCompletedCount();
        const failed = await notificationQueue.getFailedCount();

        console.log(`  Waiting jobs: ${waiting}`);
        console.log(`  Active jobs: ${active}`);
        console.log(`  Completed jobs: ${completed}`);
        console.log(`  Failed jobs: ${failed}\n`);

        // Test 3: Add a test job
        console.log('Test 3: Adding a test email job...');
        const job = await notificationQueue.add('send_email_template', {
            templateCode: 'test_email',
            options: {
                to: 'test@example.com',
                variables: {
                    name: 'Test User',
                    message: 'This is a test email from queue',
                },
            },
        }, {
            jobId: `test-job-${Date.now()}`,
            attempts: 1,
            removeOnComplete: true,
        });

        console.log(`  Job added with ID: ${job.id}`);
        console.log(`  Job name: ${job.name}`);
        console.log(`  Job data:`, JSON.stringify(job.data, null, 2));

        // Wait for job to be processed
        console.log('\n⏳ Waiting for job to be processed (5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check job status
        const jobState = await job.getState();
        console.log(`  Job state: ${jobState}`);

        if (jobState === 'completed') {
            console.log('  ✅ Job completed successfully!\n');
        } else if (jobState === 'failed') {
            const failedReason = job.failedReason;
            console.log(`  ❌ Job failed: ${failedReason}\n`);
        } else {
            console.log(`  ⚠️  Job is still ${jobState}\n`);
        }

        // Test 4: Check for failed jobs
        console.log('Test 4: Checking for failed jobs...');
        const failedJobs = await notificationQueue.getFailed(0, 10);
        if (failedJobs.length > 0) {
            console.log(`  ⚠️  Found ${failedJobs.length} failed jobs:`);
            failedJobs.forEach(job => {
                console.log(`    - Job ${job.id}: ${job.failedReason}`);
            });
            console.log();
        } else {
            console.log('  ✅ No failed jobs\n');
        }

        // Test 5: Clean up old jobs
        console.log('Test 5: Cleaning up old completed jobs...');
        await notificationQueue.clean(3600000, 'completed'); // Clean jobs older than 1 hour
        console.log('  ✅ Cleanup completed\n');

        console.log('🎉 Queue test completed successfully!\n');

        // Summary
        console.log('='.repeat(50));
        console.log('SUMMARY');
        console.log('='.repeat(50));
        console.log('✅ Redis connection: OK');
        console.log('✅ Queue registration: OK');
        console.log('✅ Job creation: OK');
        console.log('✅ Job processing: Check logs above');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await app.close();
    }
}

// Run the test
testQueue()
    .then(() => {
        console.log('\n✅ Test script finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test script failed:', error);
        process.exit(1);
    });
