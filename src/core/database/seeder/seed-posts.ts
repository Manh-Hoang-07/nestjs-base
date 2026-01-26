import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PostStatus } from '@/shared/enums/types/post-status.enum';
import { PostType } from '@/shared/enums/types/post-type.enum';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class SeedPosts {
    private readonly logger = new Logger(SeedPosts.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding posts module...');

        const existingCount = await this.prisma.post.count();
        if (existingCount > 0) {
            this.logger.log(`Posts already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
        const defaultUserId = adminUser ? Number(adminUser.id) : null;

        // ========== SEED POST CATEGORIES ==========
        this.logger.log('Seeding post categories...');

        const categoryData = [
            {
                name: 'Tin tức công ty',
                description: 'Các tin tức và sự kiện của công ty',
                image: '/uploads/categories/company-news.jpg',
                status: BasicStatus.active,
                sort_order: 1,
                meta_title: 'Tin tức công ty - Cập nhật mới nhất',
                meta_description: 'Theo dõi các tin tức, sự kiện và hoạt động mới nhất của công ty',
            },
            {
                name: 'Dự án nổi bật',
                description: 'Giới thiệu các dự án tiêu biểu',
                image: '/uploads/categories/featured-projects.jpg',
                status: BasicStatus.active,
                sort_order: 2,
                meta_title: 'Dự án nổi bật - Thành tựu công ty',
                meta_description: 'Khám phá các dự án tiêu biểu và thành tựu của công ty',
            },
            {
                name: 'Kiến thức xây dựng',
                description: 'Chia sẻ kiến thức và kinh nghiệm trong lĩnh vực xây dựng',
                image: '/uploads/categories/construction-knowledge.jpg',
                status: BasicStatus.active,
                sort_order: 3,
                meta_title: 'Kiến thức xây dựng - Chia sẻ kinh nghiệm',
                meta_description: 'Cập nhật kiến thức và kinh nghiệm trong lĩnh vực xây dựng',
            },
            {
                name: 'Xu hướng ngành',
                description: 'Cập nhật xu hướng và công nghệ mới trong ngành xây dựng',
                image: '/uploads/categories/industry-trends.jpg',
                status: BasicStatus.active,
                sort_order: 4,
                meta_title: 'Xu hướng ngành - Công nghệ mới',
                meta_description: 'Theo dõi xu hướng và công nghệ mới trong ngành xây dựng',
            },
            {
                name: 'Tuyển dụng',
                description: 'Thông tin tuyển dụng và cơ hội nghề nghiệp',
                image: '/uploads/categories/recruitment.jpg',
                status: BasicStatus.active,
                sort_order: 5,
                meta_title: 'Tuyển dụng - Cơ hội nghề nghiệp',
                meta_description: 'Tìm hiểu các vị trí tuyển dụng và cơ hội nghề nghiệp tại công ty',
            },
        ];

        const createdCategories = new Map<string, any>();
        for (const category of categoryData) {
            const slug = StringUtil.toSlug(category.name);
            const saved = await this.prisma.postCategory.create({
                data: {
                    ...category,
                    slug,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });
            createdCategories.set(category.name, saved);
            this.logger.log(`Created post category: ${saved.name}`);
        }

        // ========== SEED POST TAGS ==========
        this.logger.log('Seeding post tags...');

        const tagData = [
            { name: 'Xây dựng dân dụng', description: 'Các bài viết về xây dựng dân dụng', status: BasicStatus.active },
            { name: 'Xây dựng công nghiệp', description: 'Các bài viết về xây dựng công nghiệp', status: BasicStatus.active },
            { name: 'Thiết kế kiến trúc', description: 'Các bài viết về thiết kế kiến trúc', status: BasicStatus.active },
            { name: 'Quản lý dự án', description: 'Các bài viết về quản lý dự án xây dựng', status: BasicStatus.active },
            { name: 'An toàn lao động', description: 'Các bài viết về an toàn lao động', status: BasicStatus.active },
            { name: 'Vật liệu xây dựng', description: 'Các bài viết về vật liệu xây dựng', status: BasicStatus.active },
            { name: 'Công nghệ mới', description: 'Các bài viết về công nghệ mới trong xây dựng', status: BasicStatus.active },
            { name: 'Bảo trì công trình', description: 'Các bài viết về bảo trì công trình', status: BasicStatus.active },
            { name: 'Môi trường xanh', description: 'Các bài viết về xây dựng xanh và bền vững', status: BasicStatus.active },
            { name: 'Quy chuẩn xây dựng', description: 'Các bài viết về quy chuẩn và tiêu chuẩn xây dựng', status: BasicStatus.active },
        ];

        const createdTags = new Map<string, any>();
        for (const tag of tagData) {
            const slug = StringUtil.toSlug(tag.name);
            const saved = await this.prisma.postTag.create({
                data: {
                    ...tag,
                    slug,
                    meta_title: `${tag.name} - Bài viết liên quan`,
                    meta_description: tag.description,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });
            createdTags.set(tag.name, saved);
            this.logger.log(`Created post tag: ${saved.name}`);
        }

        // ========== SEED POSTS ==========
        this.logger.log('Seeding posts...');

        const postData = [
            {
                name: 'Khởi công dự án tòa nhà văn phòng 30 tầng tại Quận 1',
                excerpt: 'Công ty chúng tôi vinh dự được chọn làm nhà thầu chính cho dự án tòa nhà văn phòng 30 tầng tại vị trí đắc địa Quận 1, TP.HCM.',
                content: `<h2>Giới thiệu dự án</h2>
<p>Ngày 15/01/2026, công ty chúng tôi đã tổ chức lễ khởi công dự án tòa nhà văn phòng 30 tầng tại Quận 1, TP.HCM. Đây là một trong những dự án trọng điểm của công ty trong năm 2026.</p>

<h2>Thông tin dự án</h2>
<ul>
  <li>Tổng diện tích: 25,000m²</li>
  <li>Số tầng: 30 tầng nổi + 3 tầng hầm</li>
  <li>Thời gian thi công: 24 tháng</li>
  <li>Tổng mức đầu tư: 800 tỷ đồng</li>
</ul>

<h2>Cam kết chất lượng</h2>
<p>Với đội ngũ kỹ sư giàu kinh nghiệm và trang thiết bị hiện đại, chúng tôi cam kết hoàn thành dự án đúng tiến độ và đảm bảo chất lượng cao nhất.</p>`,
                image: '/uploads/posts/office-building-construction.jpg',
                cover_image: '/uploads/posts/office-building-cover.jpg',
                category_name: 'Tin tức công ty',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: true,
                is_pinned: true,
                published_at: new Date('2026-01-15T08:00:00'),
                view_count: 1250,
                tags: ['Xây dựng dân dụng', 'Quản lý dự án'],
                meta_title: 'Khởi công dự án tòa nhà văn phòng 30 tầng tại Quận 1',
                meta_description: 'Công ty chúng tôi vinh dự được chọn làm nhà thầu chính cho dự án tòa nhà văn phòng 30 tầng tại vị trí đắc địa Quận 1, TP.HCM.',
            },
            {
                name: 'Hoàn thành dự án khu đô thị sinh thái Green Valley',
                excerpt: 'Sau 30 tháng thi công, dự án khu đô thị sinh thái Green Valley đã chính thức hoàn thành và bàn giao cho chủ đầu tư.',
                content: `<h2>Thành công vượt mong đợi</h2>
<p>Dự án khu đô thị sinh thái Green Valley đã chính thức hoàn thành sau 30 tháng thi công. Đây là một trong những dự án lớn nhất mà công ty đã thực hiện.</p>

<h2>Điểm nổi bật</h2>
<ul>
  <li>Quy mô: 500 căn hộ cao cấp</li>
  <li>Diện tích: 250,000m²</li>
  <li>Tiện ích: Trường học, bệnh viện, trung tâm thương mại</li>
  <li>Không gian xanh: 40% tổng diện tích</li>
</ul>

<h2>Đánh giá từ chủ đầu tư</h2>
<p>Chủ đầu tư đánh giá cao chất lượng thi công và tiến độ hoàn thành dự án. Đây là minh chứng cho năng lực và uy tín của công ty.</p>`,
                image: '/uploads/posts/green-valley-completed.jpg',
                cover_image: '/uploads/posts/green-valley-cover.jpg',
                category_name: 'Dự án nổi bật',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: true,
                is_pinned: false,
                published_at: new Date('2026-01-10T10:00:00'),
                view_count: 980,
                tags: ['Xây dựng dân dụng', 'Môi trường xanh', 'Quản lý dự án'],
                meta_title: 'Hoàn thành dự án khu đô thị sinh thái Green Valley',
                meta_description: 'Sau 30 tháng thi công, dự án khu đô thị sinh thái Green Valley đã chính thức hoàn thành và bàn giao cho chủ đầu tư.',
            },
            {
                name: '5 xu hướng xây dựng xanh năm 2026',
                excerpt: 'Tìm hiểu về các xu hướng xây dựng xanh và bền vững đang được áp dụng rộng rãi trong ngành xây dựng hiện đại.',
                content: `<h2>Xu hướng 1: Sử dụng vật liệu tái chế</h2>
<p>Việc sử dụng vật liệu tái chế không chỉ giúp giảm chi phí mà còn bảo vệ môi trường.</p>

<h2>Xu hướng 2: Năng lượng tái tạo</h2>
<p>Tích hợp hệ thống năng lượng mặt trời, gió để giảm tiêu thụ năng lượng từ lưới điện.</p>

<h2>Xu hướng 3: Thiết kế thông minh</h2>
<p>Áp dụng công nghệ IoT và AI để tối ưu hóa việc sử dụng năng lượng và tài nguyên.</p>

<h2>Xu hướng 4: Vườn trên mái</h2>
<p>Tạo không gian xanh trên mái nhà giúp cải thiện không khí và giảm nhiệt độ.</p>

<h2>Xu hướng 5: Hệ thống thu gom nước mưa</h2>
<p>Tận dụng nước mưa cho các mục đích sinh hoạt và tưới cây.</p>`,
                image: '/uploads/posts/green-construction-trends.jpg',
                cover_image: '/uploads/posts/green-construction-cover.jpg',
                category_name: 'Xu hướng ngành',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: true,
                is_pinned: false,
                published_at: new Date('2026-01-08T14:00:00'),
                view_count: 1500,
                tags: ['Môi trường xanh', 'Công nghệ mới', 'Vật liệu xây dựng'],
                meta_title: '5 xu hướng xây dựng xanh năm 2026',
                meta_description: 'Tìm hiểu về các xu hướng xây dựng xanh và bền vững đang được áp dụng rộng rãi trong ngành xây dựng hiện đại.',
            },
            {
                name: 'Hướng dẫn quản lý dự án xây dựng hiệu quả',
                excerpt: 'Các bước và phương pháp quản lý dự án xây dựng giúp đảm bảo tiến độ và chất lượng công trình.',
                content: `<h2>Lập kế hoạch chi tiết</h2>
<p>Một kế hoạch chi tiết là nền tảng cho sự thành công của dự án. Cần xác định rõ mục tiêu, nguồn lực và thời gian.</p>

<h2>Quản lý nguồn lực</h2>
<p>Phân bổ nguồn lực hợp lý giúp tối ưu hóa chi phí và thời gian thi công.</p>

<h2>Giám sát tiến độ</h2>
<p>Theo dõi tiến độ thường xuyên để kịp thời phát hiện và xử lý các vấn đề phát sinh.</p>

<h2>Quản lý rủi ro</h2>
<p>Xác định và đánh giá các rủi ro tiềm ẩn, xây dựng kế hoạch ứng phó.</p>

<h2>Giao tiếp hiệu quả</h2>
<p>Đảm bảo thông tin được truyền đạt chính xác giữa các bên liên quan.</p>`,
                image: '/uploads/posts/project-management.jpg',
                cover_image: '/uploads/posts/project-management-cover.jpg',
                category_name: 'Kiến thức xây dựng',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: false,
                is_pinned: false,
                published_at: new Date('2026-01-05T09:00:00'),
                view_count: 750,
                tags: ['Quản lý dự án', 'Thiết kế kiến trúc'],
                meta_title: 'Hướng dẫn quản lý dự án xây dựng hiệu quả',
                meta_description: 'Các bước và phương pháp quản lý dự án xây dựng giúp đảm bảo tiến độ và chất lượng công trình.',
            },
            {
                name: 'Tuyển dụng kỹ sư xây dựng có kinh nghiệm',
                excerpt: 'Công ty đang tìm kiếm các kỹ sư xây dựng có kinh nghiệm để tham gia các dự án lớn trong năm 2026.',
                content: `<h2>Vị trí tuyển dụng</h2>
<p>Chúng tôi đang tìm kiếm các kỹ sư xây dựng có kinh nghiệm từ 3 năm trở lên.</p>

<h2>Yêu cầu công việc</h2>
<ul>
  <li>Tốt nghiệp đại học chuyên ngành Xây dựng</li>
  <li>Có kinh nghiệm quản lý dự án</li>
  <li>Thành thạo AutoCAD, Revit</li>
  <li>Kỹ năng giao tiếp tốt</li>
</ul>

<h2>Quyền lợi</h2>
<ul>
  <li>Lương cạnh tranh: 20-30 triệu/tháng</li>
  <li>Bảo hiểm đầy đủ</li>
  <li>Thưởng theo dự án</li>
  <li>Cơ hội thăng tiến</li>
</ul>

<h2>Cách thức ứng tuyển</h2>
<p>Gửi CV về email: tuyendung@company.com hoặc nộp trực tiếp tại văn phòng công ty.</p>`,
                image: '/uploads/posts/recruitment.jpg',
                cover_image: '/uploads/posts/recruitment-cover.jpg',
                category_name: 'Tuyển dụng',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: false,
                is_pinned: false,
                published_at: new Date('2026-01-03T08:00:00'),
                view_count: 520,
                tags: ['Quản lý dự án', 'Thiết kế kiến trúc'],
                meta_title: 'Tuyển dụng kỹ sư xây dựng có kinh nghiệm',
                meta_description: 'Công ty đang tìm kiếm các kỹ sư xây dựng có kinh nghiệm để tham gia các dự án lớn trong năm 2026.',
            },
            {
                name: 'An toàn lao động trong xây dựng - Những điều cần biết',
                excerpt: 'Hướng dẫn các biện pháp đảm bảo an toàn lao động tại công trường xây dựng.',
                content: `<h2>Tầm quan trọng của an toàn lao động</h2>
<p>An toàn lao động là ưu tiên hàng đầu trong mọi dự án xây dựng.</p>

<h2>Các biện pháp an toàn cơ bản</h2>
<ul>
  <li>Đội mũ bảo hộ khi vào công trường</li>
  <li>Sử dụng dây an toàn khi làm việc trên cao</li>
  <li>Kiểm tra thiết bị trước khi sử dụng</li>
  <li>Tuân thủ quy trình làm việc</li>
</ul>

<h2>Đào tạo an toàn</h2>
<p>Công ty thường xuyên tổ chức các khóa đào tạo về an toàn lao động cho toàn bộ nhân viên.</p>

<h2>Xử lý sự cố</h2>
<p>Có kế hoạch ứng phó sự cố và đội ngũ cấp cứu sẵn sàng tại công trường.</p>`,
                image: '/uploads/posts/safety.jpg',
                cover_image: '/uploads/posts/safety-cover.jpg',
                category_name: 'Kiến thức xây dựng',
                status: PostStatus.published,
                post_type: PostType.text,
                is_featured: false,
                is_pinned: false,
                published_at: new Date('2025-12-28T10:00:00'),
                view_count: 680,
                tags: ['An toàn lao động', 'Quản lý dự án'],
                meta_title: 'An toàn lao động trong xây dựng - Những điều cần biết',
                meta_description: 'Hướng dẫn các biện pháp đảm bảo an toàn lao động tại công trường xây dựng.',
            },
        ];

        for (const post of postData) {
            const slug = StringUtil.toSlug(post.name);
            const category = createdCategories.get(post.category_name);

            if (!category) {
                this.logger.warn(`Category ${post.category_name} not found for post ${post.name}`);
                continue;
            }

            const savedPost = await this.prisma.post.create({
                data: {
                    name: post.name,
                    slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    image: post.image,
                    cover_image: post.cover_image,
                    primary_postcategory_id: category.id,
                    status: post.status,
                    post_type: post.post_type,
                    is_featured: post.is_featured,
                    is_pinned: post.is_pinned,
                    published_at: post.published_at,
                    view_count: BigInt(post.view_count),
                    meta_title: post.meta_title,
                    meta_description: post.meta_description,
                    og_title: post.meta_title,
                    og_description: post.meta_description,
                    og_image: post.image,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });

            // Create post-category relationship
            await this.prisma.postPostcategory.create({
                data: {
                    post_id: savedPost.id,
                    postcategory_id: category.id,
                },
            });

            // Create post-tag relationships
            for (const tagName of post.tags) {
                const tag = createdTags.get(tagName);
                if (tag) {
                    await this.prisma.postPosttag.create({
                        data: {
                            post_id: savedPost.id,
                            posttag_id: tag.id,
                        },
                    });
                }
            }

            this.logger.log(`Created post: ${savedPost.name} (${post.tags.length} tags)`);
        }

        // ========== SEED ADDITIONAL RANDOM POSTS ==========
        this.logger.log('Seeding additional random posts...');

        const randomPostCount = 40;
        const categoryKeys = Array.from(createdCategories.keys());
        const tagKeys = Array.from(createdTags.keys());

        for (let i = 1; i <= randomPostCount; i++) {
            const randomCategoryName = categoryKeys[i % categoryKeys.length];
            const category = createdCategories.get(randomCategoryName);

            if (!category) continue;

            const name = `Bài viết mẫu số ${i}: Xu hướng xây dựng 202${i % 5 + 5}`;
            const slug = StringUtil.toSlug(name);

            // Generate random tags (1-3 tags)
            const randomTags: any[] = [];
            const numTags = (i % 3) + 1;
            for (let j = 0; j < numTags; j++) {
                const tagKey = tagKeys[(i + j) % tagKeys.length];
                const tag = createdTags.get(tagKey);
                if (tag) randomTags.push(tag);
            }

            const savedPost = await this.prisma.post.create({
                data: {
                    name: name,
                    slug: `${slug}-${i}`, // Ensure unique slug
                    excerpt: `Đây là đoạn trích dẫn ngắn gọn cho bài viết mẫu số ${i}. Nội dung xoay quanh các chủ đề ${randomCategoryName}.`,
                    content: `<h2>Nội dung chi tiết bài viết ${i}</h2>
                    <p>Đây là nội dung giả định cho bài viết số ${i}. Bài viết này thuộc danh mục <strong>${randomCategoryName}</strong>.</p>
                    <p>Chúng tôi tập trung vào việc cập nhật các thông tin mới nhất về <em>${randomTags.map(t => t.name).join(', ')}</em>.</p>
                    <h3>Các điểm chính:</h3>
                    <ul>
                        <li>Điểm nổi bật 1 của bài viết ${i}</li>
                        <li>Điểm nổi bật 2 của bài viết ${i}</li>
                        <li>Điểm nổi bật 3 của bài viết ${i}</li>
                    </ul>
                    <p>Kết luận: Bài viết này nhằm mục đích thử nghiệm dữ liệu.</p>`,
                    image: `/uploads/posts/demo-${(i % 5) + 1}.jpg`,
                    cover_image: `/uploads/posts/demo-cover-${(i % 5) + 1}.jpg`,
                    primary_postcategory_id: category.id,
                    status: i % 10 === 0 ? PostStatus.draft : PostStatus.published, // 10% draft
                    post_type: PostType.text,
                    is_featured: i % 7 === 0,
                    is_pinned: false,
                    published_at: new Date(Date.now() - i * 86400000), // Back in time
                    view_count: BigInt(Math.floor(Math.random() * 1000) + 50),
                    meta_title: `Bài viết mẫu ${i} - ${randomCategoryName}`,
                    meta_description: `Mô tả ngắn cho SEO của bài viết mẫu số ${i} thuộc chủ đề ${randomCategoryName}.`,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });

            // Create post-category relationship
            await this.prisma.postPostcategory.create({
                data: {
                    post_id: savedPost.id,
                    postcategory_id: category.id,
                },
            });

            // Create post-tag relationships
            for (const tag of randomTags) {
                await this.prisma.postPosttag.create({
                    data: {
                        post_id: savedPost.id,
                        posttag_id: tag.id,
                    },
                });
            }

            this.logger.log(`Created random post ${i}: ${savedPost.name}`);
        }

        this.logger.log(`✅ Posts module seeding completed`);
        this.logger.log(`   - Categories: ${createdCategories.size}`);
        this.logger.log(`   - Tags: ${createdTags.size}`);
        this.logger.log(`   - Posts: ${postData.length}`);
    }
}
