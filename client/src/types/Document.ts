import type { Block } from './Blocks';

export interface Document {
    id? : number;
    title : string;
    version : number;
    blocks : Block[];
    createdAt? : Date;
    updatedAt? : Date;
}
