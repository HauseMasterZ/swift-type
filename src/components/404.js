import React from "react";
import Header from "./Header";
import "../static/styles/styles.scss";
import HamburgerMenu from "./Hamburger";
function NotFound() {
  return (
    <div className={`container`}>
      <Header />
      <HamburgerMenu home="Home" />
      <div className="instruction">
        <h1>404 Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;
