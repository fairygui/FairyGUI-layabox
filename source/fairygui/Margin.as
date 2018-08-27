package fairygui {
	
	public class Margin {
		public var left: Number = 0;
		public var right: Number = 0;
		public var top: Number = 0;
		public var bottom: Number = 0;

		public function copy(source: Margin): void {
			this.top = source.top;
			this.bottom = source.bottom;
			this.left = source.left;
			this.right = source.right;
		}
	}
}