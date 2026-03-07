import { toast } from "sonner";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
    args: {
        userId: v.optional(v.string()),
        name: v.string(),
        email: v.string(),
        telefono: v.number(),
        mensaje: v.optional(v.string()),
        calle: v.string(),
        referencia: v.string(),
        colonia: v.string(),
        cp: v.number(),
        ciudad: v.string(),
        estado: v.string(),
        items: v.array(v.object({
            productId: v.string(),
            name: v.string(),
            price: v.number(),
            quantity: v.number(),
            image: v.optional(v.string()),
        })),
        total: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        
        const userId = identity?.subject || 'unauth';
        
        const orderId = await ctx.db.insert("orders", {
            userId,
            customerData: {
                name: args.name,
                email: args.email,
                telefono: args.telefono,
                mensaje: args.mensaje || '',
            },
            shippingAddress: {
                calle: args.calle,
                referencia: args.referencia,
                colonia: args.colonia,
                cp: args.cp,
                ciudad: args.ciudad,
                estado: args.estado,
            },
            items: args.items,
            total: args.total,
            payed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return orderId;
    }
});

export const updateOrderPayment = mutation({
    args: {
        orderId: v.id("orders"),
    }, handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity) throw new Error('No autenticado')

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), identity.subject))
            .unique()
            
        if(!user?.admin){
            throw new Error('No autorizado')
        }

        const order = await ctx.db.get(args.orderId)

        if(!order) {
            toast.error("Error al actualizar")
        }

        const update = ctx.db.patch(args.orderId, {
            payed: !order?.payed,
        })
        
        return update
    }
})

export const getAllOrders = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders").order("desc").collect();

        return orders;
    },
});


export const removeOrder = mutation({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {        
        return await ctx.db.delete(args.orderId);
    }
});

export const searchByCustomer = query({
    args: {
        name: v.string(),
        month: v.optional(v.number()),
        year: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let orders = await ctx.db
            .query("orders").order("desc").collect();

        if(args.name && args.name.trim() !== ''){
            const term = args.name.toLowerCase().trim();
            orders = orders.filter(order =>
                order.customerData.name.toLowerCase().includes(term)
            )
        }

        if (args.month !== undefined && args.year !== undefined) {
            const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
            const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();
            
            orders = orders.filter(order => 
                order.createdAt >= startOfMonth && order.createdAt <= endOfMonth
            );
        } else if (args.year !== undefined) {
            const startOfYear = new Date(args.year, 0, 1).getTime();
            const endOfYear = new Date(args.year, 11, 31, 23, 59, 59, 999).getTime();
            
            orders = orders.filter(order => 
                order.createdAt >= startOfYear && order.createdAt <= endOfYear
            );
        }
        
        return orders;
    }
})