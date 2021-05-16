const { valid, satisfies } = require("semver");

function promptWidgetProperties(mxProjectDir, widgetName) {
    return [
        {
            type: "input",
            name: "name",
            validate: input => {
                if (/^([a-zA-Z]+)$/.test(input)) {
                    return true;
                }
                return "Your widget name can only contain one or more letters (a-z & A-Z). Please provide a valid name";
            },
            message: "What is the name of your widget?",
            default: widgetName ? widgetName : "MyWidget"
        },
        {
            type: "input",
            name: "projectPath",
            message: "Mendix project path",
            default: mxProjectDir ? mxProjectDir : "./tests/testProject"
        } 
    ];
}
 
module.exports = {
    promptWidgetProperties,
};
