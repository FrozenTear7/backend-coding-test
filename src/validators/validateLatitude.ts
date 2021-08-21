const validateLatitude = (latitude: number): boolean => {
  return latitude < -90 || latitude > 90;
};

export default validateLatitude;
