//var akizukiOrigin = document.location.origin;

//console.log(akizukiOrigin);

function openHistoryTab(document, page) {
  // openfirst page
//  chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?" + p + "&ps=50" });
//  console.log({ url: akizukiOrigin + "/catalog/customer/history.aspx?p=" + page + "&ps=50" });
  var akizukiOrigin = document.location.origin;
//  chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?p=" + page + "&ps=50" });

  /*
  var pages = $(document).find(".navipage_").first().find("a").slice(0, -2);

  for(var page of pages) {
    var href = page.attr("href")
    console.log(href);
//    chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?" + p + "&ps=50" });
  }
  */
}

//openHistoryTab(1);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request); // "Hello from background script!"
//  openHistoryTab(request, 1);
});

function copyHistory1Items(tab, info) {
  console.log(info);
  let result = chrome.tabs.sendMessage(tab.id, {
    type: "copyHistory1Items",
    payload: info
  });


  result
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    })
  
  return true;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyHistory1Items",
    title: "CopyBOM",
    contexts: ["page"],
    documentUrlPatterns: [
      "https://akizukidenshi.com/catalog/customer/historydetail.aspx*"
    ]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    case "copyHistory1Items":
      copyHistory1Items(tab, info);
      break;
    default:
      break;
  }
});