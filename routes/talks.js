const express = require("express");
const { body, validationResult } = require("express-validator");
const { auth, speakerOnly, organizerOnly } = require("../middleware/auth");
const Talk = require("../models/Talk");
const User = require("../models/User");

const router = express.Router();

// @route   POST api/talks
// @desc    Submit a talk
// @access  Private (Speaker)
router.post(
  "/",
  [
    auth,
    speakerOnly,
    [
      body("title", "Title is required").not().isEmpty(),
      body("abstract", "Abstract is required").not().isEmpty(),
      body("duration", "Duration must be a number").optional().isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, abstract, duration, notes } = req.body;

    try {
      const newTalk = new Talk({
        title,
        abstract,
        duration,
        notes,
        speaker: req.user.id,
      });

      const talk = await newTalk.save();
      res.json(talk);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/talks
// @desc    Get all talks based on user role
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let talks;
    if (req.user.role === "organizer") {
      // Organizers get all talks, populated with speaker details
      talks = await Talk.find().populate("speaker", ["name", "email"]);
    } else if (req.user.role === "speaker") {
      // Speakers get only their talks
      talks = await Talk.find({ speaker: req.user.id }).populate("speaker", [
        "name",
        "email",
      ]);
    } else {
      // Attendees and other users get only approved talks
      talks = await Talk.find({ status: "approved" }).populate("speaker", [
        "name",
        "email",
      ]);
    }
    res.json(talks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/talks/:id
// @desc    Get talk by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const talk = await Talk.findById(req.params.id).populate("speaker", [
      "name",
      "email",
    ]);

    if (!talk) {
      return res.status(404).json({ msg: "Talk not found" });
    }

    res.json(talk);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Talk not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/talks/:id
// @desc    Update a talk
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const { title, abstract, duration, notes, status } = req.body;

  try {
    let talk = await Talk.findById(req.params.id);

    if (!talk) {
      return res.status(404).json({ msg: "Talk not found" });
    }

    const isOrganizer = req.user.role === "organizer";
    const isOwner = talk.speaker.toString() === req.user.id;

    if (!isOrganizer && !isOwner) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Speakers can only update their talks if pending
    if (isOwner && talk.status !== "pending" && !isOrganizer) {
      return res
        .status(403)
        .json({ msg: "Talk cannot be updated once it has been reviewed." });
    }

    // Organizers can update anything, Speakers can update content fields
    if (title) talk.title = title;
    if (abstract) talk.abstract = abstract;
    if (duration) talk.duration = duration;
    if (notes) talk.notes = notes;

    // Only organizers can change the status
    if (status && isOrganizer) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ msg: "Invalid status" });
      }
      talk.status = status;
    }

    talk = await talk.save();
    res.json(talk);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/talks/:id
// @desc    Delete a talk
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const talk = await Talk.findById(req.params.id);

    if (!talk) {
      return res.status(404).json({ msg: "Talk not found" });
    }

    const isOrganizer = req.user.role === "organizer";
    const isOwner = talk.speaker.toString() === req.user.id;

    if (!isOrganizer && !isOwner) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // A speaker can only delete if the talk is pending
    if (isOwner && talk.status !== "pending" && !isOrganizer) {
      return res
        .status(403)
        .json({ msg: "Talk cannot be deleted once it has been reviewed." });
    }

    await talk.deleteOne();

    res.json({ msg: "Talk removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Talk not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
