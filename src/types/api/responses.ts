export interface ContentBlock {
  type: string;
  text?: string;
}

export interface QueryResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: ContentBlock[];
}
