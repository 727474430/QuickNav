chrome.runtime.onInstalled.addListener(() => {
  console.log("插件已安装");
});

function injectIframe() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "toggleIframe"});
  });
}

chrome.commands.onCommand.addListener(function(command) {
  console.log(`收到命令: ${command}`);
  if (command === "toggle-search") {
    injectIframe();
  }
});

chrome.action.onClicked.addListener(function(tab) {
  injectIframe();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "closePopup") {
    chrome.action.setPopup({popup: ""});
    setTimeout(() => {
      chrome.action.setPopup({popup: "popup.html"});
    }, 100);
  }
});