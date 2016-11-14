package fairygui {

    public class GearDisplay extends GearBase {
		public var pages:Array;
		
        public function GearDisplay(owner: GObject) {
            super(owner);
        }

		override protected function init():void
		{
			this.pages = null;
		}

		override public function apply(): void {
			if(!this._controller || this.pages==null || this.pages.length==0 
				|| this.pages.indexOf(this._controller.selectedPageId)!=-1)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        }
    }
}