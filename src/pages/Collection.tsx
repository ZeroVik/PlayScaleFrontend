import { useEffect, useState } from "react";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { ProductDTO } from "../types/ProductDTO";

interface Category {
    id: number;
    name: string;
}

function Collection() {
    const [products, setProducts] = useState<ProductDTO[]>([]); // All products from the backend
    const [filterProducts, setFilterProducts] = useState<ProductDTO[]>([]); // Filtered products
    const [categories, setCategories] = useState<Category[]>([]); // All categories
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Selected categories
    const [search, setSearch] = useState<string>(""); // Search query
    const [showFilter, setShowFilter] = useState<boolean>(false); // Toggle filter section
    const [sortType, setSortType] = useState<string>("relevant"); // Sorting type
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    // Fetch products from the backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("https://localhost:7263/api/products");
                const data = await response.json();
                setProducts(data);
                setFilterProducts(data); // Initialize the filtered products
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Fetch categories from the backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7263/api/categories");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError("Failed to load categories. Please try again.");
            }
        };
        fetchCategories();
    }, []);

    // Apply filters to products
    const applyFilter = () => {
        let filtered = [...products];

        // Filter by search query
        if (search) {
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by selected categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((item) => selectedCategories.includes(item.categoryId));
        }

        setFilterProducts(filtered);
    };

    // Sort products
    const sortProduct = () => {
        const sorted = [...filterProducts];
        switch (sortType) {
            case "low-high":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "high-low":
                sorted.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }
        setFilterProducts(sorted);
    };

    // Handle category selection
    const toggleCategory = (id: number) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
        );
    };

    // Reapply filters whenever search or selected categories change
    useEffect(() => {
        applyFilter();
    }, [search, selectedCategories]);

    // Reapply sorting whenever sort type changes
    useEffect(() => {
        sortProduct();
    }, [sortType]);

    if (loading) {
        return <div className="text-center text-gray-500">Loading products...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t">
            {/* Filters Section */}
            <div className="sm:min-w-[240px] w-full sm:w-auto">
                <p
                    onClick={() => setShowFilter(!showFilter)}
                    className="my-2 text-xl flex items-center cursor-pointer gap-2"
                >
                    FILTERS
                </p>
                <div
                    className={`border border-gray-300 pl-5 py-3 mt-6 ${
                        showFilter ? "" : "hidden"
                    } sm:block`}
                >
                    <p className="mb-3 text-sm font-medium">CATEGORIES</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        {categories.map((cat) => (
                            <p key={cat.id} className="flex gap-2">
                                <input
                                    className="w-3"
                                    value={cat.id}
                                    checked={selectedCategories.includes(cat.id)}
                                    onChange={() => toggleCategory(cat.id)}
                                    type="checkbox"
                                />
                                {cat.name}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
            {/* Products Section */}
            <div className="flex-1">
                <div className="flex justify-between text-base sm:text-2xl mb-4 items-center">
                    <Title text1="ALL" text2="Products" />
                    <input
                        type="text"
                        placeholder="Search products"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-2 py-1 rounded text-sm"
                    />
                    <select
                        onChange={(e) => setSortType(e.target.value)}
                        className="border-2 border-gray-300 text-sm px-2"
                    >
                        <option value="relevant">Sort by: Relevant</option>
                        <option value="low-high">Sort by: Low to High</option>
                        <option value="high-low">Sort by: High to Low</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                    {filterProducts.map((product) => (
                        <ProductItem
                            key={product.id}
                            id={product.id}
                            image={product.imageUrl}
                            name={product.name}
                            price={product.price}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Collection;
