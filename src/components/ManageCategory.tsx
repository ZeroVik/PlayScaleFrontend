import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Category {
    id: number;
    name: string;
}

const ManageCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState<string>("");
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Category[]>("https://localhost:7263/api/Categories");
                setCategories(response.data);
                toast.success("Categories loaded successfully.");
            } catch (err) {
                console.error("Error fetching categories:", err);
                toast.error("Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Add a new category
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast.error("Category name cannot be empty.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "https://localhost:7263/api/Categories",
                { name: newCategory },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Assuming the backend returns the created category with `id` and `name`
            const createdCategory = response.data;

            setCategories([...categories, createdCategory]); // Add the new category to the list
            setNewCategory(""); // Clear the input field
            toast.success("Category added successfully.");
        } catch (err) {
            console.error("Error adding category:", err);
            toast.error("Failed to add category.");
        }
    };


    // Edit an existing category
    const handleUpdateCategory = async () => {
        if (!editCategory || !editCategory.name.trim()) {
            toast.error("Category name cannot be empty.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `https://localhost:7263/api/Categories/${editCategory.id}`,
                { id: editCategory.id, name: editCategory.name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCategories(
                categories.map((cat) => (cat.id === editCategory.id ? { ...cat, name: editCategory.name } : cat))
            );
            setEditCategory(null);
            toast.success("Category updated successfully.");
        } catch (err) {
            console.error("Error updating category:", err);
            toast.error("Failed to update category.");
        }
    };

    // Delete a category
    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://localhost:7263/api/Categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(categories.filter((cat) => cat.id !== id));
            toast.success("Category deleted successfully.");
        } catch (err) {
            console.error("Error deleting category:", err);
            toast.error("Failed to delete category.");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>

            {loading ? (
                <div className="text-center">Loading categories...</div>
            ) : (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Add New Category</h2>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="border p-2 rounded w-full"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter category name"
                            />
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                onClick={handleAddCategory}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-2">Existing Categories</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">ID</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="border border-gray-300 px-4 py-2 text-center">{category.id}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {editCategory?.id === category.id ? (
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full"
                                            value={editCategory.name}
                                            onChange={(e) =>
                                                setEditCategory({ ...editCategory, name: e.target.value })
                                            }
                                        />
                                    ) : (
                                        category.name
                                    )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    {editCategory?.id === category.id ? (
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            onClick={handleUpdateCategory}
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                            onClick={() => setEditCategory(category)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                                        onClick={() => handleDeleteCategory(category.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
