import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Category {
    id: number;
    name: string;
}

interface CreateProductProps {
    onProductCreated: (newProduct: any) => void;
}

const CreateProduct: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        categoryId: 0,
        image: null as File | null,
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch categories from the backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get<Category[]>("https://localhost:7263/api/categories");
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                toast.error("Failed to load categories.");
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "price" || name === "categoryId" ? Number(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not authenticated. Please log in.");
                return;
            }

            const form = new FormData();
            form.append("name", formData.name);
            form.append("description", formData.description);
            form.append("price", formData.price.toString());
            form.append("categoryId", formData.categoryId.toString());
            if (formData.image) {
                form.append("ImageFile", formData.image); // Ensure field name matches backend
            } else {
                toast.error("Please upload an image.");
                setLoading(false);
                return;
            }

            await axios.post("https://localhost:7263/api/products/create", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Product created successfully!");
            setFormData({ name: "", description: "", price: 0, categoryId: 0, image: null });
        } catch (err: any) {
            console.error("Error creating product:", err);
            toast.error(err.response?.data?.message || "Failed to create product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto mt-10 max-w-lg p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Create Product</h1>
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
                />
                <input
                    type="number"
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
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Creating..." : "Create Product"}
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
