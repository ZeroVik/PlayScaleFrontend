import { useNavigate } from 'react-router-dom';

interface ShopButtonProps {
    Id: number;
}

function ShopButton({ Id }: ShopButtonProps) {
    const navigate = useNavigate();

    const handleShopNow = () => {
        navigate(`/product/${Id}`);
    };

    return (
        <button
            onClick={handleShopNow}
            className="px-6 py-3 bg-gray-800 text-white text-sm md:text-base font-medium rounded-md shadow-md hover:bg-gray-700 transition"
        >
            Shop Now
        </button>
    );
}

export default ShopButton;
