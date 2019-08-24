const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route  GET api/profile/me
// @desc   Get Current Loged Profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "Pas de user pour ce profile" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur Serveur!!");
  }
});

// @route  POST api/profile
// @desc   Create or Update User's Profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Statut est obligatoire !!")
        .not()
        .isEmpty(),
      check("skills", "Compétences est obligatoire")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Créer l'object Profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    // Build Social Array (Facebook ,etc...)
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Modifier
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          {
            $set: profileFields
          },
          {
            new: true
          }
        );
        return res.json(profile);
      }
      // Else, we gonna create a new one
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Erreur du Serveur !!::/");
    }
  }
);

// @route  GET api/profile
// @desc   Get all profiles
// @access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user_id
// @access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "ya pas de profile pour ce user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "ID Erroné" });
    }
    res.status(500).send("Erreur du serveur");
  }
});

// @route  DELETE api/profile
// @desc   Delete profile,user,posts
// @access Private

router.delete("/", auth, async (req, res) => {
  try {
    // Supprimer les post d'un user
    await Post.deleteMany({ user: req.user.id });

    // Supprimer Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Supprimer User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "Utilisateur supprimé!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

// @route  PUT /api/profile/education
// @desc   Add profile education
// @access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School obligatoire!")
        .not()
        .isEmpty(),
      check("degree", "Degree obligatoire!")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field Of Study obligatoire!")
        .not()
        .isEmpty(),
      check("from", "Date obligatoire!")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur du serveur!dd");
    }
  }
);

// @route  Delete /api/profile/education/:edu_id
// @desc   Delete education from profile
// @access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  PUT /api/profile/experience
// @desc   Add profile Experience
// @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Titre obligatoire!")
        .not()
        .isEmpty(),
      check("company", "Entreprise obligatoire!")
        .not()
        .isEmpty(),
      check("from", "Date obligatoire!")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur du serveur!dd");
    }
  }
);

// @route  Delete /api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
