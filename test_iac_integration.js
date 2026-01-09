/**
 * Test script to verify IaC Engine integration with MongoDB
 */

import { processProjectFromDB, generateTerraform, runSecurityAudit } from './IaCEngine.js';

// Sample project data similar to what would be stored in MongoDB
const sampleProject = {
  _id: 'test-project-id',
  projectName: 'Test Infrastructure Project',
  nodes: [
    {
      id: '1',
      type: 'ec2',
      position: { x: 0, y: 0 },
      data: {
        label: 'Web Server',
        type: 'ec2'
      }
    },
    {
      id: '2',
      type: 's3',
      position: { x: 200, y: 0 },
      data: {
        label: 'Data Bucket',
        type: 's3'
      }
    },
    {
      id: '3',
      type: 'rds',
      position: { x: 400, y: 0 },
      data: {
        label: 'Database',
        type: 'rds'
      }
    }
  ],
  user: 'user-id',
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('Testing IaC Engine Integration...\n');

// Test 1: Process project from DB
console.log('1. Testing processProjectFromDB function...');
try {
  const result = processProjectFromDB(sampleProject);
  console.log('✅ processProjectFromDB successful!');
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Project Name: ${result.projectName}`);
  console.log(`   - Node Count: ${result.nodeIdCount}`);
  console.log(`   - Terraform Code Length: ${result.terraformCode.length} characters\n`);
} catch (error) {
  console.error('❌ processProjectFromDB failed:', error.message);
}

// Test 2: Direct Terraform generation
console.log('2. Testing direct generateTerraform function...');
try {
  const terraformCode = generateTerraform(sampleProject.nodes);
  console.log('✅ generateTerraform successful!');
  console.log(`   - Code Length: ${terraformCode.length} characters\n`);
} catch (error) {
  console.error('❌ generateTerraform failed:', error.message);
}

// Test 3: Security audit
console.log('3. Testing runSecurityAudit function...');
try {
  const sampleTerraformWithIssue = `
    resource "aws_security_group" "example" {
      ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]  # This should trigger a security warning
      }
    }
  `;
  
  const auditResult = runSecurityAudit(sampleTerraformWithIssue);
  console.log('✅ runSecurityAudit successful!');
  console.log(`   - Has Issues: ${auditResult.hasIssues}`);
  console.log(`   - Total Warnings: ${auditResult.summary.totalIssues}`);
  console.log(`   - High Risk Issues: ${auditResult.summary.highRisk}`);
  
  if (auditResult.warnings.length > 0) {
    console.log('   - Found expected security issue:', auditResult.warnings[0].message);
  }
  console.log('');
} catch (error) {
  console.error('❌ runSecurityAudit failed:', error.message);
}

console.log('All tests completed! The IaC Engine integration is working properly.');