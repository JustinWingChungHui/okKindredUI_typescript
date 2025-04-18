import store from '../store/store';

export default class BrowserDetection {

    public static isXamarinApp(): boolean {
        return store.state.userAgent.toLowerCase().indexOf('xamarin') > -1;
    }

    public static isAndroidWebView(): boolean {
        return store.state.userAgent.toLowerCase().indexOf('; wv') > -1;
    }

    public static isAndroid(): boolean {
        return store.state.userAgent.toLowerCase().indexOf('android') > -1;
    }

    public static isFirefox(): boolean {
        return store.state.userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    public static is_iOS(): boolean {
        if (!!navigator.platform) {
            while (BrowserDetection.iDevices.length) {
                if (navigator.platform === BrowserDetection.iDevices.pop()) { return true; }
            }
        }

        return store.state.userAgent.toLowerCase().indexOf('ios') > -1;
    }

    public static isMobileMenuOpen(): boolean {
        const mobileMenu = document.getElementById('nav_collapse') as HTMLDivElement;
        if (!mobileMenu) {
            return false;
        } else {
            return mobileMenu.clientHeight > 80;
        }
    }

    public static debugState(): string {
        return `isXamarinApp: ${BrowserDetection.isXamarinApp()}
        isAndroid: ${BrowserDetection.isAndroid()}
        isFirefox: ${BrowserDetection.isFirefox()}
        isMobileMenuOpen: ${BrowserDetection.isMobileMenuOpen()}`;
    }

    private static iDevices: string[] = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
    ];
}
