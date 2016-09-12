package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.events.Event;
	import laya.media.Sound;
	import laya.utils.Utils;

    public class GButton extends GComponent {
        protected var _titleObject: GObject;
        protected var _iconObject: GObject;
        protected var _relatedController: Controller;

        private var _mode: int;
        private var _selected: Boolean;
        private var _title: String;
        private var _selectedTitle: String;
        private var _icon: String;
        private var _selectedIcon: String;
        private var _sound: String;
        private var _soundVolumeScale: Number = 0;
        private var _pageOption: PageOption;
        private var _buttonController: Controller;
        private var _changeStateOnClick: Boolean;
        private var _linkedPopup: GObject;
        private var _downEffect:Number = 0;
        private var _downEffectValue:Number = 0;

        private var _down: Boolean;
        private var _over: Boolean;

        public static const UP: String = "up";
        public static const DOWN: String = "down";
        public static const OVER: String = "over";
        public static const SELECTED_OVER: String = "selectedOver";
        public static const DISABLED: String = "disabled";
        public static const SELECTED_DISABLED: String = "selectedDisabled";
        
        public function GButton() {
            super();

            this._mode = ButtonMode.Common;
            this._title = "";
            this._icon = "";
            this._sound = fairygui.UIConfig.buttonSound;
            this._soundVolumeScale = fairygui.UIConfig.buttonSoundVolumeScale;
            this._pageOption = new PageOption();
            this._changeStateOnClick = true;
            this._downEffectValue = 0.8;
        }

        public function get icon(): String {
            return this._icon;
        }

        public function set icon(value: String):void {
            this._icon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if(this._iconObject is GLoader)
                GLoader(this._iconObject).url = value;
            else if(this._iconObject is GLabel)
                GLabel(this._iconObject).icon = value;
            else if(this._iconObject is GButton)
                GButton(this._iconObject).icon = value;       
        }

        public function get selectedIcon(): String {
            return this._selectedIcon;
        }

        public function set selectedIcon(value: String):void {
            this._selectedIcon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if(this._iconObject is GLoader)
               GLoader(this._iconObject).url = value;
            else if(this._iconObject is GLabel)
                GLabel(this._iconObject).icon = value;
            else if(this._iconObject is GButton)
               GButton(this._iconObject).icon = value;
        }

        public function get title(): String {
            return this._title;
        }

        public function set title(value: String):void {
            this._title = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
        }

        override public function get text(): String {
            return this.title;
        }

		override public function set text(value: String):void {
            this.title = value;
        }

        public function get selectedTitle(): String {
            return this._selectedTitle;
        }

        public function set selectedTitle(value: String):void {
            this._selectedTitle = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
        }

        public function get titleColor(): String {
            if(this._titleObject is GTextField)
                return GTextField(this._titleObject).color;
            else if(this._titleObject is GLabel)
                return GLabel(this._titleObject).titleColor;
            else if(this._titleObject is GButton)
                return GButton(this._titleObject).titleColor;
            else
                return "#000000";
        }

        public function set titleColor(value: String):void {
            if(this._titleObject is GTextField)
                GTextField(this._titleObject).color = value;
            else if(this._titleObject is GLabel)
                GLabel(this._titleObject).titleColor = value;
            else if(this._titleObject is GButton)
                GButton(this._titleObject).titleColor = value;
        }

        public function get sound(): String {
            return this._sound;
        }

        public function set sound(val: String):void {
            this._sound = val;
        }

        public function get soundVolumeScale(): Number {
            return this._soundVolumeScale;
        }
        
        public function set soundVolumeScale(value: Number):void {
            this._soundVolumeScale = value;
        }
        
        public function set selected(val: Boolean):void {
            if (this._mode == ButtonMode.Common)
                return;

            if (this._selected != val) {
                this._selected = val;
                if(this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                    if(this._selected)
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else {
                    if(this._selected)
                        this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);
                    else
                        this.setState(this._over ? GButton.OVER : GButton.UP);
                }
                if(this._selectedTitle && this._titleObject)
                    this._titleObject.text = this._selected ? this._selectedTitle : this._title;
                if(this._selectedIcon) {
                    var str: String = this._selected ? this._selectedIcon : this._icon;
                    if(this._iconObject is GLoader)
                        GLoader(this._iconObject).url = str;
                    else if(this._iconObject is GLabel)
                        GLabel(this._iconObject).icon = str;
                    else if(this._iconObject is GButton)
                        GButton(this._iconObject).icon = str;
                }
                if(this._relatedController
                    && this._parent
                    && !this._parent._buildingDisplayList) {
                    if(this._selected)
                    {
                        this._relatedController.selectedPageId = this._pageOption.id;
                        if(this._relatedController._autoRadioGroupDepth)
                            this._parent.adjustRadioGroupDepth(this,this._relatedController);
                    }
                    else if(this._mode == ButtonMode.Check && this._relatedController.selectedPageId == this._pageOption.id)
                        this._relatedController.oppositePageId = this._pageOption.id;
                }
            }
        }

        public function get selected(): Boolean {
            return this._selected;
        }

        public function get mode(): int {
            return this._mode;
        }

        public function set mode(value: int):void {
            if (this._mode != value) {
                if (value == ButtonMode.Common)
                    this.selected = false;
                this._mode = value;
            }
        }

        public function get relatedController(): Controller {
            return this._relatedController;
        }

        public function set relatedController(val: Controller):void {
            if (val != this._relatedController) {
                this._relatedController = val;
                this._pageOption.controller = val;
                this._pageOption.clear();
            }
        }

        public function get pageOption(): PageOption {
            return this._pageOption;
        }

        public function get changeStateOnClick(): Boolean {
            return this._changeStateOnClick;
        }

        public function set changeStateOnClick(value: Boolean):void {
            this._changeStateOnClick = value;
        }

        public function get linkedPopup(): GObject {
            return this._linkedPopup;
        }

        public function set linkedPopup(value: GObject):void {
            this._linkedPopup = value;
        }

        public function fireClick(downEffect: Boolean= true): void {
            if (downEffect && this._mode == ButtonMode.Common) {
                this.setState(GButton.OVER);
                Laya.timer.once(100, this, this.setState, [GButton.DOWN]);
                Laya.timer.once(200, this, this.setState, [GButton.UP]);
            }
            this.__click(Events.createEvent(Event.CLICK, this.displayObject));
        }

        protected function setState(val: String): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
                
            if(this._downEffect == 1) {
                var cnt: Number = this.numChildren;
                if(val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    var r: Number = this._downEffectValue * 255;
                    var color: String = Utils.toHexColor((r << 16) + (r << 8) + r);
                    for(var i: Number = 0;i < cnt;i++) {
                        var obj: GObject = this.getChildAt(i);
                        if((obj is GImage) || (obj is GLoader) 
                            || (obj is GMovieClip))//instanceof IColorGear
                            IColorGear(obj).color = color;
                    }
                }
                else {
                    for(i = 0;i < cnt;i++) {
                        obj = this.getChildAt(i);
                        if((obj is GImage) || (obj is GLoader)
                            || (obj is GMovieClip))
                            IColorGear(obj).color = "#FFFFFF";
                    }
                }
            }
            else if(this._downEffect == 2) {
                if(val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED)
                    this.setScale(this._downEffectValue,this._downEffectValue);
                else
                    this.setScale(1,1);
            }
        }

		override public function handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._relatedController == c)
                this.selected = this._pageOption.id == c.selectedPageId;
        }
        
		override protected function handleGrayChanged(): void {
            if(this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                if(this.grayed) {
                    if(this._selected && this._buttonController.hasPage(GButton.SELECTED_DISABLED))
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else if(this._selected)
                    this.setState(GButton.DOWN);
                else
                    this.setState(GButton.UP);
            }
            else
                super.handleGrayChanged();
        }

		override protected function constructFromXML(xml: Object): void {
            super.constructFromXML(xml);

            xml = ToolSet.findChildNode(xml, "Button");

            var str: String;
            str = xml.getAttribute("mode");
            if (str)
                this._mode = ButtonMode.parse(str);
                
            str= xml.getAttribute("sound");
            if(str)
                this._sound = str;
            str = xml.getAttribute("volume");
            if(str)
                this._soundVolumeScale = parseInt(str) / 100;
            str = xml.getAttribute("downEffect");
            if(str)
            {
                this._downEffect = str=="dark"?1:(str=="scale"?2:0);
                str = xml.getAttribute("downEffectValue");
                this._downEffectValue = parseFloat(str);
            }

            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");

            if (this._mode == ButtonMode.Common)
                this.setState(GButton.UP);
                
            this.on(Event.ROLL_OVER, this, this.__rollover);
		    this.on(Event.ROLL_OUT, this, this.__rollout);
            this.on(Event.MOUSE_DOWN, this, this.__mousedown);
            this.on(Event.CLICK, this, this.__click);
        }

		override public function setup_afterAdd(xml: Object): void {
            super.setup_afterAdd(xml);
			
			if(this._downEffect==2)
				this.setPivot(0.5, 0.5);

            xml = ToolSet.findChildNode(xml, "Button");
            if (xml) {
                var str: String;
                str = xml.getAttribute("title");
				if (str)
					this.title = str;
                str = xml.getAttribute("icon");
				if (str)
					this.icon = str;
                str = xml.getAttribute("selectedTitle");
                if (str)
                    this.selectedTitle = str;
                str = xml.getAttribute("selectedIcon");
                if (str)
                    this.selectedIcon = str;

                str = xml.getAttribute("titleColor");
                if (str)
                    this.titleColor = str;
                str = xml.getAttribute("controller");
                if (str)
                    this._relatedController = this._parent.getController(str);
                else
                    this._relatedController = null;
                this._pageOption.id = xml.getAttribute("page");
                this.selected = xml.getAttribute("checked") == "true";
            }
        }

        private function  __rollover(): void {
            if(!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = true;
            if (this._down)
                return;
			
			if(this.grayed && this._buttonController.hasPage(GButton.DISABLED))
				return;

            this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        }

        private function  __rollout(): void {
            if(!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = false;
            if (this._down)
                return;
			
			if(this.grayed && this._buttonController.hasPage(GButton.DISABLED))
				return;

            this.setState(this._selected ? GButton.DOWN : GButton.UP);
        }

        private function  __mousedown(evt:Event): void {
            this._down = true;
            GRoot.inst.checkPopups(evt.target);
            
            Laya.stage.on(Event.MOUSE_UP, this, this.__mouseup);

            if(this._mode == ButtonMode.Common) {
                if(this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                    this.setState(GButton.SELECTED_DISABLED);
                else
                    this.setState(GButton.DOWN);
            }

            if (this._linkedPopup != null) {
                if (this._linkedPopup is Window)
                   Window(this._linkedPopup).toggleStatus();
                else 
                    this.root.togglePopup(this._linkedPopup, this);
            }
        }

        private function  __mouseup(): void {
            if (this._down) {
                Laya.stage.off(Event.MOUSE_UP, this, this.__mouseup);
                this._down = false;

                if(this._mode == ButtonMode.Common) {
                    if(this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                        this.setState(GButton.DISABLED);
                    else if(this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }

        private function  __click(evt:Event): void {
            if(this._sound) {
                var pi: PackageItem = UIPackage.getItemByURL(this._sound);
                if (pi) {
                    var sound: Sound = Sound(pi.owner.getItemAsset(pi));
                    if(sound)
                        GRoot.inst.playOneShotSound(sound,this._soundVolumeScale);
                }
            }

            if (!this._changeStateOnClick)
                return;

            if (this._mode == ButtonMode.Check) {
                this.selected = !this._selected;
                Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
            }
            else if (this._mode == ButtonMode.Radio) {
                if (!this._selected) {
                    this.selected = true;
                    Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
                }
            }
        }
    }
}