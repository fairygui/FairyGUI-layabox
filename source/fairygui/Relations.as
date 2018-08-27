package fairygui {
	import fairygui.utils.ByteBuffer;
	
	public class Relations {
		private var _owner: GObject;
		private var _items: Vector.<RelationItem>;
		
		public var handling: GObject;
		public var sizeDirty: Boolean;
		
		public function Relations(owner: GObject) {
			this._owner = owner;
			this._items = new Vector.<RelationItem>();
		}
		
		public function add(target: GObject, relationType: Number, usePercent: Boolean= false): void {
			var length: Number = this._items.length;
			for (var i: Number = 0; i < length; i++) {
				var item: RelationItem = this._items[i];
				if (item.target == target) {
					item.add(relationType, usePercent);
					return;
				}
			}
			var newItem: RelationItem = new RelationItem(this._owner);
			newItem.target = target;
			newItem.add(relationType, usePercent);
			this._items.push(newItem);
		}
		
		public function remove(target: GObject, relationType: Number = 0): void {
			var cnt: Number = this._items.length;
			var i: Number = 0;
			while (i < cnt) {
				var item: RelationItem = this._items[i];
				if (item.target == target) {
					item.remove(relationType);
					if (item.isEmpty) {
						item.dispose();
						this._items.splice(i, 1);
						cnt--;
					}
					else
						i++;
				}
				else
					i++;
			}
		}
		
		public function contains(target: GObject): Boolean {
			var length: Number = this._items.length;
			for (var i: Number = 0; i < length; i++) {
				var item: RelationItem = this._items[i];
				if (item.target == target)
					return true;
			}
			return false;
		}
		
		public function clearFor(target: GObject): void {
			var cnt: Number = this._items.length;
			var i: Number = 0;
			while (i < cnt) {
				var item: RelationItem = this._items[i];
				if (item.target == target) {
					item.dispose();
					this._items.splice(i, 1);
					cnt--;
				}
				else
					i++;
			}
		}
		
		public function clearAll(): void {
			var length: Number = this._items.length;
			for (var i: Number = 0; i < length; i++) {
				var item: RelationItem = this._items[i];
				item.dispose();
			}
			this._items.length = 0;
		}
		
		public function copyFrom(source: Relations): void {
			this.clearAll();
			
			var arr: Vector.<RelationItem> = source._items;
			var length: Number = arr.length;
			for (var i: Number = 0; i < length; i++) {
				var ri: RelationItem = arr[i];
				var item: RelationItem = new RelationItem(this._owner);
				item.copyFrom(ri);
				this._items.push(item);
			}
		}
		
		public function dispose(): void {
			this.clearAll();
		}
		
		public function onOwnerSizeChanged(dWidth:Number, dHeight:Number, applyPivot:Boolean): void {
			if (this._items.length == 0)
				return;
			
			var length: Number = this._items.length;
			for (var i: Number = 0; i < length; i++) {
				var item: RelationItem = this._items[i];
				item.applyOnSelfResized(dWidth, dHeight, applyPivot);
			}
		}
		
		public function ensureRelationsSizeCorrect(): void {
			if (this._items.length == 0)
				return;
			
			this.sizeDirty = false;
			var length: Number = this._items.length;
			for (var i: Number = 0; i < length; i++) {
				var item: RelationItem = this._items[i];
				item.target.ensureSizeCorrect();
			}
		}
		
		public function get empty(): Boolean {
			return this._items.length == 0;
		}
		
		public function setup(buffer:ByteBuffer, parentToChild:Boolean): void {
			var cnt:int = buffer.readByte();
			var target:GObject;
			for (var i:int = 0; i < cnt; i++)
			{
				var targetIndex:int = buffer.getInt16();
				if (targetIndex == -1)
					target = _owner.parent;
				else if (parentToChild)
					target = GComponent(_owner).getChildAt(targetIndex);
				else
					target = _owner.parent.getChildAt(targetIndex);
				
				var newItem:RelationItem = new RelationItem(_owner);
				newItem.target = target;
				_items.push(newItem);
				
				var cnt2:int = buffer.readByte();
				for (var j:int = 0; j < cnt2; j++)
				{
					var rt:int = buffer.readByte();
					var usePercent:Boolean = buffer.readBool();
					newItem.internalAdd(rt, usePercent);
				}
			}
		}
	}
}