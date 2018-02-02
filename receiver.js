var fs = require("fs");
var ecec = require("child_process").exec;

console.log(__dirname)

var root_path = __dirname+"\\tmp\\";
/*
if(!fs.existsSync(root_path)){
	fs.mkdirSync(root_path);
	console.log("mkdir "+root_path);
}*/
var _last={tm:0}
fs.watch(root_path,function(evt, filename){
	if(filename != "chat.json"){return;}
	//console.log('event is '+ evt);
	//console.log(filename?"file name "+filename : "no name");
	var fd = fs.openSync(root_path+"chat.json",'r');
	var err, data = fs.readFileSync(fd);
	var chatData = JSON.parse(data.toString());
	
	var last = chatData[chatData.length-1];
	if(last.tm <=_last.tm){return;}
	_last = last;
	//console.log(root_path);
	//console.log(last.content);
	if(last.type == "str"){console.log(last.content);}
	else if(last.type == "dir"){ecec("explorer.exe /e,"+root_path+last.content); }
	else if(last.type == "file"){ecec("explorer.exe /e,"+root_path); }
});