package fairygui {
	import laya.events.Event;
	import laya.maths.Point;
	
	public class DragDropManager {
		
		private var _agent: GLoader;
		private var _sourceData: Object;
		
		private static var _inst: DragDropManager;
		public static function get inst(): DragDropManager {
			if(DragDropManager._inst == null)
				DragDropManager._inst = new DragDropManager();
			return DragDropManager._inst;
		}
		
		public function DragDropManager() {
			this._agent = new GLoader();
			this._agent.draggable = true;
			this._agent.touchable = false;//important
			this._agent.setSize(100,100);
			this._agent.setPivot(0.5, 0.5, true);
			this._agent.align = "center";
			this._agent.verticalAlign = "middle";
			this._agent.sortingOrder = 1000000;
			this._agent.on(Events.DRAG_END, this, this.__dragEnd);
		}
		
		public function get dragAgent(): GObject {
			return this._agent;
		}
		
		public function get dragging(): Boolean {
			return this._agent.parent != null;
		}
		
		public function startDrag(source: GObject,icon: String,sourceData: *,touchPointID: Number = -1): void {
			if(this._agent.parent != null)
				return;
			
			this._sourceData = sourceData;
			this._agent.url = icon;
			GRoot.inst.addChild(this._agent);
			var pt: Point = GRoot.inst.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
			this._agent.setXY(pt.x,pt.y);
			this._agent.startDrag(touchPointID);
		}
		
		public function cancel(): void {
			if(this._agent.parent != null) {
				this._agent.stopDrag();
				GRoot.inst.removeChild(this._agent);
				this._sourceData = null;
			}
		}
		
		private function __dragEnd(evt:Event): void {
			if(this._agent.parent == null) //cancelled
				return;
			
			GRoot.inst.removeChild(this._agent);
			
			var sourceData: * = this._sourceData;
			this._sourceData = null;
			
			var obj: GObject = GObject.cast(evt.target);
			while(obj != null) {
				if(obj.displayObject.hasListener(Events.DROP)) {
					obj.requestFocus();
					obj.displayObject.event(Events.DROP, [sourceData, Events.createEvent(Events.DROP, obj.displayObject, evt)]);
					return;
				}
				
				obj = obj.parent;
			}
		}
	}
}
