import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../static/styles/styles.scss";
import Header from "./Header";
import HamburgerMenu from "./Hamburger";
import LoadingSpinner from "./LoadingSpinner";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef();
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        alert("Please verify your email before logging in");
        await signOut(auth);
        setIsLoading(false);
        return;
      }
      toast.success("Login successful");
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.emailVerified) {
          navigate("/");
          return;
        } else {
          return;
        }
      });
    } catch (error) {
      console.error(error);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className={`container`}>
      <Header toBeFocusedRef={emailRef} />
      <HamburgerMenu home="Home" signup="Signup" />
      {isLoading ? <LoadingSpinner /> : ""}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <label htmlFor="username">Email:</label>
          <input
            type="email"
            id="username"
            name="username"
            value={email}
            placeholder="Username or Email"
            ref={emailRef}
            onChange={handleUsernameChange}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={handlePasswordChange}
            required
          />
          <button className="button" type="submit">
            Login
          </button>
        </form>
        <p>
          <Link to="/forgot">Forgot Password?</Link>
        </p>
        <p>
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
