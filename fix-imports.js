#!/usr/bin/env node

/**
 * Batch fix script for import path errors
 * This script will be executed to fix all common import path issues
 */

const fs = require('fs');
const path = require('path');

const fixes = [
    // Fix RbacModule imports
    {
        pattern: /from '@\/modules\/rbac\/rbac\.module'/g,
        replacement: "from '@/modules/core/rbac/rbac.module'",
        description: 'Fix RbacModule import path'
    },
    // Fix RequestContext imports
    {
        pattern: /from '@\/common\/utils\/request-context\.util'/g,
        replacement: "from '@/common/shared/utils'",
        description: 'Fix RequestContext import path'
    },
    // Fix Permission decorator imports
    {
        pattern: /from '@\/common\/decorators\/rbac\.decorators'/g,
        replacement: "from '@/common/auth/decorators/rbac.decorators'",
        description: 'Fix Permission decorator import path'
    },
    // Fix LogRequest decorator imports
    {
        pattern: /from '@\/common\/decorators\/log-request\.decorator'/g,
        replacement: "from '@/common/shared/decorators/log-request.decorator'",
        description: 'Fix LogRequest decorator import path'
    },
    // Fix list-query helper imports
    {
        pattern: /from '@\/common\/base\/utils\/list-query\.helper'/g,
        replacement: "from '@/common/core/utils/list-query.helper'",
        description: 'Fix list-query helper import path'
    },
    // Fix pagination helper imports
    {
        pattern: /from '@\/common\/base\/utils\/pagination\.helper'/g,
        replacement: "from '@/common/core/utils/pagination.helper'",
        description: 'Fix pagination helper import path'
    },
    // Fix CacheService imports
    {
        pattern: /from '@\/common\/services\/cache\.service'/g,
        replacement: "from '@/common/cache/services/cache.service'",
        description: 'Fix CacheService import path'
    },
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
        if (fix.pattern.test(content)) {
            content = content.replace(fix.pattern, fix.replacement);
            modified = true;
            console.log(`  ✓ ${fix.description}`);
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else if (file.endsWith('.ts')) {
            callback(filePath);
        }
    });
}

const comicsDir = path.join(__dirname, 'src', 'modules', 'comics');
console.log('Fixing import paths in comics modules...\n');

let filesFixed = 0;
walkDir(comicsDir, (filePath) => {
    if (fixFile(filePath)) {
        console.log(`Fixed: ${path.relative(comicsDir, filePath)}`);
        filesFixed++;
    }
});

console.log(`\n✅ Fixed ${filesFixed} files`);
