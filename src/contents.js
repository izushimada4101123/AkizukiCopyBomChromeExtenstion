const pathname = document.location.pathname;
const pathname_fields = pathname?.split("/");
const hostURL = document.location.origin;

const history_detail_header = "発注日\tOrderID\tOrderURL\t通販コード\t通販コードURL\t商品名\t数量\t単位\t金額\n"

// parse History Detail from jquery_object
async function parseHistoryDetail(jquery_object) {
  let result = ""

  const order_id = await jquery_object.find('td.block-purchase-history-detail--order-id').text();
  const trs = await jquery_object.find('table.table.block-purchase-history-detail--order-detail-items tbody tr');
  const order_date =
    await jquery_object.find('td.block-purchase-history-detail--order-dt').text();

  for(const tr of trs) {
    const tds = $(tr).find('td');
    part_id = $(tds[0]).text();
    unit = $(tds[1]).find('div.block-goods-sales_unit').text().match(/([0-9,]+)/g);
    result += (
      order_date +
      "\t" + order_id +
      "\t" + location.href +
      "\t" + part_id + 
      "\t" + "https://akizukidenshi.com/catalog/g/g" + part_id +
      "\t" + $(tds[1]).find('div.block-purchase-history-detail--goods-name').text() +
      "\t" + $(tds[2]).text() +
      "\t" + ((unit.length>1)?unit[1]:unit[0]) +
      "\t" + /([0-9,]+)/.exec($(tds[3]).text().replaceAll(",",""))[0] +
      "\n"
    )
  }
//  console.log(result);
  return result;
}

// extract cart items and copy to clipboard
async function parseCartItems(jquery_object) {
  const rows = jquery_object.find(".block-cart--contents--table")
              .first()
              .find(".block-cart--goods-list")

  let result = "通販コード\t商品名\t単価\t数量\t単位\t合計\n";
  for(const row of rows) {
    const tds = $(row).find("td");
    const unit_price = parseInt(/[0-9,]+/.exec($(tds[2]).find('p').text())[0]);
    const count = parseInt($(tds[3]).find('input').val());
    const unit_ = $(tds[1]).clone().find(".block-goods-sales_unit").text().match(/[0-9,]+/g);
    const unit = unit_.length>1?unit_[1]:unit_[0];
    result += (
      hostURL + $(tds[0]).find('a').attr('href') +
      "\t" + $(tds[1]).find('a').filter(function() {return $.trim($(this).text()) !== "";}).text() +
      "\t" + unit_price +
      "\t" + count +
      "\t" + unit +
      "\t" + unit_price * count +
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
  showAlert("現在取得しています\nしばらくお待ちください");
  let result = await parseHistoryDetail($(document))
  setAlertString("クリップボードに<br/>コピー完了");
  hideAlert();
  navigator.clipboard.writeText(history_detail_header + result);
}

// copy cartItems
async function copyCartItems() {
  showAlert("現在取得しています\nしばらくお待ちください");
  const result = await getContentViaAjax("/catalog/cart/cart.aspx", {}, parseCartItems);
  setAlertString("クリップボードに<br/>コピー完了");
  hideAlert();
  navigator.clipboard.writeText(result);
}

// copy items on history list page
async function copyHistoryItems(jquery_object, argument=[]) {
  showAlert("現在取得しています\nしばらくお待ちください");
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
  setAlertString("クリップボードに<br/>コピー完了");
  hideAlert();
  navigator.clipboard.writeText(history_detail_header + result);
  return true;
}

// handle context menu event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request?.type) {
    case "copyHistory1Items":
      if (!checkLoggingIn()) {
        alert("ログインしないと使えません");
      } else {
        copy1HistoryDetail();
      }
      break;
    case "copyCartItems":
      copyCartItems();
      break;
    case "copyAllHistoryItems":
      if (!checkLoggingIn()) {
        alert("ログインしないと使えません");
      } else {
        getAllHistoryDetails();
      }
      break;
   case "copyHistoryItemsThisPage":
      if (!checkLoggingIn()) {
        alert("ログインしないと使えません");
      } else {
        getHistoryDetailsOnThisPage(document.location.pathname);
      }
      break;
   case "copyBookmarkItems":
      if (!checkLoggingIn()) {
        alert("ログインしないと使えません");
      } else {
        copyBookmarkItems();
      }
      break;
  }
});

// check login or not
function checkLoggingIn() {
  let login_img = null;
  if (navigator.userAgent.match("Edg")) {
    // Edge
    login_img = $('img[src*="gnav_mypage.png"]');
  } else {
    // chrome
    login_img = $('img[src*="gnav_mypage.png"]');
  }

  return login_img.length > 0;
}

// get bookmark(favorite) items
async function getBookmarkItems(jquery_object) {
  const tables = jquery_object.find('form[action*="bookmark.aspx"]').find('li.js-enhanced-ecommerce-item')

  let result = "更新日\t通販コード\t通販URL\t商品名\t単位\t金額\tコメント\n"
  for(let i = 0; i < tables.length-1; i++) {
    const anchor = $(tables[i]).find("a.js-enhanced-ecommerce-goods-name");
    const comment = $(tables[i]).find("div.block-favorite--comment-message").text();
    const updatedOn = $(tables[i]).find("dl.block-favorite--update-dt dd").text();
    const unit = $(tables[i]).find("div.block-favorite--sales_qty").text().match(/([0-9,]+)/g)
    const price_ = $(tables[i]).find("div.block-favorite--price.price.js-enhanced-ecommerce-goods-price").text().match(/([0-9,]+)/)[0];

    // updated, code , url, name
    let row = [
      updatedOn, anchor.attr("href").match(/([^\/]+)\/$/)[1],
      location.origin + anchor.attr("href"), anchor.text() ];

    if (unit) {
      row.push(unit.length>1?unit[1]:unit[0]); // unit
      row.push(price_)  // unit price
    } else {
      row.push("");
      row.push("");
    }

    row.push(comment);

    result += (row.join('\t') + '\n');
  }

  return result;
}

// craw 1 item
async function copyBookmarkItems(order_id) {
  showAlert("現在取得しています\nしばらくお待ちください");
  const result = await getContentViaAjax(
    "/catalog/customer/bookmark.aspx", {},
    getBookmarkItems);
  setAlertString("クリップボードに<br/>コピー完了");
  hideAlert();
  navigator.clipboard.writeText(result);
}

// show "non-standard" alert window
async function showAlert(str) {
  const countNewline = Math.max(1, ( str.match( /\n/g ) || [] ).length);
  $("body").append(`<div id="alert" class="grad">${str.replaceAll("\n", "<br/>")}</div>`);
  var $ah = $("#alert").height();
  var $aw = $("#alert").width();
  var $top = $(window).height()/2-$ah/2;
  var $left = $(window).width()/2-$aw/2;
  $("#alert").css({"top":$top,"left":$left,"opacity":0, "line-height":`${($ah)/(countNewline+1)}px`}).animate({"opacity":1},500);
}

// set alert string
function setAlertString(str) {
  $("body div#alert").html(str.replaceAll("\n", "<br/>"));
}

// hide alert
async function hideAlert() {
  setTimeout(function(){
  $("#alert").delay(1000).animate({"opacity":0},500,function(){
  $(this).remove();
  $("body").css("overflow","auto");
  });
  },200);
}