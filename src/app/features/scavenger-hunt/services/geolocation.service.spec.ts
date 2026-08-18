import {
  haversineDistanceMeters,
  initialBearingDegrees,
  relativeBearingDegrees,
} from './geolocation.service';

describe('haversineDistanceMeters', () => {
  it('is zero for identical coordinates', () => {
    expect(haversineDistanceMeters(40.0001, -3.0001, 40.0001, -3.0001)).toBe(0);
  });

  it('is approximately 111.2km for one degree of latitude', () => {
    const distance = haversineDistanceMeters(0, 0, 1, 0);
    expect(distance).toBeGreaterThan(110500);
    expect(distance).toBeLessThan(111900);
  });

  it('is symmetric', () => {
    const a = haversineDistanceMeters(40.0001, -3.0001, 40.0008, -3.0008);
    const b = haversineDistanceMeters(40.0008, -3.0008, 40.0001, -3.0001);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe('initialBearingDegrees', () => {
  it('points north (0°) when moving to a higher latitude at the same longitude', () => {
    expect(initialBearingDegrees(0, 0, 1, 0)).toBeCloseTo(0, 3);
  });

  it('points east (90°) when moving to a higher longitude at the same latitude', () => {
    expect(initialBearingDegrees(0, 0, 0, 1)).toBeCloseTo(90, 3);
  });

  it('points south (180°) when moving to a lower latitude at the same longitude', () => {
    expect(initialBearingDegrees(0, 0, -1, 0)).toBeCloseTo(180, 3);
  });

  it('points west (270°) when moving to a lower longitude at the same latitude', () => {
    expect(initialBearingDegrees(0, 0, 0, -1)).toBeCloseTo(270, 3);
  });

  it('always returns a value in [0, 360)', () => {
    const bearing = initialBearingDegrees(40.0001, -3.0001, 40.0008, -3.0009);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });
});

describe('relativeBearingDegrees', () => {
  it('is zero when the target bearing matches the device heading', () => {
    expect(relativeBearingDegrees(90, 90)).toBe(0);
  });

  it('wraps negative differences into [0, 360)', () => {
    expect(relativeBearingDegrees(10, 350)).toBe(20);
  });

  it('wraps positive differences past 360 back into [0, 360)', () => {
    expect(relativeBearingDegrees(350, 10)).toBe(340);
  });
});
