import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { orderData, type } = await request.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const itemsList = orderData.items.map((item: any) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const formatearMoneda = (valor: number) => {
            return valor.toFixed(2);
        };

        if (type === 'customer' || type === 'both') {
            const mailOptions = {
                    from: `"Dominoes | Tu mesa de juegos" <${process.env.EMAIL_USER}>`,
                    to: orderData.customerData.email,
                    subject: `📝 Orden creada - Pendiente de pago #${orderData.orderId}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #B86112; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                                .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                                .order-details { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
                                .payment-pending { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                                .payment-pending h3 { margin-top: 0; color: #856404; }
                                .payment-button { background-color: #B86112; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; font-weight: bold; }
                                .payment-button:hover { background-color: #9a4c0f; }
                                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                                th { background-color: #f0f0f0; padding: 8px; text-align: left; }
                                td { padding: 8px; border-bottom: 1px solid #ddd; }
                                .total { font-size: 18px; font-weight: bold; color: #B86112; text-align: right; margin-top: 20px; }
                                .contact-info { background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                                .contact-info p { margin: 5px 0; }
                                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                                .warning { color: #dc3545; font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>¡Orden creada exitosamente!</h1>
                                </div>
                                
                                <div class="content">
                                    <p>Hola <strong>${orderData.customerData.name}</strong>,</p>
                                    <p>Hemos recibido tu solicitud de orden. <strong class="warning">Tu pago está pendiente</strong> para confirmar la compra.</p>
                                    
                                    <!-- SECCIÓN IMPORTANTE: PAGO PENDIENTE -->
                                    <div class="payment-pending">
                                        <h3>⏳ PAGO PENDIENTE</h3>
                                        <p>Tu orden ha sido creada pero aún no has realizado el pago.</p>
                                        <p><strong>Completa el pago para confirmar tu orden:</strong></p>
                                    </div>
                                    
                                    <!-- DETALLES DE LA ORDEN -->
                                    <div class="order-details">
                                        <h3>Detalles de la orden #${orderData.orderId}</h3>
                                        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                                        
                                        <h4>Productos:</h4>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${itemsList}
                                            </tbody>
                                        </table>
                                        
                                        <div class="total">
                                            Total a pagar: $${formatearMoneda(orderData.total)}
                                        </div>
                                        
                                        <h4>Datos de envío:</h4>
                                        <p>
                                            ${orderData.shippingData.calle}<br>
                                            ${orderData.shippingData.colonia}<br>
                                            ${orderData.shippingData.ciudad}, ${orderData.shippingData.estado} CP ${orderData.shippingData.cp}
                                        </p>
                                        
                                        ${orderData.customerData.mensaje ? `
                                            <h4>Notas del pedido:</h4>
                                            <p>${orderData.customerData.mensaje}</p>
                                        ` : ''}
                                    </div>
                                    
                                    <!-- INFORMACIÓN SOBRE PERSONALIZACIÓN -->
                                    <div class="contact-info">
                                        <h3>🔄 Proceso de personalización</h3>
                                        <p>Una vez que confirmes tu pago, nos pondremos en contacto contigo para proceder con la personalización de tu producto.</p>
                                        <p>Si ya realizaste el pago y no has recibido noticias nuestras en 24 horas, por favor contáctanos:</p>
                                        <p><strong>📱 WhatsApp:</strong> <a href="https://wa.me/528132349830" style="color: #B86112;">+52 81-3234-9830</a></p>
                                        <p><strong>📧 Email:</strong> <a href="mailto:ventas.dominoes@gmail.com" style="color: #B86112;">ventas.dominoes@gmail.com</a></p>
                                    </div>
                                    
                                    <!-- NOTA SOBRE DUPLICIDAD -->
                                    <p style="font-size: 13px; color: #666; font-style: italic; margin-top: 20px;">
                                        <strong>¿Ya realizaste el pago?</strong> Si ya realizaste el pago y recibiste este correo por error, 
                                        por favor contáctanos inmediatamente para verificar el estado de tu orden.
                                    </p>
                                    
                                    <p>¡Gracias por preferirnos!</p>
                                </div>
                                
                                <div class="footer">
                                    <p>© ${new Date().getFullYear()} Dominoes | Tu mesa de juegos. Todos los derechos reservados.</p>
                                    <p>Este es un correo automático, por favor no responder directamente.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                };

            await transporter.sendMail(mailOptions);
        }

        if (type === 'admin' || type === 'both') {
            const mailOptions = {
                    from: `"Dominoes | Ventas" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `🆕 NUEVA ORDEN PENDIENTE DE PAGO - #${orderData.orderId}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; }
                                .container { max-width: 600px; margin: 0 auto; }
                                .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
                                .content { padding: 20px; }
                                .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
                                table { width: 100%; border-collapse: collapse; }
                                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>NUEVA ORDEN - PAGO PENDIENTE</h1>
                                </div>
                                <div class="content">
                                    <div class="warning">
                                        <strong>ESTADO:</strong> Pendiente de pago - Confirmar con el cliente antes de proceder.
                                    </div>
                                    
                                    <h3>Datos del cliente:</h3>
                                    <p>
                                        <strong>Nombre:</strong> ${orderData.customerData.name}<br>
                                        <strong>Email:</strong> ${orderData.customerData.email}<br>
                                        <strong>Teléfono:</strong> ${orderData.customerData.telefono}<br>
                                        ${orderData.customerData.mensaje ? `<strong>Notas:</strong> ${orderData.customerData.mensaje}` : ''}
                                    </p>
                                    
                                    <h3>Dirección de envío:</h3>
                                    <p>
                                        ${orderData.shippingData.calle}<br>
                                        ${orderData.shippingData.colonia}<br>
                                        ${orderData.shippingData.ciudad}, ${orderData.shippingData.estado} CP ${orderData.shippingData.cp}
                                    </p>
                                    
                                    <h3>Productos:</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsList}
                                        </tbody>
                                    </table>
                                    
                                    <h3>Total: $${formatearMoneda(orderData.total)}</h3>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
            }   ;

            await transporter.sendMail(mailOptions);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error enviando email:', error);
        return NextResponse.json(
            { error: 'Error al enviar email' },
            { status: 500 }
        );
    }
}