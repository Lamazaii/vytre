import type { Block } from "./Block";

export interface Image {
    id: string;
    imagePath: string;
    blockId: number;
    block: Block;
}