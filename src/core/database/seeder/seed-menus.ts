import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { MenuType } from '@/shared/enums/types/menu-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedMenus {
  private readonly logger = new Logger(SeedMenus.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding menus...');

    // Xóa tất cả menu cũ để tạo lại từ đầu
    this.logger.log('Clearing existing menus...');
    await this.prisma.menuPermission.deleteMany({});
    await this.prisma.menu.deleteMany({});
    this.logger.log('Cleared all existing menus');

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Get permissions
    const permissions = await this.prisma.permission.findMany();
    const permMap = new Map<string, any>();
    permissions.forEach(perm => permMap.set(perm.code, perm));

    // Seed menus - Mỗi menu chỉ có 1 bản ghi duy nhất, không phân biệt context
    // Menu ROUTE: có 1 permission (dùng required_permission_id)
    // Menu GROUP: có thể có nhiều permissions (dùng menu_permissions table)
    const menuData = [
      // ========== DASHBOARD ==========
      {
        code: 'dashboard',
        name: 'Dashboard',
        path: '/admin/dashboard',
        api_path: 'api/admin/dashboard',
        icon: '📊',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 1,
        is_public: false,
        show_in_menu: true,
        permission_code: 'dashboard.manage',
      },

      // ========== QUẢN LÝ TÀI KHOẢN (GROUP - check nhiều quyền) ==========
      {
        code: 'account-management',
        name: 'Quản lý tài khoản',
        path: '/admin/core/iam/users',
        api_path: 'api/admin/users',
        icon: '👥',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage', // Permission chính
        permission_codes: ['user.manage', 'role.manage', 'permission.manage'], // Nhiều quyền cho group
      },
      {
        code: 'users',
        name: 'Tài khoản',
        path: '/admin/core/iam/users',
        api_path: 'api/admin/users',
        icon: '👤',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage',
      },
      {
        code: 'roles',
        name: 'Vai trò',
        path: '/admin/core/iam/roles',
        api_path: 'api/admin/roles',
        icon: '👔',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'role.manage',
      },
      {
        code: 'permissions',
        name: 'Quyền',
        path: '/admin/core/iam/permissions',
        api_path: 'api/admin/permissions',
        icon: '🔑',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'permission.manage',
      },

      // ========== NHÓM & CONTEXT (GROUP) ==========
      {
        code: 'group-management',
        name: 'Nhóm & Context',
        path: '/admin/core/group',
        api_path: 'api/admin/groups',
        icon: '👪',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
        permission_codes: ['group.manage'], // Nhiều quyền cho group
      },
      {
        code: 'groups',
        name: 'Nhóm',
        path: '/admin/core/group',
        api_path: 'api/admin/groups',
        icon: '👪',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'group-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
      },
      {
        code: 'contexts',
        name: 'Context',
        path: '/admin/core/contexts',
        api_path: 'api/admin/contexts',
        icon: '🌐',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'group-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
      },

      // ========== CẤU HÌNH HỆ THỐNG (GROUP) ==========
      {
        code: 'config-management',
        name: 'Cấu hình hệ thống',
        path: '/admin/core/system-config/general',
        api_path: 'api/admin/system-configs/general',
        icon: '⚙️',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
        permission_codes: ['config.manage', 'content_template.manage'], // Có thể thêm permissions khác nếu cần
      },
      {
        code: 'config-general',
        name: 'Cấu hình chung',
        path: '/admin/core/system-config/general',
        api_path: 'api/admin/system-configs/general',
        icon: '📋',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'config-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
      },
      {
        code: 'config-email',
        name: 'Cấu hình Email',
        path: '/admin/core/system-config/email',
        api_path: 'api/admin/system-configs/email',
        icon: '📧',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'config-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
      },
      {
        code: 'content-templates',
        name: 'Mẫu tài liệu',
        path: '/admin/core/content-templates',
        api_path: 'api/admin/content-templates',
        icon: '📄',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'config-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'content_template.manage',
      },

      // ========== MENU ==========
      {
        code: 'menus',
        name: 'Menu',
        path: '/admin/core/menus',
        api_path: 'api/admin/menus',
        icon: '📑',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 31,
        is_public: false,
        show_in_menu: true,
        permission_code: 'menu.manage',
      },

      // ========== TÍNH NĂNG MỞ RỘNG ==========
      {
        code: 'extra-management',
        name: 'Tính năng mở rộng',
        path: '/admin/extra/notifications',
        api_path: 'api/admin/extra',
        icon: '👪',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'notification.manage',
        permission_codes: ['notification.manage', 'banner.manage', 'banner_location.manage'],
      },
      // ========== THÔNG BÁO ==========
      {
        code: 'notifications',
        name: 'Thông báo',
        path: '/admin/extra/notifications',
        api_path: 'api/admin/notifications',
        icon: '🔔',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'extra-management',
        sort_order: 120,
        is_public: false,
        show_in_menu: true,
        permission_code: 'notification.manage',
      },
      // ========== BANNER (GROUP - check nhiều quyền) ==========
      {
        code: 'banner-management',
        name: 'Banner',
        path: '/admin/marketing/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_code: 'extra-management',
        sort_order: 100,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage', // Permission chính
        permission_codes: ['banner.manage', 'banner_location.manage'], // Nhiều quyền cho group
      },
      {
        code: 'banners',
        name: 'Banner',
        path: '/admin/marketing/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'banner-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage',
      },
      {
        code: 'banner-locations',
        name: 'Vị trí Banner',
        path: '/admin/marketing/locations',
        api_path: 'api/admin/banner-locations',
        icon: '📍',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'banner-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner_location.manage',
      },

      // ========== LIÊN HỆ ==========
      {
        code: 'contacts',
        name: 'Liên hệ',
        path: '/admin/introduction/contacts',
        api_path: 'api/admin/contacts',
        icon: '📞',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 110,
        is_public: false,
        show_in_menu: true,
        permission_code: 'contact.manage',
      },

      // ========== BÀI VIẾT (GROUP - check nhiều quyền) ==========
      {
        code: 'post-management',
        name: 'Bài viết',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📝',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage', // Permission chính
        permission_codes: ['post.manage', 'post_category.manage', 'post_tag.manage'], // Nhiều quyền cho group
      },
      {
        code: 'posts',
        name: 'Bài viết',
        path: '/admin/posts/list',
        api_path: 'api/admin/posts',
        icon: '📄',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'post-categories',
        name: 'Danh mục bài viết',
        path: '/admin/posts/categories',
        api_path: 'api/admin/post-categories',
        icon: '📂',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post_category.manage',
      },
      {
        code: 'post-tags',
        name: 'Thẻ bài viết',
        path: '/admin/posts/tags',
        api_path: 'api/admin/post-tags',
        icon: '🏷️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post_tag.manage',
      },
      {
        code: 'post-comments',
        name: 'Bình luận bài viết',
        path: '/admin/posts/comments',
        api_path: 'api/admin/post-comments',
        icon: '💬',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'post-stats',
        name: 'Thống kê bài viết',
        path: '/admin/posts/statistics',
        api_path: 'api/admin/posts/statistics',
        icon: '📈',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },

      // ========== GIỚI THIỆU (GROUP - check nhiều quyền) ==========
      {
        code: 'introduction',
        name: 'Giới thiệu',
        path: '/admin/introduction/projects',
        api_path: 'api/admin/projects',
        icon: '🏢',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 60,
        is_public: false,
        show_in_menu: true,
        permission_code: 'project.manage', // Permission chính
        permission_codes: [
          'project.manage',
          'about.manage',
          'staff.manage',
          'testimonial.manage',
          'partner.manage',
          'gallery.manage',
          'certificate.manage',
          'faq.manage',
        ], // Nhiều quyền cho group
      },
      {
        code: 'projects',
        name: 'Dự án',
        path: '/admin/introduction/projects',
        api_path: 'api/admin/projects',
        icon: '🏗️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'project.manage',
      },
      {
        code: 'about-sections',
        name: 'Giới thiệu',
        path: '/admin/introduction/abouts',
        api_path: 'api/admin/about-sections',
        icon: '📖',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'about.manage',
      },
      {
        code: 'staff',
        name: 'Nhân viên',
        path: '/admin/introduction/staff',
        api_path: 'api/admin/staff',
        icon: '👨‍💼',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'staff.manage',
      },
      {
        code: 'testimonials',
        name: 'Lời chứng thực',
        path: '/admin/introduction/testimonials',
        api_path: 'api/admin/testimonials',
        icon: '💬',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'testimonial.manage',
      },
      {
        code: 'partners',
        name: 'Đối tác',
        path: '/admin/introduction/partners',
        api_path: 'api/admin/partners',
        icon: '🤝',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'partner.manage',
      },
      {
        code: 'gallery',
        name: 'Thư viện ảnh',
        path: '/admin/introduction/gallery',
        api_path: 'api/admin/gallery',
        icon: '🖼️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 60,
        is_public: false,
        show_in_menu: true,
        permission_code: 'gallery.manage',
      },
      {
        code: 'certificates',
        name: 'Chứng chỉ',
        path: '/admin/introduction/certificates',
        api_path: 'api/admin/certificates',
        icon: '🏆',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 70,
        is_public: false,
        show_in_menu: true,
        permission_code: 'certificate.manage',
      },
      {
        code: 'faqs',
        name: 'Câu hỏi thường gặp',
        path: '/admin/introduction/faqs',
        api_path: 'api/admin/faqs',
        icon: '❓',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'introduction',
        sort_order: 80,
        is_public: false,
        show_in_menu: true,
        permission_code: 'faq.manage',
      },

      // ========== QUẢN LÝ SẢN PHẨM (GROUP) ==========
      {
        code: 'product-management',
        name: 'Quản lý sản phẩm',
        path: '/admin/ecommerce/products',
        api_path: 'api/admin/products/list',
        icon: '📦',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 70,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
        permission_codes: [
          'product.manage',
          'product_category.manage',
          'product_attribute.manage',
          'product_variant.manage',
          'product_attribute_value.manage',
        ],
      },
      {
        code: 'ecommerce-products',
        name: 'Sản phẩm',
        path: '/admin/ecommerce/products/list',
        api_path: 'api/admin/products',
        icon: '📦',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'product-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'ecommerce-product-variants',
        name: 'Biến thể sản phẩm',
        path: '/admin/ecommerce/products/variants',
        api_path: 'api/admin/product-variants',
        icon: '🔀',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'product-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product_variant.manage',
      },
      {
        code: 'ecommerce-product-attributes',
        name: 'Thuộc tính sản phẩm',
        path: '/admin/ecommerce/products/attributes',
        api_path: 'api/admin/product-attributes',
        icon: '🧩',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'product-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product_attribute.manage',
      },
      {
        code: 'ecommerce-product-attribute-values',
        name: 'Giá trị thuộc tính',
        path: '/admin/ecommerce/products/attribute-values',
        api_path: 'api/admin/product-attribute-values',
        icon: '🔹',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'product-management',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product_attribute_value.manage',
      },
      {
        code: 'ecommerce-product-categories',
        name: 'Danh mục sản phẩm',
        path: '/admin/ecommerce/products/categories',
        api_path: 'api/admin/product-categories',
        icon: '📚',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'product-management',
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product_category.manage',
      },

      // ========== QUẢN LÝ KHO (GROUP) ==========
      {
        code: 'warehouse-management',
        name: 'Quản lý kho',
        path: '/admin/ecommerce/warehouses',
        api_path: 'api/admin/warehouses',
        icon: '🏬',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 80,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
        permission_codes: [
          'warehouse.manage',
          'warehouse_transfer.manage',
          'warehouse_import.manage',
          'warehouse_export.manage',
        ],
      },
      {
        code: 'ecommerce-warehouses',
        name: 'Kho hàng',
        path: '/admin/ecommerce/warehouses/list',
        api_path: 'api/admin/warehouses',
        icon: '🏬',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'warehouse-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
      },
      {
        code: 'ecommerce-warehouse-transfers',
        name: 'Chuyển kho',
        path: '/admin/ecommerce/warehouses/transfers',
        api_path: 'api/admin/warehouses/transfers',
        icon: '🚛',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'warehouse-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse_transfer.manage',
      },
      {
        code: 'ecommerce-warehouse-imports',
        name: 'Nhập kho',
        path: '/admin/ecommerce/warehouses/imports',
        api_path: 'api/admin/warehouses/imports',
        icon: '📥',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'warehouse-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse_import.manage',
      },
      {
        code: 'ecommerce-warehouse-exports',
        name: 'Xuất kho',
        path: '/admin/ecommerce/warehouses/exports',
        api_path: 'api/admin/warehouses/exports',
        icon: '📤',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'warehouse-management',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse_export.manage',
      },

      // ========== COMIC MODULE ==========
      {
        code: 'comic-management',
        name: 'Quản lý Truyện',
        path: '/admin/comics',
        api_path: 'api/admin/comics/comics',
        icon: '📚',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 85,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
        permission_codes: ['comic.manage'],
      },
      {
        code: 'comic-list',
        name: 'Truyện tranh',
        path: '/admin/comics/list',
        api_path: 'api/admin/comics',
        icon: '📕',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-chapters',
        name: 'Chương truyện',
        path: '/admin/comics/chapters',
        api_path: 'api/admin/chapters',
        icon: '📑',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-categories',
        name: 'Danh mục truyện',
        path: '/admin/comics/categories',
        api_path: 'api/admin/comic-categories',
        icon: '🏷️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-comments',
        name: 'Bình luận truyện',
        path: '/admin/comics/comments',
        api_path: 'api/admin/comic-comments',
        icon: '💬',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 35,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-reviews',
        name: 'Đánh giá truyện',
        path: '/admin/comics/reviews',
        api_path: 'api/admin/comic-reviews',
        icon: '⭐',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 38,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-stats',
        name: 'Thống kê báo cáo',
        path: '/admin/comics/statistics',
        api_path: 'api/admin/comic-stats',
        icon: '📈',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'comic-management',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },

      // ========== ECOMMERCE (GROUP) ==========
      {
        code: 'ecommerce',
        name: 'Ecommerce',
        path: '/admin/ecommerce',
        api_path: 'api/admin/ecommerce',
        icon: '🛒',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 90,
        is_public: false,
        show_in_menu: true,
        permission_code: 'ecommerce.manage',
        permission_codes: [
          'order.manage',
          'shipping_method.manage',
          'coupon.manage',
          'product_review.manage',
        ],
      },
      // Đơn hàng & vận chuyển
      {
        code: 'ecommerce-orders',
        name: 'Đơn hàng',
        path: '/admin/ecommerce/orders',
        api_path: 'api/admin/orders',
        icon: '📜',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'ecommerce',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'order.manage',
      },
      {
        code: 'ecommerce-shipping-methods',
        name: 'Phương thức vận chuyển',
        path: '/admin/ecommerce/shipping-methods',
        api_path: 'api/admin/shipping-methods',
        icon: '🚚',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'ecommerce',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'shipping_method.manage',
      },
      {
        code: 'ecommerce-coupons',
        name: 'Mã khuyến mãi',
        path: '/admin/ecommerce/coupons',
        api_path: 'api/admin/coupons',
        icon: '🎟️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'ecommerce',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'coupon.manage',
      },

      // ========== PHƯƠNG THỨC THANH TOÁN (STANDALONE) ==========
      {
        code: 'payment-methods',
        name: 'Phương thức thanh toán',
        path: '/admin/payment-methods',
        api_path: 'api/admin/payment-methods',
        icon: '💳',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 100,
        is_public: false,
        show_in_menu: true,
        permission_code: 'payment_method.manage',
      },

      // ========== PUBLIC COMIC MENUS ==========
      {
        code: 'public-home',
        name: 'Trang chủ',
        path: '/',
        api_path: null,
        icon: '🏠',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 190,
        is_public: true,
        show_in_menu: true,
        group: 'client',
      },
      {
        code: 'public-comics-new-updated',
        name: 'Mới cập nhật',
        path: '/comics?sort=last_chapter_updated_at:desc',
        api_path: null,
        icon: '🆕',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 210,
        is_public: true,
        show_in_menu: true,
        group: 'client',
      },
      {
        code: 'public-comics-hot',
        name: 'Truyện HOT',
        path: '/comics?sort=view_count:desc',
        api_path: null,
        icon: '🔥',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 220,
        is_public: true,
        show_in_menu: true,
        group: 'client',
      },
      {
        code: 'public-comics-completed',
        name: 'Hoàn thành',
        path: '/comics?status=completed',
        api_path: null,
        icon: '✅',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 230,
        is_public: true,
        show_in_menu: true,
        group: 'client',
      },
      {
        code: 'public-posts',
        name: 'Tin tức',
        path: '/posts',
        api_path: null,
        icon: '📰',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 240,
        is_public: true,
        show_in_menu: true,
        group: 'client',
      },
    ];

    this.logger.log(`Will create ${menuData.length} menus (mỗi menu chỉ có 1 permission)`);

    const createdMenus = new Map<string, any>();

    // Sort menus: parents first
    const sortedMenus = this.sortMenusByParent(menuData);

    for (const menuItem of sortedMenus) {

      let parent: any | null = null;
      if (menuItem.parent_code) {
        parent = createdMenus.get(menuItem.parent_code) || null;
        if (!parent) {
          // Tìm parent trong DB nếu chưa có trong createdMenus
          parent = await this.prisma.menu.findFirst({ where: { code: menuItem.parent_code } });
          if (parent) {
            createdMenus.set(parent.code, parent);
          } else {
            this.logger.warn(`Parent menu not found for ${menuItem.code}, skipping parent relation`);
          }
        }
      }

      // Menu có 1 permission chính (required_permission)
      let requiredPermission: any | null = null;
      if (menuItem.permission_code) {
        requiredPermission = permMap.get(menuItem.permission_code) || null;
        if (!requiredPermission) {
          this.logger.warn(`Permission ${menuItem.permission_code} not found for menu ${menuItem.code}`);
        }
      }

      const saved = await this.prisma.menu.create({
        data: {
          code: menuItem.code,
          name: menuItem.name,
          path: menuItem.path,
          api_path: menuItem.api_path,
          icon: menuItem.icon,
          type: menuItem.type,
          status: menuItem.status,
          parent_id: parent ? parent.id : null,
          sort_order: menuItem.sort_order,
          is_public: menuItem.is_public,
          show_in_menu: menuItem.show_in_menu,
          group: menuItem.group || 'admin',
          required_permission_id: requiredPermission ? requiredPermission.id : null,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });

      // Nếu là menu GROUP và có nhiều permissions, tạo MenuPermission records
      if (saved.type === MenuType.group && menuItem.permission_codes && Array.isArray(menuItem.permission_codes)) {
        for (const permCode of menuItem.permission_codes) {
          const perm = permMap.get(permCode);
          if (perm) {
            await this.prisma.menuPermission.create({
              data: {
                menu_id: saved.id,
                permission_id: perm.id,
              },
            });
            this.logger.log(`  → Added permission ${permCode} to menu group ${saved.code}`);
          } else {
            this.logger.warn(`  → Permission ${permCode} not found for menu group ${saved.code}`);
          }
        }
      }

      createdMenus.set(saved.code, saved);
      this.logger.log(`Created menu: ${saved.code}${parent ? ` (parent: ${parent.code})` : ''}${requiredPermission ? ` (permission: ${requiredPermission.code})` : ''}`);
    }

    this.logger.log(`✅ Menus seeding completed - Total: ${createdMenus.size}`);
    this.logger.log(`   - Menu ROUTE: có 1 permission (required_permission)`);
    this.logger.log(`   - Menu GROUP: có thể có nhiều permissions (menu_permissions)`);
  }

  private sortMenusByParent(menus: Array<any>): Array<any> {
    const result: Array<any> = [];
    const processed = new Set<string>();

    // First pass: add all menus without parents
    for (const menu of menus) {
      if (!menu.parent_code && (menu.parent_id === null || menu.parent_id === undefined)) {
        result.push(menu);
        processed.add(menu.code);
      }
    }

    // Second pass: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const menu of menus) {
        if (!processed.has(menu.code)) {
          if (!menu.parent_code || processed.has(menu.parent_code)) {
            result.push(menu);
            processed.add(menu.code);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing menus...');
    await this.prisma.menuPermission.deleteMany({});
    await this.prisma.menu.deleteMany({});
    this.logger.log('Menus cleared');
  }
}
