export function getGridNavigationIndex(params: {
  key: string;
  currentIndex: number;
  itemCount: number;
  columnCount: number;
}) {
  const { key, currentIndex, itemCount, columnCount } = params;

  let nextIndex: number | null = null;

  switch (key) {
    case "ArrowLeft":
      nextIndex = currentIndex - 1;
      break;
    case "ArrowRight":
      nextIndex = currentIndex + 1;
      break;
    case "ArrowUp":
      nextIndex = currentIndex - columnCount;
      break;
    case "ArrowDown":
      nextIndex = currentIndex + columnCount;
      break;
    case "Home":
      nextIndex = currentIndex - (currentIndex % columnCount);
      break;
    case "End":
      nextIndex = Math.min(
        currentIndex - (currentIndex % columnCount) + columnCount - 1,
        itemCount - 1,
      );
      break;
    default:
      return null;
  }

  if (
    nextIndex === null ||
    nextIndex < 0 ||
    nextIndex >= itemCount ||
    nextIndex === currentIndex
  ) {
    return null;
  }

  return nextIndex;
}
