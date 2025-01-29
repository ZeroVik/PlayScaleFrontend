import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
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

function Product() {
    const { productId } = useParams<{ productId: string }>();
    const { products, currency, userId } = useContext(ShopContext); // Added userId from context
    const [productData, setProductData] = useState<ProductDTO | null>(null);

    useEffect(() => {
        const fetchedProduct = (products as ProductDTO[]).find(
            (item: ProductDTO) => item.id === Number(productId)
        );
        if (fetchedProduct) {
            setProductData(fetchedProduct);
        }
    }, [productId, products]);

    if (!productData) {
        return (
            <div className="opacity-0">
                <p>Loading product...</p>
            </div>
        );
    }

    return (
        <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
            <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
                {/* Product Image */}
                <div className="flex-1 flex justify-center">
                    <img
                        className="max-h-80 object-contain"
                        src={productData.imageUrl}
                        alt={productData.name}
                    />
                </div>
                {/* Product Details */}
                <div className="flex-1">
                    <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
                    <p className="mt-5 text-3xl font-medium">
                        {currency}
                        {productData.price.toFixed(2)}
                    </p>
                    <p className="mt-5 text-gray-500">Category: {productData.categoryName}</p>
                    <p className="mt-3 text-gray-500">
                        {productData.isSecondHand ? "Condition: Second-hand" : "Condition: New"}
                    </p>
                    {/* Add to Cart Button */}
                    <AddToCartButton
                        productId={productData.id}
                        price={productData.price}
                        userId={userId} // Pass the userId dynamically
                    />
                </div>
            </div>
            {/* Related Products */}
            <RelatedProducts category={productData.categoryName} />
        </div>
    );
}

export default Product;
