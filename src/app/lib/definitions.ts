// src/app/lib/definitions.ts

export type User = {
  id: string;
  email: string;
  password?: string;
};

// This is the single, correct definition for your image data.
export type ImageForAnnotation = {
  id: number;
  imageName: string;
  imageUrl: string;
  modelStatus: string;
  userStatus?: string | null;
};