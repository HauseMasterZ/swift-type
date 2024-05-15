import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import "../static/styles/styles.scss";

function Verify() {
  return (
    <div className={`container`}>
      <Header />
      <div className="stats">
        <div className="stat">
          <h1 style={{ marginTop: "15%" }}>
            Verification link has been sent to your email.
          </h1>
          <h1>
            <Link to="/login">Login</Link>
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Verify;
