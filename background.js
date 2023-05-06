// send a message to contents.js for copy item
async function copyItems(tab, info, messageType) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: messageType,
      payload: info
    });
    console.log(response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// create context menus
const menuItemData = [
  {
    id: "copyHistory1Items",
    title: "秋月Copy",
    urlPattern: "https://akizukidenshi.com/catalog/customer/historydetail.aspx*"
  },
  {
    id: "copyCartItems",
    title: "秋月Copy",
    urlPattern: "https://akizukidenshi.com/catalog/cart/cart.aspx*"
  }
];

chrome.runtime.onInstalled.addListener(() => {
  menuItemData.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ["page"],
      documentUrlPatterns: [item.urlPattern]
    });
  });
});

// handle context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    case "copyHistory1Items":
    case "copyCartItems":
      copyItems(tab, info, info.menuItemId);
      break;
    default:
      break;
  }
});

// for future function
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

// for future function
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // just for debugging
  console.log(request);
});
