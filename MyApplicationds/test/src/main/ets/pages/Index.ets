import { BusinessError } from '@kit.BasicServicesKit';
import { abilityAccessCtrl, common, Permissions } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';
import wifiManager from '@ohos.wifiManager';
import socket from '@ohos.net.socket';

@Entry
@Component
struct MyPage {
  @State currentScreen: 'welcome' | 'main' | 'temperature' = 'welcome';
  @State timerId: number = 0;
  @State formattedDate: string = "";
  @State temperature: number = 0;
  @State timeUpdateId: number = 0;
  @State isConnected: boolean = false;
  @State receivedData: string = '';
  @State connectStatus: string = '未连接';
  @State serverIp: string = '192.168.4.1';
  @State serverPort: string = '6666';
  @State wifiConnected: boolean = false;
  @State wifiInfo: string = '未连接WiFi';
  @State wifiList: Array<wifiManager.WifiScanInfo> = [];
  @State isScanning: boolean = false;
  @State showWifiDialog: boolean = false;
  @State selectedWifi: string = '';
  @State wifiPassword: string = '';

  // AP（接入点）模式状态变量
  @State isAPMode: boolean = false;
  @State apSsid: string = 'FishTank_AP';
  @State apPassword: string = '12345678';
  @State apIp: string = '192.168.43.1';
  @State apSubnet: string = '255.255.255.0';
  @State apGateway: string = '192.168.43.1';
  @State apActive: boolean = false;
  @State apStatus: string = 'AP模式未启用';
  @State apClientCount: number = 0;
  @State msgReceivedCount: number = 0;
  @State msgLastContent: string = '等待接收...';
  @State msgSentCount: number = 0;
  private apCheckTimer: number = 0;

  // 水位数据
  @State waterLevel: number = 0;
  @State waterLevelMax: number = 30;
  @State waterLevelStatus: string = '等待数据...';
  @State waterLevelTime: string = '--:--:--';
  @State canvasRedrawId: number = 0;

  private tcpSocket: socket.TCPSocket | null = null;
  private receiveTimer: number = 0;
  private dataPollTimer: number = 0;
  private receiveBuffer: string = '';
  private lastWaterLevelTime: number = 0;
  private waterLevelCache: number[] = [];
  private static readonly LEVEL_STALE_MS: number = 10000;

  private settings: RenderingContextSettings = new RenderingContextSettings(true)
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings)

  private xData: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  private yData: number[] = [];
  private smoothedYData: number[] = [];
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  // 数据验证与平滑参数
  private static readonly MIN_TEMP: number = 0;
  private static readonly MAX_TEMP: number = 50;
  private static readonly SMOOTH_WINDOW: number = 3;
  private badReadCount: number = 0;

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
    } catch (err) {
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
    }

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
    }, 1000)
    this.timerId = setTimeout(() => {
      this.currentScreen = 'main';
    }, 100);
  }

  buildLine() {
  }

  private drawAxes(width: number, height: number, dataList: number[], yDataList: number[]) {
    if (width <= 0 || height <= 0) return;

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
      if (residual <= 1.5) tickStep = magnitude;
      else if (residual <= 3) tickStep = 2 * magnitude;
      else if (residual <= 7) tickStep = 5 * magnitude;
      else tickStep = 10 * magnitude;

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
    } else {
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
        } else {
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
      } else {
        this.wifiConnected = false;
        this.wifiInfo = 'WiFi未连接';
        console.info('WiFi未连接');
      }
    } catch (err) {
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
    } catch (err) {
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
        } catch (err) {
          console.error('轮询异常: ' + JSON.stringify(err));
        }

        retryCount++;
        if (retryCount > 20) {
          clearInterval(checkInterval);
          console.error('WiFi连接超时');
        }
      }, 1000);
    } catch (err) {
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
      } else {
        this.apStatus = 'AP模式未激活';
        this.apClientCount = 0;
      }
    } catch (err) {
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
    } else {
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
      } catch (err) {
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
    } else {
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
        } catch (err) {
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

    } catch (err) {
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
    } catch (err) {
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
      } catch (err) {
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
      } else {
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
    } catch (e) {
      console.error('JSON解析失败: ' + dataStr.substring(0, 80));
    }

    // 兼容旧版前缀格式
    if (dataStr.startsWith('TEMP:')) {
      const temp: number = parseFloat(dataStr.substring(5).trim());
      this.processTemperature(temp);
    } else if (dataStr.startsWith('LEVEL:')) {
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
    } else {
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

    this.waterLevel = Math.round((smoothed -12)* 10) / 10;

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

  build() {
    Column() {
      // 欢迎界面
      if (this.currentScreen === 'welcome') {
        Column() {
          Text('智能鱼缸控制系统')
            .fontSize(30)
            .fontColor(Color.Blue)
            .margin({ bottom: 30 })
          Button('开始连接设备')
            .fontSize(20)
            .onClick(() => {
              this.checkWifiStatus();
              this.currentScreen = 'main';
            })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      }

      // 主界面 - WiFi连接和控制
      if (this.currentScreen === 'main') {
        Column() {
          Text('智能鱼缸')
            .fontSize(28)
            .fontColor(Color.Blue)
            .margin({ top: 20, bottom: 10 })

          // 模式切换标签
          Row() {
            Button('WiFi客户端模式')
              .fontSize(12)
              .height(30)
              .backgroundColor(this.isAPMode ? '#E0E0E0' : '#1976D2')
              .fontColor(this.isAPMode ? '#666' : Color.White)
              .borderRadius(15)
              .onClick(() => {
                if (this.isAPMode) {
                  this.toggleAPMode();
                }
              })

            Button('AP接入点模式')
              .fontSize(12)
              .height(30)
              .backgroundColor(this.isAPMode ? '#E65100' : '#E0E0E0')
              .fontColor(this.isAPMode ? Color.White : '#666')
              .borderRadius(15)
              .margin({ left: 8 })
              .onClick(() => {
                if (!this.isAPMode) {
                  this.toggleAPMode();
                }
              })
          }
          .margin({ bottom: 10 })

          // 网络状态显示
          Text(this.isAPMode ? this.apStatus : this.wifiInfo)
            .fontSize(13)
            .fontColor(this.isAPMode ? (this.apActive ? Color.Green : Color.Orange) : (this.wifiConnected ? Color.Green : Color.Red))
            .margin({ bottom: 5 })

          Text(`TCP连接状态: ${this.connectStatus}`)
            .fontSize(15)
            .fontColor(this.isConnected ? Color.Green : Color.Red)
            .margin({ bottom: 5 })

          // 调试：消息接收计数 + 最新数据预览
          if (this.isConnected) {
            Text(`发送: ${this.msgSentCount} | 接收: ${this.msgReceivedCount}`)
              .fontSize(11)
              .fontColor('#888888')
              .margin({ bottom: 3 })
            Text(`最后: ${this.msgLastContent}`)
              .fontSize(11)
              .fontColor('#666666')
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .margin({ bottom: 8 })
          }

          // ======== AP模式配置面板 ========
          if (this.isAPMode) {
            Column() {
              Text('AP接入点配置')
                .fontSize(16)
                .fontColor(Color.Gray)
                .margin({ bottom: 10 })

              Row() {
                Text('SSID:')
                  .fontSize(13)
                  .width(65)
                TextInput({ text: this.apSsid })
                  .width(180)
                  .height(34)
                  .onChange((value: string) => {
                    this.apSsid = value;
                  })
              }
              .margin({ bottom: 6 })

              Row() {
                Text('密码:')
                  .fontSize(13)
                  .width(65)
                TextInput({ text: this.apPassword })
                  .width(180)
                  .height(34)
                  .type(InputType.Password)
                  .onChange((value: string) => {
                    this.apPassword = value;
                  })
              }
              .margin({ bottom: 6 })

              Row() {
                Text('IP地址:')
                  .fontSize(13)
                  .width(65)
                TextInput({ text: this.apIp })
                  .width(180)
                  .height(34)
                  .onChange((value: string) => {
                    this.apIp = value;
                  })
              }
              .margin({ bottom: 6 })

              Row() {
                Text('子网掩码:')
                  .fontSize(13)
                  .width(65)
                TextInput({ text: this.apSubnet })
                  .width(180)
                  .height(34)
                  .onChange((value: string) => {
                    this.apSubnet = value;
                  })
              }
              .margin({ bottom: 6 })

              Row() {
                Text('网关:')
                  .fontSize(13)
                  .width(65)
                TextInput({ text: this.apGateway })
                  .width(180)
                  .height(34)
                  .onChange((value: string) => {
                    this.apGateway = value;
                  })
              }
              .margin({ bottom: 8 })

              // AP控制按钮
              Row() {
                if (!this.apActive) {
                  Button('开启AP热点')
                    .backgroundColor('#E65100')
                    .fontSize(14)
                    .height(36)
                    .onClick(() => {
                      this.enableHotspot();
                    })
                } else {
                  Button('关闭AP热点')
                    .backgroundColor(Color.Red)
                    .fontSize(14)
                    .height(36)
                    .onClick(() => {
                      this.disableHotspot();
                    })
                }

                Button('刷新状态')
                  .backgroundColor(Color.Gray)
                  .fontSize(14)
                  .height(36)
                  .margin({ left: 8 })
                  .onClick(() => {
                    this.checkHotspotStatus();
                  })
              }
              .margin({ bottom: 6 })

              if (!this.apActive) {
                Text('提示：如权限不足，请在系统设置中手动开启热点')
                  .fontSize(11)
                  .fontColor('#999')
              }
            }
            .width('92%')
            .padding(12)
            .backgroundColor('#FFF8E1')
            .borderRadius(10)
            .margin({ bottom: 12 })
          }

          // ======== WiFi客户端模式扫描/连接面板 ========
          if (!this.isAPMode) {
            Row() {
              if (!this.wifiConnected) {
                Button('扫描WiFi')
                  .backgroundColor(Color.Blue)
                  .margin({ right: 10 })
                  .onClick(() => {
                    this.scanWifi();
                    this.showWifiDialog = true;
                  })
              } else {
                Button('断开WiFi')
                  .backgroundColor(Color.Orange)
                  .margin({ right: 10 })
                  .onClick(() => {
                    this.disconnectWifi();
                  })
              }

              Button('刷新状态')
                .backgroundColor(Color.Gray)
                .onClick(() => {
                  this.checkWifiStatus();
                })
            }
            .margin({ bottom: 10 })

            // WiFi列表弹窗
            if (this.showWifiDialog) {
              Column() {
                Text('选择WiFi网络')
                  .fontSize(18)
                  .fontColor(Color.Black)
                  .margin({ bottom: 10 })

                if (this.isScanning) {
                  Text('正在扫描...')
                    .fontSize(14)
                    .fontColor(Color.Gray)
                } else if (this.wifiList.length > 0) {
                  ForEach(this.wifiList, (wifi: wifiManager.WifiScanInfo) => {
                    Button(wifi.ssid)
                      .width('90%')
                      .margin({ bottom: 8 })
                      .onClick(() => {
                        this.selectedWifi = wifi.ssid;
                      })
                  })
                } else {
                  Text('未发现WiFi网络')
                    .fontSize(14)
                    .fontColor(Color.Gray)
                }

                if (this.selectedWifi) {
                  TextInput({ placeholder: '输入WiFi密码' })
                    .width('90%')
                    .height(40)
                    .type(InputType.Password)
                    .margin({ top: 10, bottom: 10 })
                    .onChange((value: string) => {
                      this.wifiPassword = value;
                    })

                  Row() {
                    Button('连接')
                      .backgroundColor(Color.Green)
                      .margin({ right: 10 })
                      .onClick(() => {
                        this.connectToWifi(this.selectedWifi, this.wifiPassword);
                      })

                    Button('取消')
                      .backgroundColor(Color.Red)
                      .onClick(() => {
                        this.showWifiDialog = false;
                        this.selectedWifi = '';
                      })
                  }
                }
              }
              .width('90%')
              .padding(15)
              .backgroundColor('#F0F0F0')
              .borderRadius(10)
              .margin({ bottom: 12 })
            }
          }

          // 服务器配置（仅客户端模式下显示）
          if (!this.isAPMode || !this.apActive) {
            Column() {
              Text(this.isAPMode ? 'RK2206设备IP配置' : 'RK2206服务器配置')
                .fontSize(15)
                .fontColor(Color.Gray)
                .margin({ bottom: 8 })

              Row() {
                Text('IP地址:')
                  .fontSize(13)
                  .width(60)
                TextInput({ text: this.serverIp })
                  .width(180)
                  .height(34)
                  .onChange((value: string) => {
                    this.serverIp = value;
                  })
              }
              .margin({ bottom: 6 })

              Row() {
                Text('端口:')
                  .fontSize(13)
                  .width(60)
                TextInput({ text: this.serverPort })
                  .width(180)
                  .height(34)
                  .type(InputType.Number)
                  .onChange((value: string) => {
                    this.serverPort = value;
                  })
              }
              .margin({ bottom: 8 })
            }
            .width('90%')
            .padding(10)
            .backgroundColor('#F5F5F5')
            .borderRadius(8)
            .margin({ bottom: 12 })
          }

          // TCP连接控制按钮
          Row() {
            if (!this.isConnected) {
              Button('连接设备')
                .backgroundColor(this.isAPMode ? '#E65100' : Color.Green)
                .margin({ right: 10 })
                .onClick(() => {
                  this.connectTCP();
                })
            } else {
              Button('断开连接')
                .backgroundColor(Color.Red)
                .margin({ right: 10 })
                .onClick(() => {
                  this.disconnectTCP();
                })
            }
          }
          .margin({ bottom: 12 })

          // 控制按钮
          if (this.isConnected) {
            Row() {
              Button('请求温度')
                .backgroundColor(Color.Orange)
                .fontSize(13)
                .margin({ right: 6 })
                .onClick(() => {
                  this.sendTCPData('{"cmd":"get_temp"}');
                })

              Button('打开水泵')
                .backgroundColor(Color.Blue)
                .fontSize(13)
                .margin({ right: 6 })
                .onClick(() => {
                  this.sendTCPData('{"cmd":"pump_on"}');
                })

              Button('关闭水泵')
                .backgroundColor(Color.Gray)
                .fontSize(13)
                .onClick(() => {
                  this.sendTCPData('{"cmd":"pump_off"}');
                })
            }
            .margin({ bottom: 12 })
          }

          // 接收到的数据显示
          if (this.receivedData) {
            Column() {
              Text('接收到的数据:')
                .fontSize(14)
                .fontColor(Color.Gray)
              Text(this.receivedData)
                .fontSize(16)
                .fontColor(Color.Black)
                .margin({ top: 5 })
            }
            .width('90%')
            .padding(10)
            .backgroundColor('#E8F5E8')
            .borderRadius(8)
            .margin({ bottom: 12 })
          }

          Button('查看水温曲线')
            .margin({ top: 5 })
            .onClick(() => {
              this.currentScreen = 'temperature';
            })
        }
        .width('100%')
        .height('100%')
        .padding(20)
      }

      // 水温界面
      if (this.currentScreen === 'temperature') {
        Column() {
          // 顶部标题栏
          Row() {
            Button('← 返回')
              .fontSize(16)
              .height(36)
              .onClick(() => {
                this.currentScreen = 'main';
              })
            Blank()
            Text('水温与水位监控')
              .fontSize(22)
              .fontColor(Color.Blue)
            Blank()
            // 占位保持居中
            Row().width(80).height(36)
          }
          .width('100%')
          .padding({ left: 10, right: 10, top: 10 })

          // 状态栏
          Row() {
            Column() {
              Text(`水温: ${this.temperature.toFixed(1)}°C`)
                .fontSize(18)
                .fontColor(Color.Orange)
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Start)

            Column() {
              Text(this.formattedDate)
                .fontSize(13)
                .fontColor(Color.Gray)
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.End)
          }
          .width('100%')
          .padding({ left: 15, right: 15, top: 8, bottom: 8 })

          // 水温曲线图
          Canvas(this.context)
            .width('100%')
            .height(180)
            .background('#1A1A2E')
            .borderRadius(8)
            .margin({ left: 10, right: 10, bottom: 10 })
            .onAreaChange((_: Area, newArea: Area) => {
              // onAreaChange 获取组件实际像素尺寸（最可靠）
              const pw: number = newArea.width as number;
              const ph: number = newArea.height as number;
              if (pw > 0 && ph > 0) {
                this.canvasWidth = pw;
                this.canvasHeight = ph;
                this.drawAxes(pw, ph, this.xData, this.smoothedYData);
              }
            })
            .onReady(() => {
              // onReady 作为备用：使用 context 内部尺寸
              if (this.context.width > 0 && this.context.height > 0) {
                this.canvasWidth = this.context.width;
                this.canvasHeight = this.context.height;
                this.drawAxes(this.canvasWidth, this.canvasHeight, this.xData, this.smoothedYData);
              }
            })

          // 水位显示模块
          Column() {
            Text('实时水位')
              .fontSize(16)
              .fontColor('#666')
              .margin({ bottom: 8 })

            // 水位可视化条
            Row() {
              // 水位柱状图
              Column() {
                Stack({ alignContent: Alignment.Bottom }) {
                  // 背景柱
                  Column()
                    .width(40)
                    .height(120)
                    .backgroundColor('#E0E0E0')
                    .borderRadius(8)

                  // 当前水位柱（高度按比例）
                  Column()
                    .width(40)
                    .height(Math.min(120, Math.max(0, (this.waterLevel / this.waterLevelMax) * 120)))
                    .backgroundColor('#2196F3')
                    .borderRadius(8)
                    .animation({ duration: 500, curve: Curve.EaseOut })
                }
                .margin({ right: 12 })
              }

              // 水位数字详情
              Column() {
                Text(`${this.waterLevel.toFixed(1)} cm`)
                  .fontSize(42)
                  .fontWeight(FontWeight.Bold)
                  .fontColor('#2196F3')

                Text(`最大深度: ${this.waterLevelMax}cm`)
                  .fontSize(12)
                  .fontColor('#999')
                  .margin({ top: 4 })

                // 更新时间
                Row() {
                  Text('更新: ')
                    .fontSize(11)
                    .fontColor('#999')
                  Text(this.waterLevelTime)
                    .fontSize(11)
                    .fontColor('#666')
                }
                .margin({ top: 8 })

                // 状态指示
                Row() {
                  Circle({ width: 8, height: 8 })
                    .fill(this.waterLevelStatus === '数据正常' ? Color.Green : Color.Red)
                    .margin({ right: 6 })
                  Text(this.waterLevelStatus)
                    .fontSize(12)
                    .fontColor(this.waterLevelStatus === '数据正常' ? '#4CAF50' : '#F44336')
                }
                .margin({ top: 4 })
              }
              .alignItems(HorizontalAlign.Start)
              .margin({ left: 8 })
            }
            .width('100%')
            .padding(12)

            // 水位百分比指示
            Row() {
              Text('水位占比: ')
                .fontSize(12)
                .fontColor('#999')
              Text(`${Math.round(this.waterLevel / this.waterLevelMax * 100)}%`)
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FF9800')
              Blank()
              Text('数据来源: WiFi → RK2206')
                .fontSize(10)
                .fontColor('#BBB')
            }
            .width('100%')
            .margin({ top: 8 })
          }
          .width('95%')
          .padding(15)
          .backgroundColor('#FAFAFA')
          .borderRadius(12)
          .margin({ top: 5, bottom: 15 })

          // 数据接收状态提示
          if (!this.isConnected) {
            Row() {
              Circle({ width: 10, height: 10 })
                .fill(Color.Red)
                .margin({ right: 8 })
              Text('设备未连接，数据显示为最后缓存值')
                .fontSize(12)
                .fontColor('#F44336')
            }
            .padding(10)
            .backgroundColor('#FFEBEE')
            .borderRadius(6)
            .margin({ left: 15, right: 15, bottom: 10 })
          }

          if (this.waterLevelStatus !== '数据正常' && this.waterLevelStatus !== '等待数据...') {
            Row() {
              Circle({ width: 10, height: 10 })
                .fill(Color.Orange)
                .margin({ right: 8 })
              Text(this.waterLevelStatus)
                .fontSize(12)
                .fontColor('#FF5722')
            }
            .padding(10)
            .backgroundColor('#FFF3E0')
            .borderRadius(6)
            .margin({ left: 15, right: 15, bottom: 10 })
          }
        }
        .width('100%')
        .height('100%')
        .backgroundColor('#F5F5F5')
      }
    }
    .width('100%')
    .height('100%')
  }
}