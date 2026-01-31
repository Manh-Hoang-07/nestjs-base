#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Map of incorrect paths to correct relative paths
const moduleSpecificFixes = {
    // Admin modules - use relative paths
    'comment/admin': [
        { from: "@/modules/comics/admin/comments/controllers/comments.controller", to: "./controllers/comments.controller" },
        { from: "@/modules/comics/admin/comments/services/comments.service", to: "./services/comments.service" },
    ],
    'moderation/admin': [
        { from: "@/modules/comics/admin/moderation/controllers/moderation.controller", to: "./controllers/moderation.controller" },
        { from: "@/modules/comics/admin/moderation/services/moderation.service", to: "./services/moderation.service" },
    ],
    'review/admin': [
        { from: "@/modules/comics/admin/reviews/controllers/reviews.controller", to: "./controllers/reviews.controller" },
        { from: "@/modules/comics/admin/reviews/services/reviews.service", to: "./services/reviews.service" },
    ],
    // User modules
    'dashboard/user': [
        { from: "@/modules/comics/user/dashboard/controllers/dashboard.controller", to: "./controllers/dashboard.controller" },
        { from: "@/modules/comics/user/dashboard/services/dashboard.service", to: "./services/dashboard.service" },
    ],
    'follow/user': [
        { from: "@/modules/comics/user/follows/controllers/follows.controller", to: "./controllers/follows.controller" },
        { from: "@/modules/comics/user/follows/services/follows.service", to: "./services/follows.service" },
    ],
    'reading-history/user': [
        { from: "@/modules/comics/user/reading-history/controllers/reading-history.controller", to: "./controllers/reading-history.controller" },
        { from: "@/modules/comics/user/reading-history/services/reading-history.service", to: "./services/reading-history.service" },
    ],
    'review/user': [
        { from: "@/modules/comics/user/reviews/controllers/reviews.controller", to: "./controllers/reviews.controller" },
        { from: "@/modules/comics/user/reviews/services/reviews.service", to: "./services/reviews.service" },
    ],
    // Public modules
    'homepage/public': [
        { from: "@/modules/comics/public/homepage/controllers/homepage.controller", to: "./controllers/homepage.controller" },
        { from: "@/modules/comics/public/homepage/services/homepage.service", to: "./services/homepage.service" },
        { from: "@/modules/comics/public/comics/comics.module", to: "../../comic/public/comic.module" },
        { from: "@/modules/comics/public/chapters/chapters.module", to: "../../chapter/public/chapter.module" },
        { from: "@/modules/comics/public/comic-categories/comic-categories.module", to: "../../comic-category/public/comic-category.module" },
        { from: "@/modules/comics/public/comics/services/comics.service", to: "../../comic/public/services/comic.service" },
        { from: "@/modules/comics/public/comic-categories/services/comic-categories.service", to: "../../comic-category/public/services/comic-category.service" },
    ],
    'review/public': [
        { from: "@/modules/comics/public/reviews/controllers/reviews.controller", to: "./controllers/reviews.controller" },
        { from: "@/modules/comics/public/reviews/services/reviews.service", to: "./services/reviews.service" },
    ],
    'stats/public': [
        { from: "@/modules/comics/public/stats/controllers/stats.controller", to: "./controllers/stats.controller" },
        { from: "@/modules/comics/public/stats/services/stats.service", to: "./services/stats.service" },
    ],
};

function fixFile(filePath, basePath) {
    const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
    const dirKey = Object.keys(moduleSpecificFixes).find(key => relativePath.startsWith(key));

    if (!dirKey) return false;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const fixes = moduleSpecificFixes[dirKey];
    fixes.forEach(fix => {
        const pattern = new RegExp(`from ['"]${fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        if (pattern.test(content)) {
            content = content.replace(pattern, `from '${fix.to}'`);
            modified = true;
            console.log(`  ✓ ${fix.from} → ${fix.to}`);
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walkDir(dir, callback, basePath) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback, basePath);
        } else if (file.endsWith('.ts')) {
            callback(filePath, basePath);
        }
    });
}

const comicsDir = path.join(__dirname, 'src', 'modules', 'comics');
console.log('Fixing module-specific import paths...\n');

let filesFixed = 0;
walkDir(comicsDir, (filePath, basePath) => {
    if (fixFile(filePath, basePath)) {
        console.log(`Fixed: ${path.relative(comicsDir, filePath)}\n`);
        filesFixed++;
    }
}, comicsDir);

console.log(`✅ Fixed ${filesFixed} files`);
