import express from 'express';
import {
  saveProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  generateTerraformFromProject,
  runSecurityAuditOnProject
} from '../controllers/projectController.js';
import { deployProject, checkDeploymentReadiness } from '../controllers/deploymentController.js';
import { detectDrift, getDriftHistory, compareState } from '../controllers/driftDetectionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All project routes are protected
router.use(verifyToken);

// Simple CRUD routes
router.post('/', saveProject);           // POST /api/projects - Create project
router.get('/', getAllProjects);        // GET /api/projects - Get all projects
router.get('/:id', getProject);         // GET /api/projects/:id - Get single project
router.put('/:id', updateProject);     // PUT /api/projects/:id - Update project
router.delete('/:id', deleteProject);  // DELETE /api/projects/:id - Delete project

// IaC Generation routes
router.post('/:id/generate-terraform', generateTerraformFromProject); // POST /api/projects/:id/generate-terraform - Generate Terraform code from project
router.post('/:id/run-security-audit', runSecurityAuditOnProject); // POST /api/projects/:id/run-security-audit - Run security audit on Terraform code

// Deployment routes
router.post('/:id/deploy', deployProject); // POST /api/projects/:id/deploy - Deploy project to AWS
router.get('/:id/deployment-readiness', checkDeploymentReadiness); // GET /api/projects/:id/deployment-readiness - Check deployment readiness

// Drift Detection routes
router.post('/:id/detect-drift', detectDrift); // POST /api/projects/:id/detect-drift - Detect infrastructure drift
router.get('/:id/drift-history', getDriftHistory); // GET /api/projects/:id/drift-history - Get drift history
router.post('/:id/compare-state', compareState); // POST /api/projects/:id/compare-state - Compare current state with expected configuration

export default router;