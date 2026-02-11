import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedContentTemplates {
    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        const templates = [
            {
                code: 'registration_success',
                name: 'Đăng ký thành công',
                content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Đăng Ký Tài Khoản Thành Công</h2>
    <p>Xin chào <strong>{{name}}</strong>,</p>
    <p>Chúc mừng bạn đã đăng ký thành công tài khoản tại hệ thống của chúng tôi.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Tên đăng nhập:</strong> {{username}}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
    </div>
    <p>Bây giờ bạn có thể đăng nhập và trải nghiệm đầy đủ các tính năng.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{loginUrl}}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Đăng Nhập Ngay</a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #7f8c8d;">Đây là email tự động, vui lòng không trả lời email này.</p>
</div>
        `,
                type: TemplateType.email,
                category: TemplateCategory.render,
                status: BasicStatus.active,
                metadata: {
                    subject: 'Chào mừng bạn đến với hệ thống - Đăng ký thành công',
                    variables: ['name', 'username', 'email', 'loginUrl']
                }
            },
            {
                code: 'reset_password_success',
                name: 'Đặt lại mật khẩu thành công',
                content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Thay Đổi Mật Khẩu Thành Công</h2>
    <p>Xin chào <strong>{{name}}</strong>,</p>
    <p>Mật khẩu cho tài khoản của bạn đã được thay đổi thành công vào lúc <strong>{{time}}</strong>.</p>
    <p>Nếu bạn thực hiện thay đổi này, bạn có thể bỏ qua email này.</p>
    <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
        <strong>Cảnh báo:</strong> Nếu bạn KHÔNG thực hiện yêu cầu này, vui lòng liên hệ với quản trị viên hoặc thực hiện khôi phục mật khẩu ngay lập tức để bảo vệ tài khoản của bạn.
    </div>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{loginUrl}}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Truy cập Hệ thống</a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #7f8c8d;">Đây là email tự động, vui lòng không trả lời email này.</p>
</div>
        `,
                type: TemplateType.email,
                category: TemplateCategory.render,
                status: BasicStatus.active,
                metadata: {
                    subject: 'Thông báo thay đổi mật khẩu thành công',
                    variables: ['name', 'time', 'loginUrl']
                }
            },
            {
                code: 'send_otp_register',
                name: 'Gửi mã xác thực đăng ký',
                content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Mã Xác Thực Đăng Ký</h2>
    <p>Xin chào,</p>
    <p>Bạn vừa yêu cầu đăng ký tài khoản tại hệ thống. Để hoàn tất đăng ký, vui lòng sử dụng mã xác thực dưới đây:</p>
    <div style="background-color: #e8f0fe; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0; color: #1a73e8; letter-spacing: 5px;">
        {{otp}}
    </div>
    <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #7f8c8d;">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
</div>
                `,
                type: TemplateType.email,
                category: TemplateCategory.render,
                status: BasicStatus.active,
                metadata: {
                    subject: 'Mã xác thực đăng ký tài khoản',
                    variables: ['otp']
                }
            },
            {
                code: 'send_otp_forgot_password',
                name: 'Gửi mã xác thực quên mật khẩu',
                content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #c0392b;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
    <p>Xin chào,</p>
    <p>Chúng tôi vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
    <p>Mã xác thực của bạn là:</p>
    <div style="background-color: #ffebee; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0; color: #d32f2f; letter-spacing: 5px;">
        {{otp}}
    </div>
    <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #7f8c8d;">Nếu bạn không yêu cầu đặt lại mật khẩu, tài khoản của bạn vẫn an toàn, vui lòng bỏ qua email này.</p>
</div>
                `,
                type: TemplateType.email,
                category: TemplateCategory.render,
                status: BasicStatus.active,
                metadata: {
                    subject: 'Mã OTP xác thực khôi phục mật khẩu',
                    variables: ['otp']
                }
            },
            {
                code: 'digital_order_delivery',
                name: 'Giao hàng sản phẩm số',
                content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Thông Tin Sản Phẩm Digital</h2>
    <p>Xin chào <strong>{{customer_name}}</strong>,</p>
    <p>Cảm ơn bạn đã mua hàng! Đơn hàng <strong>#{{order_number}}</strong> của bạn đã được thanh toán thành công.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2980b9;">Chi tiết sản phẩm:</h3>
        <div style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; font-family: monospace;">
{{products_info}}
        </div>
    </div>

    <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba; font-size: 14px;">
        <strong>Lưu ý:</strong> Vui lòng bảo mật thông tin tài khoản/mã sản phẩm trên. Không chia sẻ cho bất kỳ ai để tránh mất mát.
    </div>

    <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Trân trọng,<br/><strong>Hệ thống Ecommerce</strong></p>
</div>
                `,
                type: TemplateType.email,
                category: TemplateCategory.render,
                status: BasicStatus.active,
                metadata: {
                    subject: '[Order #{{order_number}}] Thông tin sản phẩm digital của bạn',
                    variables: ['customer_name', 'order_number', 'products_info']
                }
            }
        ];

        for (const data of templates) {
            const existing = await this.prisma.contentTemplate.findFirst({
                where: { code: data.code, deleted_at: null },
            });

            if (!existing) {
                await this.prisma.contentTemplate.create({
                    data: {
                        ...data,
                        metadata: data.metadata as any
                    },
                });
                console.log(`✅ Created content template: ${data.code}`);
            } else {
                // Update existing template to ensure it has the latest content
                await this.prisma.contentTemplate.update({
                    where: { id: existing.id },
                    data: {
                        name: data.name,
                        content: data.content,
                        type: data.type,
                        category: data.category,
                        status: data.status,
                        metadata: data.metadata as any,
                    },
                });
                console.log(`🔄 Updated content template: ${data.code}`);
            }
        }
    }
}
