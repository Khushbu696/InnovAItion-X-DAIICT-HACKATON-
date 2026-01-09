/**
 * Infrastructure as Code Engine
 * Generates Terraform code from React Flow nodes and performs security audits
 */

/**
 * Generates Terraform configuration from React Flow nodes
 * @param {Array} nodes - Array of nodes from React Flow
 * @returns {string} Generated Terraform configuration
 */
function generateTerraform(nodes) {
  if (!nodes || nodes.length === 0) {
    return '# No infrastructure nodes defined\n';
  }

  let terraformCode = '# Generated Terraform Configuration\n\n';
  terraformCode += 'terraform {\n';
  terraformCode += '  required_providers {\n';
  terraformCode += '    aws = {\n';
  terraformCode += '      source  = "hashicorp/aws"\n';
  terraformCode += '      version = "~> 5.0"\n';
  terraformCode += '    }\n';
  terraformCode += '  }\n';
  terraformCode += '}\n\n';
  terraformCode += 'provider "aws" {\n';
  terraformCode += '  region = var.aws_region\n';
  terraformCode += '}\n\n';

  // Process each node
  nodes.forEach((node, index) => {
    const nodeId = node.id || `resource_${index}`;
    const nodeType = node.type || node.data?.type || '';
    const nodeLabel = node.data?.label || nodeId;

    switch (nodeType.toLowerCase()) {
      case 'ec2':
        terraformCode += `# EC2 Instance: ${nodeLabel}\n`;
        terraformCode += `resource "aws_instance" "${nodeId}" {\n`;
        terraformCode += '  ami           = var.ec2_ami\n';
        terraformCode += '  instance_type = var.instance_type\n\n';
        terraformCode += '  tags = {\n';
        terraformCode += `    Name = "${nodeLabel}"\n`;
        terraformCode += '  }\n';
        terraformCode += '}\n\n';
        break;

      case 's3':
        terraformCode += `# S3 Bucket: ${nodeLabel}\n`;
        terraformCode += `resource "aws_s3_bucket" "${nodeId}" {\n`;
        terraformCode += `  bucket = "${nodeLabel.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}"\n\n`;
        terraformCode += '  tags = {\n';
        terraformCode += `    Name = "${nodeLabel}"\n`;
        terraformCode += '  }\n';
        terraformCode += '}\n\n';
        terraformCode += `resource "aws_s3_bucket_versioning" "${nodeId}_versioning" {\n`;
        terraformCode += `  bucket = aws_s3_bucket.${nodeId}.id\n\n`;
        terraformCode += '  versioning_configuration {\n';
        terraformCode += '    status = "Enabled"\n';
        terraformCode += '  }\n';
        terraformCode += '}\n\n';
        break;

      case 'rds':
        terraformCode += `# RDS Database: ${nodeLabel}\n`;
        terraformCode += `resource "aws_db_instance" "${nodeId}" {\n`;
        terraformCode += '  identifier = var.db_identifier\n';
        terraformCode += '  engine     = "mysql"\n';
        terraformCode += '  engine_version = var.db_engine_version\n';
        terraformCode += '  instance_class = var.db_instance_class\n';
        terraformCode += '  allocated_storage = 20\n';
        terraformCode += '  storage_type = "gp2"\n';
        terraformCode += '  db_name  = var.db_name\n';
        terraformCode += '  username = var.db_username\n';
        terraformCode += '  password = var.db_password\n\n';
        terraformCode += '  tags = {\n';
        terraformCode += `    Name = "${nodeLabel}"\n`;
        terraformCode += '  }\n';
        terraformCode += '}\n\n';
        break;

      default:
        terraformCode += `# Unknown node type: ${nodeType} (${nodeLabel})\n`;
        break;
    }
  });

  // Add variables block
  terraformCode += '# Variables\n';
  terraformCode += 'variable "aws_region" {\n';
  terraformCode += '  description = "AWS region"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  default     = "us-east-1"\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "ec2_ami" {\n';
  terraformCode += '  description = "AMI ID for EC2 instances"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "instance_type" {\n';
  terraformCode += '  description = "EC2 instance type"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  default     = "t2.micro"\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_identifier" {\n';
  terraformCode += '  description = "RDS instance identifier"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_engine_version" {\n';
  terraformCode += '  description = "RDS engine version"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  default     = "8.0"\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_instance_class" {\n';
  terraformCode += '  description = "RDS instance class"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  default     = "db.t2.micro"\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_name" {\n';
  terraformCode += '  description = "RDS database name"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_username" {\n';
  terraformCode += '  description = "RDS master username"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  sensitive   = true\n';
  terraformCode += '}\n\n';

  terraformCode += 'variable "db_password" {\n';
  terraformCode += '  description = "RDS master password"\n';
  terraformCode += '  type        = string\n';
  terraformCode += '  sensitive   = true\n';
  terraformCode += '}\n';

  return terraformCode;
}

/**
 * Processes a project from MongoDB and generates Terraform code
 * @param {Object} project - The project object from MongoDB
 * @returns {Object} Object containing generated Terraform code and metadata
 */
function processProjectFromDB(project) {
  if (!project || !project.nodes) {
    return {
      success: false,
      error: 'Invalid project data: missing nodes',
      terraformCode: null
    };
  }

  try {
    // Extract nodes from the project
    const nodes = project.nodes;
    
    // Generate Terraform code from nodes
    const terraformCode = generateTerraform(nodes);
    
    return {
      success: true,
      terraformCode: terraformCode,
      projectName: project.projectName,
      nodeIdCount: Array.isArray(nodes) ? nodes.length : 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      terraformCode: null
    };
  }
}

/**
 * Runs a security audit on the generated Terraform code
 * @param {string} code - The Terraform code string to audit
 * @returns {Object} Security audit results with warnings
 */
function runSecurityAudit(code) {
  const warnings = [];
  const errors = [];

  // Check for open security groups (0.0.0.0/0)
  if (code.includes('0.0.0.0/0')) {
    warnings.push({
      level: 'HIGH',
      type: 'SECURITY_GROUP',
      message: 'High-risk security issue detected: Open security group rule (0.0.0.0/0) allows access from anywhere on the internet',
      recommendation: 'Restrict CIDR blocks to specific IP ranges or use security group references instead of 0.0.0.0/0'
    });
  }

  return {
    hasIssues: warnings.length > 0 || errors.length > 0,
    warnings: warnings,
    errors: errors,
    summary: {
      totalIssues: warnings.length + errors.length,
      highRisk: warnings.filter(w => w.level === 'HIGH').length,
      mediumRisk: warnings.filter(w => w.level === 'MEDIUM').length,
      lowRisk: warnings.filter(w => w.level === 'LOW').length
    }
  };
}

// Export functions
export { generateTerraform, runSecurityAudit, processProjectFromDB };



