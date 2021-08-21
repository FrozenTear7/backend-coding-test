const validateString = (value: unknown): boolean => {
  return typeof value !== 'string' || value.length < 1;
};

export default validateString;
