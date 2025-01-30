import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiMapPin, FiLoader, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


interface CartItemDTO {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface CartDTO {
    items: CartItemDTO[];
    totalPrice: number;
    discountAmount: number;
    grandTotal: number;
    discountMessage?: string;
}

const OrderPage: React.FC = () => {
    const [cart, setCart] = useState<CartDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [address, setAddress] = useState({
        street: "",
        city: "",
        postalCode: "",
        country: "",
    });
    const navigate = useNavigate();
    const [placingOrder, setPlacingOrder] = useState<boolean>(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    setError("Please log in to view your cart");
                    setLoading(false);
                    return;
                }

                const response = await axios.get<CartDTO>(
                    `https://localhost:7263/api/Cart/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setCart(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load cart");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const placeOrder = async () => {
        try {
            setPlacingOrder(true);
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) throw new Error("Authentication required");

            const payload = {
                userId: Number(userId),
                orderDetails: cart?.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                totalAmount: cart?.totalPrice,
                address,
            };

            await axios.post("https://localhost:7263/api/orders", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCart(null);
            toast.success("Order placed successfully!");
            window.location.href = "/order-confirmation";
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to place order");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 p-8"
            >
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
                    <FiPackage className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Cart</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 p-8"
            >
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
                    <FiShoppingCart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Add items to your cart to place an order</p>
                    <button
                        onClick={() => window.location.href = "/collection"}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Browse Products
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <motion.div
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <FiPackage className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">Checkout</h1>
                        </motion.div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                                <FiMapPin className="w-5 h-5 text-purple-600" />
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(address).map(([key, value]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <input
                                            type="text"
                                            name={key}
                                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                            value={value}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {cart.items.map((item, index) => (
                                        <motion.div
                                            key={item.productId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <h3 className="font-medium">{item.productName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <span className="font-medium">
                                                ${item.subtotal.toFixed(2)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {cart.discountAmount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 p-4 bg-green-50 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">Discount</span>
                                            {cart.discountMessage && (
                                                <span className="ml-2 text-green-600 text-sm">
                                                    ({cart.discountMessage})
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-medium text-green-600">
                                            -${cart.discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        ${cart.grandTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="flex justify-end"
                        >
                            <button
                                onClick={placeOrder}
                                disabled={placingOrder}
                                className={`px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium ${
                                    placingOrder ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
                                } transition-opacity`}
                            >
                                {placingOrder ? (
                                    <span className="flex items-center gap-2">
                                        <FiLoader className="animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Confirm Order"
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderPage;