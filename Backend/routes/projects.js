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

export default router;
