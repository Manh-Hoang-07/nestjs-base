#!/usr/bin/env node

/**
 * Script để tìm các service cần refactor để sử dụng autoAddGroupId
 * 
 * Usage: node scripts/find-services-need-refactor.js
 */

const fs = require('fs');
const path = require('path');

// Pattern để tìm code cần refactor
const PATTERN_TO_FIND = `const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      (payload as any).group_id = groupId;
    }`;

// Các service đã được refactor
const REFACTORED_SERVICES = [
    'comic.service.ts',
    'comic-category.service.ts',
    'chapter.service.ts',
];

function findFilesRecursive(dir, pattern, results = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, dist, etc.
            if (!['node_modules', 'dist', '.git', 'coverage'].includes(file)) {
                findFilesRecursive(filePath, pattern, results);
            }
        } else if (file.endsWith('.service.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Check if file contains the pattern
            if (content.includes("RequestContext.get<number | null>('groupId')")) {
                // Check if already refactored
                const isRefactored = REFACTORED_SERVICES.some(s => filePath.includes(s));

                if (!isRefactored) {
                    // Count occurrences
                    const matches = content.match(/RequestContext\.get<number \| null>\('groupId'\)/g);
                    const count = matches ? matches.length : 0;

                    results.push({
                        file: filePath,
                        count,
                        hasAutoAddGroupId: content.includes('this.autoAddGroupId = true'),
                    });
                }
            }
        }
    });

    return results;
}

function main() {
    console.log('🔍 Đang tìm các service cần refactor...\n');

    const srcDir = path.join(__dirname, '..', 'src');
    const results = findFilesRecursive(srcDir, 'groupId');

    if (results.length === 0) {
        console.log('✅ Tất cả service đã được refactor!');
        return;
    }

    console.log(`📋 Tìm thấy ${results.length} service cần refactor:\n`);

    // Group by module
    const byModule = {};
    results.forEach(r => {
        const moduleName = r.file.split(/[\/\\]modules[\/\\]/)[1]?.split(/[\/\\]/)[0] || 'unknown';
        if (!byModule[moduleName]) {
            byModule[moduleName] = [];
        }
        byModule[moduleName].push(r);
    });

    // Print grouped results
    Object.keys(byModule).sort().forEach(module => {
        console.log(`\n📦 Module: ${module}`);
        byModule[module].forEach(r => {
            const fileName = path.basename(r.file);
            const status = r.hasAutoAddGroupId ? '⚠️  (đã có flag nhưng chưa refactor beforeCreate)' : '❌';
            console.log(`  ${status} ${fileName} (${r.count} lần sử dụng)`);
            console.log(`     ${r.file}`);
        });
    });

    console.log('\n\n📝 Hướng dẫn refactor:');
    console.log('1. Thêm vào constructor: this.autoAddGroupId = true');
    console.log('2. Trong beforeCreate: const payload = await super.beforeCreate(data)');
    console.log('3. Xóa đoạn code thêm group_id thủ công');
    console.log('\n📖 Xem chi tiết tại: docs/base-service-auto-group-id.md');
}

main();
