"use strict";

// 後台訂單
var orderData = [];
var orderList = document.querySelector('.js-orderList');

function init() {
  getOrderList();
}

init(); // 圖表

function renderC3() {
  // 物件資料蒐集
  var total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  }); // 做出資料關聯

  var categoryAry = Object.keys(total);
  var newData = [];
  categoryAry.forEach(function (item) {
    var ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      type: "pie",
      columns: newData
    }
  });
}

function getOrderList() {
  axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/".concat(api_path, "/orders"), {
    headers: {
      'authorization': token
    }
  }).then(function (response) {
    orderData = response.data.orders; // 組字串資料

    var str = '';
    orderData.forEach(function (item) {
      var timeStamp = new Date(item.createdAt * 1000);
      var orderTime = "".concat(timeStamp.getFullYear(), "/").concat(timeStamp.getMonth() + 1, "/").concat(timeStamp.getDate());
      console.log(orderTime);
      var productStr = '';
      item.products.forEach(function (productItem) {
        productStr += "<p>".concat(productItem.title, " x ").concat(productItem.quantity, "</p>");
      }); // 判斷訂單處理狀態

      var orderStatus = '';

      if (item.paid == true) {
        orderStatus = '已處理';
      } else {
        orderStatus = '未處理';
      } // 對照訂單輸入變數


      str += "<tr>\n            <td>".concat(item.id, "</td>\n            <td>\n            <p>").concat(item.user.name, "</p>\n            <p>").concat(item.user.tel, "</p>\n            </td>\n            <td>").concat(item.user.address, "</td>\n            <td>").concat(item.user.email, "</td>\n            <td>\n            ").concat(productStr, "\n            </td>\n            <td>").concat(orderTime, "</td>\n            <td class=\"js-orderStatus\">\n            <a href=\"#\" data-status=\"").concat(item.paid, "\" class=\"orderStatus\" data-id=\"").concat(item.id, "\">").concat(orderStatus, "</a>\n            </td>\n            <td>\n            <input type=\"button\" class=\"delSingleOrder-Btn js-orderDelete\" data-id=\"").concat(item.id, "\" value=\"\u522A\u9664\">\n            </td>\n        </tr>");
    });
    orderList.innerHTML = str;
    renderC3();
  });
}

orderList.addEventListener('click', function (e) {
  e.preventDefault();
  var targetClass = e.target.getAttribute('class');
  var id = e.target.getAttribute('data-id');

  if (targetClass == 'delSingleOrder-Btn js-orderDelete') {
    deleteOrderItem(id);
    return;
  }

  if (targetClass == 'orderStatus') {
    var status = e.target.getAttribute('data-status');
    changeOrderStatus(status, id);
    return;
  }
}); // 訂單狀態

function changeOrderStatus(status, id) {
  var newStatus;

  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios.put("https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/".concat(api_path, "/orders"), {
    "data": {
      "id": id,
      "paid": newStatus
    }
  }, {
    headers: {
      'authorization': token
    }
  }).then(function (response) {
    alert('修改訂單狀態成功');
    getOrderList();
  });
} // 刪除


function deleteOrderItem(id) {
  axios["delete"]("https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/".concat(api_path, "/orders/").concat(id), {
    headers: {
      'authorization': token
    }
  }).then(function (response) {
    alert('刪除該筆訂單成功');
    getOrderList();
  });
} // 清除全部訂單


var discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  axios["delete"]("https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/".concat(api_path, "/orders"), {
    headers: {
      'authorization': token
    }
  }).then(function (response) {
    alert('全部刪除成功');
    getOrderList();
  });
});