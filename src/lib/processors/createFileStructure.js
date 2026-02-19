export function createFileStructure(folders = [], looseFiles = []) {
    const rustJobs = [];
    const uiFiles = { folders: [], toProcess: [] };
    let globalIndex = 0;

    folders.forEach(folder => {
        const folderFiles = folder.toProcess || [];

        rustJobs.push({
            type: 'folder',
            name: folder.name,
            count: folderFiles.length
        });

        const processedFiles = folderFiles.map(file => ({
            ...file,
            globalIndex: globalIndex++
        }));

        uiFiles.folders.push({
            name: folder.name,
            originalPath: folder.originalPath,
            path: folder.path,
            toProcess: processedFiles,
            folders: folder.folders || []
        });

        // Add files to flattened array
        processedFiles.forEach(file => {
            rustJobs.push({
                type: 'file',
                data: file,
                globalIndex: file.globalIndex
            });
        });
    });

    // Process loose files (not in folders)
    uiFiles.toProcess = looseFiles.map(file => ({
        ...file,
        globalIndex: globalIndex++
    }));

    // Add loose files to flattened array
    uiFiles.toProcess.forEach(file => {
        rustJobs.push({
            type: 'file',
            data: file,
            globalIndex: file.globalIndex
        });
    });

    const rustFiles = rustJobs
        .filter(item => item.type === 'file')
        .map(item => ({
            path: item.data.path,
            output_path: item.data.outputPath || item.data.path,
            name: item.data.name
        }));

    return { uiFiles, rustFiles };
}