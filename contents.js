var pathname = document.location.pathname;
var pathname_fields = pathname.split("/");

function copyHistory1Items() {
    console.log("hogehoge");
    result = ""
    bom_table = $('.history_loop_').not('.order_total_');
    trs = $(bom_table.get(0)).find('tr');

    for(var index=1;index<trs.length;index++) {
        tds = $(trs[index]).find('td');
        result += (
            "https://akizukidenshi.com" + $(tds[0]).find('a').attr('href') + 
            "\t" + $(tds[1]).text() + 
            "\t" + /[0-9,]+/.exec($(tds[2]).text().replaceAll(",",""))[0] +
            "\t" + /[0-9,]+/.exec($(tds[3]).text().replaceAll(",",""))[0] + 
            "\n"
        )
   }

   navigator.clipboard.writeText(result);
}

window.onload = function() {
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.type); // "Hello from background script!"
  switch(request.type) {
      case "copyHistory1Items":
          copyHistory1Items();
          break;
      default:
          break;
  }
  return true;
});

//    console.log("hoge");

//    chrome.runtime.sendMessage(document);
    /*
    var pathname = document.location.pathname;
    var pathname_fields = pathname.split("/");

//    bom_table = $('.history_loop_').not('.order_total_');
//    trs = $(bom_table.get(0)).find('tr');

    result = ""
    for(var index=1;index<trs.length;index++) {
        tds = $(trs[index]).find('td');
        result += (
            "https://akizukidenshi.com" + $(tds[0]).find('a').attr('href') + 
            "\t" + $(tds[1]).text() + 
            "\t" + /[0-9,]+/.exec($(tds[2]).text().replaceAll(",",""))[0] +
            "\t" + /[0-9,]+/.exec($(tds[3]).text().replaceAll(",",""))[0] + 
            "\n"
        )
   }

   navigator.clipboard.writeText(result)

//    console.log(bom_table);
*/
};