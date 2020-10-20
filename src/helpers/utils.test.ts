import { deepMerge } from './utils';

test('deepMerge 1', () => {
  const a: any = [{a: 1, b: 2}, 3, {c: { d: 4 }}];
  const b: any = [{a: { d: 4 }}, [], {c: { f: 6 }}];
  const o = deepMerge(a, b);
  expect(o[0].a.d).toBe(4);
  expect(o[1]).toStrictEqual([]);
  expect(o).toEqual([{a: { d: 4 }, b: 2}, [], {c: { d: 4, f: 6 }}]);
  expect(o[0] === a[0]).toBe(false);
  expect(o[0].a === b[0].a).toBe(false);
  expect(o[1] === b[1]).toBe(false);
  expect(o[2] === b[2]).toBe(false);
});

test('deepMerge 2', () => {
  const arr1: any = [];
  const arr2: any = [];
  const arrMerge = deepMerge(arr1, arr2);
  expect(arrMerge === arr1).toBe(false);
  expect(arrMerge === arr2).toBe(false);
});
