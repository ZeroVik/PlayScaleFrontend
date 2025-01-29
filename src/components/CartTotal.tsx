import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CartItem {
    cartItemId: number;
    instrumentId: number;
    instrumentName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface Cart {
    cartId: number;
    userId: number;
    items: CartItem[];
    totalPrice: number;
}

const Cart: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                console.log("Token:", token); // Check if token is available
                console.log("User ID:", userId); // Check if userId is defined

                if (!token) {
                    setError("No token found. Please log in.");
                    return;
                }

                if (!userId) {
                    setError("User ID not found.");
                    return;
                }

                const response = await axios.get(`https://localhost:7263/api/Cart/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Cart Data:", response.data); // Log cart data
                setCart(response.data);
            } catch (err: any) {
                console.error("Error fetching cart:", err); // Log full error
                setError(err.response?.data?.message || "Failed to load cart. Please try again.");
            }
        };

        fetchCart();
    }, []);


    const handleRemoveItem = async (cartItemId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://localhost:7263/api/Cart/RemoveItem/${cartItemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCart((prevCart) =>
                prevCart
                    ? {
                        ...prevCart,
                        items: prevCart.items.filter((item) => item.cartItemId !== cartItemId),
                        totalPrice: prevCart.totalPrice - prevCart.items.find((item) => item.cartItemId === cartItemId)!.subtotal,
                    }
                    : null
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove item.');
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!cart) {
        return <div className="text-gray-500 text-center mt-10">Loading cart...</div>;
    }

    return (
        <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">My Cart</h1>
            {cart.items.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty.</p>
            ) : (
                <div>
                    <ul className="divide-y divide-gray-200">
                        {cart.items.map((item) => (
                            <li key={item.cartItemId} className="flex justify-between items-center py-4">
                                <div>
                                    <h2 className="text-lg font-medium">{item.instrumentName}</h2>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold">${item.subtotal.toFixed(2)}</p>
                                    <button
                                        onClick={() => handleRemoveItem(item.cartItemId)}
                                        className="text-red-500 hover:underline text-sm"
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
