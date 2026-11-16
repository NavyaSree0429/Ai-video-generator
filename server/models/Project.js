const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner userId is required']
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Project title cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    language: {
      type: String,
      required: [true, 'Language selection is required'],
      enum: {
        values: ['Telugu', 'English'],
        message: 'Language must be either Telugu or English'
      },
      default: 'English'
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      enum: {
        values: ['text-to-video', 'image-to-video'],
        message: 'Project type must be text-to-video or image-to-video'
      },
      default: 'text-to-video'
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);

