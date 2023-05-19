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
  },
  {
    id: "copyHistoryItems",
    title: "秋月Copy",
    urlPattern: "https://akizukidenshi.com/catalog/customer/history.aspx"
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
    case "copyHistoryItems":
      copyItems(tab, info, info.menuItemId);
      break;
    default:
      break;
  }
});

// for future function
async function openHistoryTabs(origin, anchors) {
  // openfirst page
//  chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?" + p + "&ps=50" });
//  console.log({ url: akizukiOrigin + "/catalog/customer/history.aspx?p=" + page + "&ps=50" });
//  chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?p=" + page + "&ps=50" });

  /*
  var pages = $(document).find(".navipage_").first().find("a").slice(0, -2);

  for(var page of pages) {
    var href = page.attr("href")
    console.log(href);
//    chrome.tabs.create({ url: akizukiOrigin + "/catalog/customer/history.aspx?" + p + "&ps=50" });
  }
  */
  var tab_ids = [];
  for(var anchor of anchors) {
    console.log(origin,anchor)
    let tab = await chrome.tabs.create({ url: origin + anchor});
    tab_ids.push(tab.id);
  }

  console.log(tab_ids);
  let groupId = await chrome.tabs.group({ tabIds: tab_ids }, groupId => {
    console.log(groupId);
    chrome.tabGroups.update(groupId, {
      collapsed: true,
      title: "hogehoge"
  });
   });
 /*
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
  console.log(request, sender, sendResponse);
  switch(request.type) {
    case "openURL":
      openHistoryTabs(sender.origin, request.payload.anchors);
      break;
    default:
      break;
  }
});
