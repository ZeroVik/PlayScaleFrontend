import { assets } from '../assets/assets';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAdmin, refreshAuthState } = useAuth();
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        refreshAuthState();
        navigate('/login');
    };

    return (
        <nav className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-md">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img className="w-12" src={assets.logo} alt="Logo" />
                    <span className="text-xl font-bold hidden sm:block tracking-wide">PlayScale</span>
                </Link>

                {/* Desktop Links */}
                <ul className="hidden sm:flex gap-8 font-medium">
                    {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item, index) => (
                        <NavLink
                            key={index}
                            to={`/${item.toLowerCase()}`}
                            className="hover:text-yellow-300 transition duration-300"
                        >
                            {item}
                        </NavLink>
                    ))}
                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className="hover:text-yellow-300 transition duration-300"
                        >
                            ADMIN
                        </NavLink>
                    )}
                </ul>

                {/* Desktop Icons */}
                <div className="hidden sm:flex items-center gap-4">
                    {/* Search Icon */}
                    <img
                        onClick={() => navigate('/collection')}
                        className="w-6 cursor-pointer hover:scale-110 transition duration-300"
                        src={assets.search_icon}
                        alt="Search"
                    />
                    {/* Profile Dropdown */}
                    <div className="relative group">
                        <img
                            onClick={() => navigate('/login')} // Ensure this navigates to the login page
                            className="w-6 cursor-pointer hover:scale-110 transition duration-300"
                            src={assets.profile_icon}
                            alt="Profile"
                        />
                        {/* Dropdown Menu */}
                        <div
                            className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white text-gray-800 shadow-lg rounded-md z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                        >
                            <p
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition duration-300"
                                onClick={() => navigate('/profile')} // Navigate to the profile page
                            >
                                My Profile
                            </p>
                            <p
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition duration-300"
                                onClick={() => navigate('/orders')} // Navigate to the orders page
                            >
                                Orders
                            </p>
                            <p
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition duration-300"
                                onClick={handleLogout} // Logs out and navigates to the login page
                            >
                                Logout
                            </p>
                        </div>
                    </div>

                    {/* Cart Icon */}
                    <Link to="/cart">
                        <img
                            className="w-6 cursor-pointer hover:scale-110 transition duration-300"
                            src={assets.cart_icon}
                            alt="Cart"
                        />
                    </Link>
                </div>

                {/* Mobile Menu Icon */}
                <img
                    onClick={() => setVisible(true)}
                    className="w-8 cursor-pointer sm:hidden"
                    src={assets.menu_icon}
                    alt="Menu"
                />
            </div>

            {/* Mobile Side Menu */}
            {visible && (
                <div className="fixed top-0 left-0 w-3/4 h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg z-50 p-6">
                    {/* Close Button */}
                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-4 right-4 text-2xl font-bold"
                    >
                        ✕
                    </button>
                    <ul className="flex flex-col gap-6 mt-12 text-lg font-medium">
                        {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item, index) => (
                            <NavLink
                                key={index}
                                to={`/${item.toLowerCase()}`}
                                className="hover:text-yellow-300 transition duration-300"
                                onClick={() => setVisible(false)}
                            >
                                {item}
                            </NavLink>
                        ))}
                        {isAdmin && (
                            <NavLink
                                to="/admin"
                                className="hover:text-yellow-300 transition duration-300"
                                onClick={() => setVisible(false)}
                            >
                                ADMIN
                            </NavLink>
                        )}
                        <div className="flex flex-col gap-4 mt-4">
                            <NavLink
                                to="/profile"
                                className="hover:text-yellow-300 transition duration-300"
                                onClick={() => setVisible(false)}
                            >
                                My Profile
                            </NavLink>
                            <NavLink
                                to="/orders"
                                className="hover:text-yellow-300 transition duration-300"
                                onClick={() => setVisible(false)}
                            >
                                Orders
                            </NavLink>
                            <p
                                className="cursor-pointer hover:text-yellow-300 transition duration-300"
                                onClick={() => {
                                    setVisible(false);
                                    handleLogout();
                                }}
                            >
                                Logout
                            </p>
                        </div>
                        <NavLink
                            to="/cart"
                            className="hover:text-yellow-300 transition duration-300"
                            onClick={() => setVisible(false)}
                        >
                            Cart
                        </NavLink>
                        <p
                            className="cursor-pointer hover:text-yellow-300 transition duration-300"
                            onClick={() => {
                                setVisible(false);
                                navigate('/collection');
                            }}
                        >
                            Search
                        </p>
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
