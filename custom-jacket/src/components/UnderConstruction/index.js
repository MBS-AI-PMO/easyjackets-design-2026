import React from "react";
import logo from "../../assets/images/Header-logo.webp";
import "./styles.scss";

const UnderConstruction = ({ message = "The site is under construction" }) => {
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = "The site is under construction | Easy Jackets";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="cjd-under-construction" aria-labelledby="cjd-under-construction-title">
      <div className="cjd-under-construction__inner">
        <img src={logo} alt="Easy Jackets" className="cjd-under-construction__logo" />
        <span className="cjd-under-construction__label">Updating Easy Jackets</span>
        <h1 id="cjd-under-construction-title">{message}</h1>
        <p>We are applying a site update right now. The designer will return automatically when deployment is complete.</p>
        <div className="cjd-under-construction__bar" aria-hidden="true" />
      </div>
    </main>
  );
};

export default UnderConstruction;
