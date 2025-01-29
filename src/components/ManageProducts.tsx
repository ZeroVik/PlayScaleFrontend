import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    imageUrl: string;
}

interface Category {
    id: number;
    name: string;
}

interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
}

const ManageProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        description: "",
        price: "",
        categoryId: 0,
        image: null as File | null,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                if (
                    decodedToken[
                        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                        ] === "Admin"
                ) {
                    setIsAdmin(true);
                } else {
                    toast.error("You do not have permission to manage products.");
                }
            } catch (err) {
                console.error("Invalid token:", err);
                toast.error("Authentication error. Please log in again.");
            }
        }
    }, []);

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("User is not authenticated.");
                }
                const [productsResponse, categoriesResponse] = await Promise.all([
                    axios.get<Product[]>("https://localhost:7263/api/products", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get<Category[]>("https://localhost:7263/api/categories", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setProducts(productsResponse.data);
                setCategories(categoriesResponse.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load products or categories.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductsAndCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "price"
                    ? value === "" || /^[0-9]*\.?[0-9]*$/.test(value)
                        ? value
                        : prev.price
                    : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({
            id: 0,
            name: "",
            description: "",
            price: "",
            categoryId: 0,
            image: null,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setModalMode("edit");
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            categoryId: product.categoryId,
            image: null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You are not authenticated. Please log in.");
            return;
        }

        const form = new FormData();
        form.append("id", formData.id.toString());
        form.append("name", formData.name);
        form.append("description", formData.description);
        form.append("price", formData.price);
        form.append("categoryId", formData.categoryId.toString());

        // Handle image logic
        if (formData.image) {
            // Append the new image file
            form.append("ImageFile", formData.image);
        } else if (modalMode === "edit") {
            // Append the existing image URL if no new image is selected
            const existingProduct = products.find((p) => p.id === formData.id);
            if (existingProduct && existingProduct.imageUrl) {
                form.append("ImageUrl", existingProduct.imageUrl);
            } else {
                toast.error("Error: Unable to find the existing image URL.");
                return;
            }
        }

        try {
            if (modalMode === "create") {
                const response = await axios.post(
                    "https://localhost:7263/api/products/create",
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                const newProduct = response.data;
                setProducts((prev) => [...prev, newProduct]);
                toast.success("Product created successfully.");
            } else if (modalMode === "edit") {
                await axios.put(
                    `https://localhost:7263/api/products/update/${formData.id}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                // Update the product list with the edited product
                setProducts((prev) =>
                    prev.map((product) =>
                        product.id === formData.id
                            ? { ...product, ...formData, price: parseFloat(formData.price) }
                            : product
                    )
                );
                toast.success("Product updated successfully.");
            }
        } catch (err: any) {
            console.error("Error submitting product:", err);
            toast.error(err.response?.data?.message || "Failed to save product.");
        } finally {
            setIsModalOpen(false);
            setFormData({
                id: 0,
                name: "",
                description: "",
                price: "",
                categoryId: 0,
                image: null,
            });
        }
    };





    const deleteProduct = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You are not authenticated. Please log in.");
            return;
        }
        try {
            await axios.delete(`https://localhost:7263/api/products/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((product) => product.id !== id));
            toast.success("Product deleted successfully.");
        } catch (err) {
            console.error("Error deleting product:", err);
            toast.error("Failed to delete product.");
        }
    };

    if (loading) {
        return <div className="text-center">Loading products...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
            {isAdmin && (
                <button
                    onClick={openCreateModal}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    + Add Product
                </button>
            )}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">Price</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                        <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                        <td className="border border-gray-300 px-4 py-2">
                            ${product.price.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                            <button
                                onClick={() => openEditModal(product)}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => deleteProduct(product.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === "create" ? "Add Product" : "Edit Product"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Product Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border rounded p-2"
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Product Description"
                                value={formData.description}
                                onChange={handleChange}
                                className="border rounded p-2"
                                required
                            ></textarea>
                            <input
                                type="text"
                                name="price"
                                placeholder="Price"
                                value={formData.price}
                                onChange={handleChange}
                                className="border rounded p-2"
                                required
                            />
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="border rounded p-2"
                                required
                            >
                                <option value={0} disabled>
                                    Select a category
                                </option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="border rounded p-2"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {modalMode === "create" ? "Create" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
