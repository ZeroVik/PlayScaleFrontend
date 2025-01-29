import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

interface ProductItemProps {
    id: number; // Assuming `id` is a number based on ProductDTO
    image: string; // Image URL as a string
    name: string;
    price: number;
}

function ProductItem({ id, image, name, price }: ProductItemProps) {
    const { currency } = useContext(ShopContext);

    return (
        <Link
            to={`/product/${id}`} // Navigate to the product page with the product's ID
            className="group relative block overflow-hidden rounded-lg shadow hover:shadow-lg"
        >
            {/* Product Image */}
            <div className="h-52 sm:h-64 w-full flex items-center justify-center">
                <img
                    src={image}
                    alt={name}
                    className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
                />
            </div>

            {/* Product Details */}
            <div className="relative border border-gray-100 bg-white p-4 sm:p-6">
                <p className="text-gray-700 font-medium">
                    {currency}
                    {price.toFixed(2)}
                </p>
                <h3 className="mt-1.5 text-base sm:text-lg font-medium text-gray-900">
                    {name}
                </h3>
            </div>
        </Link>
    );
}

export default ProductItem;
