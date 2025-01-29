import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { ProductDTO } from '../types/ProductDTO';

function CategoryPage() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { products } = useContext(ShopContext);
    const [filteredProducts, setFilteredProducts] = useState<ProductDTO[]>([]);

    useEffect(() => {
        const filtered = products.filter((product) => product.categoryId === Number(categoryId));
        setFilteredProducts(filtered);
    }, [products, categoryId]);

    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <h1 className="font-bold">Category: {categoryId}</h1>
                <p className="text-gray-600">Browse products from this category.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {filteredProducts.map((item) => (
                    <ProductItem
                        key={item.id}
                        id={item.id}
                        image={item.imageUrl}
                        name={item.name}
                        price={item.price}
                    />
                ))}
            </div>
        </div>
    );
}

export default CategoryPage;
