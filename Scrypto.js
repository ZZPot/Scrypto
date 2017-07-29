// ==UserScript==
// @name        Scrypt0
// @namespace   scrypt0
// @include     *
// @version     1
// @grant       none
// ==/UserScript==
var label_style = document.createElement("style");
label_style.innerHTML = `
.label
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
}
.inputField
{
	transition-duration: 0.2s;
	width: 100%;
	color: black;
	font: 14px "Arial";
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


label.className = "label";
keyField.className = "inputField";
keyField.setAttribute("type", "text");
keyField.setAttribute("placeholder", "Key");
textField.className = "inputField";
textField.setAttribute("placeholder", "Text");
arrows.className = "arrows";

encryptBtn.onclick = encryptMessage;
decryptBtn.onclick = decryptMessage;
encryptBtn.className = "cryptBtn";
decryptBtn.className = "cryptBtn";
encryptBtn.innerHTML = "ENCRYPT";
decryptBtn.innerHTML = "DECRYPT";

function hideCrypt()
{
	label.style.top = "-" + arrows.getBoundingClientRect().top + "px";
	arrows.onclick = showCrypt;
	arrows.innerHTML = "▼";
}
function showCrypt()
{
	label.style.top = "0px";
	arrows.onclick = hideCrypt;
	arrows.innerHTML = "▲";
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
function crytp(text, action)
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
		salt: btoa(document.location.href.split("/")[2]),
		v: 1,
	};
	switch(action)
	{
		case "encrypt":
			return sjcl.encrypt(password, text, params);
		break; // don't need
		
		case "decrypt":
			params.ct = text;
			return sjcl.decrypt(password, JSON.stringify(params));
		break;
	}
}
function encryptMessage()
{
	var selectedText = getSelectedText();
	if(!selectedText)
		return false;
	try
	{
		selectedText = selectedText.toString();
		var encryptedText = crytp(selectedText, "encrypt");
		console.log("Selected text: " + selectedText + "; Encrypted: " + encryptedText);
		if(!swapText(JSON.parse(encryptedText).ct))
		{
			alert("Can't swap text");
			return false;
		}
		return true;
	}
	catch(err)
	{
		alert("Error: " + err);
	}
	return false;
}
function decryptMessage()
{
	var selectedText = getSelectedText();
	if(!selectedText)
		return false;
	try
	{
		selectedText = selectedText.toString();
		var decryptedText = crytp(selectedText, "decrypt");
		console.log("Encrypted text: " + selectedText + "; Decrypted: " + decryptedText);
		if(!swapText(decryptedText))
		{
			alert("Can't swap text");
			return false;
		}
		return true;
	}
	catch(err)
	{
		alert("Error: " + err);
	}	
	return false;
}

document.head.appendChild(label_style);
document.head.insertBefore(cryptoLib, document.head.firstChild);

document.body.appendChild(label);
label.appendChild(keyField);
label.appendChild(br);
label.appendChild(encryptBtn);
label.appendChild(decryptBtn);
label.appendChild(textField);
label.appendChild(arrows);
showCrypt();
