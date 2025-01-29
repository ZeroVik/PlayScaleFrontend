import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile: React.FC = () => {
    const [user, setUser] = useState<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [updatedFirstName, setUpdatedFirstName] = useState<string>("");
    const [updatedLastName, setUpdatedLastName] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("No token found. Please log in.");
                    return;
                }
                const response = await axios.get("https://localhost:7263/api/Auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setUpdatedFirstName(response.data.firstName);
                setUpdatedLastName(response.data.lastName);
            } catch (err: any) {
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Failed to fetch profile. Please try again.");
                }
            }
        };
        fetchUserProfile();
    }, []);

    const handleNameChange = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found. Please log in.");
                return;
            }
            await axios.put(
                `https://localhost:7263/api/User/${user?.id}`,
                { firstName: updatedFirstName, lastName: updatedLastName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser((prevUser) => ({
                ...prevUser!,
                firstName: updatedFirstName,
                lastName: updatedLastName,
            }));
            setEditMode(false);
            setError(null);
            alert("Name updated successfully.");
        } catch (err: any) {
            console.error("Error updating names:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to update names. Please try again.");
            }
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user) {
        return <div className="text-gray-500 text-center mt-10">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto mt-10 max-w-md p-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-center">My Profile</h1>
            <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                </div>
                <div className="text-center">
                    {editMode ? (
                        <div>
                            <input
                                type="text"
                                value={updatedFirstName}
                                onChange={(e) => setUpdatedFirstName(e.target.value)}
                                className="border rounded p-2 mb-2 w-full text-black"
                                placeholder="First Name"
                            />
                            <input
                                type="text"
                                value={updatedLastName}
                                onChange={(e) => setUpdatedLastName(e.target.value)}
                                className="border rounded p-2 w-full text-black"
                                placeholder="Last Name"
                            />
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={handleNameChange}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-semibold">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-lg opacity-90">{user.email}</p>
                            <button
                                onClick={() => setEditMode(true)}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Edit Name
                            </button>
                        </>
                    )}
                </div>
            </div>
            {user.role === "Admin" && (
                <div className="mt-10 text-center">
                    <button
                        onClick={() => navigate("/admin/*")}
                        className="w-full px-4 py-2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
                    >
                        Go to Admin Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;