import { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// import context provider
import { AuthContext } from '../App';

/* Components */
import ErrorAlert from "../components/ErrorAlert";

export default function Login() {
    const API_URL = `${localStorage.API_URL}`;
    const url = `${API_URL}/user/login`;
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useContext(AuthContext);
    const [mfaForm, setMfaForm] = useState(false);
    const [userLoginInit, setUserLoginInit] = useState(false);
    const [inputs, setInputs] = useState({});
    const navigate = useNavigate();

    const HandleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    };

    const HandleClick = () => {
        setMfaForm(!mfaForm);
    }

    useEffect(() => {
        if (!inputs?.session || inputs?.username.length === 0 || inputs?.password.length === 0) {
            setMfaForm(false);
            setUserLoginInit(false);
        }
    }, [inputs]);

    const loginInit = (event) => {
        event.preventDefault();

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({ username: inputs.username, password: inputs.password }),
            })
            .then(res => {
                if (res.ok) { 
                    res.json().then((res) => {
                        setInputs(values => ({...values, [session]: res.session}))
                        setMfaForm(true);
                        setUserLoginInit(true);
                        setError(null);
                    })
                }
                else if (res.status === 400) {
                    throw new Error("Login failed, username and password are required.")
                }
                else if (res.status === 401) {
                    throw new Error("Login failed. Incorrect username or password.")
                }
                else if (res.status === 429) {
                    throw new Error("Login failed - too many attempts.\nPlease try again in a few minutes.")
                }
                else {
                    throw new Error(res?.message || "Login failed unexpectedly.")
                }
            })
            .catch((e) => {
                setError(e);
                setInputs({});
                setMfaForm(false);
                setUserLoginInit(false);
            }
        );
    };

    const loginMfa = (event) => {
        event.preventDefault();

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({ username: inputs.username, password: inputs.password, mfaCode: inputs.mfaCode, session: inputs.session }),
            })
            .then(res => {
                if (res.ok) { 
                    res.json().then((res) => {
                        localStorage.setItem("userEmail", inputs.email);
                        localStorage.setItem("bearerToken", res.bearerToken.token);
                        localStorage.setItem("accessToken", res.accessToken.token);
                        localStorage.setItem("refreshToken", res.refreshToken.token);
                        setAuthenticated(true);
                        setError(null);
                        setMfaForm(false);
                        setUserLoginInit(false);
                        navigate(-1);
                    })
                } else {
                    throw new Error(res?.message || "Login failed unexpectedly.")
                }
            })
            .catch((e) => {
                setError(e);
                setInputs({});
                setMfaForm(false);
                setUserLoginInit(false);
            }
        );
    };

    return (
        <div className="container authenticate">
            <div className="text">{ mfaForm ? "Register":"Log In"}</div>
            <div className="underline"></div>
            <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />
            <form onSubmit={ mfaForm ? loginMfa : loginInit } >
                {
                    userLoginInit ? <div className="alert login">
                        <h2>Almost there!</h2>
                        <p>Please keep this page open and enter the code sent to your email.</p>
                    </div> : null
                }
                {
                    userLoginInit && mfaForm ? 
                    <div className="inputs">
                        <div className="input">
                            <label htmlFor="username">Username:</label>
                            <input id="username" name="username" type="text" 
                                value={inputs?.username || ""}
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
                            <button type="submit" id="submit-button">Request Code</button>
                        </div>
                    </div> :
                    <div className="inputs">
                        <div className="input">
                            <label htmlFor="mfaCode">MFA Code:</label>
                            <input id="mfaCode" name="mfaCode" type="text" 
                                value={inputs?.mfaCode || ""}
                                onChange={HandleChange}
                            />
                        </div>
                        <div className="submit-container">
                            <button type="submit" id="submit-button">Log In</button>
                        </div>
                    </div>
                }
            </form>               
            <div className="subtle">
                <div className="underline"></div>
                <button onClick={HandleClick}>
                    or { mfaForm ? "Request New Code":"Enter MFA Code" }
                </button>
            </div> 
        </div>
    );
}