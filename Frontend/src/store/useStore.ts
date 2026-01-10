import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { estimateTotalCost } from '@/lib/costEstimator';

export interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: string;
  resourceCount: number;
  status: 'draft' | 'deployed' | 'syncing';
}

export interface AWSResource {
  id: string;
  name: string;
  type: string;
  category: 'network' | 'compute' | 'storage' | 'database' | 'security' | 'integration';
  icon: string;
  terraformType: string;
}

interface StudioState {
  // Diagram state
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  
  // Cost estimation
  totalCost: number;
  costBreakdown: Record<string, number>;
  
  // Terraform state
  terraformCode: string;
  isEditing: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
  
  // UI state
  isSidebarCollapsed: boolean;
  isCodePanelCollapsed: boolean;
  isToolsPanelCollapsed: boolean;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setTerraformCode: (code: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setSyncStatus: (status: 'synced' | 'syncing' | 'error') => void;
  setTotalCost: (cost: number) => void;
  setCostBreakdown: (breakdown: Record<string, number>) => void;
  toggleSidebar: () => void;
  toggleCodePanel: () => void;
  toggleToolsPanel: () => void;
  updateNodeParent: (nodeId: string, parentId: string | null) => void;
  generateTerraform: () => void;
  calculateCosts: () => void;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

// Update the generateTerraformFromNodes function to calculate costs as well
const generateTerraformFromNodes = (nodes: Node[]): string => {
  if (nodes.length === 0) {
    return `# Cloud Architect - Terraform Configuration
# Drag AWS resources to the canvas to generate code

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Your infrastructure code will appear here...
`;
  }

  let code = `# Cloud Architect - Terraform Configuration
# Generated automatically from visual diagram

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

`;

  // First, generate VPC resources (parent containers)
  const vpcNodes = nodes.filter(node => 
    node.data?.terraformType === 'aws_vpc' || 
    node.data?.type === 'vpc' || 
    node.type === 'vpcGroup'
  );

  vpcNodes.forEach((node) => {
    const resourceData = node.data as { label: string; terraformType: string; resourceType: string; config?: any };
    const resourceName = resourceData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const config = resourceData.config || {};
    
    code += `resource "aws_vpc" "${resourceName}" {
  cidr_block           = "${config.cidr_block || '10.0.0.0/16'}"
  enable_dns_hostnames = ${config.enable_dns_hostnames || true}
  enable_dns_support   = ${config.enable_dns_support || true}

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
  });

  // Then generate child resources that belong to VPCs
  const childNodes = nodes.filter(node => node.parentNode);
  const regularNodes = nodes.filter(node => !node.parentNode && 
    node.data?.terraformType !== 'aws_vpc' && 
    node.data?.type !== 'vpc' && 
    node.type !== 'vpcGroup'
  );

  // Process all non-VPC nodes
  [...regularNodes, ...childNodes].forEach((node) => {
    const resourceData = node.data as { label: string; terraformType: string; resourceType: string; type: string; config?: any };
    const resourceName = resourceData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Determine if this resource belongs to a VPC
    const parentVpc = node.parentNode ? 
      nodes.find(parent => parent.id === node.parentNode && 
        (parent.data?.terraformType === 'aws_vpc' || 
         parent.data?.type === 'vpc' || 
         parent.type === 'vpcGroup')) : null;
    
    // Get the resource configuration
    const config = resourceData.config || {};
    
    switch (resourceData.terraformType) {
      case 'aws_vpc':
        // Already handled above
        break;
      case 'aws_subnet':
        code += `resource "aws_subnet" "${resourceName}" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "${config.cidr_block || '10.0.1.0/24'}"
  availability_zone       = "${config.availability_zone || 'us-east-1a'}"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_instance':
        code += `resource "aws_instance" "${resourceName}" {
  ami           = "${config.ami || 'ami-0c55b159cbfafe1f0'}"
  instance_type = "${config.instance_type || 't3.micro'}"
  key_name      = "${config.key_name || ''}"
  ${parentVpc ? `vpc_security_group_ids = [aws_security_group.default.id]
  subnet_id              = aws_subnet.main.id` : ''}

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_lambda_function':
        code += `resource "aws_lambda_function" "${resourceName}" {
  filename         = "${config.filename || 'lambda_function.zip'}"
  function_name    = "${config.function_name || resourceName}"
  role             = "${config.role || ''}"
  handler          = "${config.handler || 'index.handler'}"
  runtime          = "${config.runtime || 'python3.9'}"
  timeout          = ${config.timeout || 30}
  memory_size      = ${config.memory_size || 128}
  ${parentVpc ? `vpc_config {
    subnet_ids         = [aws_subnet.main.id]
    security_group_ids = [aws_security_group.default.id]
  }` : ''}

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_s3_bucket':
        const bucketName = config.bucket || `${resourceName}-bucket-${Date.now()}`;
        code += `resource "aws_s3_bucket" "${resourceName}" {
  bucket = "${bucketName}"

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

resource "aws_s3_bucket_versioning" "${resourceName}_versioning" {
  bucket = aws_s3_bucket.${resourceName}.id
  versioning_configuration {
    status = "${config.versioning?.enabled ? 'Enabled' : 'Suspended'}"
  }
}

`;
        break;
      case 'aws_db_instance':
        code += `resource "aws_db_instance" "${resourceName}" {
  identifier                = "${config.identifier || resourceName}"
  allocated_storage         = ${config.allocated_storage || 20}
  max_allocated_storage     = ${config.max_allocated_storage || 100}
  storage_type              = "${config.storage_type || 'gp2'}"
  engine                    = "${config.engine || 'postgres'}"
  engine_version            = "${config.engine_version || '15.4'}"
  instance_class            = "${config.instance_class || 'db.t3.micro'}"
  db_name                   = "${config.db_name || 'mydb'}"
  username                  = "${config.username || 'admin'}"
  password                  = "${config.password || 'CHANGEME'}"
  skip_final_snapshot       = ${config.skip_final_snapshot || true}
  ${parentVpc ? `vpc_security_group_ids = [aws_security_group.default.id]` : ''}

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_dynamodb_table':
        code += `resource "aws_dynamodb_table" "${resourceName}" {
  name           = "${config.name || resourceName}"
  billing_mode   = "${config.billing_mode || 'PAY_PER_REQUEST'}"
  hash_key       = "${config.hash_key || 'id'}"

  attribute {
    name = "${config.hash_key || 'id'}"
    type = "S"
  }

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_security_group':
        code += `resource "aws_security_group" "${resourceName}" {
  name        = "${config.name || resourceName}"
  description = "${config.description || `Security group for ${resourceData.label}`}"
  ${parentVpc ? 'vpc_id      = aws_vpc.main.id' : 'vpc_id      = aws_vpc.main.id'}

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_lb':
        code += `resource "aws_lb" "${resourceName}" {
  name               = "${config.name || resourceName}"
  internal           = ${config.internal || false}
  load_balancer_type = "${config.load_balancer_type || 'application'}"
  security_groups    = [aws_security_group.default.id]
  subnets            = [aws_subnet.main.id]

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      case 'aws_sqs_queue':
        code += `resource "aws_sqs_queue" "${resourceName}" {
  name                              = "${config.name || resourceName}.fifo"
  fifo_queue                        = true
  visibility_timeout_seconds        = ${config.visibility_timeout_seconds || 30}

  tags = {
    Name        = "${resourceData.label}"
    Environment = "production"
    ManagedBy   = "CloudArchitect"
  }
}

`;
        break;
      default:
        code += `# Resource: ${resourceData.label}
# Type: ${resourceData.terraformType}
# Parent VPC: ${parentVpc ? parentVpc.data?.label : 'None'}
# Configuration: ${JSON.stringify(config, null, 2)}
# TODO: Add configuration

`;
    }
  });

  return code;
};

export const useStudioStore = create<StudioState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  totalCost: 0,
  costBreakdown: {},
  terraformCode: generateTerraformFromNodes([]),
  isEditing: false,
  syncStatus: 'synced',
  isSidebarCollapsed: false,
  isCodePanelCollapsed: false,

  setNodes: (nodes) => {
    set({ nodes });
    get().calculateCosts(); // Recalculate costs when nodes change
    get().generateTerraform();
  },
  setEdges: (edges) => set({ edges }),
  addNode: (node) => {
    const nodes = [...get().nodes, node];
    set({ nodes });
    get().calculateCosts(); // Recalculate costs when adding a node
    get().generateTerraform();
  },
  removeNode: (nodeId) => {
    const nodes = get().nodes.filter((n) => n.id !== nodeId);
    const edges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({ nodes, edges, selectedNode: null });
    get().calculateCosts(); // Recalculate costs when removing a node
    get().generateTerraform();
  },
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setTerraformCode: (code) => set({ terraformCode: code }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setTotalCost: (cost) => set({ totalCost: cost }),
  setCostBreakdown: (breakdown) => set({ costBreakdown: breakdown }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleCodePanel: () => set((state) => ({ isCodePanelCollapsed: !state.isCodePanelCollapsed })),
  toggleToolsPanel: () => set((state) => ({ isToolsPanelCollapsed: !state.isToolsPanelCollapsed })),
  updateNodeParent: (nodeId: string, parentId: string | null) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, parentNode: parentId, extent: parentId ? 'parent' as const : undefined } 
          : node
      )
    }));
    get().calculateCosts(); // Recalculate costs when updating parent
    get().generateTerraform();
  },
  calculateCosts: () => {
    const nodes = get().nodes;
    const resources = nodes
      .filter(node => node.data?.type && node.data?.config)
      .map(node => ({
        type: node.data.type,
        config: node.data.config
      }));
    
    const costResult = estimateTotalCost(resources);
    
    set({
      totalCost: costResult.monthly,
      costBreakdown: costResult.breakdown
    });
  },
  generateTerraform: () => {
    set({ syncStatus: 'syncing' });
    const code = generateTerraformFromNodes(get().nodes);
    setTimeout(() => {
      set({ terraformCode: code, syncStatus: 'synced' });
    }, 300);
  },
}));

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [
    {
      id: '1',
      name: 'Production Infrastructure',
      description: 'Main production environment with auto-scaling',
      lastEdited: '2 hours ago',
      resourceCount: 12,
      status: 'deployed',
    },
    {
      id: '2',
      name: 'Staging Environment',
      description: 'Pre-production testing infrastructure',
      lastEdited: '1 day ago',
      resourceCount: 8,
      status: 'syncing',
    },
    {
      id: '3',
      name: 'Data Pipeline',
      description: 'ETL and analytics infrastructure',
      lastEdited: '3 days ago',
      resourceCount: 15,
      status: 'draft',
    },
  ],
  currentProject: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));
