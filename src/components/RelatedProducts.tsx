import { useEffect, useState } from "react";
import axios from "axios";
import { ProductDTO } from "../types/ProductDTO";

interface RelatedProductsProps {
    category: string;
}

function RelatedProducts({ category }: RelatedProductsProps) {
    const [relatedProducts, setRelatedProducts] = useState<ProductDTO[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await axios.get<ProductDTO[]>(
                    `https://localhost:7263/api/products/related?category=${encodeURIComponent(category)}`
                );
                setRelatedProducts(response.data);
            } catch (err: any) {
                setError("Failed to load related products.");
                console.error(err);
            }
        };

        fetchRelatedProducts();
    }, [category]);

    if (error) {
        return <p className="text-red-500 text-center mt-6">{error}</p>;
    }

    return (
        <div className="related-products my-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Related Products</h2>
                <p className="text-sm text-gray-500">
                    Explore products in the <span className="font-medium">{category}</span> category.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                    <div
                        key={product.id}
                        className="relative group bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                        {/* Product Image */}
                        <div className="overflow-hidden rounded-t-lg">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-36 object-contain bg-gray-100 group-hover:scale-105 transition-transform"
                                style={{ background: "transparent"}}
                            />
                        </div>
                        {/* Product Details */}
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-800 truncate">
                                {product.name}
                            </h3>
                            <p className="text-sm font-semibold text-gray-600 mt-1">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                        {/* Hover Action */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                            <a
                                href={`/product/${product.id}`}
                                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm rounded transition"
                            >
                                View Details
                            </a>
                        </div>
                    </div>
                ))}
            </div>
            {relatedProducts.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-6">
                    No related products found in this category.
                </p>
            )}
        </div>
    );
}

export default RelatedProducts;
