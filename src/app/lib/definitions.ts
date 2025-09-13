// src/app/lib/definitions.ts

export type User = {
  id: string;
  email: string;
  password?: string;
};

export interface ImageForAnnotation {
  id: number;
  imageName: string;
  imageUrl: string;
  modelStatus: string;
  annotationId?: number | null;
}