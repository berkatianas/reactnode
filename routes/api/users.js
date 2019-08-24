const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const config = require("config");
const { check, validationResult } = require("express-validator/check");

// Importer model
const User = require("../../models/User");

// @route  POST api/route
// @desc   Register User
// @access Public
router.post(
  "/",
  [
    check("name", "Nom est requis")
      .not()
      .isEmpty(),
    check("email", "Please ajouter un email valide").isEmail(),
    check("password", "Please entrez un mot de passe > 6").isLength({
      min: 6,
      max: 30
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user Exist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Utilisateur déjà existant !" }] });
      }
      // Get User Gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Return Jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur du Serveur :(");
    }
  }
);

module.exports = router;
