#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix remaining service imports
const serviceImportFixes = {
    'dashboard/user/controllers/dashboard.controller.ts': {
        from: "./services/dashboard.service",
        to: "../services/dashboard.service"
    },
    'follow/user/controllers/follows.controller.ts': {
        from: "./services/follows.service",
        to: "../services/follows.service"
    },
    'homepage/public/controllers/homepage.controller.ts': {
        from: "./services/homepage.service",
        to: "../services/homepage.service"
    },
    'moderation/admin/controllers/moderation.controller.ts': {
        from: "./services/moderation.service",
        to: "../services/moderation.service"
    },
    'reading-history/user/controllers/reading-history.controller.ts': {
        from: "./services/reading-history.service",
        to: "../services/reading-history.service"
    },
    'review/admin/controllers/reviews.controller.ts': {
        from: "./services/reviews.service",
        to: "../services/reviews.service"
    },
    'review/public/controllers/reviews.controller.ts': {
        from: "./services/reviews.service",
        to: "../services/reviews.service"
    },
    'review/user/controllers/reviews.controller.ts': {
        from: "./services/reviews.service",
        to: "../services/reviews.service"
    },
    'stats/public/controllers/stats.controller.ts': {
        from: "./services/stats.service",
        to: "../services/stats.service"
    },
    'homepage/public/services/homepage.service.ts': {
        from: "../../comic/public/services/comic.service",
        to: "../../comic/public/services/comic.service" // Already correct, but check class name
    }
};

const comicsDir = path.join(__dirname, 'src', 'modules', 'comics');

Object.entries(serviceImportFixes).forEach(([relativePath, fix]) => {
    const filePath = path.join(comicsDir, relativePath);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${relativePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const pattern = new RegExp(`from ['"]${fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');

    if (pattern.test(content)) {
        content = content.replace(pattern, `from '${fix.to}'`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${relativePath}`);
    }
});

// Fix filters -> filter in review admin controller
const reviewAdminController = path.join(comicsDir, 'review/admin/controllers/reviews.controller.ts');
if (fs.existsSync(reviewAdminController)) {
    let content = fs.readFileSync(reviewAdminController, 'utf8');
    if (content.includes('const { filters, options }')) {
        content = content.replace(
            /const \{ filters, options \} = prepareQuery\(query\);/g,
            'const { filter, options } = prepareQuery(query);'
        );
        content = content.replace(
            /return this\.reviewsService\.getList\(filters, options\);/g,
            'return this.reviewsService.getList({ filter, ...options });'
        );
        fs.writeFileSync(reviewAdminController, content, 'utf8');
        console.log('✓ Fixed filters in review/admin/controllers/reviews.controller.ts');
    }
}

console.log('\n✅ All service imports fixed!');
