export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    admin: boolean;
    password: string;
    sites: string[];
    verified: boolean;
    create_timestamp: string;
}

export interface Site {
    id: string;
    name: string;
    members: SiteMember[];
    create_timestamp: string;
    agents?: number
}

export interface SiteMember {
    user: string;
    role: number;
}

export interface Agent {
    id: string;
    name: string;
    site: string;
    pin: string;
    heartbeat?: string;
    initialized: boolean;
    longitude: number;
    latitude: number;
    timestamp: string;
}

export interface CheckData {
    target?: string;
    id: string;
    check: string;
    agent: string;
    triggered: boolean;
    timestamp: string;
    result: any;
    type: string;
}


export interface Preferences {
    dark: boolean,
    token: string
}

export {}
