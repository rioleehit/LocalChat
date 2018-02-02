var fs = require("fs");
var path = require("path");
var root_path = __dirname+"\\tmp\\";
var chatHistoryFile = root_path+"\\chat.json";
/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
  fs.access(dist, function(err){
    if(err){
      // 目录不存在时创建目录
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });

  function _copy(err, src, dist) {
    if(err){ callback(err);return; } 
	fs.readdir(src, function(err, paths) {
        if(err){ callback(err); return;} 		
		paths.forEach(function(path) {
			var _src = src + '\\' +path;
            var _dist = dist + '\\' +path;
            fs.stat(_src, function(err, stat) {
				if(err){ callback(err);return; }
				// 判断是文件还是目录
				if(stat.isFile()) {
					fs.writeFileSync(_dist, fs.readFileSync(_src));
				} else if(stat.isDirectory()) {
					// 当是目录是，递归复制
					copyDir(_src, _dist, callback)
                }
            })
		})
    })
  }
}


var ChatJson = [];
class ChatItem{
	constructor(ct){
		this.tm = Date.now();
		var file = path.normalize(ct.trim());
		//console.log("--");
		if(file == "\n" ||
		   file == "." ||
		   file+"\\" == path.normalize(root_path) ||
		   file =="\\" ||
		   !fs.existsSync(file)){		
			this.content = ct.trim()//.SubString(0,ct.length>1?ct.length-1:ct.length);
			this.type="str";
			return;
		}
		//if(file == path.normalize()){}
		this.source = file;
		this.content = path.basename(file);
		/*console.log(file);
		console.log(root_path);
		console.log(path.normalize(root_path));
		console.log(file == root_path);
		console.log(file == path.normalize(root_path));
		console.log("*******************************************");
		return;*/
		var st = fs.statSync(file);
		this.type=st.isDirectory() ? "dir" : "file";
		if(this.type=="dir"){
			copyDir(file,root_path+this.content);
		}else{
			fs.writeFileSync(root_path+this.content, fs.readFileSync(file));
		}
	}
}
if(!fs.existsSync(root_path)){
	fs.mkdirSync(root_path);
	console.log("mkdir "+root_path);
}
if(!fs.existsSync(chatHistoryFile)){
	var fd = fs.openSync(chatHistoryFile,'w+');
	console.log(JSON.stringify(ChatJson));
	fs.writeFileSync(fd, JSON.stringify(ChatJson));
	fs.closeSync(fd);
}
var chatfd;
fs.open(chatHistoryFile,'rs+',function(err,fd){
	if(err){return;}
	var err, data = fs.readFileSync(fd);
	if(err != null){return;}
	//console.log(data.toString());
	ChatJson = JSON.parse(data.toString());
	//console.log(JSON.stringify(ChatJson));
	fs.closeSync(fd);
	//chatfd = fd;
});	

function msg(str){
	var i = new ChatItem(str);
	ChatJson.push(i);
	var fd = fs.openSync(chatHistoryFile,'rs+');
	//console.log(JSON.stringify(ChatJson));
	fs.writeFileSync(fd, JSON.stringify(ChatJson));
	fs.closeSync(fd);
	//fs.flush(chatfd);
}

process.stdin.setEncoding("utf8");
process.stdin.on('readable',()=>{
	const chunk = process.stdin.read();
	if(chunk!=null){
		msg(chunk);
	}
})

