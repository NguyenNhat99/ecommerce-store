import { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cartService";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartQty, setCartQty] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const total = await cartService.getTotalQty();
                setCartQty(total);
            } catch (err) {
                console.error("Lỗi lấy số lượng giỏ", err);
            }
        })();
    }, []);

    return (
        <CartContext.Provider value={{ cartQty, setCartQty }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);