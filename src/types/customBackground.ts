export interface CustomBackground {
    id: number;
    user_id: number;
    name: string;
    category: string;
    url: string;
    active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface CustomBackgroundsResponse {
    backgrounds: CustomBackground[];
    count: number;
}

export interface CreateCustomBackgroundInput {
    name: string;
    image: string; // Base64 encoded image
}
