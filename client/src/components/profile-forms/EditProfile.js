import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createProfile, getCurrentProfile } from "../../actions/profile";
import { Link, withRouter } from "react-router-dom";
import { set } from "mongoose";

const EditProfile = ({
  profile: { profile, loading },
  createProfile,
  history,
  getCurrentProfile
}) => {
  const [formData, setFormData] = useState({
    company: "",
    website: "",
    location: "",
    status: "",
    skills: "",
    bio: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    toutube: "",
    instagram: ""
  });

  const [displaySocialInputs, toggleSocialInputs] = useState(false);

  useEffect(() => {
    getCurrentProfile();
    setFormData({
      company: loading || !profile.company ? "" : profile.company,
      website: loading || !profile.website ? "" : profile.website,
      location: loading || !profile.location ? "" : profile.location,
      status: loading || !profile.status ? "" : profile.status,
      skills: loading || !profile.skills ? "" : profile.skills.join(","),
      bio: loading || !profile.bio ? "" : profile.bio,
      twitter: loading || !profile.social ? "" : profile.social.twitter,
      facebook: loading || !profile.social ? "" : profile.social.facebook,
      linkedin: loading || !profile.social ? "" : profile.social.linkedin,
      youtube: loading || !profile.social ? "" : profile.social.youtube,
      instagram: loading || !profile.social ? "" : profile.social.instagram
    });
  }, [loading, getCurrentProfile]);

  const {
    company,
    website,
    location,
    status,
    skills,
    bio,
    twitter,
    facebook,
    linkedin,
    youtube,
    instagram
  } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    createProfile(formData, history, true);
  };

  return (
    <Fragment>
      <h1 className="large text-primary">Créer Votre Profile</h1>
      <p className="lead">
        <i className="fas fa-user" /> Veuillez taper vos informations
      </p>
      <small>* = Champs Requis</small>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <select name="status" value={status} onChange={e => onChange(e)}>
            <option value="0">* Selectionnez votre statut</option>
            <option value="Développeur">Développeur</option>
            <option value="Développeur Junior">Développeur Junior</option>
            <option value="Développeur Senior">Développeur Senior</option>
            <option value="Manager">Manager</option>
            <option value="Etudiant">Etudiant</option>
            <option value="Professeur">Professeur</option>
            <option value="Chef de Projet">Chef de Projet</option>
            <option value="Autres">Autres</option>
          </select>
          <small className="form-text">
            Donnez-nous une idée sur votre plan de carrière
          </small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Entreprise"
            name="company"
            value={company}
            onChange={e => onChange(e)}
          />
          <small className="form-text">
            Mentionnez le nom de votre entreprise
          </small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Site Web"
            name="website"
            value={website}
            onChange={e => onChange(e)}
          />
          <small className="form-text">
            Tapez le site web de votre entreprise, sinon le votre !
          </small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Ville"
            name="location"
            value={location}
            onChange={e => onChange(e)}
          />
          <small className="form-text">Où travaillez-vous ?</small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="* Compétences"
            name="skills"
            value={skills}
            onChange={e => onChange(e)}
          />
          <small className="form-text">
            Merci d'utiliser une virgule entre chaque entrée (Ex : HTML,CSS,PHP)
          </small>
        </div>
        <div className="form-group">
          <textarea
            placeholder="Une petite introduction sur vous ?"
            name="bio"
            value={bio}
            onChange={e => onChange(e)}
          />
          <small className="form-text">Parlez de votre plan de carrière</small>
        </div>

        <div className="my-2">
          <button
            onClick={() => toggleSocialInputs(!displaySocialInputs)}
            type="button"
            className="btn btn-light"
          >
            Ajouter vos réseaux sociaux
          </button>
          <span>Optionnel</span>
        </div>

        {displaySocialInputs && (
          <Fragment>
            <div className="form-group social-input">
              <i className="fab fa-twitter fa-2x" />
              <input
                type="text"
                placeholder="Twitter URL"
                name="twitter"
                value={twitter}
                onChange={e => onChange(e)}
              />
            </div>

            <div className="form-group social-input">
              <i className="fab fa-facebook fa-2x" />
              <input
                type="text"
                placeholder="Facebook URL"
                name="facebook"
                value={facebook}
                onChange={e => onChange(e)}
              />
            </div>

            <div className="form-group social-input">
              <i className="fab fa-youtube fa-2x" />
              <input
                type="text"
                placeholder="YouTube URL"
                name="youtube"
                value={youtube}
                onChange={e => onChange(e)}
              />
            </div>

            <div className="form-group social-input">
              <i className="fab fa-linkedin fa-2x" />
              <input
                type="text"
                placeholder="Linkedin URL"
                name="linkedin"
                value={linkedin}
                onChange={e => onChange(e)}
              />
            </div>

            <div className="form-group social-input">
              <i className="fab fa-instagram fa-2x" />
              <input
                type="text"
                placeholder="Instagram URL"
                name="instagram"
                value={instagram}
                onChange={e => onChange(e)}
              />
            </div>
          </Fragment>
        )}

        <input type="submit" className="btn btn-primary my-1" />
        <Link className="btn btn-light my-1" to="/dashboard">
          Retour
        </Link>
      </form>
    </Fragment>
  );
};

EditProfile.propTypes = {
  createProfile: PropTypes.func.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { createProfile, getCurrentProfile }
)(withRouter(EditProfile));
