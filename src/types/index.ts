export interface GistFile {
  filename: string;
  content: string;
}

export interface GistData {
  description: string;
  files: GistFile[];
} 