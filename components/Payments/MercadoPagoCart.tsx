"use client";

import { api } from "@/convex/_generated/api";
import { useCart } from "@/providers/cart-provider";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomerData {
    nombre: string;
    email: string;
    telefono: number;
    mensaje?: string;
}

interface ShippingData {
    calle: string;
    referencia: string;
    colonia: string;
    cp: number;
    ciudad: string;
    estado: string;
}

interface Props {
    url?: string;
    customerData: CustomerData;
    shippingData: ShippingData;
}

const CheckoutMP = ({url, customerData, shippingData}: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [validatedItems, setValidatedItems] = useState<any[]>([]);
    const [validating, setIsValidating] = useState<boolean>(false)

    const { state } = useCart();

    const singleProduct = useQuery(
        api.products.getSingleProduct,
        url ? { url } : 'skip'
    );

    const productsURL = state.items.map((item: any) => item.url)

    const multipleProducts = useQuery(api.products.getMultipleProducts, { 
        url: productsURL 
    });

    const createOrder = useMutation(api.orders.createOrder);

    useEffect(()=>{
        setMounted(true)
    }, []);

    useEffect(() => {
        if(url && singleProduct){
            const validated = [{
                _id: singleProduct._id,
                name: singleProduct.name,
                price: singleProduct.price,
                envio: singleProduct.envio,
                quantity: 1,
                image: singleProduct.images?.[0] || '',
                onStock: singleProduct.onStock,
                url: singleProduct.url
            }];
            
            setValidatedItems(validated);
        }


        if (!url && multipleProducts) {
            const productsMap = new Map(
                multipleProducts.map(p => [p._id, p])
            );
            
            const validated = state.items.map((item: any) => {
                const dbProduct = productsMap.get(item._id);
                
                if (!dbProduct) {
                    toast.error('Producto no encontrado!')
                    return null;
                }
                
                return {
                    ...item,
                    name: dbProduct.name,
                    price: dbProduct.price,
                    envio: dbProduct.envio,
                    image: dbProduct.images?.[0] || '',
                    onStock: dbProduct.onStock
                };
            }).filter((item: any) => item !== null); 

            setValidatedItems(validated);
            setIsValidating(false);
            
            const hasPriceChanges = state.items.some((item: any) => {
                const dbProduct = productsMap.get(item._id);
                return dbProduct && (dbProduct.price !== item.price || dbProduct.envio !== item.envio);
            });
            
            if (hasPriceChanges) {
                toast.warning('Algunos precios han sido actualizados');
            }
            
        }
    }, [url, singleProduct, multipleProducts, state.items]);

    const handlePay = async () =>{
        try{
            setLoading(true);

            if (validatedItems.length === 0) {
                toast.error(url ? 'Producto no disponible' : 'Carrito vacío');
                return;
            }

            const outOfStock = validatedItems.filter(item => !item.onStock);

            if (outOfStock.length > 0) {
                toast.error(`Productos sin stock: ${outOfStock.map(i => i.name).join(', ')}`);
                return;
            }

            const subtotal = validatedItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
            );

            const envio = validatedItems.reduce(
                (sum, item) => sum + (item.envio * item.quantity), 
                0
            );

            const total = subtotal+envio

            const orderId = await createOrder({
                name: customerData.nombre,
                email: customerData.email,
                telefono: Number(customerData.telefono),
                mensaje: customerData.mensaje,
                calle: shippingData.calle,
                referencia: shippingData.referencia,
                colonia: shippingData.colonia,
                cp: Number(shippingData.cp),
                ciudad: shippingData.ciudad,
                estado: shippingData.estado,
                items: validatedItems.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                total,
            });

            const orderData = {
                orderId,
                customerData: customerData,
                shippingData: shippingData,
                items: validatedItems,
                total: total,
            };

            await fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderData: {
                        orderId: orderData.orderId,
                        customerData: orderData.customerData,
                        shippingData: orderData.shippingData,
                        items: orderData.items,
                        total: orderData.total,
                    },
                    type: 'both'
                })
            });

            const payload = {
                items: validatedItems.map((item: any) => ({
                    id: item._id,
                    title: item.name,
                    description: item.name,
                    quantity: item.quantity,
                    unit_price: Number(item.price+item.envio),
                    currency_id: "MX",
                    picture_url: item.image || ''
                })),
                external_reference: `CART-${Date.now()}`,
                payer: {
                    name: customerData.nombre,
                    email: customerData.email,
                    phone: { number: customerData.telefono.toString() },
                    address: {
                        street: shippingData.calle,
                        city: shippingData.ciudad,
                        zip: shippingData.cp.toString()
                    }
                },
                redirect_mode: 'blank'
            }

            const res = await fetch('/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
        
            const data = await res.json();
        
            if(!res.ok){
                toast.error('Hubo un problema con la compra')
                throw new Error('Error al comprar')
            }
        
            if(data.initPoint){
                window.location.href = data.initPoint;
            }else{
                toast.error('Hubo un problema con la compra')
                throw new Error('No se recibio initpoint')
            }
        } catch (error: any){
            toast.error('Hubo un problema con la compra')
        } finally {
            setLoading(false);
        }
    }

    if (!mounted || validating) {
        return (
            <button disabled className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-wait">Cargando...</button>
        );
    }

    if (validatedItems.length === 0) {
        return (
            <button disabled className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">
                {url ? 'Producto no disponible' : 'Carrito vacío'}
            </button>
        );
    }

    return (
        <button onClick={handlePay} disabled={!mounted || loading} className={`bg-[#B86112] hover:bg-[#cb7818] font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 ${mounted ? "cursor-pointer" : "cursor-no-drop"}`}>MERCADO PAGO</button>
    );
}
 
export default CheckoutMP;