import type { Block } from './Blocks';
import type { DocumentVersion } from './DocumentVersion';

export interface Document {
    id? : number;
    title : string;
    version : number;
    blocks : Block[];
    createdAt? : Date;
    updatedAt? : Date;
    state?: string; // "En édition" | "Actif" | "Archivé"
    versions?: DocumentVersion[];
}
