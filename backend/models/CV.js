import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  qualification: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  time: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
});

const workExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  position: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  time: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  languages: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
});

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalDetails: {
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  about: {
    profile: {
      type: String,
      trim: true,
      default: ''
    }
  },
  education: [educationSchema],
  workExperience: [workExperienceSchema],
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema]
}, {
  timestamps: true
});

// Ensure default empty arrays and objects
cvSchema.pre('save', function(next) {
  if (!this.education || this.education.length === 0) {
    this.education = [{
      institution: '',
      qualification: '',
      time: ''
    }];
  }
  
  if (!this.workExperience || this.workExperience.length === 0) {
    this.workExperience = [{
      company: '',
      position: '',
      time: ''
    }];
  }
  
  if (!this.projects || this.projects.length === 0) {
    this.projects = [{
      name: '',
      description: '',
      languages: ''
    }];
  }
  
  if (!this.skills) {
    this.skills = [];
  }
  
  if (!this.interests) {
    this.interests = [];
  }
  
  next();
});

const CV = mongoose.model('CV', cvSchema);

export default CV;
