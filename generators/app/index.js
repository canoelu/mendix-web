const Generator = require("yeoman-generator");
const { join } = require("path");

const { promptWidgetProperties } = require("./lib/prompttexts.js");
const { getWidgetDetails, dirExists, isDirEmpty, findMprDir } = require("./lib/utils.js");
const text = require("./lib/text.js");

const widgetSrcFolder = "components/";

class MxGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);

        /**
         * Test if a widget folder was passed by argument and try to create the new folder
         */
        if (args.length > 0) {
            const dir = args.map(arg => arg.replace(/(^|\s)\S/g, l => l.toLowerCase())).join("-");
            const name = args.map(arg => arg.replace(/(^|\s)\S/g, l => l.toUpperCase())).join("");
            if (dir) {
                this.dir = dir;
                this.widgetParamName = name;
            }
        }
    }

    async initializing() {
        const fullDestinationPath = this.dir ? join(this.destinationPath(), this.dir) : this.destinationPath();

        if ((await dirExists(fullDestinationPath)) && !(await isDirEmpty(fullDestinationPath))) {
            this.log(text.BANNER);
            this.env.error(Error(text.DIR_NOT_EMPTY_ERROR));
        }
    }

    async prompting() {
        this.log(text.BANNER);

        const mprDir = await findMprDir(this.dir);
        const widgetAnswers = await this.prompt(promptWidgetProperties(mprDir, this.widgetParamName));
        this.widget = getWidgetDetails(widgetAnswers);
    }

    writing() {
        if (this.dir) {
            this.destinationRoot(this.dir);
        }

        this._writeWidgetJson();
        this._writeWidgetXML();
        this._writeWidgetFiles();
    }
    async end() {
        // Remove .yo-rc.json
        try {
            this.fs.delete(this.destinationPath(".yo-rc.json"));
        } catch (e) {
            console.error(e);
        }

        this.log(text.END_SUCCESS);
    }

  
    _writeWidgetJson() {
      this._copyTemplate(
            `${this.widget.templateSourcePath}/WidgetName.json.ejs`,
            `${this.widget.name}.json`,
            Object.assign(this.widget, {
                nameCamelCase: this.widget.name.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
                packagePathXml: this.widget.packagePath.replace(/\//g, ".")
            })
        );

       
    }
    _writeWidgetXML() {
        this._copyTemplate(
            `${this.widget.templateSourcePath}/package.xml.ejs`,
            "package.xml",
            Object.assign(this.widget, { packagePathXml: this.widget.packagePath.replace(/\./g, "/") })
        );

        this._copyTemplate(
            `${this.widget.templateSourcePath}/WidgetName.xml.ejs`,
            `${this.widget.name}.xml`,
            Object.assign(this.widget, {
                nameCamelCase: this.widget.name.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
                packagePathXml: this.widget.packagePath.replace(/\//g, ".")
            })
        );
    }

    _writeWidgetFiles() {
        const fileExtension = `${this.widget.fileExtension}x`;


        const tempSampleSuffix = this.widget.isPlatformWeb ? "Sample" : "";

        // web & native
         this._copyTemplate(
                `${this.widget.templateSourcePath}${widgetSrcFolder}HelloWorld${tempSampleSuffix}.${fileExtension}.ejs`,
                `${widgetSrcFolder}HelloWorld${tempSampleSuffix}.${fileExtension}`
            );
            this._copyTemplate(
                `${this.widget.templateSourcePath}/WidgetName.${fileExtension}.ejs`,
                `${this.widget.name}.${fileExtension}`
            );

       this._copyTemplate(
                `${this.widget.templateSourcePath}/WidgetName.editorPreview.${fileExtension}.ejs`,
                `${this.widget.name}.editorPreview.${fileExtension}`
            );
            this._copyTemplate(
                `${this.widget.templateSourcePath}/ui/WidgetName.css${this.widget.usesFullTemplate ? ".ejs" : ""}`,
                `ui/${this.widget.name}.css`
            );

            if (this.widget.usesFullTemplate) {
                this._copyFile(
                    `${this.widget.templateSourcePath}${widgetSrcFolder}Alert.${fileExtension}.ejs`,
                    `${widgetSrcFolder}Alert.${fileExtension}`
                );
            }
    }

   
 

    _copyFile(source, destination) {
        this.fs.copy(this.templatePath(source), this.destinationPath(destination), { globOptions: { noext: true } });
    }

    _copyTemplate(source, destination, replaceVariable = this.widget) {
        this.fs.copyTpl(
            this.templatePath(source),
            this.destinationPath(destination),
            replaceVariable,
            {},
            { globOptions: { noext: true } }
        );
    }
}

module.exports = MxGenerator;
