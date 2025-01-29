import { useEffect, useState } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { ProductDTO } from "../types/ProductDTO"; // Assuming you have a ProductDTO type
import axios from "axios";

function LatestCollection() {
    const [latestProducts, setLatestProducts] = useState<ProductDTO[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get<ProductDTO[]>("https://localhost:7263/api/products");
                setLatestProducts(response.data.slice(0, 5)); // Get the first 10 products
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="my-10">
            <div className="text-center py-8 text-3xl">
                <Title text1="LATEST" text2="PRODUCTS" />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {latestProducts.map((item) => (
                    <ProductItem
                        key={item.id} // Use `id` instead of `_id` since you're using ProductDTO
                        id={item.id}
                        image={item.imageUrl} // Use `imageUrl` instead of `image`
                        name={item.name}
                        price={item.price}
                    />
                ))}
            </div>
        </div>
    );
}

export default LatestCollection;
