export const MAX_CHILDREN_PER_PARENT = 5;
export const MIN_CHILDREN_PER_PARENT = 1;

export type ChildDraft = {
  name: string;
  age: string;
};

export type ChildLoginCode = {
  name: string;
  loginCode: string;
};

export function emptyChildDraft(): ChildDraft {
  return { name: '', age: '' };
}
