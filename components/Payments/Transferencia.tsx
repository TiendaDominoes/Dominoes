"use client";

import { api } from "@/convex/_generated/api";
import { useCart } from "@/providers/cart-provider";
import { useMutation, useQuery } from "convex/react";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard } from "../shared-assets/credit-card/credit-card";

interface CustomerData {
    nombre: string;
    email: string;
    telefono: number;
    mensaje?: string;
}

interface ShippingData {
    calle: string;
    colonia: string;
    cp: number;
    ciudad: string;
    estado: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

interface Props {
    url?: string;
    customerData: CustomerData;
    shippingData: ShippingData;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"onClick={onClose}>
            <div className="bg-white rounded-lg w-96" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Datos de la transferencia</h2>
                    <button onClick={onClose} className="text-xl">×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Transferencia = ({url, customerData, shippingData}: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
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
                    image: dbProduct.images?.[0] || '',
                    onStock: dbProduct.onStock
                };
            }).filter((item: any) => item !== null); 

            setValidatedItems(validated);
            setIsValidating(false);
            
            const hasPriceChanges = state.items.some((item: any) => {
                const dbProduct = productsMap.get(item._id);
                return dbProduct && dbProduct.price !== item.price;
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

            const total = validatedItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
            );
            
            const orderId = await createOrder({
                name: customerData.nombre,
                email: customerData.email,
                telefono: Number(customerData.telefono),
                mensaje: customerData.mensaje,
                calle: shippingData.calle,
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


            const order = await useQuery(api.orders.getOrder, { orderId });

            if (order) {
                const orderData = {
                    orderId,
                    customerData: order.customerData,
                    shippingData: order.shippingAddress,
                    items: order.items,
                    total: order.total,
                };
                    
                await fetch('/api/send-order-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderData: {
                            orderId,
                            customerData,
                            shippingData,
                            items: validatedItems,
                            total,
                        },
                        type: 'both'
                    })
                });
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
        <div>
            <button onClick={()=> setIsOpen(true)} disabled={!mounted || loading} className={`bg-gray-900 hover:bg-gray-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 ${mounted ? "cursor-pointer" : "cursor-no-drop"}`}>TRANSFERENCIA</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="p-4 flex justify-center">
                    <CreditCard type="gray-dark"/>
                </div>
                <div className="p-4 border-t flex justify-end items-center">
                    <button onClick={handlePay} className="bg-[#B86112] hover:bg-[#cb7818] font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300">Listo</button>
                </div>
            </Modal>
        </div>
    );
}
 
export default Transferencia;