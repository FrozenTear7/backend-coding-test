const validateLongitude = (latitude: number): boolean => {
  return latitude < -180 || latitude > 180;
};

export default validateLongitude;
