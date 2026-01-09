import Project from '../models/Project.js';

// @desc    Save a new project
// @route   POST /api/projects
// @access  Private
export const saveProject = async (req, res) => {
  try {
    const { projectName, nodes, generatedCode } = req.body;

    // Validation
    if (!projectName || !nodes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectName and nodes'
      });
    }

    const project = await Project.create({
      projectName,
      nodes,
      generatedCode: generatedCode || '',
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Project saved successfully',
      project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while saving project',
      error: error.message
    });
  }
};

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
      error: error.message
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const { projectName, nodes, generatedCode } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    // Update fields
    if (projectName !== undefined) project.projectName = projectName;
    if (nodes !== undefined) project.nodes = nodes;
    if (generatedCode !== undefined) project.generatedCode = generatedCode;

    project.updatedAt = Date.now();
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating project',
      error: error.message
    });
  }
};

// @desc    Generate Terraform code from project
// @route   POST /api/projects/:id/generate-terraform
// @access  Private
export const generateTerraformFromProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    // Import IaCEngine functions
    const { processProjectFromDB } = await import('../../IaCEngine.js');
    
    // Process the project to generate Terraform code
    const result = processProjectFromDB(project);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate Terraform code',
        error: result.error
      });
    }
    
    // Optionally update the project with the generated code
    project.generatedCode = result.terraformCode;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Terraform code generated successfully',
      terraformCode: result.terraformCode,
      projectInfo: {
        id: project._id,
        name: project.projectName,
        nodeCount: result.nodeIdCount,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while generating Terraform code',
      error: error.message
    });
  }
};

// @desc    Run security audit on Terraform code
// @route   POST /api/projects/:id/run-security-audit
// @access  Private
export const runSecurityAuditOnProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    // Import IaCEngine functions
    const { runSecurityAudit } = await import('../../IaCEngine.js');
    
    // Run security audit on the generated Terraform code
    const auditResult = runSecurityAudit(project.generatedCode || '');

    res.status(200).json({
      success: true,
      message: 'Security audit completed successfully',
      auditResult,
      projectInfo: {
        id: project._id,
        name: project.projectName,
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while running security audit',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project',
      error: error.message
    });
  }
};
