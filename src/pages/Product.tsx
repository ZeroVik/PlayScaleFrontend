import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiTag, FiShoppingBag, FiX } from "react-icons/fi";
import RelatedProducts from "../components/RelatedProducts";
import AddToCartButton from "../components/AddToCartButton";

export interface ProductDTO {
    id: number;
    name: string;
    price: number;
    categoryName: string;
    imageUrl: string;
    isSecondHand: boolean;
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};

const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0 },
};

function Product() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [productData, setProductData] = useState<ProductDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currency = "$";

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(
                    `https://localhost:7263/api/products/details/${productId}`
                );
                if (!response.ok) throw new Error("Product not found");
                const data = await response.json();
                setProductData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-screen flex items-center justify-center text-red-500"
                >
                    <div className="text-center">
                        <p>{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 text-indigo-600 hover:text-indigo-700 flex items-center justify-center"
                        >
                            <FiArrowLeft className="mr-2" /> Go Back
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative"
        >
            {/* Image Modal */}
            <AnimatePresence>
                {isModalOpen && productData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors z-50"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <FiX className="w-8 h-8" />
                            </button>
                            <div className="bg-white p-8 rounded-2xl shadow-2xl">
                                <img
                                    src={productData.imageUrl}
                                    alt={productData.name}
                                    className="w-full h-full object-contain max-h-[80vh]"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div variants={fadeIn} className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" /> Back to Shop
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {productData && (
                        <motion.div
                            key={productData.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid lg:grid-cols-2 gap-12 lg:gap-16"
                        >
                            {/* Product Image */}
                            <motion.div
                                variants={fadeIn}
                                className="relative group bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-zoom-in"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-8">
                                    <motion.img
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                                        src={productData.imageUrl}
                                        alt={productData.name}
                                    />
                                </div>
                                {productData.isSecondHand && (
                                    <div className="absolute top-6 right-6 bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center text-sm font-medium">
                                        <FiTag className="mr-2" /> Second Hand
                                    </div>
                                )}
                            </motion.div>

                            {/* Product Details */}
                            <motion.div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {productData.name}
                                    </h1>
                                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                                        <span className="text-4xl font-bold text-indigo-600">
                                            {currency}
                                            {productData.price.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                Free Shipping
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                productData.isSecondHand
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}>
                                                {productData.isSecondHand ? "Second Hand" : "Brand New"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    <div className="p-6 bg-white rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Category
                                                </h3>
                                                <p className="mt-1 text-lg font-medium text-gray-900">
                                                    {productData.categoryName}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <FiShoppingBag className="w-6 h-6 text-indigo-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <AddToCartButton
                                        productId={productData.id}
                                        productName={productData.name}
                                        price={productData.price}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Product Details
                                        </h3>
                                        <div className="space-y-2 text-gray-600">
                                            <p>• Premium quality materials</p>
                                            <p>• Eco-friendly packaging</p>
                                            <p>• 1-year manufacturer warranty</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16"
                >
                    <RelatedProducts category={productData?.categoryName || ""} />
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Product;