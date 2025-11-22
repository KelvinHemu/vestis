export type FeatureType = 'legacy' | 'flatlay' | 'mannequin' | 'onmodel' | 'chat' | 'background_change';

export interface Generation {
    id: number;
    user_id: number;
    feature_type: FeatureType;
    image_url: string;
    created_at: string;
    model_id?: number;
    background_id?: number;
    prompt?: string;
    photo_count?: number;
    product_count?: number;
}

export interface GenerationListResponse {
    generations: Generation[];
    metadata: {
        current_page: number;
        page_size: number;
        total_records: number;
    };
}
