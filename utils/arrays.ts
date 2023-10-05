// FIXME: Weird behavior with dupicates
export const getDifference = <T>(
  arr1: T[],
  arr2: T[],
  equals: (obj1: T, obj2: T) => boolean = (obj1, obj2) => obj1 === obj2,
): [removed: T[], added: T[]] => [
  arr1.filter((obj1) => !arr2.some((obj2) => equals(obj1, obj2))),
  arr2.filter((obj2) => !arr1.some((obj1) => equals(obj1, obj2))),
];
