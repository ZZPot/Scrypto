// ==UserScript==
// @name        Scrypt0
// @namespace   scrypt0
// @include     *
// @version     1
// @grant       none
// ==/UserScript==

var label_style = document.createElement("style");
label_style.innerHTML = `
.cryptLabel
{
	background-color:rgb(44, 51, 61);
	width: 200px;
	border-radius: 0px 0px 3px 3px;
	padding: 3px;
	font-size: 20px;
	position: fixed;
	transition-duration: 0.5s;
	right: 30px;
	display: flex;
	flex-wrap: wrap;
	box-sizing: border-box;
	z-index: 30;
}
.arrows
{
	display: block;
	bottom: 0px;
	text-align: center;
	width: 100%;
	left: 0px;
	cursor: pointer;
	color: white;
	font-size: 14px;
}
.inputField
{
	transition-duration: 0.2s;
	width: 100%;
	color: black;
	font: 14px "Arial";
	background-color: white;
	border: 1px solid rgb(0, 0, 0);
	border-radius: 2px;
}
.inputField:focus
{
	box-shadow: 0px 0px 3px 0px rgba(124, 228, 146, 0.8);
}
.cryptBtn
{
	border-radius: 3px;
	padding: 2px;
	background-color: rgb(124, 228, 146);
	color: white;
	display: inline-block;
	height: 30px;
	border: none;
	cursor: pointer;
	padding: 3px;
	margin: 3px auto;
	width:48%;
	font: 700 20px "Trebuchet MS",sans-serif;
}
.waveBtn
{
	border-radius: 5px;
	background: radial-gradient(rgb(30, 145, 53), rgb(255, 255, 255), rgb(30, 145, 53), rgb(255, 255, 255));
	color: black;
	font-size: 14px
}
.waveBtn:disabled
{
	background: rgb(100, 100, 100);
	cursor: default;
	display: none;
}
.checkBoxLabel
{
	color: white;
}
`;
var cryptoLib = document.createElement("script");
cryptoLib.setAttribute("src", "https://bitwiseshiftleft.github.io/sjcl/sjcl.js");
cryptoLib.setAttribute("type", "text/javascript");


var label = document.createElement("div");
var keyField = document.createElement("input");
var textField = document.createElement("textarea");
var arrows = document.createElement("div");
var br = document.createElement("br");

var encryptBtn = document.createElement("button");
var decryptBtn = document.createElement("button");
var encryptWaveBtn = document.createElement("button");
var decryptWaveBtn = document.createElement("button");

var autoBtn = document.createElement("input");
var autoLabel = document.createElement("label");

label.className = "cryptLabel";
keyField.className = "inputField";
keyField.setAttribute("type", "text");
keyField.setAttribute("placeholder", "Key");
keyField.onchange = function(){localStorage["pwd"] = this.value;};
textField.className = "inputField";
textField.setAttribute("placeholder", "Text");
arrows.className = "arrows";

encryptBtn.onclick = function (){cryptMessage("encrypt");};
decryptBtn.onclick = function (){cryptMessage("decrypt");};
encryptBtn.className = "cryptBtn";
decryptBtn.className = "cryptBtn";
encryptBtn.innerHTML = "ENCRYPT";
decryptBtn.innerHTML = "DECRYPT";

encryptWaveBtn.onclick = function (){processBoard("crypt", "encrypt");};
decryptWaveBtn.onclick = function (){processBoard("crypt", "decrypt");};
encryptWaveBtn.className = "cryptBtn waveBtn";
decryptWaveBtn.className = "cryptBtn waveBtn";
encryptWaveBtn.innerHTML = "EncryptWave";
decryptWaveBtn.innerHTML = "DecryptWave";

autoBtn.className = "autoBtn";
autoBtn.setAttribute("type", "checkbox");
autoBtn.onclick = function(){
	if(autoBtn.checked)
		localStorage["autoDecrypt"] = 1;
	else
		localStorage["autoDecrypt"] = 0;
}
autoLabel.className = "checkBoxLabel";
autoLabel.innerHTML = "Auto decrypt";
var crawler0chan = 
{
	extract: function(post)
	{
		var postBody = post.getElementsByClassName("post-body-message");
		if(postBody.empty)
			return false;
		var postMsg = postBody[0].getElementsByTagName("div");
		var msgNode = 0; // in there is no post-link, that occupy first div-node
		if(postBody[0].childElementCount >= 2)
		{
			msgNode = 1; // or last, I didn't encounter more than two
		}
		if(postMsg.empty)
			return false;
		return postMsg[msgNode];
	},
	collect: function()
	{
		var posts = document.getElementsByClassName("block post");
		return posts;
	},
	auto: false, // because of javashit
	escapeCode: function(postText)
	{
		var res = postText.replace(/</mg, "&lt;");
		res = res.replace(/^>(?!>)(.+?)(\n|$)/mg, "<blockquote>>$1</blockquote>\n");
		res = res.replace(/^>{2,}(\d+?)(\n|$)/mg, "<a data-post=\"$1\" style=\"\">>>$1</a>\n");
		res = res.replace(/\n/mg, "<br>");
		return res;
	},
	markPost: function(post)
	{
		post.style.backgroundColor = "#99FF99";
	}
};
var crawler2channelru = 
{
	extract: function(post)
	{
		var postBody = post.getElementsByClassName("replytext");
		if(postBody.empty)
			return false;
		var postMsg = postBody[0].getElementsByTagName("p");//sometimes it doesn't have <p> element
		if(postMsg.empty)
		{
			return false;
		}
		return postMsg[0];
	},
	collect: function()
	{
		var posts = document.getElementsByClassName("reply");
		return posts;
	},
	auto: true,
	escapeCode: function(postText)
	{
		// no post-links, because undefined target 
		var res = postText.replace(/</mg, "&lt;");
		res = res.replace(/^>(?!>)(.+?)(\n|$)/mg, "<blockquote>>$1</blockquote>");
		res = res.replace(/\n/mg, "<br>");
		return res;
	},
	markPost: function(post) // 
	{
		post.style.backgroundColor = "#99FF99";
	}
};
var crawlerkozlyach = //etot min00s ne podkhodeet
{
	extract: function(post)
	{
		var postBody = post.getElementsByTagName("blockquote");
		if(postBody.empty)
			return false;
		var postMsg = postBody[0];
		if(postMsg.empty)
		{
			return false;
		}
		return postMsg;
	},
	collect: function()
	{
		var posts = document.getElementsByClassName("post-container"); //not full post because post block has only common class "glass"
		return posts;
	},
	auto: true,
	escapeCode: function(postText)
	{
		var res = postText.replace(/</mg, "&lt;");
		res = res.replace(/^>(?!>)(.+?)[\n$\s]/mg, "<em>&gt;$1</em>");
		res = res.replace(/^>{2,}(\d+?)[\n$\s]/mg,
		"<em><a class=\"post-link temp\" data-id=\"$1\" href=\"#p$1\">&gt;&gt;$1</a><a class=\"hash-link\" href=\"#p$1\"> #</a></em>"); 
		res = res.replace(/\n/mg, "<br>");
		return res;
	},
	markPost: function(post)
	{
		post.style.backgroundColor = "#99FF99";
	}
}
//supported chans
var crawlers = {
	"0chan.hk": 		crawler0chan,
	"2channel.ru": 		crawler2channelru,
	"0-chan.ru": 		crawlerkozlyach,
	"www.0-chan.ru": 	crawlerkozlyach
};

var siteName = document.domain;
//loading params, if absent - set it default
var defaultParams = {
	"show": 1,
	"autoDecrypt": 0,
	"pwd": ""
};
for(var paramName in defaultParams)
{
	if (!localStorage.hasOwnProperty(paramName))
		localStorage[paramName] = defaultParams[paramName];
}
if(!crawlers.hasOwnProperty(siteName))
{
	encryptWaveBtn.disabled = true;
	decryptWaveBtn.disabled = true;
}

function hideCrypt()
{
	label.style.top = "-" + arrows.getBoundingClientRect().top + "px";
	arrows.onclick = showCrypt;
	arrows.innerHTML = "▼";
	localStorage["show"] = 0;
}
function showCrypt()
{
	label.style.top = "0px";
	arrows.onclick = hideCrypt;
	arrows.innerHTML = "▲";
	localStorage["show"] = 1;
}
function getSelectedText()
{
	var selection = window.getSelection();
	if(selection.anchorNode !== selection.focusNode)
	{
		console.log("Selection must end in same node");
		return false;
	}
	if(selection.isCollapsed)
	{
		if(!textField.value)
		{
			console.log("Nothing selected");
			return false;
		}
		return textField.value;
	}
	return selection;
}
function swapText(newText)
{
	var selection = getSelectedText();
	if(!selection)
		return false;
	if(selection instanceof Selection)
	{
		var node = selection.anchorNode;
		if(node.nodeType !== 3)
			return false;
		var oldText = node.data;
		console.log(selection);
		var part1 = oldText.slice(0, Math.min(selection.anchorOffset, selection.focusOffset));
		var part2 = oldText.slice(Math.max(selection.focusOffset, selection.anchorOffset), oldText.length);
		node.data = part1 + newText + part2;
		
		return true;
	}
	else
	{
		textField.value = newText;
		return true;
	}
}
function crytp(text, param)
{
	var password = keyField.value;
	var params = 
	{
		adata: "",
        iter: 500,
        mode: "ccm",
        ts: 64,
        ks: 128,
		cipher: "aes",
		iv: "gKh+JQQmah38VpDZPkACyw==", //should be random
		salt: btoa(siteName),
		v: 1,
	};
	switch(param)
	{
		case "encrypt":
			return JSON.parse(sjcl.encrypt(password, text, params)).ct;
		break; // don't need
		
		case "decrypt":
			params.ct = text;
			return sjcl.decrypt(password, JSON.stringify(params));
		break;
	}
}
function cryptMessage(param)
{
	var selectedText = getSelectedText();
	if(!selectedText)
		return false;
	try
	{
		selectedText = selectedText.toString();
		var output = crytp(selectedText, param);
		console.log("Input: " + selectedText + "; Output: " + output);
		if(!swapText(output))
		{
			console.log("Can't swap text");
			return false;
		}
		return true;
	}
	catch(err)
	{
		console.log("Error: " + err);
	}
	return false;
}
function processPost(post, action, param)
{
	switch(action)
	{
		case "crypt":
			var msgNode = crawlers[siteName].extract(post);
			if(!msgNode)
			{
				console.log("Can't extract message body");
				return false;
			}
			try
			{
				msgNode.innerHTML = crawlers[siteName].escapeCode(crytp(msgNode.innerHTML, param));
				crawlers[siteName].markPost(post);
				return true;
			}
			catch(err)
			{
				//some style response?
				console.log("Can't perform crypt operation: " + param);
			}
			break;
	}
}
function processBoard(action, param)
{
	console.log(siteName + " processBoard(" + action + ", " + param + ")");
	var posts = crawlers[siteName].collect();
	if(posts.empty)
	{
		console.log("Can't find any post");
		return false;
	}
	console.log("Posts on page: " + posts.length);
	for(var i = 0; i < posts.length; i++)
		processPost(posts[i], action, param);
}
document.head.appendChild(label_style);
document.head.insertBefore(cryptoLib, document.head.firstChild);

document.body.appendChild(label);
label.appendChild(keyField);
keyField.value = localStorage["pwd"];
label.appendChild(br);
label.appendChild(encryptBtn);
label.appendChild(decryptBtn);
if(crawlers.hasOwnProperty(siteName) && crawlers[siteName].auto)
{
	autoLabel.insertBefore(autoBtn, autoLabel.firstChild);
	label.appendChild(autoLabel);
}
label.appendChild(encryptWaveBtn);
label.appendChild(decryptWaveBtn);
label.appendChild(textField);
label.appendChild(arrows);

window.onload = function(){
	if(localStorage["autoDecrypt"] == 1)
	{
		autoBtn.checked = "true";
		processBoard("crypt", "decrypt");
	}
	if(localStorage["show"] == 1)
	{
		showCrypt();
	}
	else
	{
		showCrypt();
		//костыль
		hideCrypt();
	}
}
