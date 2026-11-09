export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RequestStatus = 'Under review' | 'Assigned' | 'In progress' | 'Resolved';
export type RequestCategory = 'HVAC / AC' | 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Security';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  building: string;
  floor: string;
  room: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
  photos: string[];
  assignedTechnician?: string;
  slaHours?: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  type: 'Reactive' | 'Corrective' | 'Predictive';
  assetName: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  dueDate: string;
}

export interface FacilityAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'Operational' | 'Requires Service' | 'Offline';
  serialNumber: string;
  installDate: string;
  lastService: string;
}

