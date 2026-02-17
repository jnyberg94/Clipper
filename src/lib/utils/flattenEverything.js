//remove uiList from this

export function flattenEverything(
    node,
    outputDir,
    result = { rustJobs: [], uiList: [] },
) {
    if (node.folders) {
        for (const folder of node.folders) {
            result.uiList.push({
                type: "folder",
                name: folder.name,
                count: folder.toProcess?.length || 0,
            });

            flattenEverything(
                folder,
                `${outputDir}/${folder.name}`,
                result,
            );
        }
    }

    if (node.toProcess) {
        for (const file of node.toProcess) {
            const globalIndex = result.rustJobs.length;

            const job = {
                path: file.path,
                name: file.name,
                output_path: `${outputDir}/${file.name}`,
            };

            result.rustJobs.push(job);

            result.uiList.push({
                type: "file",
                data: file,
                globalIndex,
            });
        }
    }

    return result;
}

// export function formatTime(seconds) {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
// }