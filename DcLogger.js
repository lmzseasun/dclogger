var os = require('os');
var uuid = require('node-uuid');
var DcRollingFileStream = require('./DcRollingFileStream');

var format = require('date-format');
var TIMESTAMP_FORMAT = 'yyyy-MM-dd hh:mm:ss.SSS';

module.exports = DcLogger;

function DcLogger(appId) {
	this.appId = appId;
	this.dateUuid = {};
	if (!this.appId) {
		throw new Error("appId must be not empty");
	}
	this.dcRollingFileStream = new DcRollingFileStream(this.appId);
	
	function getServerIp() {
		var addresses = [];
		var interfaces = os.networkInterfaces();
		for (var k in interfaces) {
			for (var k2 in interfaces[k]) {
		        var address = interfaces[k][k2];
		        if (address.family === 'IPv4' && !address.internal) {
		        	addresses.push(address.address);
		        }
		    }
		}
		return addresses.length > 0 ? addresses[0] : '';
	};
	this.serverIp = getServerIp();
}

DcLogger.prototype.createBlankLogMsg = function() {
	return {		 
		 // ==== role info, need for all types======
		 stime: '',				//服务器时间,格式1539783963358
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 
		 //==== client info, need only for role.login======
		 deviceId: '',			//设备ID			
		 os: '',				//操作系统:android/iso等
		 osVersion: '',			//操作系统版本号：ios 6.1.3、android 4.3等
		 nework: '',			//网络类型
		 clientIp: '',			//客户端IP地址
		 appVersion: '',		//应用自身版本号，如1.3.1,对应andriod:versionName
		 appVersionCode: '',	//应用自身版本号，如1,对应andriod:versionCode
		 sdkVersion: '',		//渠道sdk的版本
		 deviceBrand: '',		//设备提供商： 小米、华为、三星、苹果
		 deviceModel: '',		//设备型号：小米note、华为meta7 iphone 6 plus等
		 deviceScreen: '',		//设备屏幕大小: 1024*920
		 mac: '',				//mac地址
		 imei: '',				//Android设备编号（android独有
		 uuid: '',				//UUID,用于唯一标示某台设备（android独有）
		 packageName: '',		//应用的包名（android独有）
		 buildNumber: '',		//BuildNumber（android独有）
		 carrier: '',			//运营商：中国移动，中国联通等
		 iccid: '',				//ICCID：Integrate circuit card identity 集成电路卡识别码即SIM卡卡号，相当于手机号码的身份证。
		 imsi: '',				//国际移动用户识别码（IMSI：International Mobile Subscriber Identification Number）
		 idfa: '',				//广告标示符（iOS版本在进行AppStore商店推广时才需要采集）		 
		 pxgkschannel:'',		//标识用户来源，用于广告链接买量
		
		 // ==== recharge info, need for recharge message===
		 currency: '',			//"CNY", "KER", "HKD", "USD", "VND", "THB", "PHP"等币种标识
		 money: '', 			//充值金额，浮点数，入库去尾法保留2位小数,(单位:元)
		 tradeNo: '',			//游戏充值定单号，服务端排重使用，避免重复定单
		 channelTradeNo: '',	//渠道充值订单号，对账使用
		 
		 // ==== virtual currency consume/purchase/reward info
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 isBinding: '',				//是否绑定
		 itemId: '',				//物品ID
		 itemName: '',				//物品名称
		 itemType: '',				//物品类型
		 itemNum: '',				//物品数量
		 gainChannel: '',			//获得渠道
		 gainChannelType: '',		//获得渠道类型
		 
		 // ==== trade info, use same property as virtual currency===
		 tradeId: '', 				//交易ID
		 tradeType: '',				//交易类型，如玩家间直接交易，拍卖行交易，摆摊交易等
		 //itemId: '',				//物品ID
		 //itemName: '',				//物品名称
		 //itemType: '',				//物品类型
		 //itemNum: '',				//物品数量
		 //gainChannel: '',			//获得渠道
		 //gainChannelType: '',		//获得渠道类型
		 
		 // ==== event info, need for custom event===
		 eventId: '',			//事件ID
		 eventDesc: '', 		//事件描述
		 eventBody: {},			//事件体
		 
		 // ==== mission info, need for custom event===
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: '',		//mission类型：如活动，关卡，任务等
		 // ==== mission reward info, use same property as virtual currency===
		 //gold: '',				//mission获得虚拟货币金额
		 //virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 //virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 //itemId: '',				//物品ID
		 //itemName: '',				//物品名称
		 //itemType: '',				//物品类型
		 //itemNum: '',				//物品数量
		 // ==== mission reward info===
		 consumeNum: '', 			//消耗活动力数量
		 remainNum: '',				//剩余活动力数量
		 powerType: '',				//活动力类型，如体力，精力等
	};
};

/**
 * 玩家选择并进入服务器时调用
 * 
 * @param loginInfo
 * 
 {
 		 stime: '',				//服务器时间
		 deviceId: '',			//设备ID			
		 os: '',				//操作系统:android/iso等
		 osVersion: '',			//操作系统版本号：ios 6.1.3、android 4.3等
		 nework: '',			//网络类型
		 clientIp: '',			//客户端IP地址
		 appVersion: '',		//应用自身版本号，如1.3.1,对应andriod:versionName
		 appVersionCode: '',	//应用自身版本号，如1,对应andriod:versionCode
		 sdkVersion: '',		//渠道sdk的版本
		 deviceBrand: '',		//设备提供商： 小米、华为、三星、苹果
		 deviceModel: '',		//设备型号：小米note、华为meta7 iphone 6 plus等
		 deviceScreen: '',		//设备屏幕大小: 1024*920
		 mac: '',				//mac地址
		 imei: '',				//Android设备编号（android独有
		 uuid: '',				//UUID,用于唯一标示某台设备（android独有）
		 packageName: '',		//应用的包名（android独有）
		 buildNumber: '',		//BuildNumber（android独有）
		 carrier: '',			//运营商：中国移动，中国联通等
		 iccid: '',				//iccid
		 imsi: '',				//imsi
		 idfa: '',				//广告标示符（iOS版本在进行AppStore商店推广时才需要采集）
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: ''		//战斗力
	}
 * 
 * 
 */
DcLogger.prototype.onRoleLogin = function(loginInfo) {
	if (loginInfo) {
		loginInfo.msgType = 'role.login';
		this._log(this._applyCommonInfo(loginInfo));
	}
};

/**
 * 玩家选择并进入服务器时调用
 * 
 * @param logoutInfo
 {
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称		 
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: ''		//战斗力
	}
 * 
 */
DcLogger.prototype.onRoleLogout = function(logoutInfo) {
	if (logoutInfo) {
		logoutInfo.msgType = 'role.logout';
		this._log(this._applyCommonInfo(logoutInfo));
	}
};

/**
 * 玩家充值成功时调用
 * 
 * @param rechargeInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 currency: '',			//"CNY", "KER", "HKD", "USD", "VND", "THB", "PHP"等币种标识
		 money: '', 			//充值金额，浮点数，入库去尾法保留2位小数,(单位:元)
		 tradeNo: '',			//游戏充值定单号，服务端排重使用，避免重复定单
		 channelTradeNo: ''		//渠道充值订单号，对账使用
	}
 * 
 */
DcLogger.prototype.onRoleRecharge = function(rechargeInfo) {
	if (rechargeInfo) {
		rechargeInfo.msgType = 'role.recharge';
		this._log(this._applyCommonInfo(rechargeInfo));
	}
};

/**
 * 玩家购买虚拟货币时调用（代币除外，代币请使用onTokenPurchase）
 * 
 * @param virtualCurrencyPurchaseInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称		 
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: ''	//玩家当前虚拟货币总量
	}
 * 
 */
DcLogger.prototype.onVirtualCurrencyPurchase = function(virtualCurrencyPurchaseInfo) {
	if (virtualCurrencyPurchaseInfo) {
		virtualCurrencyPurchaseInfo.msgType = 'virtualcurrency.purchase';
		this._log(this._applyCommonInfo(virtualCurrencyPurchaseInfo));
	}
};

/**
 * 玩家非购买获得虚拟货币时调用（代币除外，代币请使用onTokenPurchase）
 * 
 * @param virtualCurrencyRewardInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 isBinding: '',				//是否绑定
		 gainChannel: '',			//获得渠道
		 gainChannelType: ''		//获得渠道类型
	}
 * 
 */
DcLogger.prototype.onVirtualCurrencyReward = function(virtualCurrencyRewardInfo) {
	if (virtualCurrencyRewardInfo) {
		virtualCurrencyRewardInfo.msgType = 'virtualcurrency.reward';
		this._log(this._applyCommonInfo(virtualCurrencyRewardInfo));
	}
};

/**
 * 玩家消费虚拟货币时调用（代币除外，代币请使用onTokenConsume）
 * 
 * @param virtualCurrencyConsumeInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 isBinding: '',				//是否绑定
		 itemId: '',				//物品ID
		 itemName: '',				//物品名称
		 itemType: '',				//物品类型
		 itemNum: ''				//物品数量
	}
 * 
 */
DcLogger.prototype.onVirtualCurrencyConsume = function(virtualCurrencyConsumeInfo) {
	if (virtualCurrencyConsumeInfo) {
		virtualCurrencyConsumeInfo.msgType = 'virtualcurrency.consume';
		this._log(this._applyCommonInfo(virtualCurrencyConsumeInfo));
	}
};

/**
 * 玩家购买代币时调用,其他虚拟货币请使用onVirtualCurrencyPurchase
 * 
 * @param tokenPurchaseInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: ''	//玩家当前虚拟货币总量
	}
 * 
 */
DcLogger.prototype.onTokenPurchase = function(tokenPurchaseInfo) {
	if (tokenPurchaseInfo) {
		tokenPurchaseInfo.msgType = 'virtualcurrency.purchase';
		tokenPurchaseInfo.virtualCurrencyType = 'token';
		this._log(this._applyCommonInfo(tokenPurchaseInfo));
	}
};


/**
 * 玩家非购买获得代币时调用,其他虚拟货币请使用onVirtualCurrencyReward
 * 
 * @param tokenRewardInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 isBinding: '',				//是否绑定
		 gainChannel: '',			//获得渠道
		 gainChannelType: ''		//获得渠道类型
	}
 * 
 */
DcLogger.prototype.onTokenReward = function(tokenRewardInfo) {
	if (tokenRewardInfo) {
		tokenRewardInfo.msgType = 'virtualcurrency.reward';
		tokenRewardInfo.virtualCurrencyType = 'token';
		this._log(this._applyCommonInfo(tokenRewardInfo));
	}
};


/**
 * 玩家消费代币时调用,其他虚拟货币请使用onVirtualCurrencyConsume
 * 
 * @param tokenConsumeInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 gold: '',				//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 isBinding: '',				//是否绑定
		 itemId: '',				//物品ID
		 itemName: '',				//物品名称
		 itemType: '',				//物品类型
		 itemNum: ''				//物品数量
	}
 * 
 */
DcLogger.prototype.onTokenConsume = function(tokenConsumeInfo) {
	if (tokenConsumeInfo) {
		tokenConsumeInfo.msgType = 'virtualcurrency.consume';
		tokenConsumeInfo.virtualCurrencyType = 'token';
		this._log(this._applyCommonInfo(tokenConsumeInfo));
	}
};

/**
 * 玩家升级的时候调用
 * 
 * @param roleLevelUpInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: ''		//战斗力
	}
 * 
 */
DcLogger.prototype.onRoleLeveUp = function(roleLevelUpInfo) {
	if (roleLevelUpInfo) {
		roleLevelUpInfo.msgType = 'role.level';
		this._log(this._applyCommonInfo(roleLevelUpInfo));
	}
};

/**
 * 任务&活动开始的时候调用
 * 
 * @param missionInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: ''		//mission类型：如活动，关卡，任务等
	}
 * 
 */
DcLogger.prototype.onMissionBegin = function(missionInfo) {
	if (missionInfo) {
		missionInfo.msgType = 'role.mission';
		missionInfo.missionFlag = 'enter';
		this._log(this._applyCommonInfo(missionInfo));
	}
};

/**
 * 任务&活动失败的时候调用
 * 
 * @param missionInfo
  {
  		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: ''		//mission类型：如活动，关卡，任务等
	}
 * 
 */
DcLogger.prototype.onMissionFail = function(missionInfo) {
	if (missionInfo) {
		missionInfo.msgType = 'role.mission';
		missionInfo.missionFlag = 'failed';
		this._log(this._applyCommonInfo(missionInfo));
	}
};

/**
 * 任务&活动成功的时候调用
 * 
 * @param missionInfo
  {
  		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: ''		//mission类型：如活动，关卡，任务等
	}
 * 
 */
DcLogger.prototype.onMissionSuccess = function(missionInfo) {
	if (missionInfo) {
		missionInfo.msgType = 'role.mission';
		missionInfo.missionFlag = 'success';
		this._log(this._applyCommonInfo(missionInfo));
	}
};

/**
 * 获得任务&活动奖励时调用
 * 
 * @param missionRewardInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: '',		//mission类型：如活动，关卡，任务等
		 gold: '',				//mission获得虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 itemId: '',				//物品ID
		 itemName: '',				//物品名称
		 itemType: '',				//物品类型
		 itemNum: ''				//物品数量
	}
 * 
 */
DcLogger.prototype.onMissionReward = function(missionRewardInfo) {
	if (missionRewardInfo) {
		missionRewardInfo.msgType = 'mission.reward';
		this._log(this._applyCommonInfo(missionRewardInfo));
	}
};

/**
 * 完成交易时调用
 * 
 * @param tradeInfo
 {
		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 tradeId: '', 				//交易ID
		 tradeType: '',				//交易类型，如玩家间直接交易，拍卖行交易，摆摊交易等
		 gold: '',					//虚拟货币金额
		 virtualCurrencyType: '',	//虚拟货币类型：如金币，银币，元宝等
		 virtualCurrencyTotal: '',	//玩家当前虚拟货币总量
		 itemId: '',				//物品ID
		 itemName: '',				//物品名称
		 itemType: '',				//物品类型
		 itemNum: ''				//物品数量
	}
 * 
 */
DcLogger.prototype.onRoleTrade = function(tradeInfo) {
	if (tradeInfo) {
		tradeInfo.msgType = 'role.trade';
		this._log(this._applyCommonInfo(tradeInfo));
	}
};

/**
 * 行动力消耗时调用
 * 
 * @param powerConsumeInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 missionId: '',			//missionID
		 missionName: '',		//mission名称
		 missionType: '',		//mission类型：如活动，关卡，任务等
		 missionFlag: '',		//mission标识：enter,success,failed等
		 consumeNum: '', 		//消耗活动力数量
		 remainNum: '',			//剩余活动力数量
		 powerType: ''			//活动力类型，如体力，精力等
	}
 * 
 */
DcLogger.prototype.onPowerConsume = function(powerConsumeInfo) {
	if (powerConsumeInfo) {
		powerConsumeInfo.msgType = 'power.consume';
		this._log(this._applyCommonInfo(powerConsumeInfo));
	}
};

/**
 * 自定义事件
 * 
 * @param customEventInfo
 {
 		 stime: '',				//服务器时间
		 accountId: '',			//账号ID
		 roleId: '',			//角色ID
		 roleName: '',			//角色名
		 roleType: '',			//角色类型,如法师，道士，战士
		 roleLevel: '',			//角色等级
		 roleVipLevel: '', 		//角色vip等级
		 zone: '',				//游戏区ID
		 zoneName: '',			//游戏区名称
		 channel: '',			//渠道ID
		 channelDesc: '',		//渠道描述
		 server: '',			//游戏服ID,示例:s1,s2
		 serverName: '',		//游戏服名称,示例:风云争霸
		 partyId: '',			//公会ID
		 gender: '',			//角色性别
		 battleScore: '',		//战斗力
		 eventId: '',			//事件ID
		 eventDesc: '', 		//事件描述
		 eventBody: {}			//事件体
	}
 * 
 */
DcLogger.prototype.onCustomEvent = function(customEventInfo) {
	if (customEventInfo) {
		customEventInfo.msgType = 'custom.event';
		this._log(this._applyCommonInfo(customEventInfo));
	}
};

DcLogger.prototype._applyCommonInfo = function(logInfo) {	
	if (logInfo) {
		logInfo.msgId = uuid.v1();
		logInfo.msgVersion = '3.0.0';
		logInfo.dataSdkVersion = '1.1.0';
		logInfo.dataSdkLanguage = 'nodejs';
		logInfo.datasource = "server";
		logInfo.appId = this.appId;
		logInfo.serverIp = this.serverIp;
		logInfo.timestamp = format(TIMESTAMP_FORMAT, new Date());
		logInfo.stime = logInfo.stime || (new Date()).getTime();
	}
	return logInfo;
};

DcLogger.prototype._log = function(logInfo) {
	if (logInfo && logInfo.stime) {
		this.dcRollingFileStream.write(logInfo);
	}
};