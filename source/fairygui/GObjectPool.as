package fairygui {
	
	public class GObjectPool {
		private var _pool: Object;
		private var _count: Number = 0;
		
		public function GObjectPool() {
			this._pool = {};
		}
		
		public function clear(): void {
			for (var i1:String in this._pool) {
				var arr: Array = this._pool[i1];
				var cnt: Number = arr.length;
				for (var i: Number = 0; i < cnt; i++)
					arr[i].dispose();
			}
			this._pool = {};
			this._count = 0;
		}
		
		public function get count(): Number {
			return this._count;
		}
		
		public function getObject(url: String): GObject {
			url = UIPackage.normalizeURL(url);
			if(url==null)
				return null;
			
			var arr: Array = this._pool[url];
			if (arr != null && arr.length>0) {
				this._count--;
				return arr.shift();
			}
			
			var child: GObject = UIPackage.createObjectFromURL(url);
			return child;
		}
		
		public function returnObject(obj: GObject): void {
			var url: String = obj.resourceURL;
			if (!url)
				return;
			
			var arr: Array = this._pool[url];
			if (arr == null) {
				arr = [];
				this._pool[url] = arr;
			}
			
			this._count++;
			arr.push(obj);
		}
	}
}