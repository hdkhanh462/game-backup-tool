export interface DriveFolderCrumb {
  id: string;
  name: string;
}

export interface DriveFolderPickerRequest {
  startParentId?: string;
  startPath?: string;
  onSelect: (folder: { id: string; path: string }) => void | Promise<void>;
}
