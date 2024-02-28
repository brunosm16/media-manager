export const groupArrayByKey = (arr: any[], key: string, fn: any): object => {
  return arr.reduce((acc, curr) => {
    const currKey = curr[key];
    const keyGroup = fn ? fn(currKey) : key;
    const tempAcc = acc;

    if (!tempAcc[keyGroup]) {
      tempAcc[keyGroup] = [];
    }

    tempAcc[keyGroup].push(curr);

    return tempAcc;
  }, {});
};
