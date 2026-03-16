import type { Block } from './Blocks';

export interface DocumentVersion {
    id?: number;
    documentId?: number;
    version: number;
    createdAt?: Date | string;
    title?: string;
    state?: string;
    snapshot?: {
        title: string;
        state?: string;
        blocks: Block[];
    } | null;
}