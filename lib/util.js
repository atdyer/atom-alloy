'use babel';

function extension(file) {
    return file.split('.').pop();
}

export {
    extension
};
