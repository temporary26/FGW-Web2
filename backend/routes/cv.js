import express from 'express';
import { body, validationResult } from 'express-validator';
import CV from '../models/CV.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's CV data
// @route   GET /api/cv
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cv = await CV.findOne({ user: req.user.id });
    
    // If no CV exists, create a default one
    if (!cv) {
      cv = await CV.create({
        user: req.user.id,
        personalDetails: {
          fullName: '',
          phone: '',
          email: '',
          address: ''
        },
        about: {
          profile: ''
        },
        education: [{
          institution: '',
          qualification: '',
          time: ''
        }],
        workExperience: [{
          company: '',
          position: '',
          time: ''
        }],
        skills: [],
        interests: [],
        projects: [{
          name: '',
          description: '',
          languages: ''
        }]
      });
    }

    res.status(200).json({
      success: true,
      data: cv
    });
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching CV data'
    });
  }
});

// @desc    Create or update user's CV data
// @route   POST /api/cv
// @access  Private
router.post('/', protect, [
  body('personalDetails.fullName')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 100) {
        throw new Error('Full name must be less than 100 characters');
      }
      return true;
    }),
  body('personalDetails.phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 20) {
        throw new Error('Phone must be less than 20 characters');
      }
      return true;
    }),
  body('personalDetails.email')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '' || !value) {
        return true; // Allow empty string
      }
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        throw new Error('Please enter a valid email');
      }
      return true;
    }),
  body('personalDetails.address')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 200) {
        throw new Error('Address must be less than 200 characters');
      }
      return true;
    }),
  body('about.profile')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 1000) {
        throw new Error('Profile must be less than 1000 characters');
      }
      return true;
    }),
  body('education')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Education must be an array');
      }
      return true;
    }),
  body('workExperience')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Work experience must be an array');
      }
      return true;
    }),
  body('skills')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Skills must be an array');
      }
      return true;
    }),
  body('interests')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Interests must be an array');
      }
      return true;
    }),
  body('projects')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Projects must be an array');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('CV validation errors:', errors.array());
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      personalDetails,
      about,
      education,
      workExperience,
      skills,
      interests,
      projects
    } = req.body;

    // Find existing CV or create new one
    let cv = await CV.findOne({ user: req.user.id });

    if (cv) {
      // Update existing CV
      cv.personalDetails = personalDetails || cv.personalDetails;
      cv.about = about || cv.about;
      cv.education = education || cv.education;
      cv.workExperience = workExperience || cv.workExperience;
      cv.skills = skills || cv.skills;
      cv.interests = interests || cv.interests;
      cv.projects = projects || cv.projects;
      
      try {
        await cv.save();
      } catch (saveError) {
        console.error('Error saving existing CV:', saveError);
        return res.status(400).json({
          success: false,
          message: 'Error saving CV data',
          error: saveError.message
        });
      }
    } else {
      // Create new CV
      try {
        cv = await CV.create({
          user: req.user.id,
          personalDetails: personalDetails || {
            fullName: '',
            phone: '',
            email: '',
            address: ''
          },
          about: about || {
            profile: ''
          },
          education: education || [{
            institution: '',
            qualification: '',
            time: ''
          }],
          workExperience: workExperience || [{
            company: '',
            position: '',
            time: ''
          }],
          skills: skills || [],
          interests: interests || [],
          projects: projects || [{
            name: '',
            description: '',
            languages: ''
          }]
        });
      } catch (createError) {
        console.error('Error creating new CV:', createError);
        return res.status(400).json({
          success: false,
          message: 'Error creating CV data',
          error: createError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'CV saved successfully',
      data: cv
    });
  } catch (error) {
    console.error('Save CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving CV data'
    });
  }
});

// @desc    Delete user's CV data
// @route   DELETE /api/cv
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.user.id });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    await CV.findByIdAndDelete(cv._id);

    res.status(200).json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting CV data'
    });
  }
});

export default router;
