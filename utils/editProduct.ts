import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

export type Product = {
    _id: Id<"products">;
    name: string;
    price: number;
    envio: number,
    description: string;
    slug: string;
    category: Id<"categories">[];
    images: string[];
}

type EditProductStore = {
    productToEdit: Product | null;
    setProductToEdit: (product: Product | null) => void;
}

export const useEditProduct = create<EditProductStore>((set)=>({
    productToEdit: null,
    setProductToEdit: (product) => set({ productToEdit: product })
}))