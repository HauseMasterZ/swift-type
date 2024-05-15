import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import Header from "./Header";
import "../static/styles/styles.scss";
import HamburgerMenu from "./Hamburger";
import LoadingSpinner from "./LoadingSpinner";
function Forgot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");
  const emailRef = useRef();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const usernameQuery = query(
        collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME),
        where(process.env.REACT_APP_USERNAME_KEY, "==", email)
      );
      const emailQuery = query(
        collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME),
        where(process.env.REACT_APP_EMAIL_KEY, "==", email)
      );
      const [, emailDoc] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(emailQuery),
      ]);
      if (emailDoc.size === 0) {
        alert("Email doesnt exist");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/");
      } else {
        return;
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className={`container`}>
      <Header toBeFocusedRef={emailRef} />
      <HamburgerMenu home="Home" />
      {isLoading ? <LoadingSpinner /> : ""}
      {!isSent ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
            <label htmlFor="username-email">Email:</label>
            <input
              type="text"
              id="username-email"
              ref={emailRef}
              name="username-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="Username or Email"
            />
            <button type="submit" className="button">
              Submit
            </button>
          </form>
          <div className="login-link-container">
            <Link to="/login" className="login-link">
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <div className="stats">
          <div className="stat">
            <h1 style={{ marginTop: "15%" }}>
              Password reset link has been sent to your email.
            </h1>
            <h1>
              <Link to="/login">Login</Link>
            </h1>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forgot;
