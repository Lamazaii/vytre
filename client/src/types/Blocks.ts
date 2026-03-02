import type { Image } from "./Image";

export interface Block {
  id: number;
  text: string;
  step: number;
  nbOfRepeats: number;
  images: Image[];
  textZones?: string[];
  canvasData?: string;

  modified?: boolean;
}