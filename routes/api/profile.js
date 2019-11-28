const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, resp) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return resp
        .status(400)
        .json({ msg: 'There is no profile for this user' });
    }

    resp.json(profile);
  } catch (err) {
    console.log(err.message);
    resp.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    check('status', 'Status is required')
      .not()
      .isEmpty(),
    check('skills', 'Skills is required')
      .not()
      .isEmpty()
  ],
  async (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return resp.status(400).json({ errors: errors.array() });
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

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return resp.json(profile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      resp.json(profile);
    } catch (err) {
      console.log(err.message);
      resp.status(500).send('Server error');
    }
  }
);

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async (_, resp) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    resp.json(profiles);
  } catch (err) {
    console.log(err.message);
    resp.status(500).send('Server error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, resp) => {
  try {
    const userId = req.params.user_id;
    const profile = await Profile.findOne({ user: userId }).populate('user', [
      'name',
      'avatar'
    ]);

    if (!profile) {
      return resp.status(400).json({ msg: 'Profile not found' });
    }

    resp.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return resp.status(400).json({ msg: 'Profile not found' });
    }

    resp.status(500).send('Server error');
  }
});

// @route   DELETE api/profile/
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, resp) => {
  try {
    //TODO: Remove users posts
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    resp.json({ msg: 'User deleted' });
  } catch (err) {
    console.log(err.message);
    resp.status(500).send('Server error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      resp.status(400).json({ errors: errors.array() });
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

      resp.json(profile);
    } catch (err) {
      console.log(err.message);
      resp.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, resp) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex != -1) {
      profile.experience.splice(removeIndex, 1);
    }

    await profile.save();

    resp.json(profile);
  } catch (err) {
    console.log(err.message);
    resp.status(500).send('Server error');
  }
});

module.exports = router;
