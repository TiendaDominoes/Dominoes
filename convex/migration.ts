// convex/migrations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateCategoriesToArray = mutation({
    args: {},
    handler: async (ctx) => {
        // Obtener todos los productos
        const products = await ctx.db.query("products").collect();
        
        let migrated = 0;
        let errors = 0;

        for (const product of products) {
            try {
                // Verificar si ya es un array
                if (Array.isArray(product.categoryId)) {
                    console.log(`✅ Producto ${product._id} ya está migrado`);
                    continue;
                }

                // Si es string (formato antiguo), convertir a array
                if (typeof product.categoryId === 'string') {
                    await ctx.db.patch(product._id, {
                        categoryId: [product.categoryId]
                    });
                    migrated++;
                    console.log(`🔄 Migrado producto ${product.name} (${product._id})`);
                }
                
            } catch (error) {
                console.error(`❌ Error migrando producto ${product._id}:`, error);
                errors++;
            }
        }

        return {
            total: products.length,
            migrated,
            errors,
            message: `Migración completada: ${migrated} productos actualizados, ${errors} errores`
        };
    },
});

// convex/migrateCategories.ts
export const runMigration = mutation({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db.query("products").collect();
        
        for (const product of products) {
            // Si tiene categoryId (antiguo) pero no categoryIds (nuevo)
            if (product.categoryId && !Array.isArray(product.categoryId)) {
                await ctx.db.patch(product._id, {
                    // Mantener categoryId por ahora
                    categoryId: [product.categoryId]
                });
            }
        }
        
        return { success: true };
    },
});