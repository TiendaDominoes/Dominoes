"use client";

import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import Link from "next/link";
import { useCart } from "@/providers/cart-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CarouselComponent = () => {
    const { dispatch } = useCart();
    const [selectedUrl, setSelectedURL] = useState<string | null>(null);
    const shouldAddRef = useRef(false);

    const product = useQuery(
        api.products.getSingleProduct, 
        selectedUrl ? {url: selectedUrl} : 'skip'
    )

    const handleGetProduct = (url: string)=> {
        shouldAddRef.current = true
        setSelectedURL(url)
    };

    useEffect(()=> {
        if(product && shouldAddRef.current){
            dispatch({
                type: "ADD_ITEM",
                payload: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    envio: product.envio,
                    image: product.images[0],
                    url: product.url,
                    quantity: 1
                }
            });

            toast.success('Producto agregado al carrito')

            shouldAddRef.current = false;
            setSelectedURL(null)
        }
    }, [product, dispatch])

    return (
        <Carousel
            plugins={[
                Autoplay({
                    delay: 4500,
                }),
            ]}
            className="w-full">
            
            <CarouselContent className="mb-0">
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-Domino-Grand.jpg')",
                    backgroundPosition: "center center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold mb-4 text-white z-10 text-center">Mesa de Dominó Grand.</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Área de juego a nivel, personalizada (opcional colocar diseño de ajedrez o Backgammon).</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-domino-grand')
                        }}
                        className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-domino-grand' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-Blackjack-Lux.jpg')",
                    backgroundPosition: "center center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 z-10 text-center">Mesa Blackjack Lux.</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Área de juego personalizada, paño sublimado, color de fondo a elección.</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-blackjack-lux')
                        }} className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-blackjack-lux' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-Multijuegos-Lux.jpg')",
                    backgroundPosition: "top center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 z-10 text-center">Mesa Multijuegos Lux.</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Ruleta de 16” ABS eje de plástico. Área de juego es reversible, ofreciendo dos opciones en una sola mesa.</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-multijuegos-lux')
                        }} className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-multijuegos-lux' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-Texas-Lux.jpg')",
                    backgroundPosition: "top center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 z-10 text-center">Mesa Texas Hold'em Lux.</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Mesa de Texas Hold'em, diseñada para ofrecer una experiencia de juego profesional con un alto nivel de confort y sofisticación.</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-texas-holdem-lux')
                        }} className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-texas-holdem-lux' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-Ruleta-Essential.jpg')",
                    backgroundPosition: "top center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 z-10 text-center">Mesa ruleta profesional essential.</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Ruleta de 20” Madera eje de acero. Área de juego personalizada paño sublimado color de fondo a elección.</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-ruleta-profesional-essential')
                        }} className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-ruleta-profesional-essential' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
                <CarouselItem className="item-carousel flex flex-col items-center justify-center h-[85vh] w-full relative p-12" style={{
                    backgroundImage: "url('/Mesa-modular.jpg')",
                    backgroundPosition: "top center"
                }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 z-10 text-center">Mesa Modular Essential (Rectangular 6 jugadores).</h3>
                    <p className="text-lg text-neutral-100 font-medium mb-8 z-10 text-center">Mesa ideal para juegos de Rol como Catan, Calabozos y Dragones, Turista, Jenga, armar rompecabezas, armar legos etc.</p>
                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 z-10">
                        <button onClick={()=>{
                            handleGetProduct('mesa-modular-essential-6-jugadores')
                        }} className="font-semibold text-white px-8 py-4 bg-black hover:bg-[#1e1e1e]">AGREGAR AL CARRITO</button>
                        <Link href='/Productos/mesa-modular-essential-6-jugadores' className="font-semibold text-white px-8 py-4 bg-[#B86112] hover:bg-[#cb7818] flex items-center">DETALLES</Link>
                    </div>
                </CarouselItem>
            </CarouselContent>
            <div className="w-[90%] gap-x-4 flex justify-end">
                <CarouselPrevious/>
                <CarouselNext/>
            </div>
        </Carousel>
    )
}

export default CarouselComponent;