import { toast } from "sonner";
import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

//Get categories or create if doesnt exist
async function getOrCreateCategory(
    ctx: MutationCtx,
    name: string,
    parentCategory?: Id<"categories">
) {
    const identity = await ctx.auth.getUserIdentity()

    if(!identity) throw new Error('No autenticado')

    const user = await ctx.db.query("users")
        .filter(q => q.eq(q.field("clerkId"), identity.subject))
        .unique()
        
    if(!user?.admin){
        throw new Error('No autorizado')
    }

    const existing = await ctx.db
        .query("categories")
        .withIndex("by_name_parent", q =>
            q.eq("categoryName", name).eq("parentCategory", parentCategory)
        )
        .unique();

    if(existing) return existing._id

    return await ctx.db.insert("categories", {
        categoryName: name,
        parentCategory,
    });
}

//Create product on Admin/Create
export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        price: v.number(),
        images: v.array(v.string()),
        url: v.string(),
        onStock: v.boolean(),
        categoryName: v.string(),
        subCategoryName: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }

        const existingProduct = await ctx.db
            .query("products")
            .withIndex("by_url", q => q.eq("url", args.url))
            .unique();

        if (existingProduct) {
            toast.error('La url del producto ya existe')
            throw new Error("La URL del producto ya existe");
        }

        const categoryId = await getOrCreateCategory(
            ctx,
            args.categoryName
        )

        const subcategories = args.subCategoryName.split(", ").map(s => s.trim());

        const subCategoryIds = [];
        for (const subcategoryName of subcategories) {
            const subCategoryId = await getOrCreateCategory(
                ctx,
                subcategoryName,
                categoryId,
            );
            subCategoryIds.push(subCategoryId);
        }
        
        return await ctx.db.insert("products", {
            name: args.name,
            description: args.description,
            price: args.price,
            images: args.images,
            url: args.url,
            onStock: true,
            categoryId: subCategoryIds,
        });
    },
});

//Update product on Admin/Create
export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.string(),
        price: v.number(),
        description: v.string(),
        slug: v.string(),
        category: v.string(),
        subcategory: v.string(),
        images: v.array(v.string())
    },
    handler: async(ctx, args)=> {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }
        
        const categoryId = await getOrCreateCategory(
            ctx,
            args.category
        )

        const subcategories = args.subcategory.split(", ").map(s => s.trim());

        const subCategoryIds = [];
        for (const subcategoryName of subcategories) {
            const subCategoryId = await getOrCreateCategory(
                ctx,
                subcategoryName,
                categoryId,
            );
            subCategoryIds.push(subCategoryId);
        }

        const update = await ctx.db.patch(args.id, {
            name: args.name,
            description: args.description,
            price: args.price,
            images: args.images,
            url: args.slug,
            categoryId: subCategoryIds,
        });

        return update;
    }
})

//Change the Stock status
export const updateStock = mutation({
    args: {
        id: v.id("products"),
    }, handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }

        const product = await ctx.db.get(args.id)

        if(!product) {
            toast.error("Error al actualizar")
        }

        const update = ctx.db.patch(args.id, {
            onStock: !product?.onStock,
        })
        
        return update
    }
})

//remove product on admin dashboard
export const removeProduct = mutation({
    args: {
        url: v.string(),
    },
    handler: async (ctx, { url }) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }

        const product =  await ctx.db
            .query("products")
            .filter((q) => q.eq(q.field("url"), url))
            .first()

        if(!product){
            throw new Error("Product not found")
        }

        await ctx.db.delete(product._id)

        return product._id;
    },
})

export const removeImage = mutation({
    args: {
        id: v.id("products"),
        images: v.array(v.string()),
    }, handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }
    
        const product = await ctx.db.get(args.id)

        if(!product) {
            toast.error("Error al actualizar")
        }

        const update = ctx.db.patch(args.id, {
            images: args?.images,
        })
        
        return update
    }
})

//Get categories by parent for every single parent category
export const getCategoriesByParent = query({
    args: {
        name: v.string()
    },
    handler: async(ctx, args)=>{
        const parent = await ctx.db
            .query("categories")
            .withIndex("by_categoryName", q => 
                q.eq("categoryName", args.name)
            )
            .unique()

        if(!parent) return [];

        const categories = await ctx.db
            .query("categories")
            .withIndex("by_parentCategory", q =>
                q.eq("parentCategory", parent._id)
            )
            .collect();

        return categories
    }
});

export const getCategoriesName = query({
    args: {
        categoryId: v.optional(v.array(v.id("categories")))
    },
    handler: async (ctx, args) => {
        const results = [];
        
        for (const categoryId of args.categoryId || []) {
            const subcategory = await ctx.db
                .query("categories")
                .filter((q) => q.eq(q.field("_id"), categoryId))
                .unique();

            const parentCategory = await ctx.db
                .query("categories")
                .filter((q) => q.eq(q.field("_id"), subcategory?.parentCategory))
                .unique();

            results.push({
                subcategory,
                parentCategory,
            });
        }
        
        return results;
    }
})

//Get individual product for Product page
export const getSingleProduct = query({
    args: {
        url: v.string(),
    },
    handler: async (ctx, { url }) => {
        const product =  await ctx.db
            .query("products")
            .withIndex("by_url", q => q.eq("url", url))
            .unique();

        return product;
    },
});

//Get products for payment
export const getMultipleProducts = query({
    args: {
        url: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const products: any[] = [];
        
        for (const url of args.url) {
            const product = await ctx.db
                .query("products")
                .withIndex("by_url", (q) => q.eq("url", url))
                .first();
            
            if (product) {
                products.push(product);
            }
        }
        
        return products;
    },
});

//Get products for admin dashboard
export const getAllProducts = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products").order("desc").collect();

        return products;
    },
});

export const getProductsByCategories = query({
    args: {
        paginationOpts: paginationOptsValidator,
        parentName: v.string(),
        categoryIds: v.optional(v.array(v.id("categories"))),
    },
    handler: async (ctx, args) => {
        const parent = await ctx.db.query("categories")
            .withIndex("by_categoryName", q =>
                q.eq("categoryName", args.parentName)
            )
            .unique();

        if (!parent) {
            return await ctx.db.query("products")
                .order("desc")
                .paginate(args.paginationOpts);
        }

        const children = await ctx.db.query("categories")
            .withIndex("by_parentCategory", q =>
                q.eq("parentCategory", parent._id)
            )
            .collect();

        const childIds = children.map(c => c._id);
        
        const idsToSearch = args.categoryIds && args.categoryIds.length > 0 
            ? args.categoryIds 
            : childIds;

        if (idsToSearch.length === 0) {
            return {
                page: [],
                isDone: true,
                continueCursor: args.paginationOpts.cursor || "0",
            };
        }

        const allProducts = await ctx.db.query("products")
            .order("desc")
            .collect();

        const filteredProducts = allProducts.filter(product => {
            const productCategories = Array.isArray(product.categoryId) 
                ? product.categoryId 
                : [product.categoryId];
            
            return productCategories.some(catId => 
                idsToSearch.includes(catId)
            );
        });

        const { numItems, cursor } = args.paginationOpts;
        const start = cursor ? parseInt(cursor) : 0;
        const end = start + numItems;
        
        return {
            page: filteredProducts.slice(start, end),
            isDone: end >= filteredProducts.length,
            continueCursor: end.toString(),
        };
    }
});

//Get products for sections as products and newest
export const getRecentProducts = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products").order("desc").take(4);

        return products
    }
})

//Search products by name
export const searchProducts = query({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.name || args.name.trim() === "") {
            return await ctx.db.query("products")
                .order("desc")
                .collect()
        }

        const term = args.name.toLowerCase().trim();
        
        const allProducts = await ctx.db.query("products").collect();
        
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(term)
        );

        return filteredProducts.sort((a, b) => b._creationTime - a._creationTime);

    }
});

//Return the number of products on stock, out of stock and total
export const getProductsStats = query({
    args: {},
    handler: async(ctx) => {
        const products = await ctx.db.query("products").collect();
        
        const totalProducts = products.length;
        const inStock = products.filter(p => p.onStock).length;
        const outOfStock = products.filter(p => !p.onStock).length;

        return {
            totalProducts,
            inStock,
            outOfStock
        }
    }
})