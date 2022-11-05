//=============================================================================
// Save Comments: adds "Save with Comments" option. Require YEP_SaveCore.
// ilih_SaveComments.js
//=============================================================================

//=============================================================================
 /*:
 * @plugindesc v1.0.0 Adds "Save with Comments" option.
 * Require YEP_SaveCore.
 * @author ilih
 *
 * @param Command
 * @desc Text for the save with comments command in the action window.
 * Default: +Comments
 * @default +Comments
 *
 * @param Help
 * @desc Help text displayed when selecting save with comments option.
 * Default: Saves the current progress with comments in your game
 * @default Saves the current progress with comments in your game
 *
 * @param Variable
 * @type number
 * @min 0
 * @desc ID of variable used to store comments.
 * @default 0
 *
 * @param Title
 * @desc Title of the comments window.
 * Default: Enter Comments
 * @default Enter Comments
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * Require YEP_SaveCore.
 * Adds "Save with Comments" option.
 * Comments are stored in the specified variable and displayed after
 * YEP_SaveCore.DataColumns.
 *
 * Free for commercial and non-commercial projects.
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.00:
 * - initial release
 */
//=============================================================================

(function() {
	let mv_parameters = PluginManager.parameters('ilih_SaveComments');
	let SaveComments = {};

	SaveComments.Command = String(mv_parameters['Command']);
	SaveComments.Help = String(mv_parameters['Help']);
	SaveComments.Variable = parseInt(mv_parameters['Variable']);
	SaveComments.Title = String(mv_parameters['Title']);

	let Window_SaveAction_maxCols = Window_SaveAction.prototype.maxCols;
	Window_SaveAction.prototype.maxCols = function() {
		return Window_SaveAction_maxCols.call(this) + 1;
	};

	let Window_SaveAction_makeCommandList = Window_SaveAction.prototype.makeCommandList;
	Window_SaveAction.prototype.makeCommandList = function() {
		let id = this.savefileId();
		let enabled = DataManager.isThisGameFile(id);
		let valid = DataManager.loadSavefileInfo(id);
		this.addCommand(this.getCommandName('load'), 'load', valid);
		this.addCommand(this.getCommandName('save'), 'save', this.isSaveEnabled());
		this.addCommand(this.getCommandName('save-comments'), 'save-comments', this.isSaveEnabled());
		this.addCommand(this.getCommandName('delete'), 'delete', enabled);
	};

	let Window_SaveAction_getCommandName = Window_SaveAction.prototype.getCommandName;
	Window_SaveAction.prototype.getCommandName = function(type) {
		if (type === 'save-comments') {
			return SaveComments.Command;
		}

		return Window_SaveAction_getCommandName.call(this, type);
	};

	let Scene_File_createActionWindow = Scene_File.prototype.createActionWindow;
	Scene_File.prototype.createActionWindow = function() {
		Scene_File_createActionWindow.call(this);
		this._actionWindow.setHandler('save-comments', this.onActionSaveComments.bind(this));
	};

	let Window_SaveAction_updateHelp = Window_SaveAction.prototype.updateHelp;
	Window_SaveAction.prototype.updateHelp = function() {
		if (this.currentSymbol() === 'save-comments')
		{
			this._helpWindow.setText(SaveComments.Help);
			return;
		}

		return Window_SaveAction_updateHelp.call(this);
	};

	let Scene_File_onConfirmOk = Scene_File.prototype.onConfirmOk;
	Scene_File.prototype.onConfirmOk = function() {
		this._confirmWindow.deactivate();
		this._confirmWindow.close();
		if (this._actionWindow.currentSymbol() === 'load')
		{
			setTimeout(this.performActionLoad.bind(this), 200);
		}
		else if (this._actionWindow.currentSymbol() === 'save')
		{
			this.require_comments = false;
			setTimeout(this.performActionSave.bind(this), 200);
		}
		else if (this._actionWindow.currentSymbol() === 'save-comments')
		{
			this.require_comments = true;
			setTimeout(this.performActionSave.bind(this), 200);
		}
		else if (this._actionWindow.currentSymbol() === 'delete')
		{
			setTimeout(this.performActionDelete.bind(this), 200);
		}
		else
		{
			this.onConfirmCancel();
		}
	};

	let Scene_File_onActionSave = Scene_File.prototype.onActionSave;
	Scene_File.prototype.onActionSave = function() {
		this.require_comments = false;
		Scene_File_onActionSave.call(this);
	};

	Scene_File.prototype.onActionSaveComments = function() {
		this.require_comments = true;
		Scene_File_onActionSave.call(this);
	};

	let Scene_File_performActionSave = Scene_File.prototype.performActionSave;
	Scene_File.prototype.performActionSave = async function() {
		let comments = this.require_comments
			? prompt(SaveComments.Title, '')
			: '';
		$gameVariables.setValue(SaveComments.Variable, comments);
		Scene_File_performActionSave.call(this);
	};


	Window_SaveInfo.prototype.column2rows = function(column) {
		let rows = 0;
		for (let i = 0; i < column.length; i++)
		{
			if (column[i].toUpperCase().trim() !== 'EMPTY')
			{
				rows += 1;
			}
		}
		
		return rows;
	}

	let Window_SaveInfo_drawColumnData = Window_SaveInfo.prototype.drawColumnData;
	Window_SaveInfo.prototype.drawColumnData = function(dy) {
		Window_SaveInfo_drawColumnData.call(this, dy);

		let rows = 0;
		rows = Math.max(rows, this.column2rows(Yanfly.Param.SaveInfoDataCol1));
		rows = Math.max(rows, this.column2rows(Yanfly.Param.SaveInfoDataCol2));
		rows = Math.max(rows, this.column2rows(Yanfly.Param.SaveInfoDataCol3));
		rows = Math.max(rows, this.column2rows(Yanfly.Param.SaveInfoDataCol4));

		dy += rows * this.lineHeight();
		let dx = 0;
		let width = this.contents.width;
		let comments = this._saveContents.variables.value(SaveComments.Variable);
		
		this.drawDarkRect(dx, dy, width, this.lineHeight());
		this.drawText(comments, dx + this.textPadding(), dy, width - this.textPadding() * 2, 'left');
	};
})();