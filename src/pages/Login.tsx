import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [currentState, setCurrentState] = useState<"Login" | "Sign Up">("Login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { refreshAuthState } = useAuth(); // Use the refresh function from AuthContext

    const onSubmitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (currentState === "Login") {
                const response = await axios.post("https://localhost:7263/api/Auth/login", {
                    email,
                    password,
                });

                console.log("Login successful:", response.data);

                // Save token in localStorage
                localStorage.setItem("token", response.data.token);

                // Refresh authentication state
                refreshAuthState();

                // Redirect to profile page
                navigate("/profile");
            } else {
                const response = await axios.post("https://localhost:7263/api/Auth/register", {
                    firstName,
                    lastName,
                    email,
                    password,
                });

                console.log("Sign-up successful:", response.data);
                setSuccessMessage("Registration successful! Redirecting to login...");
                setTimeout(() => setCurrentState("Login"), 3000);
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
        >
            <div className="inline-flex items-center gap-2 mb-2 mt-10">
                <p className="prata-regular text-3xl">{currentState}</p>
                <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            {currentState === "Sign Up" && (
                <>
                    <input
                        className="w-full px-3 py-2 border border-gray-800"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        className="w-full px-3 py-2 border border-gray-800"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </>
            )}
            <input
                className="w-full px-3 py-2 border border-gray-800"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                className="w-full px-3 py-2 border border-gray-800"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <div className="w-full flex justify-between text-sm mt-[-8px]">
                <p className="cursor-pointer">Forgot your password?</p>
                {currentState === "Login" ? (
                    <p onClick={() => setCurrentState("Sign Up")} className="cursor-pointer">
                        Create account
                    </p>
                ) : (
                    <p onClick={() => setCurrentState("Login")} className="cursor-pointer">
                        Login here
                    </p>
                )}
            </div>
            <button type="submit" className="bg-black text-white font-light px-8 py-2 mt-4">
                {currentState === "Login" ? "Sign in" : "Sign up"}
            </button>
        </form>
    );
}

export default Login;
