import type { Block } from './Blocks';

export interface Document {
    id : string;
    title : string;
    version : string;
    blocks : Block[];
    createdAt : Date;
    updatedAt : Date;
}
