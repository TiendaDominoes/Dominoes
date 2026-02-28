"use client";

import { ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Footer = () => {
    const [openServicio, setOpenServicio] = useState(false);
    const servicioRef = useRef<HTMLLIElement>(null)

    useEffect(()=>{
        const handleClickOutside = (e:MouseEvent) => {
            if(!servicioRef.current?.contains(e.target as Node)){
                setOpenServicio(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])
    
    return (
        <footer className="flex items-center justify-center pt-8 bg-white">
            <div className="w-[90%] flex flex-col items-center justify-center max-w-300">
                <Link href={'/'} className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <img src="/logo.jpg" alt="Logo Dominoes" className="h-16 mb-4"/>
                    <img src="/logo-home.jpg" alt="Logo Dominoes" className="h-16 mb-4"/>
                </Link>
                <div className="flex flex-col md:flex-row gap-8 mb-8 md:mb-12">
                    <div className="flex flex-col items-center">
                        <div className="flex gap-8 mb-2">
                            <a target="_blank" href="https://www.facebook.com/mesasdejuegopersonalizadas">
                                <img className='size-10' src="/facebook.svg" alt="Facebook Dominoes"/>
                            </a>
                            <a target="_blank" href="https://www.instagram.com/mesasdejuegopersonalizadas/">
                                <img className='size-10' src="/instagram.svg" alt="Instagram Dominoes"/>
                            </a>
                        </div>
                        <h4 className="text-xl font-semibold">Mesas</h4>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-8 mb-2">
                            <a target="_blank" href="https://www.facebook.com/dominoeshogar/">
                                <img className='size-10' src="/facebook.svg" alt="Facebook Dominoes"/>
                            </a>
                            <a target="_blank" href="https://www.instagram.com/dominoes.home/">
                                <img className='size-10' src="/instagram.svg" alt="Instagram Dominoes"/>
                            </a>
                        </div>
                        <h4 className="text-xl font-semibold">Home</h4>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-y-4 md:gap-y-0 w-full items-center justify-between mb-12">
                    <span className="text-lg">® DOMINOES 2026</span>
                    <ul className="flex flex-col md:flex-row items-center font-medium gap-x-4 text-lg">
                        <Link href="/Quienes-Somos" className="block md:max-w-42 text-center px-4 py-2 hover:text-[#B86112]">¿QUIENES SOMOS?</Link>
                        <Link href="/Politica-De-Garantia" className="block px-4 md:max-w-42 text-center py-2 hover:text-[#B86112]">POLÍTICA DE GARANTÍA</Link>
                        <li ref={servicioRef} className="relative max-w-42 flex items-center justify-center">
                            <button onClick={()=> setOpenServicio(!openServicio)} className="flex items-center px-4 md:max-w-42 text-center py-2 hover:text-[#B86112]">
                                SERVICIO AL CLIENTE
                                <span className={`transition-transform ${openServicio ? "rotate-180" : ""}`}>
                                    <ChevronUp />
                                </span>
                            </button>

                            {openServicio && (
                                <ul className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 text-sm">
                                    <a className="block px-4 py-2 hover:bg-gray-100" href="https://wa.me/8132349830" target="_blanck">+52 81-3234-9830</a>
                                    <a className="block px-4 py-2 truncate hover:bg-gray-100" href="mailto:ventas.dominoes@gmail.com" target="_blanck">ventas.dominoes@gmail.com</a>
                                </ul>
                            )}
                        </li>
                    </ul>
                    <h4 className="text-black text-lg">Una web de <span className="font-semibold cursor-pointer"><a target="_blank" href="https://bycesaroliva.com/">César Oliva</a></span></h4>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;