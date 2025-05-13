function flipHorizontal(instance: unknown): Transform {
  const currentTransform = (instance as { relativeTransform: Transform }).relativeTransform;
  return [
    [-1, 0, currentTransform[0][2]], // Flip on y-axis
    [0, 1, currentTransform[1][2]], // Ignore x-axis
  ] as Transform;
}

export default flipHorizontal;
