import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ManageProducts from "../components/ManageProducts";
import ManageUsers from "../components/ManageUsers";
import ManageOrders from "../components/ManageOrders";
import ManageCategory from "../components/ManageCategory";

interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
    exp: number;
}

const AdminDashboard: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/"); // Redirect to homepage if no token is found
            return;
        }
        try {
            const decoded: DecodedToken = jwtDecode(token);
            if (
                decoded[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ] === "Admin"
            ) {
                setIsAdmin(true);
            } else {
                navigate("/"); // Redirect non-admin users
            }
        } catch (err) {
            console.error("Invalid token:", err);
            navigate("/"); // Redirect on error
        }
    }, [navigate]);

    if (!isAdmin) {
        return null; // Prevent rendering the Admin Dashboard until the role is verified
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-800 text-white flex flex-col">
                <h1 className="text-3xl font-bold text-center py-6 border-b border-gray-700">
                    Admin Panel
                </h1>
                <ul className="flex flex-col mt-8 gap-4 px-4">
                    <li>
                        <Link
                            to="/admin/products"
                            className="block px-4 py-2 rounded transition hover:bg-gray-700 text-lg"
                        >
                            📦 Manage Products
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/admin/users"
                            className="block px-4 py-2 rounded transition hover:bg-gray-700 text-lg"
                        >
                            👤 Manage Users
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/admin/orders"
                            className="block px-4 py-2 rounded transition hover:bg-gray-700 text-lg"
                        >
                            🛒 Manage Orders
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/admin/category"
                            className="block px-4 py-2 rounded transition hover:bg-gray-700 text-lg"
                        >
                            🗂️ Manage Categories
                        </Link>
                    </li>
                </ul>
            </nav>
            {/* Main Content */}
            <main className="flex-grow bg-gray-100 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Welcome, Admin!</h2>
                    <p className="text-gray-600 text-sm">
                        Today's Date: {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="mt-10">
                    <Routes>
                        <Route path="products" element={<ManageProducts />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="orders" element={<ManageOrders />} />
                        <Route path="category" element={<ManageCategory />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
