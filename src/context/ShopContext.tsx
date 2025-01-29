import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {ProductDTO} from "../pages/Product.tsx";

// Define the ProductDTO type for fetched products
interface CartItem {
    cartItemId: number;
    instrumentId: number;
    instrumentName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface ShopContextValue {
    currency: string;
    delivery_fee: number;
    products: ProductDTO[];
    navigate: ReturnType<typeof useNavigate>;
    addToCart: (itemId: number) => Promise<void>;
    cartItems: { [itemId: number]: number }; // Legacy support if needed
    getCartCount: () => number;
    getCartAmount: () => number;
    cart: { items: CartItem[]; totalPrice: number } | null; // Add cart
    setCart: React.Dispatch<React.SetStateAction<{ items: CartItem[]; totalPrice: number } | null>>; // Add setCart
}


// Create the context with a default value
const defaultValue: ShopContextValue = {
    currency: "$",
    delivery_fee: 10,
    products: [],
    navigate: (() => {}) as unknown as ReturnType<typeof useNavigate>,
    addToCart: async () => {},
    updateQuantity: async () => {},
    cartItems: {},
    getCartCount: () => 0,
    getCartAmount: () => 0,
};

export const ShopContext = createContext<ShopContextValue>(defaultValue);

interface ShopContextProviderProps {
    children: ReactNode;
}

const ShopContextProvider: React.FC<ShopContextProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [cart, setCart] = useState<{ items: CartItem[]; totalPrice: number } | null>(null); // Add cart state
    const navigate = useNavigate();
    const currency = "$";
    const delivery_fee = 10;

    // Fetch products from the backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get<ProductDTO[]>("https://localhost:7263/api/products");
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Add to cart
    const addToCart = async (itemId: number) => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                toast.error("User not authenticated. Please log in.");
                return;
            }

            // Call backend API to add the product to the cart
            await axios.post(
                `https://localhost:7263/api/Cart/AddItem`,
                {
                    userId: parseInt(userId, 10), // Ensure userId is a number
                    productId: itemId,
                    quantity: 1, // Default to adding one item
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Fetch updated cart data
            const response = await axios.get(`https://localhost:7263/api/Cart/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCart(response.data); // Update local cart state with backend data
            toast.success("Product added to cart!");
        } catch (err: any) {
            console.error("Error adding product to cart:", err);
            toast.error(err.response?.data?.message || "Failed to add product to cart.");
        }
    };


    // Update quantity in cart
    const updateQuantity = async (itemId: number, quantity: number) => {
        const cartData = { ...cartItems };
        if (quantity > 0) {
            cartData[itemId] = quantity;
        } else {
            delete cartData[itemId];
        }
        setCart(cartData);
    };

    // Get total cart count
    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, count) => total + count, 0);
    };

    // Get total cart amount
    const getCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            const item = products.find((product) => product.id === Number(itemId));
            return item ? total + item.price * quantity : total;
        }, 0);
    };

    // Context value
    const value: ShopContextValue = {
        currency,
        delivery_fee,
        products,
        navigate,
        addToCart,
        updateQuantity,
        cartItems: {}, // This can be replaced with the updated cart state if needed
        getCartCount: () => cart?.items.reduce((total, item) => total + item.quantity, 0) || 0,
        getCartAmount: () => cart?.totalPrice || 0,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
