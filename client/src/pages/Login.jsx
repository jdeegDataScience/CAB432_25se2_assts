import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';

// import context provider
import { AuthContext } from '../App';

/* Components */
import ErrorAlert from "../components/ErrorAlert";

export default function Login() {
    const API_URL = `${localStorage.API_URL}`;
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useContext(AuthContext);
    const [registerForm, setRegisterForm] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);
    const [inputs, setInputs] = useState({});
    const navigate = useNavigate();

    const HandleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    };

    const HandleClick = () => {
        setRegisterForm(!registerForm);
    }

    const loginUser = (event) => {
        event.preventDefault();
        const url = `${API_URL}/user/login`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({ email: inputs.email, password: inputs.password }),
            })
            .then(res => {
                if (res.ok) { 
                    res.json().then((res) => {
                        localStorage.setItem("userEmail", inputs.email);
                        localStorage.setItem("bearerToken", res.bearerToken.token);
                        localStorage.setItem("refreshToken", res.refreshToken.token);
                        setAuthenticated(true);
                        setError(null);
                        navigate(-1);
                    })
                }
                else if (res.status === 400) {
                    throw new Error("Login failed, both email and password are required.")
                }
                else if (res.status === 401) {
                    throw new Error("Login failed. Incorrect email address or password.")
                }
                else if (res.status === 429) {
                    throw new Error("Login failed - too many attempts.\nPlease try again in a few minutes.")
                }
                else {
                    throw new Error("Login failed unexpectedly.")
                }
            })
            .catch((e) => {
                setError(e);
                setInputs({});
            }
        );
    };

    const registerUser = (event) => {
        event.preventDefault();
        const url = `${API_URL}/user/register`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: inputs.email, password: inputs.password }),
            })
            .then(res => {
                if (res.status === 201) { 
                    setRegisterForm(false);
                    setUserRegistered(true);
                }
                else if (res.status === 400) {
                    throw new Error("Registration failed: both email and password are required.")
                }
                else if (res.status === 409) {
                    throw new Error("Registration failed: User with that email address already exists.")
                }
                else if (res.status === 429) {
                    throw new Error("Registration failed: Too many attempts - please try again in a few minutes.")
                }
                else {
                    throw new Error("Registration failed unexpectedly.")
                }
            })
            .then(() => { 
                setError(null);
                setInputs({ "email": inputs.email, "password": null});
            })
            .catch((e) => {
                setError(e);
                setInputs({});
            }
        );
    };

    return (
        <div className="container authenticate">
            <div className="text">{ registerForm ? "Register":"Log In"}</div>
            <div className="underline"></div>
            <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />
            <form onSubmit={ registerForm ? registerUser : loginUser } >
                {
                    userRegistered ? <div className="alert login">
                        <h2>Registration Successful!</h2>
                        <p>Please login to access all features</p>
                    </div> : null
                }
                <div className="inputs">
                    <div className="input">
                        <label htmlFor="email">Email Address:</label>
                        <input id="email" name="email" type="email" 
                            value={inputs?.email || ""}
                            onChange={HandleChange}
                        />
                    </div>
                    <div className="input">
                        <label htmlFor="password">Password:</label>
                        <input id="password" name="password" type="password"
                            value={inputs?.password || ""}
                            onChange={HandleChange}
                        />
                    </div>
                    <div className="submit-container">
                        <button type="submit" id="submit-button">
                        { registerForm ? "Register":"Log In"}
                        </button>
                    </div>
                </div>
            </form>
            {
                    userRegistered ? null : 
                    <div className="subtle">
                        <div className="underline"></div>
                        <button onClick={HandleClick}>
                            or { registerForm ? "Log In":"Register" }
                        </button>
                    </div> 
                }
        </div>
    );
}