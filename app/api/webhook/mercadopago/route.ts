// app/api/webhook/mercadopago/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { sendCustomerEmail, sendAdminEmail } from '@/lib/emailService';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            
            const paymentDetails = await fetch(
                `https://api.mercadopago.com/v1/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
                    }
                }
            ).then(res => res.json());

            if (paymentDetails.status === 'approved') {
                const orderId = paymentDetails.external_reference;
                
                const order = await convex.query(api.orders.getOrder, { orderId });
                
                if (order) {
                    await convex.mutation(api.orders.updateOrderStatus, {
                        orderId,
                        status: 'Pagado',
                        paymentId: paymentId.toString(),
                    });

                    const orderData = {
                        orderId,
                        customerData: order.customerData,
                        shippingData: order.shippingAddress,
                        items: order.items,
                        total: order.total,
                        paymentId: paymentId.toString()
                    };

                    await Promise.all([
                        sendCustomerEmail(orderData),
                        sendAdminEmail(orderData)
                    ]);
                }
            }
        }

        return NextResponse.json({ received: true });
        
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}