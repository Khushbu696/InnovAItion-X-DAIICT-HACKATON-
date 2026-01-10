import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Service for detecting infrastructure drift
 */
class DriftDetectionService {
  /**
   * Detect drift between deployed infrastructure and planned configuration
   * @param {string} terraformCode - The original Terraform configuration code
   * @param {Object} awsCredentials - AWS credentials for authentication
   * @returns {Promise<Object>} Drift detection result
   */
  async detectDrift(terraformCode, awsCredentials) {
    let tempDir = null;
    
    try {
      // Validate inputs
      if (!terraformCode || typeof terraformCode !== 'string') {
        throw new Error('Invalid Terraform code provided');
      }
      
      if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
        throw new Error('AWS credentials are required');
      }

      // Create a temporary directory for the drift detection
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'terraform-drift-'));
      
      // Write Terraform configuration to main.tf file
      const mainTfPath = path.join(tempDir, 'main.tf');
      await fs.writeFile(mainTfPath, terraformCode);
      
      // Create provider configuration with AWS credentials
      const providerConfig = `
provider "aws" {
  access_key = "${awsCredentials.accessKeyId}"
  secret_key = "${awsCredentials.secretAccessKey}"
  region     = "${awsCredentials.region}"
}
      `;
      
      const providerPath = path.join(tempDir, 'provider.tf');
      await fs.writeFile(providerPath, providerConfig);

      // Execute terraform init
      console.log(`Initializing Terraform in ${tempDir}`);
      await execAsync('terraform init', { cwd: tempDir });
      
      // Execute terraform plan to check for drift
      // The -detailed-exitcode flag returns 0 if no changes, 1 if errors, 2 if changes
      const planResult = await execAsync('terraform plan -detailed-exitcode', { cwd: tempDir });
      
      // Parse the plan output to identify drift
      const hasDrift = planResult.code === 2; // 2 indicates changes detected
      const planOutput = planResult.stdout || planResult.stderr || '';
      
      // Analyze the plan output to identify specific resources with drift
      const driftedResources = this.analyzePlanOutput(planOutput);
      
      return {
        success: true,
        hasDrift,
        message: hasDrift ? 'Drift detected in infrastructure' : 'No drift detected',
        driftedResources,
        planOutput,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Drift detection error:', error);
      return {
        success: false,
        hasDrift: false,
        message: error.message || 'Drift detection failed',
        driftedResources: [],
        error: error.message,
        stderr: error.stderr,
        stdout: error.stdout,
        timestamp: new Date().toISOString()
      };
    } finally {
      // Clean up temporary directory
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Error cleaning up temporary directory:', cleanupError);
        }
      }
    }
  }

  /**
   * Analyze Terraform plan output to identify drifted resources
   * @param {string} planOutput - Terraform plan output
   * @returns {Array} Array of drifted resources
   */
  analyzePlanOutput(planOutput) {
    const resources = [];
    
    // Look for resource changes in the plan output
    const resourcePattern = /~ (aws_[^ ]+)\.[^ ]+|± (aws_[^ ]+)\.[^ ]+|\+ (aws_[^ ]+)\.[^ ]+|~ (aws_[^ ]+)\.[^ ]+/g;
    let match;
    
    while ((match = resourcePattern.exec(planOutput)) !== null) {
      // The matched resource type will be in one of the capture groups
      const resourceType = match[1] || match[2] || match[3] || match[4];
      if (resourceType) {
        resources.push({
          type: resourceType,
          action: match[0].startsWith('~') ? 'update' : 
                 match[0].startsWith('+') ? 'create' : 
                 match[0].startsWith('-') ? 'destroy' : 'change',
          identifier: match[0].split(' ')[1] || 'unknown'
        });
      }
    }
    
    return resources;
  }

  /**
   * Compare current state with expected configuration
   * @param {string} terraformCode - Expected Terraform configuration
   * @param {Object} awsCredentials - AWS credentials for authentication
   * @returns {Promise<Object>} Comparison result
   */
  async compareState(terraformCode, awsCredentials) {
    let tempDir = null;
    
    try {
      // Validate inputs
      if (!terraformCode || typeof terraformCode !== 'string') {
        throw new Error('Invalid Terraform code provided');
      }
      
      if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
        throw new Error('AWS credentials are required');
      }

      // Create a temporary directory for the state comparison
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'terraform-compare-'));
      
      // Write Terraform configuration to main.tf file
      const mainTfPath = path.join(tempDir, 'main.tf');
      await fs.writeFile(mainTfPath, terraformCode);
      
      // Create provider configuration with AWS credentials
      const providerConfig = `
provider "aws" {
  access_key = "${awsCredentials.accessKeyId}"
  secret_key = "${awsCredentials.secretAccessKey}"
  region     = "${awsCredentials.region}"
}
      `;
      
      const providerPath = path.join(tempDir, 'provider.tf');
      await fs.writeFile(providerPath, providerConfig);

      // Execute terraform init
      await execAsync('terraform init', { cwd: tempDir });
      
      // Pull the remote state
      await execAsync('terraform state pull > state.json', { cwd: tempDir });
      
      // Execute terraform plan to see differences
      const planResult = await execAsync('terraform plan -out=tfplan', { cwd: tempDir });
      
      // Read the pulled state
      let currentState = {};
      try {
        const stateContent = await fs.readFile(path.join(tempDir, 'state.json'), 'utf8');
        currentState = JSON.parse(stateContent);
      } catch (error) {
        console.error('Error reading state:', error);
      }
      
      return {
        success: true,
        currentState,
        planOutput: planResult.stdout,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('State comparison error:', error);
      return {
        success: false,
        currentState: {},
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      // Clean up temporary directory
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Error cleaning up temporary directory:', cleanupError);
        }
      }
    }
  }
}

export default new DriftDetectionService();