import { useEffect, useState } from "react";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { ProductDTO } from "../types/ProductDTO";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";

interface Category {
    id: number;
    name: string;
}

function Collection() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [filterProducts, setFilterProducts] = useState<ProductDTO[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [sortType, setSortType] = useState("relevant");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const currency = "$";

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("https://localhost:7263/api/products");
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                setProducts(data);
                setFilterProducts(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7263/api/categories");
                if (!response.ok) throw new Error("Failed to fetch categories");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase()) &&
            (selectedCategories.length === 0 || selectedCategories.includes(product.categoryId))
        );
        setFilterProducts(filtered);
    }, [search, selectedCategories, products]);

    useEffect(() => {
        const sorted = [...filterProducts].sort((a, b) =>
            sortType === "low-high" ? a.price - b.price :
                sortType === "high-low" ? b.price - a.price : 0
        );
        setFilterProducts(sorted);
    }, [sortType]);

    const toggleCategory = (id: number) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
        );
    };

    const sidebarVariants = {
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: "-100%" },
    };

    if (loading) return <div className="text-center p-8 text-gray-500">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Section */}
                    <AnimatePresence>
                        {(showFilter || !isMobile) && (
                            <motion.div
                                key="filters"
                                initial="closed"
                                animate="open"
                                exit="closed"
                                variants={sidebarVariants}
                                className="lg:w-80 w-full"
                            >
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-semibold">Filters</h3>
                                        <button
                                            onClick={() => setShowFilter(false)}
                                            className="lg:hidden text-gray-500 hover:text-gray-700"
                                        >
                                            <FiX size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Search</label>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Categories</h4>
                                            <div className="space-y-2">
                                                {categories.map(category => (
                                                    <label
                                                        key={category.id}
                                                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(category.id)}
                                                            onChange={() => toggleCategory(category.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                                                        />
                                                        <span className="text-sm">{category.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                            <Title text1="ALL" text2="PRODUCTS" />
                            <select
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value)}
                                className="w-full sm:w-48 px-4 py-2 rounded-lg border border-gray-200 bg-white"
                            >
                                <option value="relevant">Relevant</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                            </select>
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        >
                            <AnimatePresence>
                                {filterProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full"
                                    >
                                        <ProductItem
                                            id={product.id}
                                            image={product.imageUrl}
                                            name={product.name}
                                            price={product.price}
                                            currency={currency}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Collection;