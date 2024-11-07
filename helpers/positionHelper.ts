type Position = [number, number, number];

export const computeDistance = (
  origin: Position,
  destination: Position,
): number => {
  const φ1 = (origin[1] * Math.PI) / 180; // latitude of origin in radians
  const φ2 = (destination[1] * Math.PI) / 180; // latitude of destination in radians
  const Δφ = ((destination[1] - origin[1]) * Math.PI) / 180; // difference in latitude in radians
  const Δλ = ((destination[0] - origin[0]) * Math.PI) / 180; // difference in longitude in radians

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Radius of the earth in meters
  const R = 6371e3;

  // Distance in meters without considering elevation
  const distanceWithoutElevation = R * c;

  // Elevation difference in meters
  const deltaAltitude = destination[2] - origin[2];

  // Vincenty formula for ellipsoidal earth
  const meanEarthRadius = 6371e3; // Mean radius of the Earth in meters

  const y = Math.sqrt(
    Math.pow(Math.cos(φ2) * Math.sin(Δλ), 2) +
      Math.pow(
        Math.cos(φ1) * Math.sin(φ2) -
          Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ),
        2,
      ),
  );

  const x =
    Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const distance = Math.atan2(y, x) * meanEarthRadius;

  // Calculate the total distance, taking into account elevation
  const totalDistance = Math.sqrt(
    Math.pow(distanceWithoutElevation, 2) + Math.pow(deltaAltitude, 2),
  );

  return totalDistance;
};

export const computeBearing = (
  origin: Position,
  destination: Position,
): number => {
  const convertDegToRad = (deg: number): number => deg * (Math.PI / 180);
  const lambda1 = convertDegToRad(origin[0]);
  const lambda2 = convertDegToRad(destination[0]);
  const phi1 = convertDegToRad(origin[1]);
  const phi2 = convertDegToRad(destination[1]);

  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

  const teta = Math.atan2(y, x);

  return ((teta * 180) / Math.PI + 360) % 360; // in degrees
};
