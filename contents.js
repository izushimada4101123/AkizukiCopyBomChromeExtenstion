const pathname = document.location.pathname;
const pathname_fields = pathname?.split("/");
const hostURL = document.location.origin;

const history_detail_header = "発注日\tOrderID\tOrderURL\t通販コード\t通販コードURL\t商品名\t数量\t単位\t金額\n"

// parse History Detail from jquery_object
async function parseHistoryDetail(jquery_object) {
  let result = ""

  const order_id_anchor = await jquery_object.find('.order_info_.boder_none_ td.order_list_ a');
  const trs = await jquery_object.find('.history_loop_').not('.order_total_').first().find('tr');
  const order_date =
    await jquery_object.find('span.history_title_').parent().first().clone().children().remove().end().text();

  for(const tr of trs.slice(1)) {
    const tds = $(tr).find('td');
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

// extract cart items and copy to clipboard
async function parseCartItems(jquery_object) {
  const rows = jquery_object.find(".cart_table")
              .first()
              .find("tr > .cart_tdl")
              .filter(function() {return $.trim($(this).text()) !== "";})
              .parent();

  let result = "通販コード\t商品名\t単価\t数量\t単位\t合計\n";
  for(const row of rows) {
    const tds = $(row).find("td");
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
  return result;
}

// ajax function
async function getContentViaAjax(url, data, parse_func, func_argument=null) {
  let result = "";
  await $.ajax({
    type: "GET",
    url: url,
    data: data,
  }).done(
    async msg => {
      result = await parse_func($(msg), func_argument);
    }
  );

  return result;
}

// craw 1 item
async function crawlItems(order_id) {
  return await getContentViaAjax(
    "/catalog/customer/historydetail.aspx",{ "order_id": order_id}, 
    parseHistoryDetail);
}

// extract HistoryDetailAnchors from History list
function getHistoryDetailAnchors(jquery_object) {
  let urls = [];
  for(var aa of $(jquery_object).find("td.order_id_.order_detail_").find("a")) {
    urls.push(($(aa).attr('href')));
  }
  return urls;
}

// 
async function getAllHistoryDetails() {
  return getContentViaAjax(
    "/catalog/customer/history.aspx", 
    {}, copyHistoryItems);
}

async function getHistoryDetailsOnThisPage(location_path) {
  copyHistoryItems($(document),["this_page_only"]);
}

// crawl history page
async function crawlHistory(page, itemsPerPage) {
  return getContentViaAjax(
    "/catalog/customer/history.aspx", 
    { p: page, ps: itemsPerPage }, getHistoryDetailAnchors);
}

// copy 1 History Detail
async function copy1HistoryDetail() {
  let result = await parseHistoryDetail($(document))
  navigator.clipboard.writeText(history_detail_header + result);
}

// copy cartItems
async function copyCartItems() {
  const result = await getContentViaAjax("/catalog/cart/cart.aspx", {}, parseCartItems);
  navigator.clipboard.writeText(result);
}

// copy items on history list page
async function copyHistoryItems(jquery_object, argument=[]) {
  const lastHistory = jquery_object.find(".navipage_").first().find("a").last().attr('href');
  const matched = lastHistory.match(/.+p=([0-9]+).+ps=([0-9]+).*/)
  const maxPage = 0+matched[1];
  const itemsPerPage = 0+matched[2];
  
  let result = "";
  if (argument?.length > 0) {
    if (argument[0] == "this_page_only") {
      for(let url of getHistoryDetailAnchors(jquery_object)) {
        const matched = url.match(/.+order_id=(.+)$/);
        if (matched) {
          result += await crawlItems(matched[1]);
        }
      }
    }
  } else {
    for(var page=1; page <= maxPage; page++) {
      let urls = await crawlHistory(page, itemsPerPage);
  
      for(var url of urls) {
        const matched = url.match(/.+order_id=(.+)$/);
        if (matched) {
          result += await crawlItems(matched[1]);
        }
      }
    }
  }
  navigator.clipboard.writeText(history_detail_header + result);
  return true;
}

// handle context menu event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request?.type) {
    case "copyHistory1Items":
      copy1HistoryDetail();
      break;
    case "copyCartItems":
      copyCartItems();
      break;
    case "copyAllHistoryItems":
      getAllHistoryDetails();
      break;
   case "copyHistoryItemsThisPage":
      getHistoryDetailsOnThisPage(document.location.pathname)
      break;
  }
});

// check login or not
function checkLoggingin() {
  const logout_anchor = $(document).find("div.header-sub").find("a[href*=logout.aspx]") 
  return logout_anchor.length > 0;
}