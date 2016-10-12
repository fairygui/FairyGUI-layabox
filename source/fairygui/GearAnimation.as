package fairygui {

    public class GearAnimation extends GearBase {
        private var _storage: Object;
        private var _default: GearAnimationValue;

        public function GearAnimation(owner: GObject) {
            super(owner);
        }
        
        override protected function init(): void {
            this._default = new GearAnimationValue(IAnimationGear(this._owner).playing,
				IAnimationGear(this._owner).frame);
            this._storage = {};
        }

		override protected function addStatus(pageId: String, value: String): void {
			if(value=="-")
				return;
			
            var gv: GearAnimationValue;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearAnimationValue();
                this._storage[pageId] = gv;
            }
            var arr: Array = value.split(",");
            gv.frame = parseInt(arr[0]);
            gv.playing = arr[1] == "p";
        }

		override public function apply(): void {
            this._owner._gearLocked = true;

            var gv: GearAnimationValue = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;

			IAnimationGear(this._owner).frame = gv.frame;
			IAnimationGear(this._owner).playing = gv.playing;
            
            this._owner._gearLocked = false;
        }

        override public function updateState(): void {
			if (this._controller == null || this._owner._gearLocked || this._owner._underConstruct)
				return;

            var mc: IAnimationGear = IAnimationGear(this._owner);
            var gv: GearAnimationValue = this._storage[this._controller.selectedPageId];
            if(!gv) {
                gv = new GearAnimationValue();
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.frame = mc.frame;
            gv.playing = mc.playing;
        }
    }
}

class GearAnimationValue
{
	public var playing:Boolean;
	public var frame:Number;
	
	public function GearAnimationValue(playing:Boolean=true, frame:Number=0)
	{
		this.playing = playing;
		this.frame = frame;
	}
}