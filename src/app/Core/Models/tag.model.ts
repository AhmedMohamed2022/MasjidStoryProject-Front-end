export interface TagContentViewModel {
  languageId: number;
  name: string;
}

export interface TagViewModel {
  id: number;
  contents: TagContentViewModel[];
  localizedName: string;
}
