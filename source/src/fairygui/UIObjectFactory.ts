namespace fgui {
    export class UIObjectFactory {
        public static packageItemExtensions: any = {};
        private static loaderType: any;

        public static setExtension(url: string, type: any): void {
            if (url == null)
                throw new Error("Invaild url: " + url);

            var pi: PackageItem = UIPackage.getItemByURL(url);
            if (pi != null)
                pi.extensionType = type;

            UIObjectFactory.packageItemExtensions[url] = type;
        }

        public static setPackageItemExtension(url: string, type: any): void {
            UIObjectFactory.setExtension(url, type);
        }

        public static setLoaderExtension(type: any): void {
            UIObjectFactory.loaderType = type;
        }

        public static resolvePackageItemExtension(pi: PackageItem): void {
            var extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.id + pi.id];
            if (!extensionType)
                extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.name + "/" + pi.name];
            if (extensionType)
                pi.extensionType = extensionType;
        }

        public static newObject(pi: PackageItem, userClass?: any): GObject {
            var obj: GObject;

            if (pi.type == PackageItemType.Component) {
                if (userClass)
                    obj = new userClass();
                else if (pi.extensionType)
                    obj = new pi.extensionType();
                else
                    obj = UIObjectFactory.newObject2(pi.objectType);
            }
            else
                obj = UIObjectFactory.newObject2(pi.objectType);

            if (obj)
                obj.packageItem = pi;

            return obj;
        }

        /**
         * @see ObjectType
         */
        public static newObject2(type: number): GObject {
            switch (type) {
                case ObjectType.Image:
                    return new GImage();

                case ObjectType.MovieClip:
                    return new GMovieClip();

                case ObjectType.Component:
                    return new GComponent();

                case ObjectType.Text:
                    return new GBasicTextField();

                case ObjectType.RichText:
                    return new GRichTextField();

                case ObjectType.InputText:
                    return new GTextInput();

                case ObjectType.Group:
                    return new GGroup();

                case ObjectType.List:
                    return new GList();

                case ObjectType.Graph:
                    return new GGraph();

                case ObjectType.Loader:
                    if (UIObjectFactory.loaderType)
                        return new UIObjectFactory.loaderType();
                    else
                        return new GLoader();

                case ObjectType.Button:
                    return new GButton();

                case ObjectType.Label:
                    return new GLabel();

                case ObjectType.ProgressBar:
                    return new GProgressBar();

                case ObjectType.Slider:
                    return new GSlider();

                case ObjectType.ScrollBar:
                    return new GScrollBar();

                case ObjectType.ComboBox:
                    return new GComboBox();

                case ObjectType.Tree:
                    return new GTree();

                default:
                    return null;
            }
        }
    }
}