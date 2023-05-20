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
    urlPattern: "https://akizukidenshi.com/catalog/customer/history.aspx*"
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

var gid = 0;
var tab_ids = [];
var results = "";
var called_tab_id_g = 0;
// for future function
async function openHistoryTabs(origin, anchors, called_tab_id) {
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
  called_tab_id_g = called_tab_id;
  results = "";
  for(var anchor of anchors) {
    console.log(origin,anchor)
    let tab = chrome.tabs.create({ url: origin + anchor, active: false },
      tab => {
        console.log(tab.id);
//        copyItems(tab, {}, "copyHistory1Items")
        tab_ids.push(tab.id);
/*
        if (!gid) {
          gid = chrome.tabs.group({tabIds: tab.id});
        } else {
          console.log("hoge" + gid);
          chrome.tabs.group({groupId: gid, tabIds: tab.id});
        }
*/
      }
    );
  }
  /*
  groupId = chrome.tabs.group({tabIds: tab_ids},
    groupId => {
      chrome.tabGroups.update(groupId, { collapsed: true, title: "akizuki bom", color: "blue" });
    });
  */
    /*
  console.log(tab_ids);
  await chrome.tabs.group({ tabIds: tab_ids }, groupId => {
    console.log(groupId);
    chrome.tabGroups.update(groupId, { collapsed: true, title: "akizuki bom", color: "blue" });
  });
  */
}

//
function gatherItems(id, items, tab) {
  let index = tab_ids.indexOf(tab.id);
  if (index !== -1) {
    tab_ids.splice(index, 1);
  } 
  console.log(tab_ids.length, called_tab_id_g, id, items);
  results += items;
  chrome.tabs.remove(tab.id);
  if (tab_ids.length == 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      var activeTab = tabs[0];
      const response = chrome.tabs.sendMessage(activeTab.id, {
        type: "gatheredItems",
        payload: {"items": results},
        tab: tab
      });
    });
  }
}

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab_ids.includes(tabId) && changeInfo?.status == 'complete') {
//    console.log(tabId, tab, changeInfo);
    copyItems(tab, {}, "copyHistory1ItemsAdd");
  } 
}); 