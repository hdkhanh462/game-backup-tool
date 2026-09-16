export interface DriveFolderCrumb {
  id: string;
  name: string;
}

export interface DriveFolderSelection {
  id: string;
  path: string;
}

export interface DriveFolderPickerRequest {
  startParentId?: string;
  startPath?: string;
  onSelect: (folder: DriveFolderSelection) => void | Promise<void>;
}
