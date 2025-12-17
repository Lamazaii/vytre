import type { Image } from "./Image";

export interface Blocks {
  numero: number;
  titre: string;
  description: string;
  images?: Image[];
}