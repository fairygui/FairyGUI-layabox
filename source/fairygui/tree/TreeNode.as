package fairygui.tree
{
	import fairygui.GComponent;
	
	public class TreeNode
	{
		private var _data:Object;
		
		private var _parent:TreeNode;
		private var _children:Vector.<TreeNode>;
		private var _expanded:Boolean;
		private var _tree:TreeView;
		private var _cell:GComponent;
		private var _level:int = 0;
		
		public function TreeNode(hasChild:Boolean)
		{
			if(hasChild)
				_children = new Vector.<TreeNode>();
		}
		
		final public function set expanded(value:Boolean):void
		{
			if(_children==null)
				return;
			
			if(_expanded!=value)
			{
				_expanded = value;
				if(_tree!=null)
				{
					if(_expanded)
						_tree.afterExpanded(this);
					else
						_tree.afterCollapsed(this);
				}
			}			
		}
		
		final public function get expanded():Boolean
		{
			return _expanded;
		}
		
		final public function get isFolder():Boolean
		{
			return _children!=null;
		}
		
		final public function get parent():TreeNode
		{
			return _parent;
		}
		
		final public function set data(value:Object):void
		{
			_data = value;
		}
		
		final public function get data():Object
		{
			return _data;
		}
		
		final public function get text():String
		{
			if(_cell!=null)
				return _cell.text;
			else
				return null;
		}
		
		final public function get cell():GComponent
		{
			return _cell;
		}
		
		internal function setCell(value:GComponent):void
		{
			_cell = value;
		}
		
		final public function get level():int
		{
			return _level;
		}
		
		internal function setLevel(value:int):void
		{
			_level = value;
		}
		
		public function addChild(child:TreeNode):TreeNode
		{
			addChildAt(child, _children.length);
			return child;
		}
		
		public function addChildAt(child:TreeNode, index:int):TreeNode
		{
			if(!child)
				throw new Error("child is null");

			var numChildren:int = _children.length; 
			
			if (index >= 0 && index <= numChildren)
			{
				if (child._parent == this)
				{
					setChildIndex(child, index); 
				}
				else
				{
					if(child._parent)
						child._parent.removeChild(child);
					
					var cnt:int = _children.length;
					if (index == cnt) 
						_children.push(child);
					else
						_children.splice(index, 0, child);
					
					child._parent = this;
					child._level = this._level+1;
					child.setTree(_tree);
					if(this._cell!=null && this._cell.parent!=null && _expanded)
						_tree.afterInserted(child);
				}
				
				return child;
			}
			else
			{
				throw new Error("Invalid child index");
			}
		}

		public function removeChild(child:TreeNode):TreeNode
		{
			var childIndex:int = _children.indexOf(child);
			if (childIndex != -1)
			{
				removeChildAt(childIndex);
			}
			return child;
		}
		
		public function removeChildAt(index:int):TreeNode
		{
			if (index >= 0 && index < numChildren)
			{
				var child:TreeNode = _children[index];
				_children.splice(index, 1);
				
				child._parent = null;
				if(_tree!=null)
				{
					child.setTree(null);
					_tree.afterRemoved(child);
				}
				
				return child;
			}
			else
			{
				throw new Error("Invalid child index");
			}
		}
		
		public function removeChildren(beginIndex:int=0, endIndex:int=-1):void
		{
			if (endIndex < 0 || endIndex >= numChildren) 
				endIndex = numChildren - 1;
			
			for (var i:int=beginIndex; i<=endIndex; ++i)
				removeChildAt(beginIndex);
		}
		
		public function getChildAt(index:int):TreeNode
		{
			if (index >= 0 && index < numChildren)
				return _children[index];
			else
				throw new Error("Invalid child index");
		}
	
		public function getChildIndex(child:TreeNode):int
		{
			return _children.indexOf(child);
		}
		
		public function getPrevSibling():TreeNode
		{
			if(_parent==null)
				return null;
			
			var i:int = _parent._children.indexOf(this);
			if(i<=0)
				return null;
			
			return _parent._children[i-1];
		}
		
		public function getNextSibling():TreeNode
		{
			if(_parent==null)
				return null;
			
			var i:int = _parent._children.indexOf(this);
			if(i<0 || i>=_parent._children.length-1)
				return null;
			
			return _parent._children[i+1];
		}
		
		public function setChildIndex(child:TreeNode, index:int):void
		{
			var oldIndex:int = _children.indexOf(child);
			if (oldIndex == -1) 
				throw new Error("Not a child of this container");
			
			var cnt:int = _children.length;
			if(index<0)
				index = 0;
			else if(index>cnt)
				index = cnt;
			
			if(oldIndex==index)
				return;
			
			_children.splice(oldIndex, 1);
			_children.splice(index, 0, child);
			if(this._cell!=null && this._cell.parent!=null && _expanded)
				_tree.afterMoved(child);
		}
		
		public function swapChildren(child1:TreeNode, child2:TreeNode):void
		{
			var index1:int = _children.indexOf(child1);
			var index2:int = _children.indexOf(child2);
			if (index1 == -1 || index2 == -1)
				throw new Error("Not a child of this container");
			swapChildrenAt(index1, index2);
		}
		
		public function swapChildrenAt(index1:int, index2:int):void
		{
			var child1:TreeNode = _children[index1];
			var child2:TreeNode = _children[index2];
			
			setChildIndex(child1, index2);
			setChildIndex(child2, index1);
		}
		
		final public function get numChildren():int 
		{ 
			return _children.length; 
		}
		
		final public function get tree():TreeView
		{
			return _tree;
		}

		internal function setTree(value:TreeView):void
		{
			_tree = value;
			if(_tree!=null && _tree.treeNodeWillExpand && _expanded)
				_tree.treeNodeWillExpand.runWith(this);			
			
			if(_children!=null)
			{
				var cnt:int = _children.length;
				for(var i:int=0;i<cnt;i++)
				{
					var node:TreeNode = _children[i];
					node._level = _level+1;
					node.setTree(value);
				}
			}
		}
	}
}