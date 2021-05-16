const { join } = require("path");
const { access, readdir } = require("fs").promises;

function getWidgetDetails(answers) {
    return {
        ...answers,
        name: answers.name.replace(/(^|\s)\S/g, l => l.toUpperCase()), // Capitalize first letter if it's not
        packageName: answers.name.toLowerCase(),
        packagePath: 'mendix',
        description:'mendix web',
        projectPath: answers.projectPath.replace(/\\/g, "\\\\"),
        platform:'web',
        version:'1.0.0',
        isPlatformWeb: true,
        isPlatformNative: false,
        usesEmptyTemplate: true,
        usesFullTemplate: false,
        isLanguageJS: false,
        isLanguageTS: true,
        fileExtension:  "ts",
        templateSourcePath: `pluggable/web/emptyTemplateTs/`
    };
}

async function dirExists(dirname) {
    try {
        await access(dirname);
        return true;
    } catch {
        return false;
    }
}

async function isDirEmpty(dirname) {
    return (await readdir(dirname)).length === 0;
}

async function findMprDir(widgetProjectDir) {
    let mprDir = null;
    let currentDir = "../";
    let i = 0;
    const currentPath = (widgetProjectDir ? join(process.cwd() + "/" + widgetProjectDir) : process.cwd()) + "/";
    while (i < 5 && mprDir === null) {
        const items = await readdir(join(currentPath, currentDir));
        if (items.find(item => item.endsWith(".mpr"))) {
            mprDir = currentDir;
            break;
        }
        currentDir += "../";
        i++;
    }
    return mprDir;
}

module.exports = { getWidgetDetails, dirExists, isDirEmpty, findMprDir };
