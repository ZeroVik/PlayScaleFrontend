import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface AddToCartButtonProps {
    productId: number;
    price: number;
    userId: number;
    productName: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
                                                             productId,
                                                             price,
                                                             userId,
                                                             productName
                                                         }) => {
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateSessionCart = (newItem: any) => {
        const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
        const existingItemIndex = cart.findIndex((item: any) => item.productId === newItem.productId);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += newItem.quantity;
        } else {
            cart.push(newItem);
        }

        sessionStorage.setItem("cart", JSON.stringify(cart));
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!userId || !token) {
                setError("Please log in to add items to cart");
                return;
            }

            const payload = {
                cartItemId: 0,
                userId,
                productId,
                productName,
                quantity,
                unitPrice: price,
            };

            setLoading(true);
            setError(null);

            await axios.post(
                "https://localhost:7263/api/Cart/AddItem",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Item added to cart!");
            updateSessionCart({
                productId,
                productName,
                quantity,
                unitPrice: price,
            });
        } catch (err: any) {
            console.error("Error adding item to cart:", err);
            setError(err.response?.data?.message || "Failed to add item to cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        id={`quantity-${productId}`}
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-4 py-2.5 text-lg font-medium text-center text-gray-800 bg-white/50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-2 flex flex-col justify-center">
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            aria-label="Increase quantity"
                        >
                            ▲
                        </button>
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            ▼
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    className={`px-6 py-3.5 text-lg font-semibold text-white rounded-xl 
                        ${
                        loading
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-progress"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    }
                        transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                        active:scale-95`}
                    disabled={loading}
                    aria-label="Add to cart"
                >
                    <span className="flex items-center gap-2">
                        {loading ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                                </svg>
                                Adding...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Add to Cart
                            </>
                        )}
                    </span>
                </button>
            </div>

            {error && (
                <div className="mt-3 p-2 text-red-600 bg-red-50/80 rounded-lg animate-fade-in-up">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-5 h-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};

export default AddToCartButton;