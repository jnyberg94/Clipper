export function getItemProgress(globalIndex, currentFileIndex, fileProgress) {
    currentFileIndex = currentFileIndex - 1
    if (globalIndex < currentFileIndex) return 100;
    if (globalIndex === currentFileIndex) return fileProgress;
    return 0;
}