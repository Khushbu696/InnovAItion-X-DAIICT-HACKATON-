const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data as T;
};

// Project data interface
export interface ProjectData {
  projectName: string;
  nodes: any[];
  generatedCode?: string;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  project: {
    _id: string;
    projectName: string;
    nodes: any[];
    generatedCode: string;
    user: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProjectsListResponse {
  success: boolean;
  count: number;
  projects: Array<{
    _id: string;
    projectName: string;
    nodes: any[];
    generatedCode: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Authentication API functions
export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Project API functions
export const projectApi = {
  // Create a new project
  create: async (data: ProjectData): Promise<ProjectResponse> => {
    return apiRequest<ProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all projects for the current user
  getAll: async (): Promise<ProjectsListResponse> => {
    return apiRequest<ProjectsListResponse>('/projects', {
      method: 'GET',
    });
  },

  // Get a single project by ID
  getById: async (id: string): Promise<ProjectResponse> => {
    return apiRequest<ProjectResponse>(`/projects/${id}`, {
      method: 'GET',
    });
  },

  // Update an existing project
  update: async (id: string, data: Partial<ProjectData>): Promise<ProjectResponse> => {
    return apiRequest<ProjectResponse>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Generate Terraform code from project
  generateTerraform: async (id: string): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/generate-terraform`, {
      method: 'POST',
    });
  },

  // Run security audit on project's Terraform code
  runSecurityAudit: async (id: string): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/run-security-audit`, {
      method: 'POST',
    });
  },

  // Deploy project to AWS
  deploy: async (id: string, awsCredentials: any): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ awsCredentials }),
    });
  },

  // Check deployment readiness
  checkReadiness: async (id: string): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/deployment-readiness`, {
      method: 'GET',
    });
  },

  // Detect infrastructure drift
  detectDrift: async (id: string, awsCredentials: any): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/detect-drift`, {
      method: 'POST',
      body: JSON.stringify({ awsCredentials }),
    });
  },

  // Get drift history
  getDriftHistory: async (id: string): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/drift-history`, {
      method: 'GET',
    });
  },

  // Compare current state with expected configuration
  compareState: async (id: string, awsCredentials: any): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/compare-state`, {
      method: 'POST',
      body: JSON.stringify({ awsCredentials }),
    });
  },

  // Delete a project
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
