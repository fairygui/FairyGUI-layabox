///<reference path="GComponent.ts"/>

namespace fgui {
    export class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;

        private _mode: number;
        private _selected: boolean;
        private _title: string;
        private _selectedTitle: string;
        private _icon: string;
        private _selectedIcon: string;
        private _sound: string;
        private _soundVolumeScale: number = 0;
        private _buttonController: Controller;
        private _relatedController: Controller;
        private _relatedPageId: string;
        private _changeStateOnClick: boolean;
        private _linkedPopup: GObject;
        private _downEffect: number = 0;
        private _downEffectValue: number = 0;
        private _downScaled: boolean = false;

        private _down: boolean;
        private _over: boolean;

        public static UP: string = "up";
        public static DOWN: string = "down";
        public static OVER: string = "over";
        public static SELECTED_OVER: string = "selectedOver";
        public static DISABLED: string = "disabled";
        public static SELECTED_DISABLED: string = "selectedDisabled";

        constructor() {
            super();

            this._mode = ButtonMode.Common;
            this._title = "";
            this._icon = "";
            this._sound = UIConfig.buttonSound;
            this._soundVolumeScale = UIConfig.buttonSoundVolumeScale;
            this._changeStateOnClick = true;
            this._downEffectValue = 0.8;
        }

        public get icon(): string {
            return this._icon;
        }

        public set icon(value: string) {
            this._icon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if (this._iconObject != null)
                this._iconObject.icon = value;
            this.updateGear(7);
        }

        public get selectedIcon(): string {
            return this._selectedIcon;
        }

        public set selectedIcon(value: string) {
            this._selectedIcon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if (this._iconObject != null)
                this._iconObject.icon = value;
        }

        public get title(): string {
            return this._title;
        }

        public set title(value: string) {
            this._title = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
            this.updateGear(6);
        }

        public get text(): string {
            return this.title;
        }

        public set text(value: string) {
            this.title = value;
        }

        public get selectedTitle(): string {
            return this._selectedTitle;
        }

        public set selectedTitle(value: string) {
            this._selectedTitle = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
        }

        public get titleColor(): string {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.color;
            else
                return "#000000";
        }

        public set titleColor(value: string) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.color = value;
            this.updateGear(4);
        }

        public get titleFontSize(): number {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.fontSize;
            else
                return 0;
        }

        public set titleFontSize(value: number) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.fontSize = value;
        }

        public get sound(): string {
            return this._sound;
        }

        public set sound(val: string) {
            this._sound = val;
        }

        public get soundVolumeScale(): number {
            return this._soundVolumeScale;
        }

        public set soundVolumeScale(value: number) {
            this._soundVolumeScale = value;
        }

        public set selected(val: boolean) {
            if (this._mode == ButtonMode.Common)
                return;

            if (this._selected != val) {
                this._selected = val;
                if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                    if (this._selected)
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else {
                    if (this._selected)
                        this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);
                    else
                        this.setState(this._over ? GButton.OVER : GButton.UP);
                }
                if (this._selectedTitle && this._titleObject)
                    this._titleObject.text = this._selected ? this._selectedTitle : this._title;
                if (this._selectedIcon) {
                    var str: string = this._selected ? this._selectedIcon : this._icon;
                    if (this._iconObject != null)
                        this._iconObject.icon = str;
                }
                if (this._relatedController
                    && this._parent
                    && !this._parent._buildingDisplayList) {
                    if (this._selected) {
                        this._relatedController.selectedPageId = this._relatedPageId;
                        if (this._relatedController.autoRadioGroupDepth)
                            this._parent.adjustRadioGroupDepth(this, this._relatedController);
                    }
                    else if (this._mode == ButtonMode.Check && this._relatedController.selectedPageId == this._relatedPageId)
                        this._relatedController.oppositePageId = this._relatedPageId;
                }
            }
        }

        public get selected(): boolean {
            return this._selected;
        }

        /**
         * @see ButtonMode
         */
        public get mode(): number {
            return this._mode;
        }

        /**
         * @see ButtonMode
         */
        public set mode(value: number) {
            if (this._mode != value) {
                if (value == ButtonMode.Common)
                    this.selected = false;
                this._mode = value;
            }
        }

        public get relatedController(): Controller {
            return this._relatedController;
        }

        public set relatedController(val: Controller) {
            if (val != this._relatedController) {
                this._relatedController = val;
                this._relatedPageId = null;
            }
        }

        public get relatedPageId(): string {
            return this._relatedPageId;
        }

        public set relatedPageId(val: string) {
            this._relatedPageId = val;
        }

        public get changeStateOnClick(): boolean {
            return this._changeStateOnClick;
        }

        public set changeStateOnClick(value: boolean) {
            this._changeStateOnClick = value;
        }

        public get linkedPopup(): GObject {
            return this._linkedPopup;
        }

        public set linkedPopup(value: GObject) {
            this._linkedPopup = value;
        }

        public getTextField(): GTextField {
            if (this._titleObject instanceof GTextField)
                return <GTextField>this._titleObject;
            else if (this._titleObject instanceof GLabel)
                return (<GLabel>(this._titleObject)).getTextField();
            else if (this._titleObject instanceof GButton)
                return (<GButton>this._titleObject).getTextField();
            else
                return null;
        }

        public fireClick(downEffect: boolean = true): void {
            if (downEffect && this._mode == ButtonMode.Common) {
                this.setState(GButton.OVER);
                Laya.timer.once(100, this, this.setState, [GButton.DOWN], false);
                Laya.timer.once(200, this, this.setState, [GButton.UP], false);
            }
            this.__click(Events.createEvent(Laya.Event.CLICK, this.displayObject));
        }

        protected setState(val: string): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;

            if (this._downEffect == 1) {
                var cnt: number = this.numChildren;
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    var r: number = this._downEffectValue * 255;
                    var color: string = Laya.Utils.toHexColor((r << 16) + (r << 8) + r);
                    for (var i: number = 0; i < cnt; i++) {
                        var obj: GObject = this.getChildAt(i);
                        if (!(obj instanceof GTextField))
                            obj.setProp(ObjectPropID.Color, color);
                    }
                }
                else {
                    for (i = 0; i < cnt; i++) {
                        obj = this.getChildAt(i);
                        if (!(obj instanceof GTextField))
                            obj.setProp(ObjectPropID.Color, "#FFFFFF");
                    }
                }
            }
            else if (this._downEffect == 2) {
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    if (!this._downScaled) {
                        this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
                        this._downScaled = true;
                    }
                }
                else {
                    if (this._downScaled) {
                        this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
                        this._downScaled = false;
                    }
                }
            }
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._relatedController == c)
                this.selected = this._relatedPageId == c.selectedPageId;
        }

        protected handleGrayedChanged(): void {
            if (this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                if (this.grayed) {
                    if (this._selected && this._buttonController.hasPage(GButton.SELECTED_DISABLED))
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else if (this._selected)
                    this.setState(GButton.DOWN);
                else
                    this.setState(GButton.UP);
            }
            else
                super.handleGrayedChanged();
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.titleColor;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            return tf.strokeColor;
                        else
                            return 0;
                    }
                case ObjectPropID.FontSize:
                    return this.titleFontSize;
                case ObjectPropID.Selected:
                    return this.selected;
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.titleColor = value;
                    break;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            tf.strokeColor = value;
                    }
                    break;
                case ObjectPropID.FontSize:
                    this.titleFontSize = value;
                    break;
                case ObjectPropID.Selected:
                    this.selected = value;
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._mode = buffer.readByte();
            var str: string = buffer.readS();
            if (str)
                this._sound = str;
            this._soundVolumeScale = buffer.getFloat32();
            this._downEffect = buffer.readByte();
            this._downEffectValue = buffer.getFloat32();
            if (this._downEffect == 2)
                this.setPivot(0.5, 0.5, this.pivotAsAnchor);

            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
            if (this._titleObject != null)
                this._title = this._titleObject.text;
            if (this._iconObject != null)
                this._icon = this._iconObject.icon;

            if (this._mode == ButtonMode.Common)
                this.setState(GButton.UP);

            this.on(Laya.Event.ROLL_OVER, this, this.__rollover);
            this.on(Laya.Event.ROLL_OUT, this, this.__rollout);
            this.on(Laya.Event.MOUSE_DOWN, this, this.__mousedown);
            this.on(Laya.Event.CLICK, this, this.__click);
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6))
                return;

            if (buffer.readByte() != this.packageItem.objectType)
                return;

            var str: string;
            var iv: number;

            str = buffer.readS();
            if (str != null)
                this.title = str;
            str = buffer.readS();
            if (str != null)
                this.selectedTitle = str;
            str = buffer.readS();
            if (str != null)
                this.icon = str;
            str = buffer.readS();
            if (str != null)
                this.selectedIcon = str;
            if (buffer.readBool())
                this.titleColor = buffer.readColorS();
            iv = buffer.getInt32();
            if (iv != 0)
                this.titleFontSize = iv;
            iv = buffer.getInt16();
            if (iv >= 0)
                this._relatedController = this.parent.getControllerAt(iv);
            this._relatedPageId = buffer.readS();

            str = buffer.readS();
            if (str != null)
                this._sound = str;
            if (buffer.readBool())
                this._soundVolumeScale = buffer.getFloat32();

            this.selected = buffer.readBool();
        }

        private __rollover(): void {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = true;
            if (this._down)
                return;

            if (this.grayed && this._buttonController.hasPage(GButton.DISABLED))
                return;

            this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        }

        private __rollout(): void {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = false;
            if (this._down)
                return;

            if (this.grayed && this._buttonController.hasPage(GButton.DISABLED))
                return;

            this.setState(this._selected ? GButton.DOWN : GButton.UP);
        }

        private __mousedown(evt: Laya.Event): void {
            this._down = true;
            GRoot.inst.checkPopups(evt.target);

            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__mouseup);

            if (this._mode == ButtonMode.Common) {
                if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                    this.setState(GButton.SELECTED_DISABLED);
                else
                    this.setState(GButton.DOWN);
            }

            if (this._linkedPopup != null) {
                if (this._linkedPopup instanceof Window)
                    (<Window>this._linkedPopup).toggleStatus();
                else
                    this.root.togglePopup(this._linkedPopup, this);
            }
        }

        private __mouseup(): void {
            if (this._down) {
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.__mouseup);
                this._down = false;

                if (this._displayObject == null)
                    return;

                if (this._mode == ButtonMode.Common) {
                    if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                        this.setState(GButton.DISABLED);
                    else if (this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }

        private __click(evt: Laya.Event): void {
            if (this._sound) {
                var pi: PackageItem = UIPackage.getItemByURL(this._sound);
                if (pi)
                    GRoot.inst.playOneShotSound(pi.file);
                else
                    GRoot.inst.playOneShotSound(this._sound);
            }

            if (this._mode == ButtonMode.Check) {
                if (this._changeStateOnClick) {
                    this.selected = !this._selected;
                    Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
                }
            }
            else if (this._mode == ButtonMode.Radio) {
                if (this._changeStateOnClick && !this._selected) {
                    this.selected = true;
                    Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
                }
            }
            else {
                if (this._relatedController)
                    this._relatedController.selectedPageId = this._relatedPageId;
            }
        }
    }
}
