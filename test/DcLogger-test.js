var DcLogger = require('../DcLogger');
var dcLogger = new DcLogger('12345');

function createRoleInfo() {
	var roleInfo = dcLogger.createBlankLogMsg();
	roleInfo.channel = 'mi';
	roleInfo.channelDesc = '小米';
	roleInfo.accountId = 'mi__124567';
	roleInfo.roleId = '124567';
	roleInfo.roleName = '小米登录';
	roleInfo.roleLevel = 1;	
	return roleInfo;
}

function createRandomRoleInfo() {
	var roleInfo = dcLogger.createBlankLogMsg();
	var roleId = Math.ceil(Math.random() * 100000);
	roleInfo.channel = 'mi';
	roleInfo.channelDesc = '小米';
	roleInfo.accountId = 'mi__' + roleId;
	roleInfo.roleId = roleId;
	roleInfo.roleName = '小米登录';
	roleInfo.roleLevel = 1;	
	return roleInfo;
}

function testRoleLogin() {
	var loginInfo = createRoleInfo();
	dcLogger.onRoleLogin(loginInfo);
}

function testRoleLogout() {
	var logoutInfo = createRoleInfo();
	dcLogger.onRoleLogout(logoutInfo);
}

function testRoleRecharge() {
	var rechargeInfo = createRoleInfo();
	rechargeInfo.currency = 'CNY';
	rechargeInfo.money = 6;
	rechargeInfo.tradeNo = '201711024564851515';
	dcLogger.onRoleRecharge(rechargeInfo);
}

function testRoleLeveUp() {
	var roleLevelUpInfo = createRoleInfo();
	roleLevelUpInfo.roleLevel = 2;
	dcLogger.onRoleLeveUp(roleLevelUpInfo);
}

function testMissionBegin() {
	var missionInfo = createRoleInfo();
	missionInfo.missionId = '100001';
	missionInfo.missionName = '长坂坡';
	missionInfo.missionType = '关卡';
	dcLogger.onMissionBegin(missionInfo);
}

function testMissionFail() {
	var missionInfo = createRoleInfo();
	missionInfo.missionId = '100001';
	missionInfo.missionName = '长坂坡';
	missionInfo.missionType = '关卡';
	dcLogger.onMissionFail(missionInfo);
}

function testMissionSuccess() {
	var missionInfo = createRoleInfo();
	missionInfo.missionId = '100002';
	missionInfo.missionName = '地下城';
	missionInfo.missionType = '任务';
	dcLogger.onMissionSuccess(missionInfo);
}

function testRoleTrade() {
	var tradeInfo = createRoleInfo();
	tradeInfo.tradeId = '456879464688';
	tradeInfo.tradeType = '拍卖行';
	tradeInfo.gold = 1000;
	tradeInfo.virtualCurrencyType = '元宝';
	tradeInfo.virtualCurrencyTotal = 5000;
	tradeInfo.itemId = 'item2';
	tradeInfo.itemName = '青龙偃月刀';
	tradeInfo.itemType = '武器';
	tradeInfo.itemNum = 1;
	dcLogger.onRoleTrade(tradeInfo);
}

function testPowerConsume() {
	var powerConsumeInfo = createRoleInfo();
	powerConsumeInfo.missionId = 'mission2';
	powerConsumeInfo.missionName = '名称';
	powerConsumeInfo.missionType = '关卡';
	powerConsumeInfo.missionFlag = 'enter';
	powerConsumeInfo.consumeNum = 5;
	powerConsumeInfo.remainNum = 60;
	powerConsumeInfo.powerType = '精力';
	dcLogger.onRoleTrade(powerConsumeInfo);
}

function testCustomEvent() {
	var customEventInfo = createRoleInfo();
	customEventInfo.eventId = '/asdf/asf';
	customEventInfo.eventDesc = '描述';
	customEventInfo.eventBody = {a: 'a', b:'b'};
	dcLogger.onRoleTrade(customEventInfo);
	
}

function testVirtualCurrencyPurchase() {
	var virtualCurrencyPurchaseInfo = createRoleInfo();
	virtualCurrencyPurchaseInfo.gold = 1000;
	virtualCurrencyPurchaseInfo.virtualCurrencyType = '金币';
	virtualCurrencyPurchaseInfo.virtualCurrencyTotal = '11000';
	dcLogger.onVirtualCurrencyPurchase(virtualCurrencyPurchaseInfo);
}

function testVirtualCurrencyReward() {
	var virtualCurrencyRewardInfo = createRoleInfo();
	virtualCurrencyRewardInfo.gold = 10;
	virtualCurrencyRewardInfo.virtualCurrencyType = '元宝';
	virtualCurrencyRewardInfo.virtualCurrencyTotal = '10';
	virtualCurrencyRewardInfo.gainChannel = 'mission1';
	virtualCurrencyRewardInfo.gainChannelType = 'mission';
	virtualCurrencyRewardInfo.isBinding  = true;
	dcLogger.onVirtualCurrencyReward(virtualCurrencyRewardInfo);
}

function testVirtualCurrencyConsume() {
	var virtualCurrencyConsumeInfo = createRoleInfo();
	virtualCurrencyConsumeInfo.gold = 1000;
	virtualCurrencyConsumeInfo.virtualCurrencyType = '金币';
	virtualCurrencyConsumeInfo.virtualCurrencyTotal = '10000';
	virtualCurrencyConsumeInfo.itemId = 'item123';
	virtualCurrencyConsumeInfo.itemName = '红宝石';
	virtualCurrencyConsumeInfo.itemType = '道具';
	virtualCurrencyConsumeInfo.itemNum = 1;
	dcLogger.onVirtualCurrencyConsume(virtualCurrencyConsumeInfo);
}

function testTokenPurchase() {
	var tokenPurchaseInfo = createRoleInfo();
	tokenPurchaseInfo.gold = 1000;
	tokenPurchaseInfo.virtualCurrencyType = '金币';
	tokenPurchaseInfo.virtualCurrencyTotal = '11000';
	dcLogger.onTokenPurchase(tokenPurchaseInfo);
}

function testTokenReward() {
	var tokenRewardInfo = createRoleInfo();
	tokenRewardInfo.gold = 10;
	tokenRewardInfo.virtualCurrencyType = '元宝';
	tokenRewardInfo.virtualCurrencyTotal = '10';
	tokenRewardInfo.gainChannel = 'mission1';
	tokenRewardInfo.gainChannelType = 'mission';
	dcLogger.onTokenReward(tokenRewardInfo);
}

function testTokenConsume() {
	var tokenConsumeInfo = createRoleInfo();
	tokenConsumeInfo.gold = 1000;
	tokenConsumeInfo.virtualCurrencyType = '金币';
	tokenConsumeInfo.virtualCurrencyTotal = '10000';
	tokenConsumeInfo.itemId = 'item123';
	tokenConsumeInfo.itemName = '红宝石';
	tokenConsumeInfo.itemType = '道具';
	tokenConsumeInfo.itemNum = 1;
	dcLogger.onTokenConsume(tokenConsumeInfo);
}

function testAsyncBatch() {
	var interval1 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval2 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval3 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval4 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval5 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval6 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval7 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval8 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval9 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	var interval10 = setInterval(function(){
		var dcLogger = new DcLogger('12345');
		var roleInfo = createRandomRoleInfo();
		dcLogger.onRoleLogin(roleInfo);
		dcLogger.onRoleLogout(roleInfo);
	}, 1);
	
	setTimeout(function() {
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		clearInterval(interval4);
		clearInterval(interval5);
		clearInterval(interval6);
		clearInterval(interval7);
		clearInterval(interval8);
		clearInterval(interval9);
		clearInterval(interval10);
	}, 1000 * 60 * 5);
}


testRoleLogin();
testRoleLogout();
testRoleRecharge();
testRoleLeveUp();
testMissionBegin();
testMissionFail();
testMissionSuccess();
testRoleTrade();
testPowerConsume();
testCustomEvent();
testVirtualCurrencyPurchase();
testVirtualCurrencyReward();
testVirtualCurrencyConsume();
testTokenPurchase();
testTokenReward();
testTokenConsume();
//testAsyncBatch();