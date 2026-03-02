"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/upload/multi-image";
import { 
    UploaderProvider,
    type UploadFn
} from "@/components/upload/uploader-provider";
import { useEdgeStore } from "@/utils/edgestore";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { type JSONContent } from '@tiptap/react'
import ProductEditor from "./_components/Editor";
import { toast } from "sonner";
import { useEditProduct } from "@/utils/editProduct";
import type {Product} from '@/utils/editProduct'
import { Trash2Icon } from "lucide-react";
import { useUser } from "@/hooks/use-user";

type ProductProps = {
    initialData?: Product
}

const CreateProductPage = () => {
    const productToEdit = useEditProduct(
        (state) => state.productToEdit
    )

    return (
        <ProductForm initialData={productToEdit ?? undefined}/>
    )
}

export function ProductForm({initialData}: ProductProps){
    const router = useRouter()

    const { user, isLoading, isAdmin } = useUser()

    const {edgestore} = useEdgeStore()

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (!user) {
            router.push('/')
            return
        }

        if (!isAdmin) {
            router.push('/')
            return
        }

    }, [isLoading, user, isAdmin, router])

    const setProductToEdit = useEditProduct(
        (state) => state.setProductToEdit
    )

    const categories = useQuery(api.products.getCategoriesName, 
        initialData?.category?.length 
            ? { categoryId: initialData.category }
            : "skip"
    )

    useEffect(()=>{
        if(categories){
            const categoriesString = categories.map(c => c.subcategory?.categoryName).join(", ")
            setCategory(categories[0]?.parentCategory?.categoryName ?? "")
            setSubCategory(categoriesString ?? "")
        }
    }, [categories])

    const isEditMode = !!initialData

    const [name, setName] = useState<string>(initialData?.name ?? "");
    const [price, setPrice] = useState<number>(initialData?.price ?? 0)
    const [description, setDescription] = useState<JSONContent | null>(()=> {
        if(!initialData?.description) return null;

        try{
            return JSON.parse(initialData.description)
        }
        catch{
            return null
        }
    })
    const [slug, setSlug] = useState<string>(initialData?.slug ?? "")
    const [category, setCategory] = useState<string>(categories?.[0]?.parentCategory?.categoryName ?? "")
    const [subCategory, setSubCategory] = useState<string>(categories?.[0]?.subcategory?.categoryName ?? "")
    const [images, setImages] = useState<string[]>(initialData?.images ?? [])

    const uploadFn: UploadFn = useCallback(
        async ({ file, onProgressChange, signal }) => {
            const res = await edgestore.publicFiles.upload({
                file,
                signal,
                options: {
                    temporary: true
                },
                onProgressChange,
            });
            setImages(prev => [...prev, res.url]);
            return res;
        },[edgestore],
    );
    
    const createProduct = useMutation(api.products.createProduct)
    const updateProduct = useMutation(api.products.updateProduct)
    const removeImage = useMutation(api.products.removeImage)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

       if (!validateForm()) {
            return;
        }

        handleCreate();
    }

    const validateURL = (url: string)=> {
        if(/[<>%{}|\\^[\]`]/.test(url)) return false;
        if(/(^|\/)\.\.?(\/|$)/.test(url)) return false
        if(/^[\/a-zA-Z0-9\-._~!$&'()*+,;=:@]+$/.test(url)) return true
    }

    const validateForm = (): boolean => {
        if (!name.trim()) {
            toast.error('El nombre es requerido')
            return false;
        }
        if (price<=0) {
            toast.error('El precio es requerido');
            return false;
        }
        if (description === null) {
            toast.error('Descripción requerida');
            return false;
        }
        if (!slug.trim()) {
            toast.error('URL requerida');
            return false;
        }
        if(!validateURL(slug)){
            toast.error('URL no valida');
            return false
        }
        if (images.length == 0) {
            toast.error('Imagen requerida');
            return false;
        }
        if (!category.trim()) {
            toast.error('Categoria requerida')
            return false;
        }
        if (!subCategory.trim()) {
            toast.error('Subcategoria requerida');
            return false;
        }
        
        return true;
    };

    const handleCreate = async ()=>{
        if(isEditMode){
            const promise = updateProduct({
                id: initialData._id,
                name: name,
                description: JSON.stringify(description),
                price: price,
                images: images,
                slug: slug.replace(' ', '_').toLowerCase(),
                category: category,
                subcategory: subCategory
            })
                .then(()=> router.push('/Admin'));
                setProductToEdit(null)
                    
                toast.promise(promise, {
                    loading: "Creando producto...",
                    success: "Producto creado exitosamente!",
                    error: "Error al crear el producto."
                })
        }else{
            const promise = createProduct({
                name: name,
                description: JSON.stringify(description),
                price: price,
                images: images,
                url: slug.replace(' ', '_').toLowerCase(),
                onStock: true,
                categoryName: category,
                subCategoryName: subCategory
            })
                .then(()=> router.push('/Admin'));
                    
                toast.promise(promise, {
                    loading: "Creando producto...",
                    success: "Producto creado exitosamente!",
                    error: "Error al crear el producto."
                })
    
            await Promise.all(
                images.map((url)=>
                    edgestore.publicFiles.confirmUpload({
                        url: url
                    })
                )
            )
        }
    }

    const handleRemoveImage = async (urlToDelete: string) => {
        await edgestore.publicFiles.delete({
            url: urlToDelete,
        });
        
        const index = images.indexOf(urlToDelete)
        if(index > -1){
            images.splice(index, 1)
        }

        setImages(prevImages => prevImages.filter(url => url !== urlToDelete));

        const remove = removeImage({
            id: initialData!._id,
            images: images
        })
    }

    if(user === undefined){
        return (
            <div className="animate-pulse p-4">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            </div>
        )
    }

    return (
        <>
            {user ? (
                <section className="flex flex-col items-center justify-center mt-8 mb-16">
                    <div className="w-[90%] flex flex-col md:flex-row justify-center items-center max-w-300 gap-y-8">
                        <form onSubmit={handleSubmit} className="flex w-full flex-col md:flex-row">
                            <div className="w-full md:w-1/2 flex justify-center mb-4 md:mb-0 overflow-hidden">
                                <div className="rounded-lg object-cover flex items-center justify-center focus:outline-none border border-neutral-700 p-2 size-96 md:size-128">
                                    <div className='flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400'>
                                        <div className="flex flex-wrap gap-2 justify-between">
                                            {initialData?.images.map((url, index)=>(
                                                <div key={index} className="relative inline-block group">
                                                    <img 
                                                        className="bg-white size-24 rounded-md" 
                                                        src={url} 
                                                        alt={initialData.name} 
                                                    />
                                                    <div onClick={()=> {
                                                        handleRemoveImage(url);
                                                    }} className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
                                                        <Trash2Icon className="block h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <UploaderProvider uploadFn={uploadFn} autoUpload>
                                            <ImageUploader
                                                maxFiles={6}
                                                maxSize={1024 * 1024 * 1} // 1 MB
                                            />
                                        </UploaderProvider>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex flex-col md:w-1/2 md:ml-4">
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={name}
                                    onChange={(e)=>setName(e.target.value)}
                                    className='text-[30px] font-semibold mb-2 focus:outline-none w-full max-w-215 rounded-md'
                                    placeholder="Nombre"
                                />
                                <input
                                    type="number"
                                    id="precio"
                                    name="precio"
                                    value={price}
                                    onChange={(e)=>setPrice(+e.target.value)}
                                    className='text-2xl font-semibold text-[#B86112] mb-2 focus:outline-none w-full max-w-50 rounded-md'
                                    placeholder="Precio"
                                />
                                <ProductEditor value={description} onChange={setDescription}/>
                                <input 
                                    type="text"
                                    id="url"
                                    name="url"
                                    value={slug}
                                    onChange={(e)=>setSlug(e.target.value)}
                                    className='text-lg font-semibold text-neutral-700 mb-2 focus:outline-none w-full max-w-80 rounded-md'
                                    placeholder="Slug"
                                />
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        id='categoria'
                                        name="categoria"
                                        value={category}
                                        onChange={(e)=>setCategory(e.target.value)}
                                        className='text-lg font-semibold text-neutral-700 mb-2 focus:outline-none w-full max-w-50 rounded-md'
                                        placeholder="Categoría"
                                    />
                                    <input
                                        type="text"
                                        id='subcategoria'
                                        name="subcategoria"
                                        value={subCategory}
                                        onChange={(e)=> setSubCategory(e.target.value)}
                                        className='text-lg font-semibold text-neutral-700 mb-2 focus:outline-none w-full max-w-50 rounded-md'
                                        placeholder="Subcategoría"
                                    />
                                </div>
                                    
                                <button type="submit" className="bg-[#B86112] hover:bg-[#cb7818] font-semibold text-white h-12 w-36 rounded-lg transition-colors duration-300">GUARDAR</button>
                            </div>
                        </form>
                    </div>
                </section>
            ) : (
                <div>
                </div>
            ) }
        </>
    );
}
 
export default CreateProductPage;