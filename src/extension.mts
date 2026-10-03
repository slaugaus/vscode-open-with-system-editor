import open from "tiny-open";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(OpenWithSystemEditorProvider.register());
}

export class OpenWithSystemEditorProvider implements vscode.CustomEditorProvider {

	public static register(): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			"open-with-system",
			new OpenWithSystemEditorProvider()
		);
	}

	public async resolveCustomEditor(
		document: vscode.CustomDocument,
		panel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		panel.webview.html = "Opened a file in an external program. I should close shortly, but it's OK to close me if not.";
		await this.openFile(document.uri);
		// Calling dispose directly shows an error message, but doing it with setInterval doesn't!
		setInterval(() => panel.dispose(), 0);
	}

	private displayError(err: unknown): void {
		vscode.window.showErrorMessage(`Couldn't open file: ${err}`);
	}

	private async openFile(uri: vscode.Uri): Promise<void> {
		if (!uri.scheme) {
			this.displayError(`Problematic URI: ${uri.toString()}`);
			return;
		}

		// console.log("Opening from uri", uri.toString());
		try {
			if (!(await open(decodeURIComponent(uri.toString())))) {
				this.displayError("process exited with nonzero exit code");
			}
		} catch (error) {
			this.displayError(error);
		}
	}

	//#region CustomEditorProvider Stubs
	public async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<vscode.CustomDocument> {
		return { uri, dispose: () => { } };
	}

	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	public saveCustomDocument(document: vscode.CustomDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		return new Promise<void>(() => { });
	}

	public saveCustomDocumentAs(document: vscode.CustomDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
		return new Promise<void>(() => { });
	}

	public revertCustomDocument(document: vscode.CustomDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		return new Promise<void>(() => { });
	}

	public backupCustomDocument(document: vscode.CustomDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
		return new Promise<vscode.CustomDocumentBackup>(() => { });
	}
	//#endregion
}