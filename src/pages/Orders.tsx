import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode";

interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    orderDate: string;
    status: string;
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoadingOrders(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("User not authenticated. Please log in.");
                }

                // Decode the token to get userId
                const decoded: any = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                if (!userId) {
                    throw new Error("User ID not found in the token.");
                }

                // Fetch orders for the logged-in user
                const response = await axios.get<Order[]>(
                    `https://localhost:7263/api/Orders/ByUser/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setOrders(response.data);
                toast.success("Orders loaded successfully.");
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Failed to fetch orders.");
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, []);

    if (loadingOrders) {
        return <div className="text-center">Loading your orders...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500 mt-4 text-center">You have no orders yet.</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Order ID</th>
                        <th className="border border-gray-300 px-4 py-2">Order Date</th>
                        <th className="border border-gray-300 px-4 py-2">Total</th>
                        <th className="border border-gray-300 px-4 py-2">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="border border-gray-300 px-4 py-2 text-center">{order.id}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                                ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{order.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Orders;
