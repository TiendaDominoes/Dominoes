"use client";

import { CartItem } from "@/context/CartContext";
import { useCart } from "@/providers/cart-provider";
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatearMoneda } from "@/utils/CurrencyFormat";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/utils/checkoutStore";

const Cart = () => {
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);
  
    const {state, dispatch} = useCart();
    const { clear } = useCheckoutStore();

    const total = state.items.reduce(
        (acc: any, item: CartItem) => acc + item.price * item.quantity, 0
    )
  
    const totalItems = state.items.reduce(
        (sum: number, item: CartItem) => sum + item.quantity, 0
    );

    useEffect(()=>{
        setIsMounted(true)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (cartRef.current && !cartRef.current?.contains(event.target as Node)) {
            setIsOpen(false);
        }};
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isMounted) return null

    return (
        <div className="relative inline-block" ref={cartRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full group"
            >
                <ShoppingCart className="size-6 text-gray-700 group-hover:text-[#B86112]"/>
                {totalItems > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[22px] h-5 px-1.5 
                        rounded-full bg-[#B86112] text-white text-xs font-bold flex items-center justify-center shadow-md"
                    >
                        {totalItems > 99 ? '99+' : totalItems}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-1/2 -translate-x-[70%] md:left-auto md:right-0 md:translate-x-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Carrito de Compras ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="size-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                        {state.items.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingCart className="size-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Tu carrito está vacío</p>
                            </div>
                        ) : (
                            state.items.map((item: CartItem) => (
                                <div key={item._id} className="flex gap-3 group/item">
                                    <Link href={`/Productos/${item.url}`} className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <Link href={`/Productos/${item.url}`} className="font-medium text-gray-800 truncate pr-2">{item.name}</Link>
                                            <button
                                                onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item._id })}
                                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-50 rounded-full cursor-pointer"
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </button>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-2">{formatearMoneda(item.price)}</p>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => dispatch({ type: "DECREASE_QTY", payload: item._id })}
                                                className="p-1 hover:bg-gray-100 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                        
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        
                                            <button
                                                onClick={() => dispatch({ type: "INCREASE_QTY", payload: item._id })}
                                                className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        
                                            <span className="ml-auto text-sm font-semibold text-[#B86112]">
                                                {formatearMoneda(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {state.items.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-gray-700">Subtotal:</span>
                                <span className="text-xl font-bold text-[#B86112]">{formatearMoneda(total)}</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        dispatch({ type: "CLEAR_CART"});
                                        toast.success('Carrito vaciado')
                                    }}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-[#222] cursor-pointer"
                                >
                                Vaciar
                                </button>
                                <button
                                    onClick={() => {
                                        clear();
                                        router.push('/Checkout');
                                    }}
                                    className="flex-1 px-4 py-2 bg-[#B86112] text-white rounded-lg font-medium hover:bg-[#9E4F0F] cursor-pointer"
                                >
                                Pagar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart;