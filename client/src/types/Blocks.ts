import type { Image } from "./Image";

export interface Blocks {
  numero: number;
  description: string;
  repetitionCount: number;
  images?: Image[];
}