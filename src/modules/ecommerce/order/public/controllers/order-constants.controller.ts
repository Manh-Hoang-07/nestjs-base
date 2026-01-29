import { Controller, Get } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/order-constants')
export class OrderConstantsController {
    @Permission('public')
    @Get()
    async getConstants() {
        return {
            orderStatuses: [
                { value: 'pending', label: 'Chờ xác nhận', color: '#FFA500' },
                { value: 'confirmed', label: 'Đã xác nhận', color: '#4169E1' },
                { value: 'processing', label: 'Đang xử lý', color: '#9370DB' },
                { value: 'shipped', label: 'Đã giao vận chuyển', color: '#20B2AA' },
                { value: 'delivered', label: 'Đã giao hàng', color: '#32CD32' },
                { value: 'cancelled', label: 'Đã hủy', color: '#DC143C' },
            ],
            paymentStatuses: [
                { value: 'pending', label: 'Chờ thanh toán', color: '#FFA500' },
                { value: 'paid', label: 'Đã thanh toán', color: '#32CD32' },
                { value: 'failed', label: 'Thanh toán thất bại', color: '#DC143C' },
                { value: 'refunded', label: 'Đã hoàn tiền', color: '#4169E1' },
                { value: 'partially_refunded', label: 'Hoàn tiền một phần', color: '#9370DB' },
            ],
            shippingStatuses: [
                { value: 'pending', label: 'Chờ chuẩn bị', color: '#FFA500' },
                { value: 'preparing', label: 'Đang chuẩn bị', color: '#4169E1' },
                { value: 'shipped', label: 'Đã giao vận chuyển', color: '#20B2AA' },
                { value: 'delivered', label: 'Đã giao hàng', color: '#32CD32' },
                { value: 'returned', label: 'Đã trả hàng', color: '#DC143C' },
            ],
            orderTypes: [
                { value: 'physical', label: 'Sản phẩm vật lý' },
                { value: 'digital', label: 'Sản phẩm số' },
                { value: 'mixed', label: 'Kết hợp' },
            ],
        };
    }
}
