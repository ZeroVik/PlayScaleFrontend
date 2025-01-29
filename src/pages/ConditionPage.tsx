import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { ProductDTO } from '../types/ProductDTO';

function ConditionPage() {
    const { type } = useParams<{ type: string }>(); // "second-hand" or "new"
    const { products } = useContext(ShopContext);
    const [filteredProducts, setFilteredProducts] = useState<ProductDTO[]>([]);

    useEffect(() => {
        const filtered = products.filter((product) =>
            type === 'second-hand' ? product.isSecondHand : !product.isSecondHand
        );
        setFilteredProducts(filtered);
    }, [products, type]);

    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <h1 className="font-bold capitalize">{type === 'second-hand' ? 'Second Hand' : 'New'} Products</h1>
                <p className="text-gray-600">Explore our {type === 'second-hand' ? 'second-hand' : 'new'} collection.</p>
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

export default ConditionPage;
