package fairygui {
	import laya.events.EventDispatcher;
	import laya.utils.Handler;

    public class Controller extends EventDispatcher {
        private var _name: String;
        private var _selectedIndex: Number = 0;
        private var _previousIndex: Number = 0;
        private var _pageIds: Vector.<String>;
        private var _pageNames: Vector.<String>;
        private var _pageTransitions: Vector.<PageTransition>;
        private var _playingTransition: Transition;
        
        public var _parent: GComponent;
        public var _autoRadioGroupDepth: Boolean;
        
        private static var _nextPageId:Number = 0;

        public function Controller() {
            super();
            this._pageIds = new Vector.<String>();
            this._pageNames = new Vector.<String>();
            this._selectedIndex = -1;
            this._previousIndex = -1;
        }

        public function get name(): String {
            return this._name;
        }

        public function set name(value: String):void {
            this._name = value;
        }

        public function get parent(): GComponent {
            return this._parent;
        }

        public function get selectedIndex(): Number {
            return this._selectedIndex;
        }

        public function set selectedIndex(value: Number):void {
            if(this._selectedIndex != value) {
                if(value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this._parent.applyController(this);

                this.event(Events.STATE_CHANGED);

                if(this._playingTransition) {
                    this._playingTransition.stop();
                    this._playingTransition = null;
                }

                if(this._pageTransitions) {
                    var len: Number = this._pageTransitions.length;
                    for(var i: Number = 0;i < len;i++) {
                        var pt: PageTransition = this._pageTransitions[i];
                        if(pt.toIndex == this._selectedIndex && (pt.fromIndex == -1 || pt.fromIndex==this._previousIndex)) {
                            this._playingTransition = this.parent.getTransition(pt.transitionName);
                            break;
                        }
                    }
                    
                    if(this._playingTransition)
                        this._playingTransition.play(Handler.create(this, function(): void { this._playingTransition = null; }));
                }
            }
        }

        //功能和设置selectedIndex一样，但不会触发事件
        public function setSelectedIndex(value: Number = 0): void {
            if (this._selectedIndex != value) {
                if(value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;
                    
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this._parent.applyController(this);
                    
                if(this._playingTransition) {
                    this._playingTransition.stop();
                    this._playingTransition = null;
                }
            }
        }

        public function get previsousIndex(): Number {
            return this._previousIndex;
        }

        public function get selectedPage(): String {
            if (this._selectedIndex == -1)
                return null;
            else
                return this._pageNames[this._selectedIndex];
        }

        public function set selectedPage(val: String):void {
            var i: Number = this._pageNames.indexOf(val);
            if (i == -1)
                i = 0;
            this.selectedIndex = i;
        }

        //功能和设置selectedPage一样，但不会触发事件
        public function setSelectedPage(value: String): void {
            var i: Number = this._pageNames.indexOf(value);
            if (i == -1)
                i = 0;
            this.setSelectedIndex(i);
        }

        public function get previousPage(): String {
            if (this._previousIndex == -1)
                return null;
            else
                return this._pageNames[this._previousIndex];
        }

        public function get pageCount(): Number {
            return this._pageIds.length;
        }

        public function getPageName(index: Number = 0): String {
            return this._pageNames[index];
        }

        public function addPage(name: String= ""): void {
            this.addPageAt(name, this._pageIds.length);
        }

        public function addPageAt(name: String, index: Number = 0): void {
            var nid: String = "" + (Controller._nextPageId++);
            if (index == this._pageIds.length) {
                this._pageIds.push(nid);
                this._pageNames.push(name);
            }
            else {
                this._pageIds.splice(index, 0, nid);
                this._pageNames.splice(index, 0, name);
            }
        }

        public function removePage(name: String): void {
            var i: Number = this._pageNames.indexOf(name);
            if (i != -1) {
                this._pageIds.splice(i, 1);
                this._pageNames.splice(i, 1);
                if (this._selectedIndex >= this._pageIds.length)
                    this.selectedIndex = this._selectedIndex - 1;
                else
                    this._parent.applyController(this);
            }
        }

        public function removePageAt(index: Number = 0): void {
            this._pageIds.splice(index, 1);
            this._pageNames.splice(index, 1);
            if (this._selectedIndex >= this._pageIds.length)
                this.selectedIndex = this._selectedIndex - 1;
            else
                this._parent.applyController(this);
        }

        public function clearPages(): void {
            this._pageIds.length = 0;
            this._pageNames.length = 0;
            if (this._selectedIndex != -1)
                this.selectedIndex = -1;
            else
                this._parent.applyController(this);
        }
        
        public function hasPage(aName:String):Boolean {
            return this._pageNames.indexOf(aName) != -1;
        }

        public function getPageIndexById(aId: String): Number {
            return this._pageIds.indexOf(aId);
        }

        public function getPageIdByName(aName: String): String {
            var i: Number = this._pageNames.indexOf(aName);
            if(i != -1)
                return this._pageIds[i];
            else
                return null;
        }

        public function getPageNameById(aId: String): String {
            var i: Number = this._pageIds.indexOf(aId);
            if(i != -1)
                return this._pageNames[i];
            else
                return null;
        }

        public function getPageId(index: Number = 0): String {
            return this._pageIds[index];
        }

        public function get selectedPageId(): String {
            if (this._selectedIndex == -1)
                return null;
            else
                return this._pageIds[this._selectedIndex];
        }

        public function set selectedPageId(val: String):void {
            var i: Number = this._pageIds.indexOf(val);
            this.selectedIndex = i;
        }
        
        public function set oppositePageId(val: String):void {
            var i: Number = this._pageIds.indexOf(val);
            if(i > 0)
                this.selectedIndex = 0;
            else if(this._pageIds.length > 1)
                this.selectedIndex = 1;
        }
        
        public function get previousPageId(): String {
            if(this._previousIndex == -1)
                return null;
            else
                return this._pageIds[this._previousIndex];
        }

        public function setup(xml: Object): void {
            this._name = xml.getAttribute("name");
            this._autoRadioGroupDepth = xml.getAttribute("autoRadioGroupDepth") == "true";
            
            var i: Number = 0;
            var k: Number = 0;
            var str: String = xml.getAttribute("pages");
            if (str && str!="") {
                var arr: Array = str.split(",");
                var cnt: Number = arr.length;
                for (i = 0; i < cnt; i += 2) {
                    this._pageIds.push(arr[i]);
                    this._pageNames.push(arr[i + 1]);
                }
            }
            
            str = xml.getAttribute("transitions");
            if(str && str!="") {
                this._pageTransitions = new Vector.<PageTransition>();
                arr = str.split(",");
                cnt = arr.length;
                for(i = 0;i < cnt;i++) {
                    str = arr[i];
                    if(!str)
                        continue;

                    var pt: PageTransition = new PageTransition();
                    k = str.indexOf("=");
                    pt.transitionName = str.substr(k + 1);
                    str = str.substring(0,k);
                    k = str.indexOf("-");
                    pt.toIndex = parseInt(str.substring(k + 1));
                    str = str.substring(0,k);
                    if(str == "*")
                        pt.fromIndex = -1;
                    else
                        pt.fromIndex = parseInt(str);
                    this._pageTransitions.push(pt);
                }
            }

            if (this._parent && this._pageIds.length > 0)
                this._selectedIndex = 0;
            else
                this._selectedIndex = -1;
        }
    }
}

class PageTransition
{
	public var transitionName:String;
	public var fromIndex: Number = 0;
	public var toIndex: Number = 0;
}