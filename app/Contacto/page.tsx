"use client";

import { useState } from 'react';
import { Mail, Phone, Send, CheckCircle, Facebook, Instagram } from 'lucide-react';

type FormErrors = {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
};

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    
        if (errors[name as keyof FormErrors]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }
    
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email no válido';
        }
    
        if (!formData.subject.trim()) {
            newErrors.subject = 'El asunto es requerido';
        }
    
        if (!formData.message.trim()) {
            newErrors.message = 'El mensaje es requerido';
        }
        
        setErrors(newErrors);
        
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const form = e.currentTarget;
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
    
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);

            form.submit(); 
            
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });                
            }, 4500);
        }, 1500);

    };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-300 mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">¿Tienes preguntas sobre algun producto? Estamos aquí para ayudarte a crear algo único.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                    {isSubmitted ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Mensaje Enviado!</h3>
                            <p className="text-gray-600 mb-8">Gracias por contactarnos, {formData.name}. Te responderemos en menos de 24 horas.</p>
                            <button onClick={() => setIsSubmitted(false)} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#58684f] hover:bg-[#4a5a41]">Enviar otro mensaje</button>
                        </div>
                    ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Escríbenos</h2>
                            <p className="text-gray-800">Completa el formulario y nos pondremos en contacto contigo lo antes posible.</p>
                        </div>

                        <form onSubmit={handleSubmit} action="https://formsubmit.co/cesaroliva.work@gmail.com" method="POST" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg `}
                                        placeholder="Tu nombre"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg `}
                                        placeholder="tu@email.com"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg "
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Asunto *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.subject ? 'border-red-300' : 'border-gray-300'} rounded-lg `}
                                >
                                    <option value="">Selecciona un asunto</option>
                                    <option value="Consulta general">Consulta general</option>
                                    <option value="Personalización de productos">Personalización de productos</option>
                                    <option value="Pedido personalizado">Pedido personalizado</option>
                                    <option value="Problemas con mi pedido">Problemas con mi pedido</option>
                                    <option value="Sugerencias">Sugerencias</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300' : 'border-gray-300'} rounded-lg `}
                                    placeholder="Describe lo que necesitas personalizar..."
                                ></textarea>
                                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                            </div>

                            <div>
                                <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white ${isSubmitting ? 'bg-[#cb7818]' : 'bg-[#B86112] hover:bg-[#cb7818]'}  transition`}>
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-3" />
                                            Enviar mensaje
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 h-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
                            <p className="text-gray-700 mb-8">Somos fabricantes de mesas de juego personalizadas a medida, ideales para distintos tipos de juego.
                            <br/>Partimos de la idea del cliente para diseñar y crear mesas únicas, combinando funcionalidad, diseño y calidad en cada detalle.</p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <a href='https://wa.me/8132349830' target='_blank' className="shrink-0 bg-orange-100 p-3 rounded-lg">
                                        <Phone className="w-6 h-6 text-[#B86112]" />
                                    </a>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Teléfono</h3>
                                        <a href='https://wa.me/8132349830' target='_blank' className="text-gray-600">+52 81-3234-9830</a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <a href='mailto:ventas.dominoes@gmail.com' target='_blanck' className="shrink-0 bg-orange-100 p-3 rounded-lg">
                                        <Mail className="w-6 h-6 text-[#B86112]" />
                                    </a>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Email</h3>
                                        <a href='mailto:ventas.dominoes@gmail.com' target='_blanck' className="text-gray-600">ventas.dominoes@gmail.com</a>
                                        <p className="text-gray-600 text-sm">Respondemos en menos de 24 horas</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <a href='https://www.facebook.com/mesasdejuegopersonalizadas' target='_blanck' className="shrink-0 bg-orange-100 p-3 rounded-lg">
                                        <Facebook className="w-6 h-6 text-[#B86112]" />
                                    </a>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Facebook</h3>
                                        <a href='https://www.facebook.com/mesasdejuegopersonalizadas' target='_blanck' className="text-gray-600">Mesas de Juego Personalizadas</a><br/>
                                        <a href='https://www.facebook.com/dominoeshogar' target='_blanck' className="text-gray-600">Dominoes Hogar</a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <a href='https://www.instagram.com/mesasdejuegopersonalizadas' target='_blanck' className="shrink-0 bg-orange-100 p-3 rounded-lg">
                                        <Instagram className="w-6 h-6 text-[#B86112]" />
                                    </a>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Instagram</h3>
                                        <a href='https://www.instagram.com/mesasdejuegopersonalizadas/' target='_blanck' className="text-gray-600">Mesas de Juego Personalizadas</a><br/>
                                        <a href='https://www.instagram.com/dominoes.home/' target='_blanck' className="text-gray-600">Dominoes Hogar</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default ContactPage;