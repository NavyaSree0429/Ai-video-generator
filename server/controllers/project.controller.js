const mongoose = require('mongoose');
const Project = require('../models/Project');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/apiResponse');

// In-memory fallback projects cache for offline development mode
const inMemoryProjects = [];

/**
 * Create a new video project
 * POST /api/v1/projects
 */
const createProject = async (req, res) => {
  try {
    const { title, description, language, projectType } = req.body;
    const userId = req.user._id || req.user.id;

    if (!title) {
      return errorResponse(res, 400, 'Project title is required.');
    }

    if (language && !['Telugu', 'English'].includes(language)) {
      return errorResponse(res, 400, 'Language must be either Telugu or English.');
    }

    if (projectType && !['text-to-video', 'image-to-video'].includes(projectType)) {
      return errorResponse(res, 400, 'Project type must be text-to-video or image-to-video.');
    }

    // 1. Primary: MongoDB mode
    if (mongoose.connection.readyState === 1) {
      const project = await Project.create({
        userId,
        title: title.trim(),
        description: description || '',
        language: language || 'English',
        projectType: projectType || 'text-to-video'
      });

      return successResponse(res, 201, 'Project created successfully', { project });
    }

    // 2. Fallback: In-memory mode
    const fakeId = new mongoose.Types.ObjectId().toString();
    const memProject = {
      _id: fakeId,
      userId,
      title: title.trim(),
      description: description || '',
      language: language || 'English',
      projectType: projectType || 'text-to-video',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryProjects.unshift(memProject);

    return successResponse(res, 201, 'Project created successfully (Dev Mode)', { project: memProject });
  } catch (error) {
    console.error('[Create Project Error]', error);
    return errorResponse(res, 500, error.message || 'Error creating project');
  }
};

/**
 * Get all user projects with pagination
 * GET /api/v1/projects
 */
const getProjects = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    // 1. Primary: MongoDB mode
    if (mongoose.connection.readyState === 1) {
      const totalItems = await Project.countDocuments({ userId });
      const projects = await Project.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return paginatedResponse(res, 200, 'Projects retrieved successfully', projects, {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1
      });
    }

    // 2. Fallback: In-memory mode
    const userProjects = inMemoryProjects.filter(p => p.userId.toString() === userId.toString());
    const totalItems = userProjects.length;
    const paginatedItems = userProjects.slice(skip, skip + limit);

    return paginatedResponse(res, 200, 'Projects retrieved successfully (Dev Mode)', paginatedItems, {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit) || 1
    });
  } catch (error) {
    console.error('[Get Projects Error]', error);
    return errorResponse(res, 500, error.message || 'Error fetching projects');
  }
};

/**
 * Get project by ID
 * GET /api/v1/projects/:projectId
 */
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) {
        return errorResponse(res, 404, 'Project not found.');
      }
      return successResponse(res, 200, 'Project retrieved', { project });
    }

    const memProject = inMemoryProjects.find(
      p => p._id.toString() === projectId.toString() && p.userId.toString() === userId.toString()
    );

    if (!memProject) {
      return errorResponse(res, 404, 'Project not found.');
    }

    return successResponse(res, 200, 'Project retrieved (Dev Mode)', { project: memProject });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Error retrieving project');
  }
};

/**
 * Update project
 * PATCH /api/v1/projects/:projectId
 */
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;
    const { title, description, language, status } = req.body;

    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId },
        { $set: { title, description, language, status } },
        { new: true, runValidators: true }
      );

      if (!project) {
        return errorResponse(res, 404, 'Project not found.');
      }

      return successResponse(res, 200, 'Project updated successfully', { project });
    }

    const memProject = inMemoryProjects.find(
      p => p._id.toString() === projectId.toString() && p.userId.toString() === userId.toString()
    );

    if (!memProject) {
      return errorResponse(res, 404, 'Project not found.');
    }

    if (title) memProject.title = title.trim();
    if (description !== undefined) memProject.description = description;
    if (language) memProject.language = language;
    if (status) memProject.status = status;
    memProject.updatedAt = new Date().toISOString();

    return successResponse(res, 200, 'Project updated successfully (Dev Mode)', { project: memProject });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Error updating project');
  }
};

/**
 * Delete project
 * DELETE /api/v1/projects/:projectId
 */
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOneAndDelete({ _id: projectId, userId });
      if (!project) {
        return errorResponse(res, 404, 'Project not found.');
      }
      return successResponse(res, 200, 'Project deleted successfully');
    }

    const index = inMemoryProjects.findIndex(
      p => p._id.toString() === projectId.toString() && p.userId.toString() === userId.toString()
    );

    if (index === -1) {
      return errorResponse(res, 404, 'Project not found.');
    }

    inMemoryProjects.splice(index, 1);
    return successResponse(res, 200, 'Project deleted successfully (Dev Mode)');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Error deleting project');
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};

