import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string; // Always "Admin" or "User"
}

interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    role?: string;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>("");

    // Fetch users and current user's role on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not authenticated");

                // Decode the token to get the current user's role
                const decoded: DecodedToken = jwtDecode(token);
                const role =
                    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                    decoded.role;

                setCurrentUserRole(role || ""); // Set the role of the logged-in user

                // Fetch all users
                const response = await axios.get<User[]>("https://localhost:7263/api/User", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Ensure roles are displayed as names
                const updatedUsers = response.data.map((user) => ({
                    ...user,
                    role: user.role === "0" ? "Admin" : user.role === "1" ? "User" : user.role,
                }));

                setUsers(updatedUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
                toast.error("Failed to load users or profile.");
            }
        };

        fetchUsers();
    }, []);

    // Update user role
    const updateUserRole = async (id: number, role: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            // Map role name to numeric values
            const roleValue = role === "Admin" ? 0 : 1;

            console.log("Sending payload:", { role: roleValue });

            await axios.put(
                `https://localhost:7263/api/User/${id}/role`,
                { role: roleValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Update the user role in the state without adding duplicates
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id ? { ...user, role } : user // Update role to the name ("Admin" or "User")
                )
            );

            toast.success("User role updated successfully.");
        } catch (err) {
            console.error("Error updating user role:", err);
            toast.error("Failed to update user role.");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Role</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td className="border border-gray-300 px-4 py-2">
                            {user.firstName} {user.lastName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                            {currentUserRole === "Admin" && (
                                <div className="flex gap-2">
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            user.role === "Admin"
                                                ? "bg-gray-500 text-white cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                        disabled={user.role === "Admin"} // Grayed out if already Admin
                                        onClick={() => updateUserRole(user.id, "Admin")}
                                    >
                                        Make Admin
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            user.role === "User"
                                                ? "bg-gray-500 text-white cursor-not-allowed"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                        }`}
                                        disabled={user.role === "User"} // Grayed out if already User
                                        onClick={() => updateUserRole(user.id, "User")}
                                    >
                                        Make User
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
