import type { Block } from "./Blocks";

export interface Image {
    id: string;
    imagePath: string;
    blockId: number;
    block: Block;
}