import { useState, useEffect } from "react";
import axios from "axios";
import ShopButton from "./ShopNowButton.tsx";
import type { ProductDTO } from "../types/ProductDTO";

function Hero() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get<ProductDTO[]>(
                    "https://localhost:7263/api/products"
                );
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 5000); // Automatically change slide every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [products]);

    const handleCircleClick = (index: number) => {
        setCurrentIndex(index);
    };

    const currentProduct = products[currentIndex];

    return (
        <div className="relative pt-32 max-w-6xl mx-auto px-4 py-10">
            {products.length === 0 ? (
                <p className="text-center text-gray-500">Loading products...</p>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8 rounded-lg overflow-hidden shadow-lg">
                    {/* Left Side Content */}
                    {currentProduct && (
                        <div className="w-full sm:w-1/2 p-6">
                            <div className="text-[#414141] space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 md:w-11 h-[2px] bg-[#414141]"></span>
                                    <p className="font-medium text-sm md:text-base uppercase text-gray-600">
                                        Newest products
                                    </p>
                                </div>
                                <h1 className="text-3xl sm:py-2 lg:text-5xl font-bold text-gray-800">
                                    {currentProduct.name}
                                </h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Price: ${currentProduct.price.toFixed(2)}
                                </p>
                                <p className="text-sm md:text-base text-gray-500">
                                    Category: {currentProduct.categoryName}
                                </p>
                                <ShopButton Id={currentProduct.id} />
                            </div>
                        </div>
                    )}
                    {/* Right Side Image */}
                    {currentProduct && (
                        <div className="w-full sm:w-1/2 flex justify-center">
                            <img
                                className="max-h-80 object-contain"
                                src={currentProduct.imageUrl}
                                alt={currentProduct.name}
                            />
                        </div>
                    )}
                </div>
            )}
            {/* Navigation Circles */}
            {products.length > 0 && (
                <div className="flex justify-center mt-6 gap-2">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleCircleClick(index)}
                            className={`w-4 h-4 rounded-full ${
                                index === currentIndex
                                    ? "bg-gray-800"
                                    : "bg-gray-300 hover:bg-gray-400"
                            } transition duration-300`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Hero;
