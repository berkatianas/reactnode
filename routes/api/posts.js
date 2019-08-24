const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route  GET api/posts
// @desc   Create a Post
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Comentaire obligatoire")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur Server");
    }
  }
);

// @route  GET api/posts
// @desc   Get All Post
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur Server");
  }
});

// @route  GET api/posts/:id
// @desc   Get Post by ID
// @access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Non trouvé" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Non trouvé" });
    }
    res.status(500).send("Erreur Server");
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete post
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Introuvé" });
    }

    // Vérifier User
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Vous n'avez pas ce droit !" });
    }
    await post.remove();
    res.json({ msg: "Post Supprimé !" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Introuvé" });
    }
    res.status(500).send("Erreur Server");
  }
});

// @route  PUT api/posts/like/:id
// @desc   Add like to a POST
// @access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Vérifier si le post est liké ou pas
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post déja liké !" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Erreur du Serveur");
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Add like to a POST
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Vérifier si le post est liké ou pas
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post pas encore liké !" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Erreur du Serveurxxx");
  }
});

// @route  POST api/posts/comment/:id
// @desc   Comment on a Post
// @access Private
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Comentaire obligatoire")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur Server");
    }
  }
);

// @route  DELETE api/posts/comment/:id/comment_id
// @desc   Delete Comment
// @access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment Exists
    if (!comment) {
      return res.status(404).json({ msg: "Commentaire not found :(" });
    }

    // Check User
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Vous ne disposez pas de droit pour le faire" });
    }

    // Get remove Index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur Server");
  }
});

module.exports = router;
