// send a message to contents.js for copy item
async function copyItems(tab, info, messageType) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: messageType,
      payload: info,
      tab: tab
    });
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
    title: "この履歴をコピー",
    urlPattern: "https://akizukidenshi.com/catalog/customer/historydetail.aspx*"
  },
  {
    id: "copyCartItems",
    title: "カートの中味をコピー",
    urlPattern: "https://akizukidenshi.com/*"
  },
  {
    id: "copyBookmarkItems",
    title: "お気に入りの中味をコピー",
    urlPattern: "https://akizukidenshi.com/*"
  },
  {
    id: "copyAllHistoryItems",
    title: "過去の履歴をすべてコピー",
    urlPattern: "https://akizukidenshi.com/*"
  },
  {
    id: "copyHistoryItemsThisPage",
    title: "このページの履歴をコピー",
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
    case "copyCartItems":
    case "copyHistory1Items":
    case "copyHistoryItemsThisPage":
    case "copyAllHistoryItems":
    case "copyBookmarkItems":
      copyItems(tab, info, info.menuItemId);
      break;
    default:
      break;
  }
});