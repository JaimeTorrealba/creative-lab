export const convertToScreenCoords = (vector, width, height) => {

  const centeredX = vector.x + width.value / 2;
  const centeredY = height.value / 2 - vector.y; // flip Y so +Y is up
  vector.set(centeredX, centeredY);
}