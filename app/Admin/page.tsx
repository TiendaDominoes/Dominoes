"use client";

import { useRouter  } from "next/navigation";
import { CircleCheck, Package, Pencil, Plus, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatearMoneda } from "@/utils/CurrencyFormat";
import RemoveDialog from "@/components/ui/AlertDialog";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { useEditProduct } from "@/utils/editProduct";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { ProductSearch } from "./_components/ProductSearch";
import { OrderFilter } from "./_components/OrderFilter";

const DasboardPage = () => {
    const router = useRouter();

    const { user, isLoading, isAdmin } = useUser();

    const stats = useQuery(api.products.getProductsStats);
    const updateStock = useMutation(api.products.updateStock);
    const updateOrderPayment = useMutation(api.orders.updateOrderPayment);
    
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<any[] | null>(null);
    
    const products = useQuery(api.products.getAllProducts);
    const orders = useQuery(api.orders.getAllOrders);

    const displayedProducts = searchResults !== null ? searchResults : products || [];
    const displayedOrders = filteredOrders !== null ? filteredOrders : orders || [];

    const handleCreate = () => {
        router.push('/Admin/Create');
    }

    const removeProduct = useMutation(api.products.removeProduct)
    
    const handleRemoveProduct = (url: string) => {
        removeProduct({
            url: url
        })
    }

    const removeOrder = useMutation(api.orders.removeOrder)
    
    const handleRemoveOrder = (id: Id<"orders">) => {
        removeOrder({
            orderId: id
        })
    }

    const changeStock =  async (_id: Id<"products">) => {
        await updateStock({id: _id})
    }

    const changePaid = async (orderId: Id<"orders">) => {
        await updateOrderPayment({ orderId: orderId });
    };

    const setProductToEdit = useEditProduct(
        (state) => state.setProductToEdit
    );

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user) {
            router.push('/');
            return;
        }

        if (!isAdmin) {
            router.push('/');
            return;
        }
    }, [user, isAdmin, isLoading, router]);

    if(isLoading){
        return (
            <div className="w-full flex items-center justify-center">
                <div className="w-[90%] md:w-[80%] flex flex-col justify-center items-center">
                    <main className="p-6 w-full">
                        <section className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <div className="">
                                <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 bg-gray-300 rounded w-32"></div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
                            
        )
    };

    if(!isAdmin || !user) return null; 

    return (
        <div className="w-full flex items-center justify-center">
            <div className="w-[90%] md:w-[80%] flex flex-col justify-center items-center">
                <main className="p-6">
                    <section className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-center sm:text-start">Gestión de Productos</h2>
                            <p className="text-lg text-neutral-600 text-center sm:text-start mb-2 sm:mb-0">Administra los productos de tu tienda en linea!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={handleCreate} className="ml-2 px-4 py-2 text-white cursor-pointer rounded-lg bg-black hover:bg-neutral-800 flex items-center font-medium">
                                <Plus className="mr-2"/>
                                Nuevo Producto
                            </button>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                    <Package className="text-black size-6"/>
                                    <i className="fas fa-box-open text-2xl text-primary"></i>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total Productos</p>
                                    <p className="text-2xl font-bold">{stats?.totalProducts}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg mr-4">
                                    <CircleCheck className="text-black size-6"/>
                                </div>
                                <div>
                                    <p className="text-gray-500">Disponibles</p>
                                    <p className="text-2xl font-bold">{stats?.inStock}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 rounded-lg mr-4">
                                    <X className="text-black size-6"/>
                                    <i className="fas fa-times-circle text-2xl text-accent"></i>
                                </div>
                                <div>
                                    <p className="text-gray-500">Agotados</p>
                                    <p className="text-2xl font-bold">{stats?.outOfStock}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                        
                    <div className="grid grid-cols-1 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Lista de Productos</h3>
                                    <ProductSearch 
                                        onSearchResults={setSearchResults}
                                        initialProducts={products}
                                    />
                                </div>
                                
                                <div className="overflow-x-auto max-h-120">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-6 text-left">Producto</th>
                                                <th className="py-3 px-6 text-left">Precio</th>
                                                <th className="py-3 px-6 text-left">Envío</th>
                                                <th className="py-3 px-6 text-left">Stock</th>
                                                <th className="py-3 px-6 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {displayedProducts?.map(({ _id, name, price, images, url, onStock, categoryId, description, envio }) => (
                                                <tr key={_id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-6">
                                                        <Link href={`/Productos/${url}`}>
                                                            <div className="flex min-w-60 max-w-80 items-center">
                                                                <div className="sm:flex items-center justify-center mr-4">
                                                                    <img className='size-12 rounded-md' src={images[0]} alt={name}/>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{name}</p>
                                                                    <p className="text-gray-500 text-sm">{`/${url}`}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 px-6 font-semibold">{formatearMoneda(price)}</td>
                                                    <td className="py-4 px-6 font-semibold">{formatearMoneda(envio)}</td>
                                                    <td className="py-4 px-6">
                                                        {onStock ? (
                                                            <CircleCheck onClick={()=> changeStock(_id)} className="cursor-pointer bg-green-100 rounded-full text-sm"/>
                                                        ): (
                                                            <X onClick={()=> changeStock(_id)} className="cursor-pointer bg-red-100 rounded-full text-sm"/>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex space-x-2">
                                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                                <Pencil onClick={()=> {
                                                                    setProductToEdit({
                                                                        _id: _id,
                                                                        name: name,
                                                                        price: price,
                                                                        envio: envio,
                                                                        description: description,
                                                                        slug: url,
                                                                        category: categoryId,
                                                                        images: images
                                                                    });
                                                                    router.push("/Admin/Create")
                                                                }} className="size-6"/>
                                                            </button>
                                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                                <RemoveDialog 
                                                                    onConfirm={() => handleRemoveProduct(url)}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mt-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Lista de Ordenes</h3>
                                    <OrderFilter 
                                        onFilterResults={setFilteredOrders}
                                        initialOrders={orders}
                                    />
                                </div>

                                <div className="overflow-x-auto max-h-120">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-6 text-left">Orden #</th>
                                                <th className="py-3 px-6 text-left">Cliente</th>
                                                <th className="py-3 px-6 text-left">Fecha</th>
                                                <th className="py-3 px-6 text-left">Productos</th>
                                                <th className="py-3 px-6 text-left">Total</th>
                                                <th className="py-3 px-6 text-left">Dirección</th>
                                                <th className="py-3 px-6 text-left">Pagado</th>
                                                <th className="py-3 px-6 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {displayedOrders?.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-6 font-mono text-sm">
                                                        #{order._id.slice(-8)}
                                                    </td>
                                                    
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <p className="font-medium">{order.customerData.name}</p>
                                                            <p className="text-gray-500 text-sm">{order.customerData.email}</p>
                                                            <p className="text-gray-500 text-xs">{order.customerData.telefono}</p>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <p className="text-sm">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(order.createdAt).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-1">
                                                            {order.items.map((item: any, idx: any) => (
                                                                <div key={idx} className="text-sm">
                                                                    <span className="font-medium">{item.quantity}x</span> {item.name}
                                                                </div>
                                                            ))}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-6 font-semibold">
                                                        ${order.total.toFixed(2)}
                                                    </td>
                                                    
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <p className="font-medium">{order.shippingAddress.calle}</p>
                                                            <p className="text-gray-500 text-sm">{order.shippingAddress.colonia} - {order.shippingAddress.cp}</p>
                                                            <p className="text-gray-500 text-xs">{order.shippingAddress.estado}</p>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        {order.payed ? (
                                                            <CircleCheck onClick={()=> changePaid(order._id)} className="cursor-pointer bg-green-100 rounded-full text-sm"/>
                                                        ): (
                                                            <X onClick={()=> changePaid(order._id)} className="cursor-pointer bg-red-100 rounded-full text-sm"/>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="flex space-x-2">
                                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                                <RemoveDialog 
                                                                    onConfirm={() => handleRemoveOrder(order._id )}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
 
export default DasboardPage;