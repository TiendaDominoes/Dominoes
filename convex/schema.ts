import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    products: defineTable({
        name: v.string(),
        description: v.string(),
        price: v.number(),
        images: v.array(v.string()),
        url: v.string(),
        onStock: v.boolean(),
        categoryId: v.array(v.id("categories")),
    })
    .index("by_url", ["url"])
    .index("by_category", ["categoryId"]),

    categories: defineTable({
        categoryName: v.string(),
        parentCategory: v.optional(v.id("categories")),
    })
    .index("by_categoryName", ["categoryName"])
    .index("by_parentCategory", ["parentCategory"])
    .index("by_name_parent", ["categoryName", "parentCategory"]),

    //To compare at login to accept
    users: defineTable({
        clerkId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        admin: v.boolean()
    })
    .index("by_role", ["admin"]),

    orders: defineTable({
        userId: v.string(),

        customerData: v.object({
            name: v.string(),
            email: v.string(),
            telefono: v.number(),
            mensaje: v.string(),
        }),

        shippingAddress: v.object({
            calle: v.string(),
            colonia: v.string(),
            cp: v.number(),
            ciudad: v.string(),
            estado: v.string(),
        }),

        items: v.array(v.object({
            productId: v.string(),
            name: v.string(),
            price: v.number(),
            quantity: v.number(),
            image: v.optional(v.string()),
        })),

        total: v.number(),
        status: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});