export interface User {
    id: string; // You can use string for ObjectID in TypeScript
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    admin: boolean;
    password: string;
    verified: boolean;
    phoneNumber: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Site {
    id: string; // You can use string for ObjectID in TypeScript
    name: string;
    description: string;
    location: string;
    members: SiteMember[];
    createdAt: Date;
    updatedAt: Date;
}

export type SiteMemberRole = "READ_ONLY" | "READ_WRITE" | "ADMIN" | "OWNER";

export interface SiteMember {
    user: string; // You can use string for ObjectID in TypeScript
    role: SiteMemberRole;
    // roles: "READ_ONLY" | "READ_WRITE" | "ADMIN" | "OWNER";
    // ADMINS can regenerate agent pins
}


export interface Agent {
    id: string; // You can use string for ObjectID in TypeScript
    name: string;
    site: string; // You can use string for ObjectID in TypeScript
    pin: string;
    initialized: boolean;
    location: number; // Assuming location is a numeric value
    createdAt: Date;
    updatedAt: Date;
}

export interface Probe {
    type: ProbeType;
    id: string; // You can use string for ObjectID in TypeScript
    agent: string; // You can use string for ObjectID in TypeScript
    pending: Date; // Assuming 'pending' is a timestamp represented as a Date
    createdAt: Date;
    updatedAt: Date;
    notifications: boolean;
    config: ProbeConfig;
}

export interface ProbeTarget {
    target: string;
    agent: string;
    group: string;
}

export // ProbeConfig
interface ProbeConfig {
    type: ProbeType;
    target: ProbeTarget[];
    duration: number;
    count: number;
    interval: number;
    server: boolean;
}
export interface AgentGroup {
    id: string;
    site: string;
    agents: string[]; // these are the IDs of agents in the group
    name: string;
    description: string;
}

// ProbeType
export type ProbeType = "RPERF" | "MTR" | "PING" | "SPEEDTEST" | "NETINFO";

// ProbeData
export interface ProbeData {
    id: string; // You can use string for ObjectID in TypeScript
    probe: string; // You can use string for ObjectID in TypeScript
    triggered: boolean;
    createdAt: Date;
    updatedAt: Date;
    target: ProbeTarget
    data?: any; // Use an appropriate type for data if possible, otherwise 'any'
}


export interface Preferences {
    dark: boolean,
    token: string
}

export {}
