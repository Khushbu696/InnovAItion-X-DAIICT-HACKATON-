# IaC Engine Integration Documentation

This document explains how the IaC (Infrastructure as Code) Engine is integrated with MongoDB to generate Terraform code from stored project data.

## Overview

The integration allows users to:
1. Store AWS infrastructure diagrams as nodes in MongoDB
2. Generate Terraform code from stored project data
3. Run security audits on the generated Terraform code

## Backend API Endpoints

### 1. Generate Terraform Code from Project
- **Endpoint**: `POST /api/projects/:id/generate-terraform`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a project from MongoDB and generates Terraform code using the IaCEngine
- **Request**: No request body required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Terraform code generated successfully",
    "terraformCode": "generated terraform code...",
    "projectInfo": {
      "id": "project id",
      "name": "project name",
      "nodeCount": 5,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```

### 2. Run Security Audit on Terraform Code
- **Endpoint**: `POST /api/projects/:id/run-security-audit`
- **Access**: Private (requires authentication)
- **Description**: Runs a security audit on the generated Terraform code for the specified project
- **Request**: No request body required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Security audit completed successfully",
    "auditResult": {
      "hasIssues": true,
      "warnings": [...],
      "errors": [...],
      "summary": {
        "totalIssues": 2,
        "highRisk": 1,
        "mediumRisk": 1,
        "lowRisk": 0
      }
    },
    "projectInfo": {
      "id": "project id",
      "name": "project name"
    }
  }
  ```

## IaCEngine Functions

### 1. `processProjectFromDB(project)`
- **Purpose**: Takes a MongoDB project object and generates Terraform code
- **Input**: Project object with nodes array
- **Output**: Object containing success status, Terraform code, and metadata

### 2. `generateTerraform(nodes)`
- **Purpose**: Generates Terraform code from an array of nodes
- **Input**: Array of node objects
- **Output**: String containing Terraform configuration

### 3. `runSecurityAudit(code)`
- **Purpose**: Runs security checks on Terraform code
- **Input**: Terraform code string
- **Output**: Audit results with warnings and errors

## Frontend Integration

To use these endpoints in the frontend:

1. **Generate Terraform Code**:
   ```javascript
   const generateTerraform = async (projectId) => {
     const response = await fetch(`/api/projects/${projectId}/generate-terraform`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     return response.json();
   };
   ```

2. **Run Security Audit**:
   ```javascript
   const runSecurityAudit = async (projectId) => {
     const response = await fetch(`/api/projects/${projectId}/run-security-audit`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     return response.json();
   };
   ```

## Data Flow

1. User creates infrastructure diagram in the frontend
2. Diagram nodes are saved to MongoDB via existing project save functionality
3. When user requests Terraform generation, the new endpoint retrieves the project from MongoDB
4. IaCEngine processes the nodes and generates Terraform code
5. Generated code is stored back to the project in MongoDB and returned to the frontend
6. Security audit endpoint can be used to check the generated code for potential security issues

## Security Considerations

- All endpoints are protected with JWT authentication
- Users can only access their own projects
- Security audit checks for common vulnerabilities like open security groups (0.0.0.0/0)
- Generated code includes security best practices where possible