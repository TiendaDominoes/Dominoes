"use client";

import { createContext } from "react";

export type CartItem = {
    _id: string
    name: string
    price: number
    envio: number
    image: string
    url: string
    quantity: number
}

type CartState = {
    items: CartItem[]
}

type Action = 
    | { type: "ADD_ITEM"; payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: string }
    | { type: "INCREASE_QTY"; payload: string }
    | { type: "DECREASE_QTY"; payload: string }
    | { type: "CLEAR_CART" }

export const CartContext = createContext<any>(null)

export function cartReducer(state: CartState, action: Action): CartState {
    switch (action.type) {
        case "ADD_ITEM":
            const existing = state.items.find(
                item => item._id === action.payload._id
            )

            if(existing){
                return {
                    items: state.items.map(item =>
                        item._id === action.payload._id
                            ? {...item, quantity: item.quantity+1}
                            : item
                    )
                }
            }

            return {
                items: [...state.items, {...action.payload, quantity:1}]
            }
        
        case "INCREASE_QTY":
            return {
                items: state.items.map(item =>
                    item._id === action.payload
                        ? {...item, quantity: item.quantity+1}
                        : item
                )
            }

        case "DECREASE_QTY":
            return {
                items: state.items
                    .map(item =>
                        item._id === action.payload
                        ? {...item, quantity: item.quantity-1}
                        : item
                    )
                    .filter(item => item.quantity > 0)
            }

        case "REMOVE_ITEM":
            return {
                items: state.items.filter(item => item._id !== action.payload)
            }

        case "CLEAR_CART":
            return { items: [] }

        default:
            return state
    }

}