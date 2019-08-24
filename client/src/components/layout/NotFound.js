import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Fragment>
      <h1 className="x-large text-primary">
        <i className="fas fa-exclamation-triangle" />
        Page Introuvable
      </h1>
      <p className="large">Désolé,cette page est introuvable !</p>
      <center>
        <Link to="/" className="btn btn-dark">
          Retour à l'accueil
        </Link>
      </center>
    </Fragment>
  );
};

export default NotFound;
