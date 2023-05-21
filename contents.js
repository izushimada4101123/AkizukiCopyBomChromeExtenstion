const pathname = document.location.pathname;
const pathname_fields = pathname?.split("/");
const hostURL = document.location.origin;

async function parseHistory1Item(jquery_object) {
//    let result_header = "発注日\tOrderID\tOrderURL\t通販コード\t通販コードURL\t商品名\t数量\t単位\t金額\n"
  let result = ""

  const order_id_anchor = await jquery_object.find('.order_info_.boder_none_ td.order_list_ a');
  const trs = await jquery_object.find('.history_loop_').not('.order_total_').first().find('tr');
  const order_date =
    await jquery_object.find('span.history_title_').parent().first().clone().children().remove().end().text();

  for(var index=1;index<trs.length;index++) {
    tds = $(trs[index]).find('td');
    result += (
      order_date +
      "\t" + $(order_id_anchor).text() +
      "\t" + location.href +
      "\t" + $(tds[0]).find('a').attr('href').split('/').slice(-2,-1) +
      "\t" + hostURL + $(tds[0]).find('a').attr('href') +
      "\t" + $(tds[1]).text() +
      "\t" + /([0-9,]+)(.+)/.exec($(tds[2]).text().replaceAll(",",""))[1] +
      "\t" + /([0-9,]+)(.+)/.exec($(tds[2]).text().replaceAll(",",""))[2] +
      "\t" + /([0-9,]+)(.+)/.exec($(tds[3]).text().replaceAll(",",""))[0] +
      "\n"
    )
  }

//  console.log(result);
  return result;
}

async function copyHistory1Items(append=false, tab) {
    let result_header = "発注日\tOrderID\tOrderURL\t通販コード\t通販コードURL\t商品名\t数量\t単位\t金額\n"
    let result = ""

    result = await parseHistory1Item($(document))

    if (append) {
//      console.log("append");
      sendMessage({"tab": tab, "header": result_header, "items": result, "id": $(order_id_anchor).text()}, "items");
    } else {
      await navigator.clipboard.writeText(result_header + result);
    }
}

// extract cart items and copy to clipboard
function copyCartItems(jquery_object) {
  // https://akizukidenshi.com/catalog/cart/cart.aspx
  var rows = jquery_object.find(".cart_table")
              .first()
              .find("tr > .cart_tdl")
              .filter(function() {return $.trim($(this).text()) !== "";})
              .parent();

  result = "通販コード\t商品名\t単価\t数量\t単位\t合計\n";
  for(var row of rows) {
    tds = $(row).find("td");
    result += (
      hostURL + $(tds[0]).find('a').attr('href') +
      "\t" + $(tds[1]).find('a').filter(function() {return $.trim($(this).text()) !== "";}).text() +
      "\t" + /[0-9,]+/.exec($(tds[2]).find('span').text())[0] +
      "\t" + $(tds[3]).find('input').val() +
      "\t" + $(tds[3]).clone().children().remove().end().text().trim() +
      "\t" + /[0-9,]+/.exec($(tds[4]).find('span').text())[0] +
      "\n"
    )
  }

//  console.log(result);

  navigator.clipboard.writeText(result);
}

// copy cartItems
async function getCatItems() {
  return getContentViaAjax("/catalog/cart/cart.aspx", {}, copyCartItems);
}

// ajax function
async function getContentViaAjax(url, data, parse_func) {
  await $.ajax({
    type: "GET",
    url: url,
    data: data,
  }).done(
    async msg => {
      result = await parse_func($(msg));
    }
  );

  return result;
}

// craw 1 item
async function crawlItems(order_id) {
  return getContentViaAjax(
    "/catalog/customer/historydetail.aspx",{ "order_id": order_id}, 
    parseHistory1Item);
}

// extract HistoryDetailAnchors from History list
function getHistoryDetailAnchors(jquery_object) {
  let urls = [];
  for(var aa of $(jquery_object).find("td.order_id_.order_detail_").find("a")) {
    urls.push(($(aa).attr('href')));
  }
  return urls;
}

// crawl history page
async function crawlHistory(page, itemsPerPage) {
  return getContentViaAjax(
    "/catalog/customer/history.aspx", 
    { p: page, ps: itemsPerPage}, getHistoryDetailAnchors);
}

//
async function copyHistoryItems(tab) {
  let items = $("td.order_id_.order_detail_").find("a")

  let lastHistory = $(".navipage_").first().find("a").last().attr('href');
  let matched = lastHistory.match(/.+p=([0-9]+).+ps=([0-9]+).*/)
  let maxPage = 0+matched[1];
  let itemsPerPage = 0+matched[2];

  var result = "";
  for(var page=1; page <= maxPage; page++) {
    urls = await crawlHistory(page, itemsPerPage);

    for(var url of urls) {
      aaa = url.match(/.+order_id=(.+)$/);
      result += await crawlItems(aaa[1]);
    }
  }
//  console.log(result);
  navigator.clipboard.writeText(result);
  return true;
}

async function sendMessage(info, messageType) {
  try {
    const response = await chrome.runtime.sendMessage({
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

function writeToClipboard(request) {
  console.log(request);
  navigator.clipboard.writeText(request.payload.items);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request?.type) {
    case "copyHistory1Items":
      copyHistory1Items();
      break;
    case "copyHistory1ItemsAdd":
      copyHistory1Items(true, request?.tab);
      break;
     case "copyCartItems":
        getCatItems();
      break;
    case "copyHistoryItems":
      copyHistoryItems(request?.tab);
      break;
    case "gatheredItems":
      writeToClipboard(request);
      break;
  }
});