export interface ClothingSelection {
  top: UploadedFile | null;
  bottom: UploadedFile | null;
  accessory: UploadedFile | null;
}

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}