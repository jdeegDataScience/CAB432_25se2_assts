import { useState, useEffect } from "react";

/* Components */
import ErrorAlert from "../components/ErrorAlert";

export default function Register() {
    const [error, setError] = useState(null);
    const [registerForm, setRegisterForm] = useState(true);
    const [userRegistered, setUserRegistered] = useState(false);
    const [userConfirmed, setUserConfirmed] = useState(false);
    const [inputs, setInputs] = useState({});

    const HandleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    };

    const HandleClick = () => {
        setRegisterForm(!registerForm);
    }

    useEffect(() => {
        if (inputs?.username?.length === 0 || inputs?.password?.length === 0) {
            setRegisterForm(true);
        }
    }, [inputs]);

    const registerUser = (event) => {
        event.preventDefault();
        const url = `${localStorage.API_URL}/user/register`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: inputs.email, username: inputs.username, password: inputs.password }),
            })
            .then(res => {
                if (res.status === 201) { 
                    setRegisterForm(false);
                    setUserRegistered(true);
                    setUserConfirmed(false);
                }
                else if (res.status === 400) {
                    throw new Error("Registration failed: email, username, and password are required.")
                }
                else if (res.status === 409) {
                    throw new Error("Registration failed: User already exists.")
                }
                else if (res.status === 429) {
                    throw new Error("Registration failed: Too many attempts - please try again in a few minutes.")
                }
                else {
                    throw new Error(res?.message || "Registration failed unexpectedly.")
                }
            })
            .then(() => { 
                setError(null);
                // setInputs({ "email": inputs.email, "username": inputs.username, "password": null});
            })
            .catch((e) => {
                setError(e);
                setInputs({});
            }
        );
    };

    const confirmUser = (event) => {
        event.preventDefault();
        const url = `${localStorage.API_URL}/user/confirm`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: inputs.email, username: inputs.username, code: inputs.code }),
            })
            .then(res => {
                if (res.status === 201) {
                    setUserConfirmed(true);
                }
                else if (res.status === 400) {
                    throw new Error("Confirmation failed: email, username, and code are required.");
                } else {
                    throw new Error(res?.message || "Confirmation failed unexpectedly.");
                }
            })
            .then(() => { 
                setError(null);
                setInputs({});
            })
            .catch((e) => {
                setError(e);
                setInputs({});
            }
        );
    };

    return (
        <div className="container authenticate">
            <div className="text">{ registerForm ? "Register New User":"Confirm Registration"}</div>
            <div className="underline"></div>
            <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />
            <form onSubmit={ registerForm ? registerUser : confirmUser } >
                {
                    userRegistered && !userConfirmed ? <div className="alert login">
                        <h2>Registration Successful!</h2>
                        <p>Please confirm your account with the code sent to your email</p>
                    </div> : null
                }
                {
                    userConfirmed ? <div className="alert login">
                        <h2>Confirmation Successful!</h2>
                        <Link to="/login">Please login to access all features</Link>
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
                        <label htmlFor="username">Username:</label>
                        <input id="username" name="username" type="text" 
                            value={inputs?.username || ""}
                            onChange={HandleChange}
                        />
                    </div>
                    { registerForm ? 
                        <div className="input">
                            <label htmlFor="password">Password:</label>
                            <input id="password" name="password" type="password"
                                value={inputs?.password || ""}
                                onChange={HandleChange}
                            />
                        </div> : 
                        <div className="input">
                            <label htmlFor="code">Confirmation Code:</label>
                            <input id="code" name="code" type="text"
                                value={inputs?.code || ""}
                                onChange={HandleChange}
                            />
                        </div>
                    }
                    <div className="submit-container">
                        <button type="submit" id="submit-button">
                        { registerForm ? "Register":"Confirm Account" }
                        </button>
                    </div>
                </div>
            </form>
            {
                userRegistered ? null : 
                <div className="subtle">
                    <div className="underline"></div>
                    <button onClick={HandleClick}>
                        or { registerForm ? "Confirm Account with Code":"Register New User" }
                    </button>
                </div> 
            }
        </div>
    );
}