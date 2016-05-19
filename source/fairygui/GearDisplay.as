package fairygui {

    public class GearDisplay extends GearBase {
        public function GearDisplay(owner: GObject) {
            super(owner);
        }

		override protected function get connected(): Boolean {
            if (this._controller && !this._pageSet.empty)
                return this._pageSet.containsId(this._controller.selectedPageId);
            else
                return true;
        }

		override public function apply(): void {
            if(this.connected)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        }
    }
}