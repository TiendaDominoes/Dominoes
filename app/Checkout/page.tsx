"use client";

import { api } from "@/convex/_generated/api";
import { useCheckoutStore } from "@/utils/checkoutStore";
import { formatearMoneda } from "@/utils/CurrencyFormat";
import { useQuery } from "convex/react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useCart } from "@/providers/cart-provider";
import { CartItem } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";
import CheckoutMP from "@/components/Payments/MercadoPagoCart";
import { toast } from "sonner";
import Transferencia from "@/components/Payments/Transferencia";

interface Contacto {
    nombre: string;
    email: string;
    telefono: number;
    mensaje: string;
}

interface Direccion {
    calle: string;
    referencia: string;
    colonia: string;
    cp: number;
    ciudad: string;
    estado: string;
}

const Checkout = () => {
    const url = useCheckoutStore((s)=> s.productSlug)
    const [mounted, setMounted] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const {state, dispatch} = useCart();

    const isDirectCheckout = !!url

    const total = state.items.reduce(
        (acc: any, item: CartItem) => acc + item.price * item.quantity, 0
    )

    const user = useQuery(api.users.getCurrentUser);

    const product = useQuery(
        api.products.getSingleProduct,
        isDirectCheckout ? {url} : "skip"
    )    

    const [currentStep, setCurrentStep] = useState<number>(1);

    const [customerData, setCustomerData] = useState<Contacto>({
        nombre: '',
        email: '',
        telefono: 0,
        mensaje: '',
    });

    const [shippingData, setShippingData] = useState<Direccion>({
        calle: '',
        referencia: '',
        colonia: '',
        cp: 0,
        ciudad: '',
        estado: '',
    })

    useEffect(() => {
        if (user) {
            setCustomerData(prev => ({
                ...prev,
                nombre: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const handleContactChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setCustomerData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setShippingData((prev) => ({
            ...prev,
            [name]: value
        }));
  };

    const handleFirstSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentStep(2);
    };

    const handleSecondSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidated(false);
        
        if(customerData.nombre.trim() === ''){
            toast.error('Nombre requerido')
            return;
        }
        if(customerData.email.trim() === ''){
            toast.error('Email requerido')
            return;
        }
        if(customerData.telefono === 0){
            toast.error('Teléfono requerido')
            return;
        }
        if(shippingData.calle.trim() === ''){
            toast.error('Calle requerida')
            return;
        }
        if(shippingData.referencia.trim() === ''){
            toast.error('Referencia requerida')
            return;
        }
        if(shippingData.colonia.trim() === ''){
            toast.error('Colonia requerida')
            return;
        }
        if(shippingData.cp === 0){
            toast.error('Código postal requerido')
            return;
        }
        if(shippingData.ciudad.trim() === ''){
            toast.error('Ciudad requerida')
            return;
        }
        if(shippingData.estado.trim() === ''){
            toast.error('Estado requerido')
            return;
        }

        setCurrentStep(3);
        setValidated(true);
    };

    const goToPreviousStep = (numero: number)=>{
        setCurrentStep(numero-1)
    }

    if(isDirectCheckout){
        if (product === undefined) {
            return (
                <button disabled className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-wait">Cargando...</button>
            );
        }

        if(!product) return <>...</>        
    }

    return (
        <section className="flex items-center justify-center py-16 md:mb-0">
            <div className="w-[90%] flex flex-col md:flex-row justify-center max-w-300">
                <div className="px-6 py-4 w-full md:w-1/2 text-center md:text-start">
                    {currentStep === 1 && (
                        <>
                            <h2 className='text-4xl font-semibold mb-4'>Información de Contacto</h2>
                            <form onSubmit={handleFirstSubmit} className='flex flex-col gap-y-2'>
                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="nombre" className='text-lg '>Nombre:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={customerData.nombre}
                                        onChange={handleContactChange}
                                        
                                        placeholder="Nombre"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="email" className='text-lg '>Correo:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={customerData.email}
                                        onChange={handleContactChange}
                                        
                                        placeholder="Email"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="telefono" className='text-lg '>Telefono:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="number"
                                        id="telefono"
                                        name="telefono"
                                        value={customerData.telefono}
                                        onChange={handleContactChange}
                                        
                                        placeholder="Telefono"
                                    />
                                </div>

                                <div className='flex flex-col gap-x-2'>
                                    <div className="w-full items-start flex">
                                        <label htmlFor="mensaje" className='text-lg '>Mensaje:</label>
                                    </div>
                                    <textarea
                                        className='p-2 min-h-16 max-h-32 border border-neutral-300 rounded-md'
                                        id="mensaje"
                                        name="mensaje"
                                        value={customerData.mensaje}
                                        onChange={handleContactChange}
                                        placeholder="Escribe tu mensaje..."
                                    />
                                </div>

                                <div className='flex justify-end mt-2'>
                                    <button 
                                        className={`bg-[#B86112] hover:bg-[#cb7818] font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer`}
                                        type="submit"
                                    >
                                    SIGUIENTE
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {currentStep == 2 && (
                        <>
                            <h2 className='text-4xl font-semibold mb-4'>Información de Dirección</h2>
                            <form onSubmit={handleSecondSubmit} className='flex flex-col gap-y-2'>
                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="calle" className='text-lg '>Calle:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="calle"
                                        name="calle"
                                        value={shippingData.calle}
                                        onChange={handleAddressChange}
                                        placeholder="Calle y número"
                                    />
                                </div>

                                <div className='flex flex-col gap-x-2'>
                                    <div className="w-full items-start flex">
                                        <label htmlFor="referencia" className='text-lg '>Referencia:</label>
                                    </div>
                                    <textarea
                                        className='p-2 min-h-16 max-h-32 border border-neutral-300 rounded-md'
                                        id="referencia"
                                        name="referencia"
                                        value={shippingData.referencia}
                                        onChange={handleAddressChange}
                                        placeholder="Referencia"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="colonia" className='text-lg '>Colonia:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="colonia"
                                        name="colonia"
                                        value={shippingData.colonia}
                                        onChange={handleAddressChange}
                                        
                                        placeholder="Colonia"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="cp" className='text-lg '>CP:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="number"
                                        id="cp"
                                        name="cp"
                                        value={shippingData.cp}
                                        onChange={handleAddressChange}
                                        
                                        placeholder="Código Postal"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="ciudad" className='text-lg '>Ciudad:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="ciudad"
                                        name="ciudad"
                                        value={shippingData.ciudad}
                                        onChange={handleAddressChange}
                                        
                                        placeholder="Ciudad"
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-x-2'>
                                    <label htmlFor="estado" className='text-lg '>Estado:</label>
                                    <input
                                        className='w-full p-2 border border-neutral-300 rounded-md'
                                        type="text"
                                        id="estado"
                                        name="estado"
                                        value={shippingData.estado}
                                        onChange={handleAddressChange}
                                        
                                        placeholder="Estado"
                                    />
                                </div>

                                <div className='flex justify-end mt-2'>
                                    <button type="button"
                                        className={`bg-neutral-800 hover:bg-neutral-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2 cursor-pointer`}
                                        onClick={() => goToPreviousStep(2)}
                                    >
                                        ANTERIOR
                                    </button>
                                    <button 
                                        className={`bg-[#B86112] hover:bg-[#cb7818] font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer`}
                                        type="submit"
                                    >
                                        LISTO
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {currentStep == 3 && (
                        <>
                            <h2 className='text-4xl font-semibold mb-4'>Importante</h2>
                            <p className="text-lg mb-4">Serás redirigido a MercadoPago para finalizar tu compra de forma segura.<br/>
                            En dado caso requeras hacer una transferencia bancaria, selecciona la opción de transferencia.<br/>
                            Asegúrate de revisar toda la información antes de proceder. ¡Gracias por tu compra!</p>    
                            <p className="text-md italic text-gray-600">Nota: Después de completar tu compra, 
                                nos pondremos en contacto contigo a través de WhatsApp para confirmar los detalles de tu pedido y personalización. 
                                ¡Gracias por elegirnos!
                            </p>
                            <div className='flex justify-end mt-2'>
                                <button type="button"
                                    className={`bg-neutral-800 hover:bg-neutral-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2 cursor-pointer`}
                                    onClick={() => goToPreviousStep(3)}
                                >
                                    ANTERIOR
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {isDirectCheckout ? (
                    <div className="px-6 py-4 w-full md:w-1/2 flex flex-col">
                        <h2 className='text-4xl font-semibold mb-4'>Resumen del pedido</h2>
                        <div className="flex flex-col">
                            <div className="flex">
                                <Link href={`/Productos/${product?.url}`} className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                    <img src={product?.images[0]} alt={product?.name} className="w-full h-full object-cover"/>
                                </Link>
                                <div className="ml-3">
                                    <Link href={`/Productos/${product?.url}`} className="font-medium text-lg text-gray-800 truncate pr-2">{product?.name}</Link>
                                    <p className='text-md font-medium text-[#B86112] mb-2'>{formatearMoneda(product!.price)}</p>
                                </div>
                            </div>

                            <div className="border-t mt-4 border-gray-200 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-semibold">Total:</span>
                                    <span className="text-xl font-bold text-[#B86112]">{formatearMoneda(product!.price)}</span>
                                </div>
                                
                                <div className='flex justify-end mt-2'>
                                    {validated ? (
                                        <div className="flex flex-row gap-4">
                                            <Transferencia url={url} customerData={customerData} shippingData={shippingData}/>
                                            <CheckoutMP url={url} customerData={customerData} shippingData={shippingData}/>
                                        </div>
                                    ): (
                                        <button disabled className={`bg-neutral-500 font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-not-allowed`}>
                                            COMPRAR
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {!mounted ? (
                            <div className="px-6 py-4 w-full md:w-1/2 flex flex-col">
                                <div className="h-8 w-1/4 bg-gray-300 rounded mb-4 animate-pulse"></div>
                                <div className="w-full flex flex-col gap-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <div className="w-16 h-16 bg-gray-300 rounded-md animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2 animate-pulse"></div>
                                            <div className="h-4 w-1/4 bg-gray-300 rounded mb-2 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-full bg-gray-300 rounded mb-2 animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-gray-300 rounded mb-2 animate-pulse"></div>
                                    <div className="h-10 w-1/3 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                            </div>

                        ) : (
                            <div className="px-6 py-4 w-full md:w-1/2 flex flex-col">
                                <h2 className='text-4xl font-semibold mb-4'>Resumen del pedido</h2>
                                {state.items.map((item: CartItem) => (
                                    <div key={item._id} className="cartProduct flex flex-col mb-3">
                                        <div className="flex flex-row justify-between">
                                            <div className="flex">
                                                <Link href={`/Productos/${item.url}`} className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                                </Link>
                                                <div className="ml-3">
                                                    <Link href={`/Productos/${item?.url}`} className="font-medium text-lg text-gray-800 truncate pr-2">{item?.name}</Link>
                                                    <p className='text-md font-medium text-[#B86112] mb-2'>{formatearMoneda(item!.price)}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex flex-row gap-1 items-center mb-2">
                                                    <button
                                                        onClick={() => dispatch({ type: "DECREASE_QTY", payload: item._id })}
                                                        className="p-1 hover:bg-gray-100 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="size-3" />
                                                    </button>
                                                
                                                    <span className="w-6 text-center text-md font-medium">{item.quantity}</span>
                                                
                                                    <button
                                                        onClick={() => dispatch({ type: "INCREASE_QTY", payload: item._id })}
                                                        className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                                                    >
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>
                                            
                                                <span className="ml-auto text-md font-semibold text-[#B86112]">
                                                    {formatearMoneda(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="border-t mt-4 border-gray-200 p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xl font-semibold">Total:</span>
                                        <span className="text-xl font-bold text-[#B86112]">{formatearMoneda(total)}</span>
                                    </div>
                                    
                                    <div className='flex justify-end mt-2'>
                                        {validated ? (
                                            <div className="flex flex-row gap-4">
                                                <Transferencia customerData={customerData} shippingData={shippingData}/>
                                                <CheckoutMP customerData={customerData} shippingData={shippingData}/>
                                            </div>
                                        ): (
                                            <button disabled className={`bg-neutral-500 font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-not-allowed`}>
                                                COMPRAR
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
 
export default Checkout;