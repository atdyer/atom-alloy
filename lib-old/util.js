'use babel';

function extension(file) {
    return file.split('.').pop();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    extension,
    sleep
};
