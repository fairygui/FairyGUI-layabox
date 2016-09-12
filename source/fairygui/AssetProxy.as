package fairygui
{
	import laya.utils.Handler;

	public final class AssetProxy
	{
		
		private var _asset:*;
		
		public function AssetProxy()
		{
			_asset = Laya.loader;
		}
		
		private static var  _inst: AssetProxy;
		
		public static function get inst(): AssetProxy {
			if(AssetProxy._inst == null)
				_inst = new AssetProxy();
			return AssetProxy._inst;
		}
		
		public function getRes(url:String):*
		{
			return _asset.getRes(url);
		}
		
		public function load(url:*, complete:Handler = null, progress:Handler = null, type:String = null, priority:int = 1, cache:Boolean = true):void
		{
			_asset.load(url, complete, progress, type, priority, cache);
		}
		
		public function setAsset(asset:*):void
		{
			_asset = asset;
		}
		
	}
}