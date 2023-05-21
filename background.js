// send a message to contents.js for copy item
async function copyItems(tab, info, messageType) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: messageType,
      payload: info,
      tab: tab
    });
    console.log(response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// context menus data
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
    urlPattern: "https://akizukidenshi.com/catalog/customer/history.aspx*"
  }
];

// install context menu
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // just for debugging
//  console.log(request, sender, sendResponse);
  switch(request.type) {
    case "openURL":
      openHistoryTabs(sender.origin, request.payload.anchors, request.payload.tab.id);
      break;
    case "items":
      gatherItems(request.payload.id, request.payload.items, request.payload.tab)
    default:
      break;
  }
});