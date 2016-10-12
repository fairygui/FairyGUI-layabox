package fairygui {

    public class GearColor extends GearBase {
        private var _storage: Object;
        private var _default: String;

        public function GearColor(owner: GObject) {
            super(owner);
        }
        
        override protected function init(): void {
            this._default = IColorGear(this._owner).color;
            this._storage = {};
        }

		override protected function addStatus(pageId: String, value: String): void {
			if(value=="-")
				return;
			
            if (pageId == null)
                this._default = value;
            else
                this._storage[pageId] = value;
        }

		override public function apply(): void {
            this._owner._gearLocked = true;

            var data: * = this._storage[this._controller.selectedPageId];
            if (data != undefined)
				IColorGear(this._owner).color = data;
            else
				IColorGear(this._owner).color = this._default;

            this._owner._gearLocked = false;
        }

		override public function updateState(): void {
			if (this._controller == null || this._owner._gearLocked || this._owner._underConstruct)
				return;

            this._storage[this._controller.selectedPageId] = IColorGear(this._owner).color;
        }
    }
}