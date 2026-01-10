import Project from '../models/Project.js';
import driftDetectionService from '../services/driftDetectionService.js';

/**
 * @desc    Detect drift between deployed infrastructure and planned configuration
 * @route   POST /api/projects/:id/detect-drift
 * @access  Private
 */
export const detectDrift = async (req, res) => {
  try {
    const { awsCredentials } = req.body;
    
    // Validate AWS credentials
    if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
      return res.status(400).json({
        success: false,
        message: 'AWS credentials are required (accessKeyId, secretAccessKey, region)'
      });
    }

    // Get the project
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

    // Check if Terraform code exists
    if (!project.generatedCode || project.generatedCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'No Terraform code available for drift detection. Please generate code first.'
      });
    }

    // Perform drift detection
    const driftResult = await driftDetectionService.detectDrift(
      project.generatedCode,
      awsCredentials
    );

    // Return the drift detection result
    res.status(200).json({
      success: driftResult.success,
      hasDrift: driftResult.hasDrift,
      message: driftResult.message,
      driftedResources: driftResult.driftedResources,
      drift: driftResult,
      timestamp: driftResult.timestamp
    });

  } catch (error) {
    console.error('Drift detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during drift detection',
      error: error.message
    });
  }
};

/**
 * @desc    Get drift history for a project
 * @route   GET /api/projects/:id/drift-history
 * @access  Private
 */
export const getDriftHistory = async (req, res) => {
  try {
    // This would typically fetch from a drift history collection
    // For now, we'll return an empty array as an example
    // In a real implementation, you'd store drift detection results in a separate collection
    
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

    // In a real implementation, fetch from drift history collection
    // For now, return an example structure
    res.status(200).json({
      success: true,
      history: [],
      message: 'Drift history feature would be implemented here'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching drift history',
      error: error.message
    });
  }
};

/**
 * @desc    Compare current state with expected configuration
 * @route   POST /api/projects/:id/compare-state
 * @access  Private
 */
export const compareState = async (req, res) => {
  try {
    const { awsCredentials } = req.body;
    
    // Validate AWS credentials
    if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
      return res.status(400).json({
        success: false,
        message: 'AWS credentials are required (accessKeyId, secretAccessKey, region)'
      });
    }

    // Get the project
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

    // Check if Terraform code exists
    if (!project.generatedCode || project.generatedCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'No Terraform code available for state comparison. Please generate code first.'
      });
    }

    // Perform state comparison
    const comparisonResult = await driftDetectionService.compareState(
      project.generatedCode,
      awsCredentials
    );

    // Return the comparison result
    res.status(200).json({
      success: comparisonResult.success,
      comparison: comparisonResult,
      timestamp: comparisonResult.timestamp
    });

  } catch (error) {
    console.error('State comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during state comparison',
      error: error.message
    });
  }
};