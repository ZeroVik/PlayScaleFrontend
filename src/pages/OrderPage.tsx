import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
    const [placingOrder, setPlacingOrder] = useState<boolean>(false);

    // Fetch the cart data
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    setError("User not authenticated. Please log in.");
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
                console.error("Error fetching cart:", err);
                setError(err.response?.data?.message || "Failed to load cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    // Handle address input changes
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    // Place the order
    const placeOrder = async () => {
        try {
            setPlacingOrder(true);
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                setError("User not authenticated. Please log in.");
                setPlacingOrder(false);
                return;
            }

            // Payload for the order
            const payload = {
                userId: Number(userId),
                orderDetails: cart?.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                totalAmount: cart?.totalPrice,
                address,
            };

            console.log("Placing order with payload:", payload);

            // Send order to backend
            const response = await axios.post(
                "https://localhost:7263/api/orders",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Order Response:", response.data);

            // Clear cart and navigate to a success page or show confirmation
            setCart(null);
            sessionStorage.removeItem("cart");
            toast.success("Order placed successfully!");
        } catch (err: any) {
            console.error("Error placing order:", err);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="text-gray-500 text-center mt-10">
                <span className="loader"></span> Loading cart...
            </div>
        );
    }

    // Error State
    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    // Empty Cart State
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

    // Order Page UI
    return (
        <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Order Details</h1>

            {/* Address Form */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="street"
                        placeholder="Street"
                        value={address.street}
                        onChange={handleAddressChange}
                        className="border px-4 py-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={address.city}
                        onChange={handleAddressChange}
                        className="border px-4 py-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className="border px-4 py-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={address.country}
                        onChange={handleAddressChange}
                        className="border px-4 py-2 rounded w-full"
                    />
                </div>
            </div>

            {/* Cart Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <ul className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                        <li key={item.productId} className="flex justify-between py-4">
                            <span>
                                {item.quantity} × {item.productName}
                            </span>
                            <span>${item.subtotal.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Place Order Button */}
            <div className="text-right">
                <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                        placingOrder ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
            </div>
        </div>
    );
};

export default OrderPage;
