export const useHeadBobbing = (headBobbingOptions, initCameraPos) => {
  const { hasHeadBobbing, speed, amplitude } = headBobbingOptions
  const headBobbingMov = (isMoving, elapsedTime) => {
    if (isMoving && hasHeadBobbing) {
      return Math.sin(elapsedTime * speed) * amplitude + initCameraPos
    } else return 0
  }
  return { headBobbingMov }
}
