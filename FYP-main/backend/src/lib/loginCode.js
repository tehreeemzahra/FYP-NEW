import { Child } from '../models/Child.js';

export const MAX_CHILDREN_PER_PARENT = 5;

export async function makeUniqueLoginCode() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const loginCode = String(Math.floor(Math.random() * 90) + 10);
    const existing = await Child.findOne({ loginCode });
    if (!existing) return loginCode;
  }
  throw new Error('No login codes available');
}

export function normalizeChildInput(body) {
  if (Array.isArray(body.children) && body.children.length > 0) {
    return body.children.map((c) => ({
      name: String(c.name || c.childName || '').trim(),
      age: c.age ?? c.childAge,
    }));
  }
  if (body.childName) {
    return [{ name: String(body.childName).trim(), age: body.childAge }];
  }
  return [];
}

export function validateChildDrafts(children) {
  if (!Array.isArray(children) || children.length < 1) {
    return 'At least one child is required';
  }
  if (children.length > MAX_CHILDREN_PER_PARENT) {
    return `A parent can have at most ${MAX_CHILDREN_PER_PARENT} children`;
  }
  for (const child of children) {
    if (!child.name) return 'Each child must have a name';
    const age = parseInt(child.age, 10);
    if (Number.isNaN(age) || age < 1 || age > 18) {
      return 'Each child age must be between 1 and 18';
    }
  }
  const names = children.map((c) => c.name.toLowerCase());
  if (new Set(names).size !== names.length) {
    return 'Each child must have a unique name on this account';
  }
  return null;
}
