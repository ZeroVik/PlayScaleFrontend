import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiTrash2, FiArrowRight, FiX, FiPlus, FiMinus } from "react-icons/fi";
import {ProductDTO} from "./Product.tsx";
import { useNavigate } from "react-router-dom";

interface CartItem {
    cartItemId: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    imageUrl?: string;
}

interface Cart {
    cartId: number;
    userId: number;
    items: CartItem[];
    totalPrice: number;
    discountAmount: number;
    grandTotal: number;
    discountMessage?: string;
}

const API_BASE = "https://localhost:7263/api";

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingItems, setUpdatingItems] = useState<number[]>([]);
    const [clearingCart, setClearingCart] = useState(false);
    const navigate = useNavigate();

    const getUserIdFromToken = (token: string): number | null => {
        try {
            const decoded: any = jwtDecode(token);
            return parseInt(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"], 10);
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token");

            const userId = getUserIdFromToken(token);
            if (!userId) throw new Error("Invalid user ID");

            const [cartResponse, productsResponse] = await Promise.all([
                axios.get<Cart>(`${API_BASE}/Cart/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(error => {
                    // Handle 404 as empty cart
                    if (error.response?.status === 404) {
                        return { data: {
                                cartId: 0,
                                userId: userId,
                                items: [],
                                totalPrice: 0,
                                discountAmount: 0,
                                grandTotal: 0
                            }};
                    }
                    throw error;
                }),
                axios.get<ProductDTO[]>(`${API_BASE}/products`)
            ]);

            const enhancedItems = cartResponse.data.items.map(item => {
                const product = productsResponse.data.find(p => p.id === item.productId);
                return {
                    ...item,
                    imageUrl: product?.imageUrl
                };
            });

            setCart({
                ...cartResponse.data,
                items: enhancedItems
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setError("Your session has expired. Please log in again.");
                localStorage.removeItem("token");
            } else {
                setError(error instanceof Error ? error.message : "Failed to load cart");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
        try {
            setUpdatingItems(prev => [...prev, cartItemId]);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");

            await axios.put(
                `${API_BASE}/Cart/UpdateQuantity/${cartItemId}?quantity=${newQuantity}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCart(prev => {
                if (!prev) return null;

                // Update the specific item
                const updatedItems = prev.items.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: newQuantity, subtotal: item.unitPrice * newQuantity }
                        : item
                );

                // Recalculate totals
                const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

                let discountAmount = 0;
                let discountMessage = '';

                if (totalPrice >= 500) {
                    discountAmount = totalPrice * 0.10;
                    discountMessage = "10% discount on orders over $500!";
                } else if (totalPrice >= 200) {
                    discountAmount = totalPrice * 0.05;
                    discountMessage = "5% discount on orders over $200!";
                }

                const grandTotal = totalPrice - discountAmount;

                return {
                    ...prev,
                    items: updatedItems,
                    totalPrice,
                    discountAmount,
                    grandTotal,
                    discountMessage
                };
            });
        } catch (error) {
            toast.error("Failed to update quantity");
        } finally {
            setUpdatingItems(prev => prev.filter(id => id !== cartItemId));
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");

            await axios.delete(`${API_BASE}/Cart/RemoveItem/${cartItemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCart(prev => {
                if (!prev) return null;

                // Remove the item and calculate new totals
                const updatedItems = prev.items.filter(item => item.cartItemId !== cartItemId);

                const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

                let discountAmount = 0;
                let discountMessage = '';

                if (totalPrice >= 500) {
                    discountAmount = totalPrice * 0.10;
                    discountMessage = "10% discount on orders over $500!";
                } else if (totalPrice >= 200) {
                    discountAmount = totalPrice * 0.05;
                    discountMessage = "5% discount on orders over $200!";
                }

                const grandTotal = totalPrice - discountAmount;

                return {
                    ...prev,
                    items: updatedItems,
                    totalPrice,
                    discountAmount,
                    grandTotal,
                    discountMessage
                };
            });

            toast.success("Item removed from cart");
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const handleClearCart = async () => {
        try {
            setClearingCart(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");

            const userId = getUserIdFromToken(token);
            if (!userId) throw new Error("Invalid user");

            await axios.delete(`${API_BASE}/Cart/ClearCart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Set empty cart state instead of null
            setCart({
                cartId: 0,
                userId: userId,
                items: [],
                totalPrice: 0,
                discountAmount: 0,
                grandTotal: 0
            });

            toast.success("Cart cleared successfully");
        } catch (error) {
            toast.error("Failed to clear cart");
        } finally {
            setClearingCart(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-8"
            >
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
                    <FiX className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Expired</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Return to Login
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!cart?.items.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-8"
            >
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
                    <FiShoppingCart className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Discover amazing products and fill your cart!</p>
                    <button
                        onClick={() => window.location.href = "/collection"}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Start Shopping
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 py-12"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-8 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
                        <motion.h1
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            className="text-3xl font-bold flex items-center gap-3"
                        >
                            <FiShoppingCart className="w-8 h-8" />
                            Shopping Cart
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 opacity-90"
                        >
                            {cart.items.length} item{cart.items.length > 1 ? 's' : ''}
                        </motion.p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence>
                            {cart.items.map((item, index) => (
                                <motion.div
                                    key={item.cartItemId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between py-4 border-b border-gray-100 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center">
                                                {item.imageUrl && (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        className="max-h-full max-w-full object-scale-down"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{item.productName}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1.5">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                                        disabled={updatingItems.includes(item.cartItemId)}
                                                        className={`p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors ${
                                                            updatingItems.includes(item.cartItemId) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        <FiMinus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                                        disabled={updatingItems.includes(item.cartItemId)}
                                                        className={`p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors ${
                                                            updatingItems.includes(item.cartItemId) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="text-sm text-gray-500">
                          ${item.unitPrice.toFixed(2)} each
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800">
                      ${item.subtotal.toFixed(2)}
                    </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleRemoveItem(item.cartItemId)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 mb-6"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-600">Subtotal:</span>
                                <span className="text-lg text-gray-800">
                  ${cart.totalPrice.toFixed(2)}
                </span>
                            </div>

                            {cart.discountAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-lg font-medium text-gray-600">Discount:</span>
                                        {cart.discountMessage && (
                                            <span className="ml-2 text-green-600 text-sm">
                        ({cart.discountMessage})
                      </span>
                                        )}
                                    </div>
                                    <span className="text-lg text-green-600">
                    -${cart.discountAmount.toFixed(2)}
                  </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center border-t pt-4">
                                <span className="text-xl font-bold text-gray-800">Grand Total:</span>
                                <span className="text-2xl font-bold text-pink-500">
                  ${cart.grandTotal.toFixed(2)}
                </span>
                            </div>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleClearCart}
                                disabled={clearingCart}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-opacity ${
                                    clearingCart
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-orange-500 text-white hover:opacity-90"
                                }`}
                            >
                                <FiTrash2 className="w-5 h-5" />
                                {clearingCart ? "Clearing..." : "Clear Cart"}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/order")}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                            >
                                Checkout Now
                                <FiArrowRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CartPage;