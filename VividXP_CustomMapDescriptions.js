//=============================================================================
// VividXP_CustomMapDescriptions.js
//=============================================================================

/*:
* @plugindesc VividXP: Custom Map Descriptions v1.1
* @author Lene
*
* @help In the map editor, enter <vividXPMD:(description)> in the notes field
* to set a description to be shown upon entering a map.
*
*
* @param Map Description Background Fill Type
* @desc Background fill to be applied to the description window. (solid/gradient)
* Default: solid
* @default solid
*
* @param Map Description Window Color
* @desc The color in rgba format (r,g,b,a).
* Only applicable when Map Description Background Fill Type is set to solid
* Default: rgba(0, 0, 0, 0.6)
* @default rgba(0, 0, 0, 0.6)
*
* @param Map Description Window Gradient Color 1
* @desc The left gradient color (in rgba format) of window.
* Only applicable when Map Description Background Fill Type is set to gradient
* Default: rgba(0, 0, 0, 0.6)
* @default rgba(0, 0, 0, 0.6)
*
* @param Map Description Window Gradient Color 2
* @desc The right gradient color (in rgba format) of window.
* Only applicable when Map Description Background Fill Type is set to gradient
* Default: rgba(0, 0, 0, 0)
* @default rgba(0, 0, 0, 0)
*
* @param Map Description Window Gradient Midpoint
* @desc Window Location where Gradient Color 1 begins transitioning to Gradient Color 2. Number from 0-100
* Default: 50
* @default 50
*
* @param Map Description Window Height
* @desc The height of the description window, in lines
* Default: 3
* @default 3
*
* @param Map Name and Description Display Time
* @desc How long should map name and description appear when displayed, in frames.
* Default: 150
* @default 150
*/

var VividXP = VividXP || {};
VividXP.CustomMapDescriptions = {};
VividXP.CustomMapDescriptions.Parameters = PluginManager.parameters('VividXP_CustomMapDescriptions');

VividXP.CustomMapDescriptions.BackgroundFillType = String(
    VividXP.CustomMapDescriptions.Parameters["Map Description Background Fill Type"]
).toLowerCase();
VividXP.CustomMapDescriptions.GradientColor1 = String(
    VividXP.CustomMapDescriptions.Parameters["Map Description Window Gradient Color 1"]
);
VividXP.CustomMapDescriptions.GradientColor2 = String(
    VividXP.CustomMapDescriptions.Parameters["Map Description Window Gradient Color 2"]
);

VividXP.CustomMapDescriptions.GradientMidpoint = Number(
    VividXP.CustomMapDescriptions.Parameters["Map Description Window Gradient Midpoint"]
);

VividXP.CustomMapDescriptions.WindowBackgroundColor = String(
    VividXP.CustomMapDescriptions.Parameters["Map Description Window Color"]
);
VividXP.CustomMapDescriptions.WindowHeight = Number(
    VividXP.CustomMapDescriptions.Parameters["Map Description Window Height"]
);

VividXP.CustomMapDescriptions.DisplayLength = Number(
	VividXP.CustomMapDescriptions.Parameters["Map Name and Description Display Time"]
);

(function() {

    //-----------------------------------------------------------------------------
    // Window_MapDescription
    //
    // The window for displaying the map description on the map screen.

    function Window_MapDescription() {
        this.initialize.apply(this, arguments);
    }

    Window_MapDescription.prototype = Object.create(Window_Base.prototype);
    Window_MapDescription.prototype.constructor = Window_MapDescription;

    Window_MapDescription.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 0, this.lineHeight(), width, height);
        this.opacity = 0;
        this.contentsOpacity = 0;
        this._showCount = 0;
        this.refresh();
    };

    Window_MapDescription.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_MapDescription.prototype.windowHeight = function() {
        return this.fittingHeight(VividXP.CustomMapDescriptions.WindowHeight) + ( this.textPadding() * 2 );
    };

    Window_MapDescription.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this._showCount > 0 && $gameMap.isNameDisplayEnabled()) {
            this.updateFadeIn();
            this._showCount--;
        } else {
            this.updateFadeOut();
        }
    };

    Window_MapDescription.prototype.updateFadeIn = function() {
        this.contentsOpacity += 16;
    };

    Window_MapDescription.prototype.updateFadeOut = function() {
        this.contentsOpacity -= 16;
    };

    Window_MapDescription.prototype.open = function() {
        this.refresh();
        this._showCount = VividXP.CustomMapDescriptions.DisplayLength;
    };
	Window_MapName.prototype.open = function() {
		this.refresh();
		this._showCount = VividXP.CustomMapDescriptions.DisplayLength;
	};

    Window_MapDescription.prototype.close = function() {
        this._showCount = 0;
    };

    Window_MapDescription.prototype.refresh = function() {
        this.contents.clear();
        if ($gameMap.displayName()) {
            var width = this.contentsWidth();
            var height = this.contentsHeight();
            this.drawBackground(0, 0, width, height);
            this.drawTextEx(
                $dataMap.meta.vividXPMD,
                this.textPadding(),
                this.textPadding(),
                this.contentsWidth(),
                this.contentsHeight()
            );
        }
    };

    Window_MapDescription.prototype.drawBackground = function(x, y, width, height) {
        switch(VividXP.CustomMapDescriptions.BackgroundFillType) {
            case 'gradient':
                var color1 = VividXP.CustomMapDescriptions.GradientColor1;
                var color2 = VividXP.CustomMapDescriptions.GradientColor2;
                var midpoint = VividXP.CustomMapDescriptions.GradientMidpoint / 100;
                this.contents.gradientFillRect(x, y, width * midpoint, height, color2, color1);
                this.contents.gradientFillRect(
                x + width * midpoint,
                y,
                (width - (width * midpoint)),
                height,
                color1,
                color2
                );
                break;
            case 'solid':
            default:
                this.contents.fillAll(
                    VividXP.CustomMapDescriptions.WindowBackgroundColor
                );
                break;
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_Map overrides
    //
    // This plugin overrides the createDisplayObjects function to add the Map Description
    // window to the Map Scene and it overrides the Scene_Map start function to open the
    // Map Description Window in addition to the Map Name Window

    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    var _Scene_Map_start = Scene_Map.prototype.start;

    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this.createMapDescriptionWindow();
    };

    Scene_Map.prototype.createMapDescriptionWindow = function() {
        this._mapNameDescription = new Window_MapDescription();
        this.addChild(this._mapNameDescription);
    }

    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if (this._transfer) {
            this._mapNameDescription.open();
        }
    };

})();
