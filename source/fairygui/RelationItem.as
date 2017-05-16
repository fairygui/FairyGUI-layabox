package fairygui {
	
	public class RelationItem {
		private var _owner: GObject;
		private var _target: GObject;
		private var _defs: Vector.<RelationDef>;
		private var _targetX: Number;
		private var _targetY: Number;
		private var _targetWidth: Number;
		private var _targetHeight: Number;		
		
		public function RelationItem(owner: GObject) {
			this._owner = owner;
			this._defs = new Vector.<RelationDef>();
		}
		
		public function get owner(): GObject {
			return this._owner;
		}
		
		public function set target(value: GObject):void {
			if (this._target != value) {
				if (this._target)
					this.releaseRefTarget(this._target);
				this._target = value;
				if (this._target)
					this.addRefTarget(this._target);
			}
		}
		
		public function get target(): GObject {
			return this._target;
		}
		
		public function add(relationType: Number, usePercent: Boolean): void {
			if (relationType == RelationType.Size) {
				this.add(RelationType.Width, usePercent);
				this.add(RelationType.Height, usePercent);
				return;
			}
			
			var length: Number = this._defs.length;
			for (var i: Number = 0; i < length; i++) {
				var def: RelationDef = this._defs[i];
				if (def.type == relationType)
					return;
			}
			
			this.internalAdd(relationType, usePercent);
		}
		
		public function internalAdd(relationType:Number, usePercent:Boolean):void
		{
			if (relationType == RelationType.Size)
			{
				internalAdd(RelationType.Width, usePercent);
				internalAdd(RelationType.Height, usePercent);
				return;
			}
			
			var info:RelationDef = new RelationDef();
			info.percent = usePercent;
			info.type = relationType;
			_defs.push(info);
			
			//当使用中线关联时，因为需要除以2，很容易因为奇数宽度/高度造成小数点坐标；当使用百分比时，也会造成小数坐标；
			//所以设置了这类关联的对象，自动启用pixelSnapping
			if (usePercent || relationType == RelationType.Left_Center || relationType == RelationType.Center_Center || relationType == RelationType.Right_Center
				|| relationType == RelationType.Top_Middle || relationType == RelationType.Middle_Middle || relationType == RelationType.Bottom_Middle)
				_owner.pixelSnapping = true;
		}
		
		public function remove(relationType: Number = 0): void {
			if (relationType == RelationType.Size) {
				this.remove(RelationType.Width);
				this.remove(RelationType.Height);
				return;
			}
			
			var dc: Number = this._defs.length;
			for (var k: Number = 0; k < dc; k++) {
				if (this._defs[k].type == relationType) {
					this._defs.splice(k, 1);
					break;
				}
			}
		}
		
		public function copyFrom(source: RelationItem): void {
			this.target = source.target;
			
			this._defs.length = 0;
			var length: Number = source._defs.length;
			for (var i: Number = 0; i < length; i++) {
				var info: RelationDef = source._defs[i];
				var info2: RelationDef = new RelationDef();
				info2.copyFrom(info);
				this._defs.push(info2);
			}
		}
		
		public function dispose(): void {
			if (this._target != null) {
				this.releaseRefTarget(this._target);
				this._target = null;
			}
		}
		
		public function get isEmpty(): Boolean {
			return this._defs.length == 0;
		}
		
		public function applyOnSelfResized(dWidth: Number, dHeight: Number): void {
			var ox: Number = this._owner.x;
			var oy: Number = this._owner.y;
			
			var length: Number = this._defs.length;
			for (var i: Number = 0; i < length; i++) {
				var info: RelationDef = this._defs[i];
				switch (info.type) {
					case RelationType.Center_Center:
					case RelationType.Right_Center:
						this._owner.x -= dWidth / 2;
						break;
					
					case RelationType.Right_Left:
					case RelationType.Right_Right:
						this._owner.x -= dWidth;
						break;
					
					case RelationType.Middle_Middle:
					case RelationType.Bottom_Middle:
						this._owner.y -= dHeight / 2;
						break;
					case RelationType.Bottom_Top:
					case RelationType.Bottom_Bottom:
						this._owner.y -= dHeight;
						break;
				}
			}
			
			if (ox != this._owner.x || oy != this._owner.y) {
				ox = this._owner.x - ox;
				oy = this._owner.y - oy;
				
				this._owner.updateGearFromRelations(1, ox, oy);
				
				if(this._owner.parent != null) {
					var len: Number = this._owner.parent._transitions.length;
					if(len > 0) {
						for(i = 0;i < len;++i) {
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
		}
		
		private function applyOnXYChanged(info: RelationDef, dx: Number, dy: Number): void {
			var tmp: Number;
			switch (info.type) {
				case RelationType.Left_Left:
				case RelationType.Left_Center:
				case RelationType.Left_Right:
				case RelationType.Center_Center:
				case RelationType.Right_Left:
				case RelationType.Right_Center:
				case RelationType.Right_Right:
					this._owner.x += dx;
					break;
				
				case RelationType.Top_Top:
				case RelationType.Top_Middle:
				case RelationType.Top_Bottom:
				case RelationType.Middle_Middle:
				case RelationType.Bottom_Top:
				case RelationType.Bottom_Middle:
				case RelationType.Bottom_Bottom:
					this._owner.y += dy;
					break;
				
				case RelationType.Width:
				case RelationType.Height:
					break;
				
				case RelationType.LeftExt_Left:
				case RelationType.LeftExt_Right:
					tmp = this._owner.x;
					this._owner.x += dx;
					this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
					break;
				
				case RelationType.RightExt_Left:
				case RelationType.RightExt_Right:
					this._owner.width = this._owner._rawWidth + dx;
					break;
				
				case RelationType.TopExt_Top:
				case RelationType.TopExt_Bottom:
					tmp = this._owner.y;
					this._owner.y += dy;
					this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
					break;
				
				case RelationType.BottomExt_Top:
				case RelationType.BottomExt_Bottom:
					this._owner.height = this._owner._rawHeight + dy;
					break;
			}
		}
		
		private function applyOnSizeChanged(info: RelationDef): void {
			var targetX: Number, targetY: Number;
			if (this._target != this._owner.parent) {
				targetX = this._target.x;
				targetY = this._target.y;
			}
			else {
				targetX = 0;
				targetY = 0;
			}
			var v: Number, tmp: Number;
			
			switch (info.type) {
				case RelationType.Left_Left:
					if(info.percent && _target==_owner.parent)
					{
						v = _owner.x - targetX;
						if (info.percent)
							v = v / _targetWidth * _target._rawWidth;
						_owner.x = targetX + v;
					}
					break;
				case RelationType.Left_Center:
					v = this._owner.x - (targetX + this._targetWidth / 2);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + this._target._rawWidth / 2 + v;
					break;
				case RelationType.Left_Right:
					v = this._owner.x - (targetX + this._targetWidth);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + this._target._rawWidth + v;
					break;
				case RelationType.Center_Center:
					v = this._owner.x + this._owner._rawWidth / 2 - (targetX + this._targetWidth / 2);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth / 2;
					break;
				case RelationType.Right_Left:
					v = this._owner.x + this._owner._rawWidth - targetX;
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + v - this._owner._rawWidth;
					break;
				case RelationType.Right_Center:
					v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth / 2);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth;
					break;
				case RelationType.Right_Right:
					v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					this._owner.x = targetX + this._target._rawWidth + v - this._owner._rawWidth;
					break;
				
				case RelationType.Top_Top:
					if(info.percent && _target==_owner.parent)
					{
						v = _owner.y - targetY;
						if (info.percent)
							v = v / _targetHeight * _target._rawHeight;
						_owner.y = targetY + v;
					}
					break;
				case RelationType.Top_Middle:
					v = this._owner.y - (targetY + this._targetHeight / 2);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + this._target._rawHeight / 2 + v;
					break;
				case RelationType.Top_Bottom:
					v = this._owner.y - (targetY + this._targetHeight);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + this._target._rawHeight + v;
					break;
				case RelationType.Middle_Middle:
					v = this._owner.y + this._owner._rawHeight / 2 - (targetY + this._targetHeight / 2);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight / 2;
					break;
				case RelationType.Bottom_Top:
					v = this._owner.y + this._owner._rawHeight - targetY;
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + v - this._owner._rawHeight;
					break;
				case RelationType.Bottom_Middle:
					v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight / 2);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight;
					break;
				case RelationType.Bottom_Bottom:
					v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					this._owner.y = targetY + this._target._rawHeight + v - this._owner._rawHeight;
					break;
				
				case RelationType.Width:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v = this._owner.sourceWidth - this._target._initWidth;
					else
						v = this._owner._rawWidth - this._targetWidth;
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					if(this._target == this._owner.parent)
						this._owner.setSize(this._target._rawWidth + v,this._owner._rawHeight,true);
					else
						this._owner.width = this._target._rawWidth + v;
					break;
				case RelationType.Height:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v = this._owner.sourceHeight - this._target._initHeight;
					else
						v = this._owner._rawHeight - this._targetHeight;
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					if(this._target == this._owner.parent)
						this._owner.setSize(this._owner._rawWidth,this._target._rawHeight + v,true);
					else
						this._owner.height = this._target._rawHeight + v;
					break;
				
				case RelationType.LeftExt_Left:
					break;
				case RelationType.LeftExt_Right:
					v = this._owner.x - (targetX + this._targetWidth);
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					tmp = this._owner.x;
					this._owner.x = targetX + this._target._rawWidth + v;
					this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
					break;
				case RelationType.RightExt_Left:
					break;
				case RelationType.RightExt_Right:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v = this._owner.sourceWidth - (targetX + this._target._initWidth);
					else
						v = this._owner.width - (targetX + this._targetWidth);
					if (this._owner != this._target.parent)
						v += this._owner.x;
					if (info.percent)
						v = v / this._targetWidth * this._target._rawWidth;
					if (this._owner != this._target.parent)
						this._owner.width = targetX + this._target._rawWidth + v - this._owner.x;
					else
						this._owner.width = targetX + this._target._rawWidth + v;
					break;
				case RelationType.TopExt_Top:
					break;
				case RelationType.TopExt_Bottom:
					v = this._owner.y - (targetY + this._targetHeight);
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					tmp = this._owner.y;
					this._owner.y = targetY + this._target._rawHeight + v;
					this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
					break;
				case RelationType.BottomExt_Top:
					break;
				case RelationType.BottomExt_Bottom:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v = this._owner.sourceHeight - (targetY + this._target._initHeight);
					else
						v = this._owner._rawHeight - (targetY + this._targetHeight);
					if (this._owner != this._target.parent)
						v += this._owner.y;
					if (info.percent)
						v = v / this._targetHeight * this._target._rawHeight;
					if (this._owner != this._target.parent)
						this._owner.height = targetY + this._target._rawHeight + v - this._owner.y;
					else
						this._owner.height = targetY + this._target._rawHeight + v;
					break;
			}
		}
		
		private function addRefTarget(target: GObject): void {
			if (target != this._owner.parent)
				target.on(Events.XY_CHANGED, this, this.__targetXYChanged);
			target.on(Events.SIZE_CHANGED, this, this.__targetSizeChanged);
			target.on(Events.SIZE_DELAY_CHANGE, this, this.__targetSizeWillChange);
			
			this._targetX = this._target.x;
			this._targetY = this._target.y;
			this._targetWidth = this._target._rawWidth;
			this._targetHeight = this._target._rawHeight;
		}
		
		private function releaseRefTarget(target: GObject): void {
			target.off(Events.XY_CHANGED, this, this.__targetXYChanged);
			target.off(Events.SIZE_CHANGED, this, this.__targetSizeChanged);
			target.off(Events.SIZE_DELAY_CHANGE, this, this.__targetSizeWillChange);
		}
		
		private function __targetXYChanged(): void {
			if (this._owner.relations.handling != null || this._owner.group!=null && this._owner.group._updating)
			{
				this._targetX = this._target.x;
				this._targetY = this._target.y;
				return;
			}
			
			this._owner.relations.handling = this._target;
			
			var ox: Number = this._owner.x;
			var oy: Number = this._owner.y;
			var dx: Number = this._target.x - this._targetX;
			var dy: Number = this._target.y - this._targetY;
			var length: Number = this._defs.length;
			for (var i: Number = 0; i < length; i++) {
				var info: RelationDef = this._defs[i];
				this.applyOnXYChanged(info, dx, dy);
			}
			this._targetX = this._target.x;
			this._targetY = this._target.y;
			
			if (ox != this._owner.x || oy != this._owner.y) {
				ox = this._owner.x - ox;
				oy = this._owner.y - oy;
				
				this._owner.updateGearFromRelations(1, ox, oy);
				
				if(this._owner.parent != null) {
					var len: Number = this._owner.parent._transitions.length;
					if(len > 0) {
						for(i = 0;i < len;++i) {
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
			this._owner.relations.handling = null;
		}
		
		private function __targetSizeChanged(): void {
			if (this._owner.relations.handling != null)
				return;
			
			this._owner.relations.handling = this._target;
			
			var ox: Number = this._owner.x;
			var oy: Number = this._owner.y;
			var ow: Number = this._owner._rawWidth;
			var oh: Number = this._owner._rawHeight;
			var length: Number = this._defs.length;
			for (var i: Number = 0; i < length; i++) {
				var info: RelationDef = this._defs[i];
				this.applyOnSizeChanged(info);
			}
			this._targetWidth = this._target._rawWidth;
			this._targetHeight = this._target._rawHeight;
			
			if (ox != this._owner.x || oy != this._owner.y) {
				ox = this._owner.x - ox;
				oy = this._owner.y - oy;
				
				this._owner.updateGearFromRelations(1, ox, oy);
				
				if(this._owner.parent != null) {
					var len: Number = this._owner.parent._transitions.length;
					if(len > 0) {
						for(i = 0;i < len;++i) {
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
			
			if(ow != this._owner._rawWidth || oh != this._owner._rawHeight) {
				ow = this._owner._rawWidth - ow;
				oh = this._owner._rawHeight - oh;
				
				this._owner.updateGearFromRelations(2, ow, oh);
			}
			
			this._owner.relations.handling = null;
		}
		
		private function __targetSizeWillChange(): void {
			this._owner.relations.sizeDirty = true;
		}
	}
}


class RelationDef {
	public var percent: Boolean;
	public var type: Number;
	
	public function RelationDef() {
	}
	
	public function copyFrom(source: RelationDef): void {
		this.percent = source.percent;
		this.type = source.type;
	}
}