const pathname = document.location.pathname;
const pathname_fields = pathname.split("/");
const hostURL = document.location.origin;

function copyHistory1Items() {
    let result = "通販コード\t商品名\t数量\t単位\t金額\n"
    const trs = $('.history_loop_').not('.order_total_').first().find('tr');

    for(var index=1;index<trs.length;index++) {
        tds = $(trs[index]).find('td');
        result += (
            hostURL + $(tds[0]).find('a').attr('href') + 
            "\t" + $(tds[1]).text() + 
            "\t" + /([0-9,]+)(.+)/.exec($(tds[2]).text().replaceAll(",",""))[1] +
            "\t" + /([0-9,]+)(.+)/.exec($(tds[2]).text().replaceAll(",",""))[2] +
            "\t" + /([0-9,]+)(.+)/.exec($(tds[3]).text().replaceAll(",",""))[0] + 
            "\n"
        )
    }

   console.log(result)

   navigator.clipboard.writeText(result);
}

function copyCartItems() {
  // https://akizukidenshi.com/catalog/cart/cart.aspx
  var rows = $(".cart_table")
              .first()
              .find("tr > .cart_tdl")
              .filter(function() {return $.trim($(this).text()) !== "";})
              .parent();

  result = "通販コード\t商品名\t価格\t数量\t単位\t合計\n";
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

  console.log(result);

  navigator.clipboard.writeText(result);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request?.type) {
    case "copyHistory1Items":
      copyHistory1Items();
      break;
    case "copyCartItems":
      copyCartItems();
      break;
  }
});