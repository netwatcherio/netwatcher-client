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

export interface Stats {
    agent_id: string;
    name: string;
    heartbeat: string;
    net_info: NetResult;
    speed_test_info: SpeedTestResult;
    speed_test_pending: boolean;
}

export interface NetResult {
    local_address: string;
    default_gateway: string;
    public_address: string;
    internet_provider: string;
    lat: string;
    long: string;
    timestamp: string;
}

export interface SpeedTestResult {
    latency: number;
    dl_speed: number;
    ul_speed: number;
    server: string;
    host: string;
    timestamp: string;
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


export interface Check {
    type: string;
    target: string;
    id: string;
    agent: string;
    duration: number;
    count: number;
    triggered: boolean;
    server: boolean;
    pending: boolean;
    interval: number;
    create_timestamp: string;
}

export interface Preferences {
    dark: boolean,
    token: string
}

export {}
