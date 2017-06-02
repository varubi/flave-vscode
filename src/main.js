const vscode = require("vscode");
const fs = require('fs');
const path = require('path');
const flave = require('flave');

const FLAVE_EXT = ".flave";
const COMPILE_COMMAND = "flave.compile";
let diagnostics;
exports.activate = function (context) {
    diagnostics = vscode.languages.createDiagnosticCollection();
    const compileFlaveSub = vscode.commands.registerCommand(COMPILE_COMMAND, (document) => {
        if (!document && !vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("This command is only available when a .flave editor is open.");
            return;
        }
        document = document || vscode.window.activeTextEditor.document;
        if (document.fileName.endsWith(FLAVE_EXT)) {
            transpile(document, diagnostics);
        }
        else {
            vscode.window.showWarningMessage("This command only works for .flave files.");
        }
    });
    const didSaveEvent = vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.fileName.endsWith(FLAVE_EXT)) {
            vscode.commands.executeCommand(COMPILE_COMMAND, doc);
        }
    });
    const didCloseEvent = vscode.workspace.onDidCloseTextDocument((doc) => {
        if (doc.fileName.endsWith(FLAVE_EXT)) {
            diagnostics.delete(doc.uri);
        }
    });
    context.subscriptions.push(compileFlaveSub);
    context.subscriptions.push(didSaveEvent);
    context.subscriptions.push(didCloseEvent);
}

exports.deactivate = function () {
    if (diagnostics) {
        diagnostics.dispose();
    }
}

function transpile(document) {
    let src = document.fileName;
    let dest = path.resolve(path.dirname(src), path.parse(src).name + '.js');
    fs.readFile(src, function (error, data) {
        if (!error)
            fs.writeFile(dest, flave.transpile(data.toString(), {
                newlines: true
            }),
                function () {

                })
    })
}
