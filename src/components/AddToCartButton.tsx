import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface AddToCartButtonProps {
    productId: number;
    price: number;
    userId: number; // Passed as a prop for dynamic user management
    productName: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, price, userId }) => {
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to update the cart in session storage
    const updateSessionCart = (newItem: any) => {
        // Get the existing cart from sessionStorage
        const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");

        // Check if the item already exists in the cart
        const existingItemIndex = cart.findIndex((item: any) => item.productId === newItem.productId);

        if (existingItemIndex !== -1) {
            // Update the quantity of the existing item
            cart[existingItemIndex].quantity += newItem.quantity;
        } else {
            // Add the new item to the cart
            cart.push(newItem);
        }

        // Save the updated cart back to sessionStorage
        sessionStorage.setItem("cart", JSON.stringify(cart));
        console.log("Updated Cart in SessionStorage:", cart);
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            // Ensure `userId` and `token` exist
            if (!userId || !token) {
                setError("User not authenticated. Please log in.");
                console.error("Missing userId or token in localStorage.");
                return;
            }

            // Create the full payload to match the backend structure
            const payload = {
                cartItemId: 0, // New item, so set to 0
                userId,
                productId,
                productName: "", // Optional, can be set dynamically if needed
                quantity,
                unitPrice: price,
            };

            console.log("Payload sent to backend:", payload);

            // Set loading and clear any previous errors
            setLoading(true);
            setError(null);

            // Make the API call to the backend
            const response = await axios.post(
                "https://localhost:7263/api/Cart/AddItem",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Add to Cart Response:", response.data);
            toast.success("Item added to cart successfully!");

            // Update the cart in sessionStorage
            updateSessionCart({
                productId,
                productName: "", // Replace with actual product name if needed
                quantity,
                unitPrice: price,
            });
        } catch (err: any) {
            console.error("Error adding item to cart:", err);
            setError("Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-md">
            <div className="flex items-center gap-2">
                <label htmlFor={`quantity-${productId}`} className="sr-only">
                    Quantity
                </label>
                <input
                    id={`quantity-${productId}`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-16 text-center"
                />
                <button
                    onClick={handleAddToCart}
                    className={`px-4 py-2 text-white rounded ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add to Cart"}
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default AddToCartButton;
