package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.utils.Ease;

    public class GearBase {
        public static var disableAllTweenEffect:Boolean = false;
        
        protected var _pageSet: PageOptionSet;
        protected var _tween: Boolean;
        protected var _easeType: Function;
        protected var _tweenTime: Number;
        protected var _delay: Number;

        protected var _owner: GObject;
        protected var _controller: Controller;

        public function GearBase(owner: GObject) {
            this._owner = owner;
            this._pageSet = new PageOptionSet();
            this._easeType = Ease.QuadOut;
            this._tweenTime = 0.3;
            this._delay = 0;
        }

        public function get controller(): Controller {
            return this._controller;
        }

        public function set controller(val: Controller):void {
            if (val != this._controller) {
                this._controller = val;
                this._pageSet.controller = val;
                this._pageSet.clear();
                if(this._controller)
                    this.init();
            }
        }

        public function getPageSet(): PageOptionSet {
            return this._pageSet;
        }

        public function get tween(): Boolean {
            return this._tween;
        }

        public function set tween(val: Boolean):void {
            this._tween = val;
        }
        
        public function get delay(): Number {
            return this._delay;
        }

        public function set delay(val: Number):void {
            this._delay = val;
        }

        public function get tweenTime(): Number {
            return this._tweenTime;
        }

        public function set tweenTime(value: Number):void {
            this._tweenTime = value;
        }

        public function get easeType(): Function {
            return this._easeType;
        }

        public function set easeType(value: Function):void {
            this._easeType = value;
        }

        public function setup(xml: Object): void {
            this._controller = this._owner.parent.getController(xml.getAttribute("controller"));
            if(this._controller == null)
                return;
            
            this.init();
            
            var str: String;
            str = xml.getAttribute("pages");
            var pages: Array;
            if (str)
                pages = str.split(",");
            else
                pages = [];
            var length1: Number = pages.length;
            for (var i1: Number = 0; i1 < length1; i1++) {
                str = pages[i1];
                this._pageSet.addById(str);
            }

            str = xml.getAttribute("tween");
            if (str)
                this._tween = true;

            str = xml.getAttribute("ease");
            if (str)
                this._easeType = ToolSet.parseEaseType(str);

            str = xml.getAttribute("duration");
            if (str)
                this._tweenTime = parseFloat(str);
                
            str = xml.getAttribute("delay");
            if (str)
                this._delay = parseFloat(str);

            str = xml.getAttribute("values");
            var values: Array;
            if (str)
                values = xml.getAttribute("values").split("|");
            else
                values = [];

            for (var i: Number = 0; i < values.length; i++) {
                str = values[i];
                if (str != "-")
                    this.addStatus(pages[i], str);
            }
            str = xml.getAttribute("default");
            if (str)
                this.addStatus(null, str);
        }

        protected function get connected(): Boolean {
            if (this._controller && !this._pageSet.empty)
                return this._pageSet.containsId(this._controller.selectedPageId);
            else
                return false;
        }
        
        protected function addStatus(pageId: String, value: String): void {
            
        }
        
        protected function init():void {
            
        }
                
        public function apply(): void {
        }

        public function updateState(): void {
        }
    }
}
