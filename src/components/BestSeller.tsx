import { Link } from 'react-router-dom';
import Title from './Title';


function BestSeller() {
    return (
        <div className="my-10">
            {/* Title Section */}
            <div className="text-center text-3xl py-8">
                <Title text1="SHOP BY" text2="CONDITION" />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Choose between brand new products or explore our second-hand collection.
                </p>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 sm:px-0">
                {/* Second Hand */}
                <Link
                    to={`/condition/second-hand`}
                    className="group relative block overflow-hidden rounded-lg shadow hover:shadow-lg transition"
                >
                    <div className="h-52 sm:h-64 w-full bg-blue-100 flex items-center justify-center rounded-lg">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                            Second Hand
                        </h3>
                    </div>
                </Link>

                {/* New */}
                <Link
                    to={`/condition/new`}
                    className="group relative block overflow-hidden rounded-lg shadow hover:shadow-lg transition"
                >
                    <div className="h-52 sm:h-64 w-full bg-green-100 flex items-center justify-center rounded-lg">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition">
                            New
                        </h3>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default BestSeller;
