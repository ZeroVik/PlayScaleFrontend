import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode";

interface CartItemDTO {
    cartItemId: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface CartDTO {
    cartId: number;
    userId: number;
    items: CartItemDTO[];
    totalPrice: number;
}

const Cart: React.FC = () => {
    const [cart, setCart] = useState<CartDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clearingCart, setClearingCart] = useState<boolean>(false);

    const getUserIdFromToken = (token: string): number | null => {
        try {
            const decoded = jwtDecode<any>(token);
            const userId =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            return userId ? parseInt(userId, 10) : null;
        } catch (err) {
            console.error("Error decoding token:", err);
            return null;
        }
    };

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded = jwtDecode<{ exp: number }>(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (err) {
            console.error("Error checking token expiration:", err);
            return true;
        }
    };

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token || isTokenExpired(token)) {
                    setError("Invalid token. Please log in again.");
                    localStorage.removeItem("token");
                    setLoading(false);
                    return;
                }

                const userId = getUserIdFromToken(token);
                if (!userId) {
                    setError("Invalid token. Please log in again.");
                    localStorage.removeItem("token");
                    setLoading(false);
                    return;
                }

                const response = await axios.get<CartDTO>(
                    `https://localhost:7263/api/Cart/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setCart(response.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    console.warn("Cart is empty or does not exist.");
                    setCart(null);
                } else {
                    console.error("Error fetching cart:", err);
                    setError(
                        err.response?.data?.message || "Failed to load cart. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            sessionStorage.removeItem("cart");
        }
    }, [cart]);

    const clearCart = async () => {
        try {
            setClearingCart(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("User not authenticated. Please log in.");
                setClearingCart(false);
                return;
            }

            const userId = getUserIdFromToken(token);
            if (!userId) {
                setError("Invalid token. Please log in again.");
                setClearingCart(false);
                return;
            }

            await axios.delete(
                `https://localhost:7263/api/Cart/ClearCart/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCart(null);
            toast.success("Cart cleared.");
        } catch (err: any) {
            console.error("Error clearing cart:", err);
            toast.error("Failed to clear cart. Please try again.");
        } finally {
            setClearingCart(false);
        }
    };

    const removeItem = async (cartItemId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("User not authenticated. Please log in.");
                return;
            }

            const userId = getUserIdFromToken(token);
            if (!userId) {
                setError("Invalid token. Please log in again.");
                return;
            }

            await axios.delete(
                `https://localhost:7263/api/Cart/RemoveItem/${cartItemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCart((prevCart) => {
                if (!prevCart) return null;
                const updatedItems = prevCart.items.filter(
                    (item) => item.cartItemId !== cartItemId
                );
                const updatedTotalPrice = updatedItems.reduce(
                    (sum, item) => sum + item.subtotal,
                    0
                );
                return { ...prevCart, items: updatedItems, totalPrice: updatedTotalPrice };
            });

            toast.success("Item removed from cart.");
        } catch (err: any) {
            console.error("Error removing item:", err);
            toast.error("Failed to remove item. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="text-gray-500 text-center mt-10">
                <span className="loader"></span> Loading cart...
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-gray-500 text-center mt-10">
                <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-4">
                    Add items to your cart to place an order.
                </p>
                <button
                    onClick={() => (window.location.href = "/collection")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">My Cart</h1>
            <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                    <li
                        key={item.cartItemId}
                        className="flex justify-between items-center py-4"
                    >
                        <div>
                            <h2 className="text-lg font-medium">{item.productName}</h2>
                            <p className="text-sm text-gray-500">
                                ${item.unitPrice.toFixed(2)} each
                            </p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">
                                ${item.subtotal.toFixed(2)}
                            </p>
                            <button
                                onClick={() => removeItem(item.cartItemId)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                    <p>Total:</p>
                    <p>${cart.totalPrice.toFixed(2)}</p>
                </div>
                <div className="mt-4 flex justify-between">
                    <button
                        onClick={clearCart}
                        disabled={clearingCart}
                        className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${
                            clearingCart ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {clearingCart ? "Clearing..." : "Clear Cart"}
                    </button>
                    <button
                        onClick={() => (window.location.href = "/order")}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
