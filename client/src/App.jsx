import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from 'react';

/* Pages */
import Home from "./pages/Home"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Puzzles from './pages/Puzzles';

// context for user authentication
export const AuthContext = createContext();

/* Components */
import Header from "./components/Header";
import ErrorAlert from "./components/ErrorAlert";
import Footer from './components/Footer';

/*  Hooks */
// import useRefreshToken from './hooks/useRefreshToken';


function App() {
    localStorage.setItem("API_URL", `https://api.sokobansolver.cab432.com`);
    const [authenticated, setAuthenticated] = useState(false);
    // const [ isTokensRefreshed, loading, refreshError ] = useRefreshToken();
    const [error, setError] = useState();
    

    function changeAuthenticated(value) {
        setAuthenticated(value);
        if (value === false) {
            localStorage.removeItem("bearerToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userEmail");
        }
    }

    // useEffect(() => {
    //     if (refreshError) {
    //         setError(refreshError);
    //         changeAuthenticated(false);  
    //     }
    //     else if (isTokensRefreshed) {
    //         changeAuthenticated(true);
    //         setError(null);
    //     }
    // }, [loading]);

    return (
        <AuthContext.Provider value={[authenticated, changeAuthenticated]}>
            <BrowserRouter>
                <div className="App">
                    <Header />
                    <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Puzzles" element={<Puzzles />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="/Register" element={<Register />} />
                    </Routes>
                    <Footer />
                </div>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App