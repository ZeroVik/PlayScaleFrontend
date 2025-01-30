import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Cart from './pages/Cart';
import Product from './pages/Product';
import Footer from './components/Footer';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryPage from "./pages/CategoryPage.tsx";
import BestSeller from "./components/BestSeller.tsx";
import ConditionPage from "./pages/ConditionPage.tsx";
import Profile from "./components/Profile.tsx";
import OrderPage from "./pages/OrderPage.tsx";
import CreateProduct from "./pages/CreateProduct.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";

const App: React.FC = () => {
    return (
        <>
            <AuthProvider>


            <ToastContainer />
            {/* Navbar placed outside the padding container */}
            <Navbar />
            {/* Content with padding */}
            <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
                <SearchBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contacts />} />
                    <Route path="/product/:productId" element={<Product />} />
                    <Route path="/" element={<BestSeller />} />
                    <Route path="/condition/:type" element={<ConditionPage />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/category/:categoryId" element={<CategoryPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order" element={<OrderPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/create-product" element={<CreateProduct />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/place-order" element={<PlaceOrder />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                </Routes>
            </div>
            <Footer />
            </AuthProvider>
        </>
    );
};

export default App;
