import { motion } from "framer-motion";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const [orderNumber, setOrderNumber] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching an order number
        const fakeOrderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        setOrderNumber(fakeOrderNumber);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 p-6"
        >
            {/* Animated Card */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white p-8 rounded-3xl shadow-lg text-center w-full max-w-md"
            >
                {/* Checkmark Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                    className="flex items-center justify-center text-green-500"
                >
                    <FiCheckCircle size={80} />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Confirmed!</h2>
                <p className="text-gray-600 mt-2">Thank you for your purchase. Your order is being processed.</p>

                {/* Order Number */}
                {orderNumber && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 bg-gray-100 text-gray-700 p-3 rounded-md text-sm"
                    >
                        Order Number: <span className="font-semibold">{orderNumber}</span>
                    </motion.div>
                )}

                {/* Button to go back */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/collection")}
                    className="mt-6 px-6 py-3 flex items-center gap-2 justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                    <FiShoppingBag size={20} />
                    Back to Shop
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default OrderConfirmation;
