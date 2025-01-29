import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    orderDate: string;
    status: string; // Example statuses: Pending, Shipped, Completed, Cancelled
}

const ManageUsersAndOrders: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const token = localStorage.getItem("token"); // Assume the JWT is stored in local storage
                const response = await axios.get<User[]>("https://localhost:7263/api/User", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
                toast.success("Users loaded successfully.");
            } catch (err) {
                console.error("Error fetching users:", err);
                toast.error("Failed to load users. Please ensure you're logged in as an admin.");
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    // Fetch orders for the selected user
    const fetchOrdersByUserId = async (userId: number) => {
        setLoadingOrders(true);
        try {
            const response = await axios.get<Order[]>(`https://localhost:7263/api/Orders/ByUser/${userId}`);
            setOrders(response.data);
            toast.success("Orders loaded successfully.");
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Failed to load orders.");
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        fetchOrdersByUserId(user.id);
    };

    // Update order status
    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            await axios.put(
                `https://localhost:7263/api/Orders/UpdateStatus/${orderId}`,
                { status }, // Send JSON object matching the DTO
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
            toast.success("Order status updated successfully.");
        } catch (err) {
            console.error("Error updating order status:", err);
            toast.error("Failed to update order status.");
        }
    };


    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manage Users and Their Orders</h1>

            {/* User List */}
            {loadingUsers ? (
                <div className="text-center">Loading users...</div>
            ) : (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Users</h2>
                    <ul className="list-disc pl-5">
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className={`cursor-pointer mb-1 ${
                                    selectedUser?.id === user.id ? "font-bold text-blue-500" : ""
                                }`}
                                onClick={() => handleUserSelect(user)}
                            >
                                {user.firstName} {user.lastName} ({user.email})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Orders for Selected User */}
            {selectedUser && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Orders for {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    {loadingOrders ? (
                        <div className="text-center">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div>No orders found for this user.</div>
                    ) : (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                                <th className="border border-gray-300 px-4 py-2">Order Date</th>
                                <th className="border border-gray-300 px-4 py-2">Total</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
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
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="border rounded"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageUsersAndOrders;
