function isObjectWithValues(obj) {
  return obj && Object.keys(obj).length > 0 && obj.constructor === Object;
}

export default isObjectWithValues;
