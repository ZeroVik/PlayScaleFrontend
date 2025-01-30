import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiHeart, FiShoppingBag } from "react-icons/fi";

interface ProductItemProps {
    id: number;
    image: string;
    name: string;
    price: number;
    currency: string;
}

function ProductItem({ id, image, name, price, currency }: ProductItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-full flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
            <Link
                to={`/product/${id}`}
                className="flex flex-col h-full"
            >
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img

                            src={image}
                            alt={name}
                            className="w-full h-64 object-contain rounded-lg mix-blend-multiply"
                    />

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                            <FiHeart className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                            <FiEye className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4 mt-auto border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
                    <div className="mt-2 flex justify-between items-center">
                        <span className="text-xl font-bold text-indigo-600">
                            {currency}{price.toFixed(2)}
                        </span>
                        <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                            <FiShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default ProductItem;