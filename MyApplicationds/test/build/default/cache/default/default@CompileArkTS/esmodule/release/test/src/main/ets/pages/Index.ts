if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MyPage_Params {
    currentScreen?: 'welcome' | 'main' | 'temperature';
    timerId?: number;
    formattedDate?: string;
    temperature?: number;
    timeUpdateId?: number;
    isConnected?: boolean;
    receivedData?: string;
    connectStatus?: string;
    serverIp?: string;
    serverPort?: string;
    wifiConnected?: boolean;
    wifiInfo?: string;
    wifiList?: Array<wifiManager.WifiScanInfo>;
    isScanning?: boolean;
    showWifiDialog?: boolean;
    selectedWifi?: string;
    wifiPassword?: string;
    isAPMode?: boolean;
    apSsid?: string;
    apPassword?: string;
    apIp?: string;
    apSubnet?: string;
    apGateway?: string;
    apActive?: boolean;
    apStatus?: string;
    apClientCount?: number;
    msgReceivedCount?: number;
    msgLastContent?: string;
    msgSentCount?: number;
    apCheckTimer?: number;
    waterLevel?: number;
    waterLevelMax?: number;
    waterLevelStatus?: string;
    waterLevelTime?: string;
    canvasRedrawId?: number;
    tcpSocket?: socket.TCPSocket | null;
    receiveTimer?: number;
    dataPollTimer?: number;
    receiveBuffer?: string;
    lastWaterLevelTime?: number;
    waterLevelCache?: number[];
    settings?: RenderingContextSettings;
    context?: CanvasRenderingContext2D;
    xData?: number[];
    yData?: number[];
    smoothedYData?: number[];
    canvasWidth?: number;
    canvasHeight?: number;
    badReadCount?: number;
}
import type { BusinessError } from "@ohos:base";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
import type { Permissions } from "@ohos:abilityAccessCtrl";
import util from "@ohos:util";
import wifiManager from "@ohos:wifiManager";
import socket from "@ohos:net.socket";
class MyPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentScreen = new ObservedPropertySimplePU('welcome', this, "currentScreen");
        this.__timerId = new ObservedPropertySimplePU(0, this, "timerId");
        this.__formattedDate = new ObservedPropertySimplePU("", this, "formattedDate");
        this.__temperature = new ObservedPropertySimplePU(0, this, "temperature");
        this.__timeUpdateId = new ObservedPropertySimplePU(0, this, "timeUpdateId");
        this.__isConnected = new ObservedPropertySimplePU(false, this, "isConnected");
        this.__receivedData = new ObservedPropertySimplePU('', this, "receivedData");
        this.__connectStatus = new ObservedPropertySimplePU('未连接', this, "connectStatus");
        this.__serverIp = new ObservedPropertySimplePU('192.168.4.1', this, "serverIp");
        this.__serverPort = new ObservedPropertySimplePU('6666', this, "serverPort");
        this.__wifiConnected = new ObservedPropertySimplePU(false, this, "wifiConnected");
        this.__wifiInfo = new ObservedPropertySimplePU('未连接WiFi', this, "wifiInfo");
        this.__wifiList = new ObservedPropertyObjectPU([], this, "wifiList");
        this.__isScanning = new ObservedPropertySimplePU(false, this, "isScanning");
        this.__showWifiDialog = new ObservedPropertySimplePU(false, this, "showWifiDialog");
        this.__selectedWifi = new ObservedPropertySimplePU('', this, "selectedWifi");
        this.__wifiPassword = new ObservedPropertySimplePU('', this, "wifiPassword");
        this.__isAPMode = new ObservedPropertySimplePU(false, this, "isAPMode");
        this.__apSsid = new ObservedPropertySimplePU('FishTank_AP', this, "apSsid");
        this.__apPassword = new ObservedPropertySimplePU('12345678', this, "apPassword");
        this.__apIp = new ObservedPropertySimplePU('192.168.43.1', this, "apIp");
        this.__apSubnet = new ObservedPropertySimplePU('255.255.255.0', this, "apSubnet");
        this.__apGateway = new ObservedPropertySimplePU('192.168.43.1', this, "apGateway");
        this.__apActive = new ObservedPropertySimplePU(false, this, "apActive");
        this.__apStatus = new ObservedPropertySimplePU('AP模式未启用', this, "apStatus");
        this.__apClientCount = new ObservedPropertySimplePU(0, this, "apClientCount");
        this.__msgReceivedCount = new ObservedPropertySimplePU(0, this, "msgReceivedCount");
        this.__msgLastContent = new ObservedPropertySimplePU('等待接收...', this, "msgLastContent");
        this.__msgSentCount = new ObservedPropertySimplePU(0, this, "msgSentCount");
        this.apCheckTimer = 0;
        this.__waterLevel = new ObservedPropertySimplePU(0, this, "waterLevel");
        this.__waterLevelMax = new ObservedPropertySimplePU(30, this, "waterLevelMax");
        this.__waterLevelStatus = new ObservedPropertySimplePU('等待数据...', this, "waterLevelStatus");
        this.__waterLevelTime = new ObservedPropertySimplePU('--:--:--', this, "waterLevelTime");
        this.__canvasRedrawId = new ObservedPropertySimplePU(0, this, "canvasRedrawId");
        this.tcpSocket = null;
        this.receiveTimer = 0;
        this.dataPollTimer = 0;
        this.receiveBuffer = '';
        this.lastWaterLevelTime = 0;
        this.waterLevelCache = [];
        this.settings = new RenderingContextSettings(true);
        this.context = new CanvasRenderingContext2D(this.settings);
        this.xData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        this.yData = [];
        this.smoothedYData = [];
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.badReadCount = 0;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MyPage_Params) {
        if (params.currentScreen !== undefined) {
            this.currentScreen = params.currentScreen;
        }
        if (params.timerId !== undefined) {
            this.timerId = params.timerId;
        }
        if (params.formattedDate !== undefined) {
            this.formattedDate = params.formattedDate;
        }
        if (params.temperature !== undefined) {
            this.temperature = params.temperature;
        }
        if (params.timeUpdateId !== undefined) {
            this.timeUpdateId = params.timeUpdateId;
        }
        if (params.isConnected !== undefined) {
            this.isConnected = params.isConnected;
        }
        if (params.receivedData !== undefined) {
            this.receivedData = params.receivedData;
        }
        if (params.connectStatus !== undefined) {
            this.connectStatus = params.connectStatus;
        }
        if (params.serverIp !== undefined) {
            this.serverIp = params.serverIp;
        }
        if (params.serverPort !== undefined) {
            this.serverPort = params.serverPort;
        }
        if (params.wifiConnected !== undefined) {
            this.wifiConnected = params.wifiConnected;
        }
        if (params.wifiInfo !== undefined) {
            this.wifiInfo = params.wifiInfo;
        }
        if (params.wifiList !== undefined) {
            this.wifiList = params.wifiList;
        }
        if (params.isScanning !== undefined) {
            this.isScanning = params.isScanning;
        }
        if (params.showWifiDialog !== undefined) {
            this.showWifiDialog = params.showWifiDialog;
        }
        if (params.selectedWifi !== undefined) {
            this.selectedWifi = params.selectedWifi;
        }
        if (params.wifiPassword !== undefined) {
            this.wifiPassword = params.wifiPassword;
        }
        if (params.isAPMode !== undefined) {
            this.isAPMode = params.isAPMode;
        }
        if (params.apSsid !== undefined) {
            this.apSsid = params.apSsid;
        }
        if (params.apPassword !== undefined) {
            this.apPassword = params.apPassword;
        }
        if (params.apIp !== undefined) {
            this.apIp = params.apIp;
        }
        if (params.apSubnet !== undefined) {
            this.apSubnet = params.apSubnet;
        }
        if (params.apGateway !== undefined) {
            this.apGateway = params.apGateway;
        }
        if (params.apActive !== undefined) {
            this.apActive = params.apActive;
        }
        if (params.apStatus !== undefined) {
            this.apStatus = params.apStatus;
        }
        if (params.apClientCount !== undefined) {
            this.apClientCount = params.apClientCount;
        }
        if (params.msgReceivedCount !== undefined) {
            this.msgReceivedCount = params.msgReceivedCount;
        }
        if (params.msgLastContent !== undefined) {
            this.msgLastContent = params.msgLastContent;
        }
        if (params.msgSentCount !== undefined) {
            this.msgSentCount = params.msgSentCount;
        }
        if (params.apCheckTimer !== undefined) {
            this.apCheckTimer = params.apCheckTimer;
        }
        if (params.waterLevel !== undefined) {
            this.waterLevel = params.waterLevel;
        }
        if (params.waterLevelMax !== undefined) {
            this.waterLevelMax = params.waterLevelMax;
        }
        if (params.waterLevelStatus !== undefined) {
            this.waterLevelStatus = params.waterLevelStatus;
        }
        if (params.waterLevelTime !== undefined) {
            this.waterLevelTime = params.waterLevelTime;
        }
        if (params.canvasRedrawId !== undefined) {
            this.canvasRedrawId = params.canvasRedrawId;
        }
        if (params.tcpSocket !== undefined) {
            this.tcpSocket = params.tcpSocket;
        }
        if (params.receiveTimer !== undefined) {
            this.receiveTimer = params.receiveTimer;
        }
        if (params.dataPollTimer !== undefined) {
            this.dataPollTimer = params.dataPollTimer;
        }
        if (params.receiveBuffer !== undefined) {
            this.receiveBuffer = params.receiveBuffer;
        }
        if (params.lastWaterLevelTime !== undefined) {
            this.lastWaterLevelTime = params.lastWaterLevelTime;
        }
        if (params.waterLevelCache !== undefined) {
            this.waterLevelCache = params.waterLevelCache;
        }
        if (params.settings !== undefined) {
            this.settings = params.settings;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.xData !== undefined) {
            this.xData = params.xData;
        }
        if (params.yData !== undefined) {
            this.yData = params.yData;
        }
        if (params.smoothedYData !== undefined) {
            this.smoothedYData = params.smoothedYData;
        }
        if (params.canvasWidth !== undefined) {
            this.canvasWidth = params.canvasWidth;
        }
        if (params.canvasHeight !== undefined) {
            this.canvasHeight = params.canvasHeight;
        }
        if (params.badReadCount !== undefined) {
            this.badReadCount = params.badReadCount;
        }
    }
    updateStateVars(params: MyPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentScreen.purgeDependencyOnElmtId(rmElmtId);
        this.__timerId.purgeDependencyOnElmtId(rmElmtId);
        this.__formattedDate.purgeDependencyOnElmtId(rmElmtId);
        this.__temperature.purgeDependencyOnElmtId(rmElmtId);
        this.__timeUpdateId.purgeDependencyOnElmtId(rmElmtId);
        this.__isConnected.purgeDependencyOnElmtId(rmElmtId);
        this.__receivedData.purgeDependencyOnElmtId(rmElmtId);
        this.__connectStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__serverIp.purgeDependencyOnElmtId(rmElmtId);
        this.__serverPort.purgeDependencyOnElmtId(rmElmtId);
        this.__wifiConnected.purgeDependencyOnElmtId(rmElmtId);
        this.__wifiInfo.purgeDependencyOnElmtId(rmElmtId);
        this.__wifiList.purgeDependencyOnElmtId(rmElmtId);
        this.__isScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__showWifiDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedWifi.purgeDependencyOnElmtId(rmElmtId);
        this.__wifiPassword.purgeDependencyOnElmtId(rmElmtId);
        this.__isAPMode.purgeDependencyOnElmtId(rmElmtId);
        this.__apSsid.purgeDependencyOnElmtId(rmElmtId);
        this.__apPassword.purgeDependencyOnElmtId(rmElmtId);
        this.__apIp.purgeDependencyOnElmtId(rmElmtId);
        this.__apSubnet.purgeDependencyOnElmtId(rmElmtId);
        this.__apGateway.purgeDependencyOnElmtId(rmElmtId);
        this.__apActive.purgeDependencyOnElmtId(rmElmtId);
        this.__apStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__apClientCount.purgeDependencyOnElmtId(rmElmtId);
        this.__msgReceivedCount.purgeDependencyOnElmtId(rmElmtId);
        this.__msgLastContent.purgeDependencyOnElmtId(rmElmtId);
        this.__msgSentCount.purgeDependencyOnElmtId(rmElmtId);
        this.__waterLevel.purgeDependencyOnElmtId(rmElmtId);
        this.__waterLevelMax.purgeDependencyOnElmtId(rmElmtId);
        this.__waterLevelStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__waterLevelTime.purgeDependencyOnElmtId(rmElmtId);
        this.__canvasRedrawId.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentScreen.aboutToBeDeleted();
        this.__timerId.aboutToBeDeleted();
        this.__formattedDate.aboutToBeDeleted();
        this.__temperature.aboutToBeDeleted();
        this.__timeUpdateId.aboutToBeDeleted();
        this.__isConnected.aboutToBeDeleted();
        this.__receivedData.aboutToBeDeleted();
        this.__connectStatus.aboutToBeDeleted();
        this.__serverIp.aboutToBeDeleted();
        this.__serverPort.aboutToBeDeleted();
        this.__wifiConnected.aboutToBeDeleted();
        this.__wifiInfo.aboutToBeDeleted();
        this.__wifiList.aboutToBeDeleted();
        this.__isScanning.aboutToBeDeleted();
        this.__showWifiDialog.aboutToBeDeleted();
        this.__selectedWifi.aboutToBeDeleted();
        this.__wifiPassword.aboutToBeDeleted();
        this.__isAPMode.aboutToBeDeleted();
        this.__apSsid.aboutToBeDeleted();
        this.__apPassword.aboutToBeDeleted();
        this.__apIp.aboutToBeDeleted();
        this.__apSubnet.aboutToBeDeleted();
        this.__apGateway.aboutToBeDeleted();
        this.__apActive.aboutToBeDeleted();
        this.__apStatus.aboutToBeDeleted();
        this.__apClientCount.aboutToBeDeleted();
        this.__msgReceivedCount.aboutToBeDeleted();
        this.__msgLastContent.aboutToBeDeleted();
        this.__msgSentCount.aboutToBeDeleted();
        this.__waterLevel.aboutToBeDeleted();
        this.__waterLevelMax.aboutToBeDeleted();
        this.__waterLevelStatus.aboutToBeDeleted();
        this.__waterLevelTime.aboutToBeDeleted();
        this.__canvasRedrawId.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentScreen: ObservedPropertySimplePU<'welcome' | 'main' | 'temperature'>;
    get currentScreen() {
        return this.__currentScreen.get();
    }
    set currentScreen(newValue: 'welcome' | 'main' | 'temperature') {
        this.__currentScreen.set(newValue);
    }
    private __timerId: ObservedPropertySimplePU<number>;
    get timerId() {
        return this.__timerId.get();
    }
    set timerId(newValue: number) {
        this.__timerId.set(newValue);
    }
    private __formattedDate: ObservedPropertySimplePU<string>;
    get formattedDate() {
        return this.__formattedDate.get();
    }
    set formattedDate(newValue: string) {
        this.__formattedDate.set(newValue);
    }
    private __temperature: ObservedPropertySimplePU<number>;
    get temperature() {
        return this.__temperature.get();
    }
    set temperature(newValue: number) {
        this.__temperature.set(newValue);
    }
    private __timeUpdateId: ObservedPropertySimplePU<number>;
    get timeUpdateId() {
        return this.__timeUpdateId.get();
    }
    set timeUpdateId(newValue: number) {
        this.__timeUpdateId.set(newValue);
    }
    private __isConnected: ObservedPropertySimplePU<boolean>;
    get isConnected() {
        return this.__isConnected.get();
    }
    set isConnected(newValue: boolean) {
        this.__isConnected.set(newValue);
    }
    private __receivedData: ObservedPropertySimplePU<string>;
    get receivedData() {
        return this.__receivedData.get();
    }
    set receivedData(newValue: string) {
        this.__receivedData.set(newValue);
    }
    private __connectStatus: ObservedPropertySimplePU<string>;
    get connectStatus() {
        return this.__connectStatus.get();
    }
    set connectStatus(newValue: string) {
        this.__connectStatus.set(newValue);
    }
    private __serverIp: ObservedPropertySimplePU<string>;
    get serverIp() {
        return this.__serverIp.get();
    }
    set serverIp(newValue: string) {
        this.__serverIp.set(newValue);
    }
    private __serverPort: ObservedPropertySimplePU<string>;
    get serverPort() {
        return this.__serverPort.get();
    }
    set serverPort(newValue: string) {
        this.__serverPort.set(newValue);
    }
    private __wifiConnected: ObservedPropertySimplePU<boolean>;
    get wifiConnected() {
        return this.__wifiConnected.get();
    }
    set wifiConnected(newValue: boolean) {
        this.__wifiConnected.set(newValue);
    }
    private __wifiInfo: ObservedPropertySimplePU<string>;
    get wifiInfo() {
        return this.__wifiInfo.get();
    }
    set wifiInfo(newValue: string) {
        this.__wifiInfo.set(newValue);
    }
    private __wifiList: ObservedPropertyObjectPU<Array<wifiManager.WifiScanInfo>>;
    get wifiList() {
        return this.__wifiList.get();
    }
    set wifiList(newValue: Array<wifiManager.WifiScanInfo>) {
        this.__wifiList.set(newValue);
    }
    private __isScanning: ObservedPropertySimplePU<boolean>;
    get isScanning() {
        return this.__isScanning.get();
    }
    set isScanning(newValue: boolean) {
        this.__isScanning.set(newValue);
    }
    private __showWifiDialog: ObservedPropertySimplePU<boolean>;
    get showWifiDialog() {
        return this.__showWifiDialog.get();
    }
    set showWifiDialog(newValue: boolean) {
        this.__showWifiDialog.set(newValue);
    }
    private __selectedWifi: ObservedPropertySimplePU<string>;
    get selectedWifi() {
        return this.__selectedWifi.get();
    }
    set selectedWifi(newValue: string) {
        this.__selectedWifi.set(newValue);
    }
    private __wifiPassword: ObservedPropertySimplePU<string>;
    get wifiPassword() {
        return this.__wifiPassword.get();
    }
    set wifiPassword(newValue: string) {
        this.__wifiPassword.set(newValue);
    }
    // AP（接入点）模式状态变量
    private __isAPMode: ObservedPropertySimplePU<boolean>;
    get isAPMode() {
        return this.__isAPMode.get();
    }
    set isAPMode(newValue: boolean) {
        this.__isAPMode.set(newValue);
    }
    private __apSsid: ObservedPropertySimplePU<string>;
    get apSsid() {
        return this.__apSsid.get();
    }
    set apSsid(newValue: string) {
        this.__apSsid.set(newValue);
    }
    private __apPassword: ObservedPropertySimplePU<string>;
    get apPassword() {
        return this.__apPassword.get();
    }
    set apPassword(newValue: string) {
        this.__apPassword.set(newValue);
    }
    private __apIp: ObservedPropertySimplePU<string>;
    get apIp() {
        return this.__apIp.get();
    }
    set apIp(newValue: string) {
        this.__apIp.set(newValue);
    }
    private __apSubnet: ObservedPropertySimplePU<string>;
    get apSubnet() {
        return this.__apSubnet.get();
    }
    set apSubnet(newValue: string) {
        this.__apSubnet.set(newValue);
    }
    private __apGateway: ObservedPropertySimplePU<string>;
    get apGateway() {
        return this.__apGateway.get();
    }
    set apGateway(newValue: string) {
        this.__apGateway.set(newValue);
    }
    private __apActive: ObservedPropertySimplePU<boolean>;
    get apActive() {
        return this.__apActive.get();
    }
    set apActive(newValue: boolean) {
        this.__apActive.set(newValue);
    }
    private __apStatus: ObservedPropertySimplePU<string>;
    get apStatus() {
        return this.__apStatus.get();
    }
    set apStatus(newValue: string) {
        this.__apStatus.set(newValue);
    }
    private __apClientCount: ObservedPropertySimplePU<number>;
    get apClientCount() {
        return this.__apClientCount.get();
    }
    set apClientCount(newValue: number) {
        this.__apClientCount.set(newValue);
    }
    private __msgReceivedCount: ObservedPropertySimplePU<number>;
    get msgReceivedCount() {
        return this.__msgReceivedCount.get();
    }
    set msgReceivedCount(newValue: number) {
        this.__msgReceivedCount.set(newValue);
    }
    private __msgLastContent: ObservedPropertySimplePU<string>;
    get msgLastContent() {
        return this.__msgLastContent.get();
    }
    set msgLastContent(newValue: string) {
        this.__msgLastContent.set(newValue);
    }
    private __msgSentCount: ObservedPropertySimplePU<number>;
    get msgSentCount() {
        return this.__msgSentCount.get();
    }
    set msgSentCount(newValue: number) {
        this.__msgSentCount.set(newValue);
    }
    private apCheckTimer: number;
    // 水位数据
    private __waterLevel: ObservedPropertySimplePU<number>;
    get waterLevel() {
        return this.__waterLevel.get();
    }
    set waterLevel(newValue: number) {
        this.__waterLevel.set(newValue);
    }
    private __waterLevelMax: ObservedPropertySimplePU<number>;
    get waterLevelMax() {
        return this.__waterLevelMax.get();
    }
    set waterLevelMax(newValue: number) {
        this.__waterLevelMax.set(newValue);
    }
    private __waterLevelStatus: ObservedPropertySimplePU<string>;
    get waterLevelStatus() {
        return this.__waterLevelStatus.get();
    }
    set waterLevelStatus(newValue: string) {
        this.__waterLevelStatus.set(newValue);
    }
    private __waterLevelTime: ObservedPropertySimplePU<string>;
    get waterLevelTime() {
        return this.__waterLevelTime.get();
    }
    set waterLevelTime(newValue: string) {
        this.__waterLevelTime.set(newValue);
    }
    private __canvasRedrawId: ObservedPropertySimplePU<number>;
    get canvasRedrawId() {
        return this.__canvasRedrawId.get();
    }
    set canvasRedrawId(newValue: number) {
        this.__canvasRedrawId.set(newValue);
    }
    private tcpSocket: socket.TCPSocket | null;
    private receiveTimer: number;
    private dataPollTimer: number;
    private receiveBuffer: string;
    private lastWaterLevelTime: number;
    private waterLevelCache: number[];
    private static readonly LEVEL_STALE_MS: number = 10000;
    private settings: RenderingContextSettings;
    private context: CanvasRenderingContext2D;
    private xData: number[];
    private yData: number[];
    private smoothedYData: number[];
    private canvasWidth: number;
    private canvasHeight: number;
    // 数据验证与平滑参数
    private static readonly MIN_TEMP: number = 0;
    private static readonly MAX_TEMP: number = 50;
    private static readonly SMOOTH_WINDOW: number = 3;
    private badReadCount: number;
    // ==================== 权限申请功能 ====================
    // 请求权限
    private async requestPermissions(): Promise<void> {
        const permissions: Array<Permissions> = [
            'ohos.permission.GET_WIFI_INFO',
            'ohos.permission.SET_WIFI_INFO',
            'ohos.permission.INTERNET',
            'ohos.permission.GET_NETWORK_INFO',
            'ohos.permission.LOCATION',
            'ohos.permission.APPROXIMATELY_LOCATION',
            'ohos.permission.MANAGE_WIFI_CONNECTION',
            'ohos.permission.MANAGE_ENTERPRISE_WIFI_CONNECTION',
            'ohos.permission.GET_WIFI_PEERS_MAC',
            'ohos.permission.GET_WIFI_CONFIG',
            'ohos.permission.SET_WIFI_CONFIG'
        ];
        const context = getContext(this) as common.UIAbilityContext;
        const atManager = abilityAccessCtrl.createAtManager();
        try {
            const result = await atManager.requestPermissionsFromUser(context, permissions);
            console.info('权限申请结果: ' + JSON.stringify(result));
        }
        catch (err) {
            console.error('权限申请失败: ' + JSON.stringify(err));
        }
    }
    // 页面显示时申请权限
    aboutToAppear() {
        this.requestPermissions();
    }
    updateDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const padZero = (num: number): string => {
            return num.toString().padStart(2, '0');
        };
        this.formattedDate = `${year}年${month}月${day}日 ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    async aboutToDisappear(): Promise<void> {
        clearTimeout(this.timerId);
        clearInterval(this.timeUpdateId);
        clearInterval(this.receiveTimer);
        clearInterval(this.apCheckTimer);
        clearInterval(this.dataPollTimer);
        await this.disconnectTCP();
    }
    startDelay() {
        clearTimeout(this.timerId);
        this.timeUpdateId = setInterval(() => {
            this.updateDateTime();
            this.checkWaterLevelStale();
        }, 1000);
        this.timerId = setTimeout(() => {
            this.currentScreen = 'main';
        }, 100);
    }
    buildLine() {
    }
    private drawAxes(width: number, height: number, dataList: number[], yDataList: number[]) {
        if (width <= 0 || height <= 0)
            return;
        const padding = 40; // 增大 padding 避免文字溢出
        const tickCount = dataList.length;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        const fontSize = Math.max(10, Math.min(12, height / 15)); // 自适应字号
        // ========== 第1步：清空画布 ==========
        this.context.clearRect(0, 0, width, height);
        // ========== 第2步：绘制X轴 ==========
        this.context.lineWidth = 1.5;
        this.context.strokeStyle = '#666666';
        this.context.font = `${fontSize}px sans-serif`;
        this.context.textAlign = 'center';
        this.context.fillStyle = '#AAAAAA';
        // X轴线
        this.context.beginPath();
        this.context.moveTo(padding, height - padding);
        this.context.lineTo(width - padding, height - padding);
        this.context.stroke();
        // X轴刻度
        for (let i = 0; i < tickCount; i++) {
            const x = padding + (graphWidth / Math.max(1, tickCount - 1)) * i;
            this.context.beginPath();
            this.context.moveTo(x, height - padding);
            this.context.lineTo(x, height - padding + 4);
            this.context.stroke();
            if (tickCount <= 20 || i % Math.ceil(tickCount / 10) === 0) {
                this.context.fillText(dataList[i].toString(), x, height - padding + fontSize + 8);
            }
        }
        // ========== 第3步：计算Y轴范围（Nice Rounding） ==========
        let yMin = 0;
        let yMax = 50;
        if (yDataList.length > 0) {
            const rawMin = Math.min(...yDataList);
            const rawMax = Math.max(...yDataList);
            const range = Math.max(rawMax - rawMin, 1);
            const paddedMin = rawMin - range * 0.15;
            const paddedMax = rawMax + range * 0.15;
            let tickStep = range / 5;
            const magnitude = Math.pow(10, Math.floor(Math.log10(tickStep)));
            const residual = tickStep / magnitude;
            if (residual <= 1.5)
                tickStep = magnitude;
            else if (residual <= 3)
                tickStep = 2 * magnitude;
            else if (residual <= 7)
                tickStep = 5 * magnitude;
            else
                tickStep = 10 * magnitude;
            yMin = Math.floor(paddedMin / tickStep) * tickStep;
            yMax = Math.ceil(paddedMax / tickStep) * tickStep;
            if (Math.abs(yMax - yMin) < tickStep * 2) {
                yMin = Math.floor(rawMin) - tickStep;
                yMax = Math.ceil(rawMax) + tickStep;
            }
        }
        // ========== 第4步：绘制Y轴 ==========
        const yTickCount = 5;
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#666666';
        this.context.textAlign = 'right';
        this.context.fillStyle = '#AAAAAA';
        for (let i = 0; i <= yTickCount; i++) {
            const yVal = yMin + (yMax - yMin) * (i / yTickCount);
            const y = (height - padding) - (graphHeight * (i / yTickCount));
            // 辅助网格线
            this.context.beginPath();
            this.context.strokeStyle = '#333355';
            this.context.moveTo(padding, y);
            this.context.lineTo(width - padding, y);
            this.context.stroke();
            // Y轴刻度线
            this.context.beginPath();
            this.context.strokeStyle = '#666666';
            this.context.moveTo(padding + 4, y);
            this.context.lineTo(padding, y);
            this.context.stroke();
            // Y轴标签
            const label = yVal % 1 === 0 ? Math.round(yVal).toString() : yVal.toFixed(1);
            this.context.fillText(label, padding - 6, y + fontSize / 3);
        }
        // ========== 第5步：绘制数据曲线（独立路径，不被后续beginPath破坏） ==========
        if (yDataList.length < 2) {
            // 单个数据点也画一个点
            if (yDataList.length === 1) {
                const ratio = (yDataList[0] - yMin) / (yMax - yMin);
                const py = (height - padding) - (graphHeight * ratio);
                const px = padding + (graphWidth / Math.max(1, tickCount - 1)) * 0;
                this.context.beginPath();
                this.context.fillStyle = '#00E5FF';
                this.context.arc(px, py, 4, 0, 2 * Math.PI);
                this.context.fill();
            }
        }
        else {
            // 多条数据：画连线
            this.context.beginPath();
            this.context.strokeStyle = '#00E5FF';
            this.context.lineWidth = 2;
            this.context.lineJoin = 'round';
            for (let j = 0; j < yDataList.length; j++) {
                const ratio = (yDataList[j] - yMin) / (yMax - yMin);
                const py = (height - padding) - (graphHeight * ratio);
                const px = padding + (graphWidth / Math.max(1, tickCount - 1)) * j;
                if (j === 0) {
                    this.context.moveTo(px, py);
                }
                else {
                    this.context.lineTo(px, py);
                }
            }
            this.context.stroke(); // ← 先stroke连线，保存路径不被破坏
        }
        // ========== 第6步：绘制数据圆点（独立于连线路径） ==========
        for (let j = 0; j < yDataList.length; j++) {
            const ratio = (yDataList[j] - yMin) / (yMax - yMin);
            const py = (height - padding) - (graphHeight * ratio);
            const px = padding + (graphWidth / Math.max(1, tickCount - 1)) * j;
            // 外圈光晕
            this.context.beginPath();
            this.context.fillStyle = 'rgba(0, 229, 255, 0.3)';
            this.context.arc(px, py, 6, 0, 2 * Math.PI);
            this.context.fill();
            // 实心圆点
            this.context.beginPath();
            this.context.fillStyle = '#00E5FF';
            this.context.arc(px, py, 3.5, 0, 2 * Math.PI);
            this.context.fill();
        }
    }
    // ==================== WiFi 功能 ====================
    // 检查WiFi状态
    private async checkWifiStatus(): Promise<void> {
        try {
            const isActive = wifiManager.isWifiActive();
            if (isActive) {
                this.wifiConnected = true;
                const linkedInfo = await wifiManager.getLinkedInfo();
                this.wifiInfo = `已连接WiFi: ${linkedInfo.ssid}`;
                console.info('WiFi已连接: ' + linkedInfo.ssid);
            }
            else {
                this.wifiConnected = false;
                this.wifiInfo = 'WiFi未连接';
                console.info('WiFi未连接');
            }
        }
        catch (err) {
            console.error('检查WiFi状态失败: ' + JSON.stringify(err));
            this.wifiInfo = 'WiFi状态未知';
        }
    }
    // 扫描WiFi列表
    private scanWifi(): void {
        try {
            this.isScanning = true;
            console.info('开始扫描WiFi...');
            // getScanInfoList 直接返回 Array，不需要 await
            const scanResults = wifiManager.getScanInfoList();
            this.wifiList = scanResults;
            this.isScanning = false;
            console.info(`扫描完成，发现 ${scanResults.length} 个WiFi`);
        }
        catch (err) {
            console.error('获取扫描结果失败: ' + JSON.stringify(err));
            this.isScanning = false;
        }
    }
    // 连接到指定WiFi
    private async connectToWifi(ssid: string, password: string): Promise<void> {
        try {
            console.info(`正在连接WiFi: ${ssid}`);
            const wifiConfig: wifiManager.WifiDeviceConfig = {
                ssid: ssid,
                preSharedKey: password,
                securityType: wifiManager.WifiSecurityType.WIFI_SEC_TYPE_PSK
            };
            // 使用候选配置API添加网络配置
            const netId: number = await wifiManager.addCandidateConfig(wifiConfig);
            console.info('候选WiFi配置已添加，netId: ' + netId);
            // 连接到候选网络 (此API返回void，不是Promise)
            wifiManager.connectToCandidateConfig(netId);
            console.info('WiFi连接请求已发送');
            // 轮询等待连接成功
            let retryCount = 0;
            const checkInterval = setInterval(() => {
                try {
                    wifiManager.getLinkedInfo().then((linkedInfo: wifiManager.WifiLinkedInfo) => {
                        if (linkedInfo.connState === wifiManager.ConnState.CONNECTED) {
                            clearInterval(checkInterval);
                            this.wifiConnected = true;
                            this.wifiInfo = `已连接WiFi: ${linkedInfo.ssid}`;
                            this.showWifiDialog = false;
                            console.info('WiFi连接成功');
                        }
                    }).catch((err: BusinessError) => {
                        console.error('检查连接状态失败: ' + JSON.stringify(err));
                    });
                }
                catch (err) {
                    console.error('轮询异常: ' + JSON.stringify(err));
                }
                retryCount++;
                if (retryCount > 20) {
                    clearInterval(checkInterval);
                    console.error('WiFi连接超时');
                }
            }, 1000);
        }
        catch (err) {
            console.error('连接WiFi失败: ' + JSON.stringify(err));
        }
    }
    // 断开WiFi连接 (非系统应用无法直接断开，清除本地状态)
    private disconnectWifi(): void {
        this.wifiConnected = false;
        this.wifiInfo = 'WiFi已断开';
        console.info('已清除WiFi连接状态，如需断开WiFi请通过系统设置操作');
    }
    // ==================== AP（接入点）模式功能 ====================
    // 检查热点状态（仅检测，不操作热点）
    private checkHotspotStatus(): void {
        try {
            const isActive = wifiManager.isHotspotActive();
            this.apActive = isActive;
            if (isActive) {
                this.apStatus = 'AP模式已激活';
                this.wifiInfo = `AP模式: ${this.apSsid}`;
                console.info('热点已激活');
            }
            else {
                this.apStatus = 'AP模式未激活';
                this.apClientCount = 0;
            }
        }
        catch (err) {
            console.error('检查热点状态失败: ' + JSON.stringify(err));
            this.apStatus = '检查AP状态失败';
        }
    }
    // 引导用户手动开启热点（系统API不提供编程开启能力）
    private enableHotspot(): void {
        this.checkHotspotStatus();
        if (this.apActive) {
            this.apStatus = 'AP模式已激活';
            this.wifiConnected = false;
            this.wifiInfo = `AP模式: ${this.apSsid}`;
            this.serverIp = this.apIp;
            this.startAPPolling();
        }
        else {
            this.apStatus = '请在系统设置中手动开启热点';
        }
    }
    // 关闭热点（清除本地状态）
    private disableHotspot(): void {
        clearInterval(this.apCheckTimer);
        this.apActive = false;
        this.apStatus = 'AP模式已关闭';
        this.apClientCount = 0;
        this.wifiInfo = '未连接WiFi';
        console.info('已清除AP状态，如需关闭热点请通过系统设置操作');
    }
    // AP状态轮询（定期检测热点状态）
    private startAPPolling(): void {
        clearInterval(this.apCheckTimer);
        this.apCheckTimer = setInterval(() => {
            try {
                this.checkHotspotStatus();
            }
            catch (err) {
                console.error('AP状态轮询异常: ' + JSON.stringify(err));
            }
        }, 5000);
    }
    // 切换AP模式
    private async toggleAPMode(): Promise<void> {
        if (this.isConnected) {
            await this.disconnectTCP();
        }
        if (this.isAPMode) {
            this.isAPMode = false;
            this.apStatus = 'AP模式未启用';
            this.serverIp = '192.168.1.100';
            if (this.apActive) {
                this.disableHotspot();
            }
        }
        else {
            this.isAPMode = true;
            this.serverIp = this.apIp;
            this.showWifiDialog = false;
            this.apStatus = '准备启用AP模式...';
        }
    }
    // ==================== TCP 功能 ====================
    // 连接到TCP（方案B：无论哪种模式，手机均作为TCP客户端连接RK2206服务器）
    private async connectTCP(): Promise<void> {
        await this.startTCPClient();
    }
    // TCP客户端模式：连接RK2206服务器
    private async startTCPClient(): Promise<void> {
        if (!this.wifiConnected) {
            console.error('WiFi未连接，无法建立TCP连接');
            this.connectStatus = 'WiFi未连接';
            return;
        }
        try {
            this.tcpSocket = socket.constructTCPSocketInstance();
            if (!this.tcpSocket) {
                console.error('创建TCP Socket失败');
                return;
            }
            const port: number = parseInt(this.serverPort);
            if (isNaN(port)) {
                console.error('端口号无效');
                return;
            }
            console.info(`正在连接TCP服务器: ${this.serverIp}:${port}`);
            // 清理旧的监听器
            this.tcpSocket.off('message');
            this.tcpSocket.off('close');
            this.tcpSocket.off('error');
            let msgCount: number = 0;
            // on('message') 兼容两种回调签名：
            //   API 22+: (value: SocketMessageInfo) => {message: ArrayBuffer, remoteInfo: ...}
            //   旧版API: 直接传递 ArrayBuffer 数据
            this.tcpSocket.on('message', (value: socket.SocketMessageInfo) => {
                msgCount++;
                this.msgReceivedCount = msgCount;
                try {
                    console.info(`[TCP-MSG #${msgCount}] 回调触发, value类型: ${typeof value}`);
                    // 尝试路径A：SocketMessageInfo.message (ArrayBuffer)
                    const msgObj = value as socket.SocketMessageInfo;
                    if (msgObj && msgObj.message && (msgObj.message as ArrayBuffer).byteLength > 0) {
                        const buf: ArrayBuffer = msgObj.message;
                        console.info(`[TCP-MSG #${msgCount}] 路径A: ArrayBuffer, byteLength=${buf.byteLength}`);
                        const decoder: util.TextDecoder = util.TextDecoder.create('utf-8');
                        const uint8Array: Uint8Array = new Uint8Array(buf);
                        const dataStr: string = decoder.decodeToString(uint8Array);
                        if (dataStr.length > 0) {
                            console.info(`[TCP-DATA #${msgCount}]: ${dataStr.substring(0, 120)}`);
                            this.msgLastContent = dataStr.substring(0, 80);
                            this.handleTCPData(dataStr);
                            return;
                        }
                    }
                    this.msgLastContent = `#${msgCount}: message为空`;
                    console.warn(`[TCP-MSG #${msgCount}] 路径A失败, message为空或byteLength=0`);
                }
                catch (err) {
                    this.msgLastContent = `#${msgCount}: 异常`;
                    console.error(`[TCP-MSG #${msgCount}] 处理异常: ${JSON.stringify(err)}`);
                }
            });
            this.tcpSocket.on('close', () => {
                console.info('TCP连接已关闭');
                this.isConnected = false;
                this.connectStatus = '已断开';
                this.tcpSocket = null;
            });
            this.tcpSocket.on('error', (err: BusinessError) => {
                console.error('TCP连接错误: ' + JSON.stringify(err));
                this.isConnected = false;
                this.connectStatus = '连接错误';
            });
            await this.tcpSocket.connect({
                address: { address: this.serverIp, port: port }
            });
            console.info('TCP客户端连接成功');
            this.isConnected = true;
            this.connectStatus = '已连接';
            // 延迟启动轮询，确保socket完全就绪
            setTimeout(() => {
                this.startDataPolling();
            }, 500);
        }
        catch (err) {
            console.error('TCP连接失败: ' + JSON.stringify(err));
            this.connectStatus = '连接失败';
            this.isConnected = false;
        }
    }
    // 发送TCP数据
    private async sendTCPData(dataStr: string): Promise<void> {
        if (!this.isConnected || !this.tcpSocket) {
            console.error('TCP未连接，无法发送数据');
            return;
        }
        try {
            await this.tcpSocket.send({
                data: dataStr + '\n'
            });
            this.msgSentCount++;
            console.info(`[TCP-SEND #${this.msgSentCount}]: ${dataStr}`);
        }
        catch (err) {
            console.error(`[TCP-SEND FAIL]: ${JSON.stringify(err)}`);
        }
    }
    // 断开TCP连接
    private async disconnectTCP(): Promise<void> {
        this.stopDataPolling();
        if (this.tcpSocket) {
            try {
                await this.tcpSocket.close();
                console.info('TCP连接已手动断开');
            }
            catch (err) {
                console.error('断开TCP连接失败: ' + JSON.stringify(err));
            }
        }
        this.tcpSocket = null;
        this.isConnected = false;
        this.connectStatus = '已断开';
    }
    // 移动平均平滑
    private smoothData(data: number[], window: number): number[] {
        if (data.length === 0) {
            return [];
        }
        const result: number[] = [];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - window + 1);
            const slice = data.slice(start, i + 1);
            const sum = slice.reduce((a, b) => a + b, 0);
            result.push(sum / slice.length);
        }
        return result;
    }
    // TCP数据分发：处理\n分隔的多行JSON，逐行解析（带缓存拼接）
    private handleTCPData(rawData: string): void {
        this.receiveBuffer += rawData;
        let idx: number;
        while ((idx = this.receiveBuffer.indexOf('\n')) >= 0) {
            const line: string = this.receiveBuffer.substring(0, idx).trim();
            this.receiveBuffer = this.receiveBuffer.substring(idx + 1);
            if (line.length > 0) {
                this.receivedData = line;
                this.parseReceivedData(line);
            }
        }
    }
    // 启动数据轮询（每3秒请求一次传感器数据）
    private startDataPolling(): void {
        this.stopDataPolling();
        // 立即请求一次数据
        this.sendTCPData('{"cmd":"get_data"}');
        this.dataPollTimer = setInterval(() => {
            if (this.isConnected) {
                this.sendTCPData('{"cmd":"get_data"}');
            }
            else {
                this.stopDataPolling();
            }
        }, 3000);
    }
    // 停止数据轮询
    private stopDataPolling(): void {
        if (this.dataPollTimer > 0) {
            clearInterval(this.dataPollTimer);
            this.dataPollTimer = 0;
        }
    }
    // 解析接收到的数据（RK2206 JSON格式，含验证、滤波、平滑）
    private parseReceivedData(dataStr: string) {
        // RK2206 JSON格式: {"temp":24.6,"water":47,"smoke_ppm":1.07,...}
        try {
            const parsed: Object = JSON.parse(dataStr);
            const json: Record<string, Object> = parsed as Record<string, Object>;
            // 解析温度 — 使用 bracket notation 兼容 ArkTS 严格类型检查
            const tempVal: Object = json['temp'];
            if (tempVal !== undefined) {
                const temp: number = Number(tempVal);
                if (!isNaN(temp)) {
                    this.processTemperature(temp);
                }
            }
            // 解析水位 — ADC原始值
            const waterVal: Object = json['water'];
            if (waterVal !== undefined) {
                const water: number = Number(waterVal);
                if (!isNaN(water)) {
                    this.processWaterLevel(water);
                }
            }
            return;
        }
        catch (e) {
            console.error('JSON解析失败: ' + dataStr.substring(0, 80));
        }
        // 兼容旧版前缀格式
        if (dataStr.startsWith('TEMP:')) {
            const temp: number = parseFloat(dataStr.substring(5).trim());
            this.processTemperature(temp);
        }
        else if (dataStr.startsWith('LEVEL:')) {
            const water: number = parseFloat(dataStr.substring(6).trim());
            this.processWaterLevel(water);
        }
    }
    // 温度数据处理流水线（5层：验证→范围→尖峰→存储→平滑）
    private processTemperature(temp: number) {
        // 1. RK2206特殊无效值处理（-999.0表示传感器未就绪）
        if (temp <= -900) {
            console.info('温度传感器未就绪 (temp <= -900)，等待有效数据...');
            return;
        }
        // 2. 基础有效性检查
        if (isNaN(temp)) {
            console.warn('接收到无效温度数据');
            this.badReadCount++;
            return;
        }
        // 3. 范围验证（鱼缸水温合理范围 0~50°C）
        if (temp < MyPage.MIN_TEMP || temp > MyPage.MAX_TEMP) {
            console.warn(`温度数据超出合理范围: ${temp}°C (范围 ${MyPage.MIN_TEMP}~${MyPage.MAX_TEMP}°C)`);
            this.badReadCount++;
            if (this.badReadCount > 5) {
                return;
            }
        }
        else {
            this.badReadCount = 0;
        }
        // 4. 异常值检测（与前值偏差超过10°C视为尖峰噪声）
        if (this.yData.length > 0) {
            const lastTemp = this.yData[this.yData.length - 1];
            if (Math.abs(temp - lastTemp) > 10) {
                console.warn(`检测到温度尖峰: ${temp}°C (前值 ${lastTemp}°C)，使用平滑值替代`);
                const corrected = lastTemp + (temp - lastTemp) * 0.3;
                this.yData.push(corrected);
                this.smoothedYData = this.smoothData(this.yData, MyPage.SMOOTH_WINDOW);
                this.temperature = corrected;
                this.redrawChart();
                return;
            }
        }
        // 5. 存储原始值
        this.temperature = temp;
        this.yData.push(temp);
        if (this.yData.length > 24) {
            this.yData.shift();
        }
        // 6. 移动平均平滑处理
        this.smoothedYData = this.smoothData(this.yData, MyPage.SMOOTH_WINDOW);
        // 触发图表重绘
        this.redrawChart();
        console.info(`水温更新: ${temp.toFixed(1)}°C (平滑值: ${this.smoothedYData[this.smoothedYData.length - 1].toFixed(1)}°C, 数据量: ${this.yData.length})`);
    }
    // 重绘水温曲线图
    private redrawChart(): void {
        const cw: number = this.canvasWidth;
        const ch: number = this.canvasHeight;
        if (cw > 0 && ch > 0) {
            this.drawAxes(cw, ch, this.xData, this.smoothedYData);
        }
    }
    // 水位数据处理（water 为 ADC 原始值 0~4095，需转换为 cm）
    private processWaterLevel(waterAdc: number) {
        // 1. 有效性检查
        if (isNaN(waterAdc)) {
            console.warn('接收到无效水位ADC数据');
            return;
        }
        // 2. ADC 原始值 → 厘米转换
        // ADC 范围 0~4095 线性映射到 0~waterLevelMax cm
        const waterCm: number = Math.round(waterAdc / 4095 * this.waterLevelMax * 10) / 10;
        // 3. 范围验证
        if (waterCm < 0 || waterCm > this.waterLevelMax) {
            console.warn(`水位数据超出范围: ${waterCm}cm (ADC=${waterAdc}, 最大 ${this.waterLevelMax}cm)`);
            return;
        }
        // 4. 缓存最近10条水位数据
        this.waterLevelCache.push(waterCm);
        if (this.waterLevelCache.length > 10) {
            this.waterLevelCache.shift();
        }
        // 5. 平滑：最近3条取平均
        const recent = this.waterLevelCache.slice(-3);
        const smoothed = recent.reduce((a, b) => a + b, 0) / recent.length;
        this.waterLevel = Math.round((smoothed - 12) * 10) / 10;
        // 6. 更新时间戳
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        this.waterLevelTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        this.lastWaterLevelTime = Date.now();
        this.waterLevelStatus = '数据正常';
        console.info(`水位更新: ${this.waterLevel.toFixed(1)}cm (ADC原始: ${waterAdc}, 转换: ${waterCm.toFixed(1)}cm)`);
    }
    // 检查水位数据是否过时
    private checkWaterLevelStale() {
        const elapsed = Date.now() - this.lastWaterLevelTime;
        if (this.lastWaterLevelTime > 0 && elapsed > MyPage.LEVEL_STALE_MS) {
            this.waterLevelStatus = `数据过时 (${Math.floor(elapsed / 1000)}秒未更新)`;
        }
    }
    // ==================== UI 构建 ====================
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 欢迎界面
            if (this.currentScreen === 'welcome') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('智能鱼缸控制系统');
                        Text.fontSize(30);
                        Text.fontColor(Color.Blue);
                        Text.margin({ bottom: 30 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('开始连接设备');
                        Button.fontSize(20);
                        Button.onClick(() => {
                            this.checkWifiStatus();
                            this.currentScreen = 'main';
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            // 主界面 - WiFi连接和控制
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 主界面 - WiFi连接和控制
            if (this.currentScreen === 'main') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('智能鱼缸');
                        Text.fontSize(28);
                        Text.fontColor(Color.Blue);
                        Text.margin({ top: 20, bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 模式切换标签
                        Row.create();
                        // 模式切换标签
                        Row.margin({ bottom: 10 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('WiFi客户端模式');
                        Button.fontSize(12);
                        Button.height(30);
                        Button.backgroundColor(this.isAPMode ? '#E0E0E0' : '#1976D2');
                        Button.fontColor(this.isAPMode ? '#666' : Color.White);
                        Button.borderRadius(15);
                        Button.onClick(() => {
                            if (this.isAPMode) {
                                this.toggleAPMode();
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('AP接入点模式');
                        Button.fontSize(12);
                        Button.height(30);
                        Button.backgroundColor(this.isAPMode ? '#E65100' : '#E0E0E0');
                        Button.fontColor(this.isAPMode ? Color.White : '#666');
                        Button.borderRadius(15);
                        Button.margin({ left: 8 });
                        Button.onClick(() => {
                            if (!this.isAPMode) {
                                this.toggleAPMode();
                            }
                        });
                    }, Button);
                    Button.pop();
                    // 模式切换标签
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 网络状态显示
                        Text.create(this.isAPMode ? this.apStatus : this.wifiInfo);
                        // 网络状态显示
                        Text.fontSize(13);
                        // 网络状态显示
                        Text.fontColor(this.isAPMode ? (this.apActive ? Color.Green : Color.Orange) : (this.wifiConnected ? Color.Green : Color.Red));
                        // 网络状态显示
                        Text.margin({ bottom: 5 });
                    }, Text);
                    // 网络状态显示
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`TCP连接状态: ${this.connectStatus}`);
                        Text.fontSize(15);
                        Text.fontColor(this.isConnected ? Color.Green : Color.Red);
                        Text.margin({ bottom: 5 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 调试：消息接收计数 + 最新数据预览
                        if (this.isConnected) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`发送: ${this.msgSentCount} | 接收: ${this.msgReceivedCount}`);
                                    Text.fontSize(11);
                                    Text.fontColor('#888888');
                                    Text.margin({ bottom: 3 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`最后: ${this.msgLastContent}`);
                                    Text.fontSize(11);
                                    Text.fontColor('#666666');
                                    Text.maxLines(1);
                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    Text.margin({ bottom: 8 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        // ======== AP模式配置面板 ========
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // ======== AP模式配置面板 ========
                        if (this.isAPMode) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('92%');
                                    Column.padding(12);
                                    Column.backgroundColor('#FFF8E1');
                                    Column.borderRadius(10);
                                    Column.margin({ bottom: 12 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('AP接入点配置');
                                    Text.fontSize(16);
                                    Text.fontColor(Color.Gray);
                                    Text.margin({ bottom: 10 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('SSID:');
                                    Text.fontSize(13);
                                    Text.width(65);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.apSsid });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.onChange((value: string) => {
                                        this.apSsid = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('密码:');
                                    Text.fontSize(13);
                                    Text.width(65);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.apPassword });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.type(InputType.Password);
                                    TextInput.onChange((value: string) => {
                                        this.apPassword = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('IP地址:');
                                    Text.fontSize(13);
                                    Text.width(65);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.apIp });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.onChange((value: string) => {
                                        this.apIp = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('子网掩码:');
                                    Text.fontSize(13);
                                    Text.width(65);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.apSubnet });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.onChange((value: string) => {
                                        this.apSubnet = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 8 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('网关:');
                                    Text.fontSize(13);
                                    Text.width(65);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.apGateway });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.onChange((value: string) => {
                                        this.apGateway = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // AP控制按钮
                                    Row.create();
                                    // AP控制按钮
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (!this.apActive) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel('开启AP热点');
                                                Button.backgroundColor('#E65100');
                                                Button.fontSize(14);
                                                Button.height(36);
                                                Button.onClick(() => {
                                                    this.enableHotspot();
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel('关闭AP热点');
                                                Button.backgroundColor(Color.Red);
                                                Button.fontSize(14);
                                                Button.height(36);
                                                Button.onClick(() => {
                                                    this.disableHotspot();
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                }, If);
                                If.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('刷新状态');
                                    Button.backgroundColor(Color.Gray);
                                    Button.fontSize(14);
                                    Button.height(36);
                                    Button.margin({ left: 8 });
                                    Button.onClick(() => {
                                        this.checkHotspotStatus();
                                    });
                                }, Button);
                                Button.pop();
                                // AP控制按钮
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (!this.apActive) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('提示：如权限不足，请在系统设置中手动开启热点');
                                                Text.fontSize(11);
                                                Text.fontColor('#999');
                                            }, Text);
                                            Text.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                        });
                                    }
                                }, If);
                                If.pop();
                                Column.pop();
                            });
                        }
                        // ======== WiFi客户端模式扫描/连接面板 ========
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // ======== WiFi客户端模式扫描/连接面板 ========
                        if (!this.isAPMode) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 10 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (!this.wifiConnected) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel('扫描WiFi');
                                                Button.backgroundColor(Color.Blue);
                                                Button.margin({ right: 10 });
                                                Button.onClick(() => {
                                                    this.scanWifi();
                                                    this.showWifiDialog = true;
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel('断开WiFi');
                                                Button.backgroundColor(Color.Orange);
                                                Button.margin({ right: 10 });
                                                Button.onClick(() => {
                                                    this.disconnectWifi();
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                }, If);
                                If.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('刷新状态');
                                    Button.backgroundColor(Color.Gray);
                                    Button.onClick(() => {
                                        this.checkWifiStatus();
                                    });
                                }, Button);
                                Button.pop();
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    // WiFi列表弹窗
                                    if (this.showWifiDialog) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Column.create();
                                                Column.width('90%');
                                                Column.padding(15);
                                                Column.backgroundColor('#F0F0F0');
                                                Column.borderRadius(10);
                                                Column.margin({ bottom: 12 });
                                            }, Column);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('选择WiFi网络');
                                                Text.fontSize(18);
                                                Text.fontColor(Color.Black);
                                                Text.margin({ bottom: 10 });
                                            }, Text);
                                            Text.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                If.create();
                                                if (this.isScanning) {
                                                    this.ifElseBranchUpdateFunction(0, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create('正在扫描...');
                                                            Text.fontSize(14);
                                                            Text.fontColor(Color.Gray);
                                                        }, Text);
                                                        Text.pop();
                                                    });
                                                }
                                                else if (this.wifiList.length > 0) {
                                                    this.ifElseBranchUpdateFunction(1, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            ForEach.create();
                                                            const forEachItemGenFunction = _item => {
                                                                const wifi = _item;
                                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                    Button.createWithLabel(wifi.ssid);
                                                                    Button.width('90%');
                                                                    Button.margin({ bottom: 8 });
                                                                    Button.onClick(() => {
                                                                        this.selectedWifi = wifi.ssid;
                                                                    });
                                                                }, Button);
                                                                Button.pop();
                                                            };
                                                            this.forEachUpdateFunction(elmtId, this.wifiList, forEachItemGenFunction);
                                                        }, ForEach);
                                                        ForEach.pop();
                                                    });
                                                }
                                                else {
                                                    this.ifElseBranchUpdateFunction(2, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create('未发现WiFi网络');
                                                            Text.fontSize(14);
                                                            Text.fontColor(Color.Gray);
                                                        }, Text);
                                                        Text.pop();
                                                    });
                                                }
                                            }, If);
                                            If.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                If.create();
                                                if (this.selectedWifi) {
                                                    this.ifElseBranchUpdateFunction(0, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            TextInput.create({ placeholder: '输入WiFi密码' });
                                                            TextInput.width('90%');
                                                            TextInput.height(40);
                                                            TextInput.type(InputType.Password);
                                                            TextInput.margin({ top: 10, bottom: 10 });
                                                            TextInput.onChange((value: string) => {
                                                                this.wifiPassword = value;
                                                            });
                                                        }, TextInput);
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Row.create();
                                                        }, Row);
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Button.createWithLabel('连接');
                                                            Button.backgroundColor(Color.Green);
                                                            Button.margin({ right: 10 });
                                                            Button.onClick(() => {
                                                                this.connectToWifi(this.selectedWifi, this.wifiPassword);
                                                            });
                                                        }, Button);
                                                        Button.pop();
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Button.createWithLabel('取消');
                                                            Button.backgroundColor(Color.Red);
                                                            Button.onClick(() => {
                                                                this.showWifiDialog = false;
                                                                this.selectedWifi = '';
                                                            });
                                                        }, Button);
                                                        Button.pop();
                                                        Row.pop();
                                                    });
                                                }
                                                else {
                                                    this.ifElseBranchUpdateFunction(1, () => {
                                                    });
                                                }
                                            }, If);
                                            If.pop();
                                            Column.pop();
                                        });
                                    }
                                    else // 服务器配置（仅客户端模式下显示）
                                     {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                        });
                                    }
                                }, If);
                                If.pop();
                            });
                        }
                        // 服务器配置（仅客户端模式下显示）
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 服务器配置（仅客户端模式下显示）
                        if (!this.isAPMode || !this.apActive) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('90%');
                                    Column.padding(10);
                                    Column.backgroundColor('#F5F5F5');
                                    Column.borderRadius(8);
                                    Column.margin({ bottom: 12 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.isAPMode ? 'RK2206设备IP配置' : 'RK2206服务器配置');
                                    Text.fontSize(15);
                                    Text.fontColor(Color.Gray);
                                    Text.margin({ bottom: 8 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('IP地址:');
                                    Text.fontSize(13);
                                    Text.width(60);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.serverIp });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.onChange((value: string) => {
                                        this.serverIp = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 8 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('端口:');
                                    Text.fontSize(13);
                                    Text.width(60);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.serverPort });
                                    TextInput.width(180);
                                    TextInput.height(34);
                                    TextInput.type(InputType.Number);
                                    TextInput.onChange((value: string) => {
                                        this.serverPort = value;
                                    });
                                }, TextInput);
                                Row.pop();
                                Column.pop();
                            });
                        }
                        // TCP连接控制按钮
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // TCP连接控制按钮
                        Row.create();
                        // TCP连接控制按钮
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (!this.isConnected) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('连接设备');
                                    Button.backgroundColor(this.isAPMode ? '#E65100' : Color.Green);
                                    Button.margin({ right: 10 });
                                    Button.onClick(() => {
                                        this.connectTCP();
                                    });
                                }, Button);
                                Button.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('断开连接');
                                    Button.backgroundColor(Color.Red);
                                    Button.margin({ right: 10 });
                                    Button.onClick(() => {
                                        this.disconnectTCP();
                                    });
                                }, Button);
                                Button.pop();
                            });
                        }
                    }, If);
                    If.pop();
                    // TCP连接控制按钮
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 控制按钮
                        if (this.isConnected) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ bottom: 12 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('请求温度');
                                    Button.backgroundColor(Color.Orange);
                                    Button.fontSize(13);
                                    Button.margin({ right: 6 });
                                    Button.onClick(() => {
                                        this.sendTCPData('{"cmd":"get_temp"}');
                                    });
                                }, Button);
                                Button.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('打开水泵');
                                    Button.backgroundColor(Color.Blue);
                                    Button.fontSize(13);
                                    Button.margin({ right: 6 });
                                    Button.onClick(() => {
                                        this.sendTCPData('{"cmd":"pump_on"}');
                                    });
                                }, Button);
                                Button.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('关闭水泵');
                                    Button.backgroundColor(Color.Gray);
                                    Button.fontSize(13);
                                    Button.onClick(() => {
                                        this.sendTCPData('{"cmd":"pump_off"}');
                                    });
                                }, Button);
                                Button.pop();
                                Row.pop();
                            });
                        }
                        // 接收到的数据显示
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 接收到的数据显示
                        if (this.receivedData) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('90%');
                                    Column.padding(10);
                                    Column.backgroundColor('#E8F5E8');
                                    Column.borderRadius(8);
                                    Column.margin({ bottom: 12 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('接收到的数据:');
                                    Text.fontSize(14);
                                    Text.fontColor(Color.Gray);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.receivedData);
                                    Text.fontSize(16);
                                    Text.fontColor(Color.Black);
                                    Text.margin({ top: 5 });
                                }, Text);
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('查看水温曲线');
                        Button.margin({ top: 5 });
                        Button.onClick(() => {
                            this.currentScreen = 'temperature';
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            // 水温界面
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 水温界面
            if (this.currentScreen === 'temperature') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#F5F5F5');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 顶部标题栏
                        Row.create();
                        // 顶部标题栏
                        Row.width('100%');
                        // 顶部标题栏
                        Row.padding({ left: 10, right: 10, top: 10 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('← 返回');
                        Button.fontSize(16);
                        Button.height(36);
                        Button.onClick(() => {
                            this.currentScreen = 'main';
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('水温与水位监控');
                        Text.fontSize(22);
                        Text.fontColor(Color.Blue);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 占位保持居中
                        Row.create();
                        // 占位保持居中
                        Row.width(80);
                        // 占位保持居中
                        Row.height(36);
                    }, Row);
                    // 占位保持居中
                    Row.pop();
                    // 顶部标题栏
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 状态栏
                        Row.create();
                        // 状态栏
                        Row.width('100%');
                        // 状态栏
                        Row.padding({ left: 15, right: 15, top: 8, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`水温: ${this.temperature.toFixed(1)}°C`);
                        Text.fontSize(18);
                        Text.fontColor(Color.Orange);
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.End);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.formattedDate);
                        Text.fontSize(13);
                        Text.fontColor(Color.Gray);
                    }, Text);
                    Text.pop();
                    Column.pop();
                    // 状态栏
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水温曲线图
                        Canvas.create(this.context);
                        // 水温曲线图
                        Canvas.width('100%');
                        // 水温曲线图
                        Canvas.height(180);
                        // 水温曲线图
                        Canvas.background('#1A1A2E');
                        // 水温曲线图
                        Canvas.borderRadius(8);
                        // 水温曲线图
                        Canvas.margin({ left: 10, right: 10, bottom: 10 });
                        // 水温曲线图
                        Canvas.onAreaChange((_: Area, newArea: Area) => {
                            // onAreaChange 获取组件实际像素尺寸（最可靠）
                            const pw: number = newArea.width as number;
                            const ph: number = newArea.height as number;
                            if (pw > 0 && ph > 0) {
                                this.canvasWidth = pw;
                                this.canvasHeight = ph;
                                this.drawAxes(pw, ph, this.xData, this.smoothedYData);
                            }
                        });
                        // 水温曲线图
                        Canvas.onReady(() => {
                            // onReady 作为备用：使用 context 内部尺寸
                            if (this.context.width > 0 && this.context.height > 0) {
                                this.canvasWidth = this.context.width;
                                this.canvasHeight = this.context.height;
                                this.drawAxes(this.canvasWidth, this.canvasHeight, this.xData, this.smoothedYData);
                            }
                        });
                    }, Canvas);
                    // 水温曲线图
                    Canvas.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水位显示模块
                        Column.create();
                        // 水位显示模块
                        Column.width('95%');
                        // 水位显示模块
                        Column.padding(15);
                        // 水位显示模块
                        Column.backgroundColor('#FAFAFA');
                        // 水位显示模块
                        Column.borderRadius(12);
                        // 水位显示模块
                        Column.margin({ top: 5, bottom: 15 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('实时水位');
                        Text.fontSize(16);
                        Text.fontColor('#666');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水位可视化条
                        Row.create();
                        // 水位可视化条
                        Row.width('100%');
                        // 水位可视化条
                        Row.padding(12);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水位柱状图
                        Column.create();
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create({ alignContent: Alignment.Bottom });
                        Stack.margin({ right: 12 });
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 背景柱
                        Column.create();
                        // 背景柱
                        Column.width(40);
                        // 背景柱
                        Column.height(120);
                        // 背景柱
                        Column.backgroundColor('#E0E0E0');
                        // 背景柱
                        Column.borderRadius(8);
                    }, Column);
                    // 背景柱
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 当前水位柱（高度按比例）
                        Column.create();
                        globalThis.Context.animation({ duration: 500, curve: Curve.EaseOut });
                        // 当前水位柱（高度按比例）
                        Column.width(40);
                        // 当前水位柱（高度按比例）
                        Column.height(Math.min(120, Math.max(0, (this.waterLevel / this.waterLevelMax) * 120)));
                        // 当前水位柱（高度按比例）
                        Column.backgroundColor('#2196F3');
                        // 当前水位柱（高度按比例）
                        Column.borderRadius(8);
                        globalThis.Context.animation(null);
                    }, Column);
                    // 当前水位柱（高度按比例）
                    Column.pop();
                    Stack.pop();
                    // 水位柱状图
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水位数字详情
                        Column.create();
                        // 水位数字详情
                        Column.alignItems(HorizontalAlign.Start);
                        // 水位数字详情
                        Column.margin({ left: 8 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.waterLevel.toFixed(1)} cm`);
                        Text.fontSize(42);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#2196F3');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`最大深度: ${this.waterLevelMax}cm`);
                        Text.fontSize(12);
                        Text.fontColor('#999');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 更新时间
                        Row.create();
                        // 更新时间
                        Row.margin({ top: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('更新: ');
                        Text.fontSize(11);
                        Text.fontColor('#999');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.waterLevelTime);
                        Text.fontSize(11);
                        Text.fontColor('#666');
                    }, Text);
                    Text.pop();
                    // 更新时间
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 状态指示
                        Row.create();
                        // 状态指示
                        Row.margin({ top: 4 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Circle.create({ width: 8, height: 8 });
                        Circle.fill(this.waterLevelStatus === '数据正常' ? Color.Green : Color.Red);
                        Circle.margin({ right: 6 });
                    }, Circle);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.waterLevelStatus);
                        Text.fontSize(12);
                        Text.fontColor(this.waterLevelStatus === '数据正常' ? '#4CAF50' : '#F44336');
                    }, Text);
                    Text.pop();
                    // 状态指示
                    Row.pop();
                    // 水位数字详情
                    Column.pop();
                    // 水位可视化条
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 水位百分比指示
                        Row.create();
                        // 水位百分比指示
                        Row.width('100%');
                        // 水位百分比指示
                        Row.margin({ top: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('水位占比: ');
                        Text.fontSize(12);
                        Text.fontColor('#999');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${Math.round(this.waterLevel / this.waterLevelMax * 100)}%`);
                        Text.fontSize(14);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF9800');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('数据来源: WiFi → RK2206');
                        Text.fontSize(10);
                        Text.fontColor('#BBB');
                    }, Text);
                    Text.pop();
                    // 水位百分比指示
                    Row.pop();
                    // 水位显示模块
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 数据接收状态提示
                        if (!this.isConnected) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.padding(10);
                                    Row.backgroundColor('#FFEBEE');
                                    Row.borderRadius(6);
                                    Row.margin({ left: 15, right: 15, bottom: 10 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Circle.create({ width: 10, height: 10 });
                                    Circle.fill(Color.Red);
                                    Circle.margin({ right: 8 });
                                }, Circle);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('设备未连接，数据显示为最后缓存值');
                                    Text.fontSize(12);
                                    Text.fontColor('#F44336');
                                }, Text);
                                Text.pop();
                                Row.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.waterLevelStatus !== '数据正常' && this.waterLevelStatus !== '等待数据...') {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.padding(10);
                                    Row.backgroundColor('#FFF3E0');
                                    Row.borderRadius(6);
                                    Row.margin({ left: 15, right: 15, bottom: 10 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Circle.create({ width: 10, height: 10 });
                                    Circle.fill(Color.Orange);
                                    Circle.margin({ right: 8 });
                                }, Circle);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.waterLevelStatus);
                                    Text.fontSize(12);
                                    Text.fontColor('#FF5722');
                                }, Text);
                                Text.pop();
                                Row.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "MyPage";
    }
}
registerNamedRoute(() => new MyPage(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "test", pagePath: "pages/Index", pageFullPath: "test/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
