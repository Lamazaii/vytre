import type { Image } from "./Image";

export interface Block {
  id: number;
  text: string;
  step: number;
  nbOfRepeats: number;
  images: Image[];


  modified: boolean;
}