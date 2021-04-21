"use strict";

var productList = document.querySelector(".productWrap");
var cartList = document.querySelector(".shoppingCart-tableList");
var productSelect = document.querySelector(".productSelect");
var productData = [];
var cartData = []; // 初始化

function init() {
  getProductList();
  getCartList();
}

init(); // 購物車印出

function getProductList() {
  axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/products")).then(function (response) {
    productData = response.data.products;
    renderProductList();
  });
} // 清除空字串的重複 進行重構


function combinebineProductHTMLItem(item) {
  return "<li class=\"productCard\">\n    <h4 class=\"productType\">\u65B0\u54C1</h4>\n    <img src=\"".concat(item.images, "\">\n    <a href=\"#\" class=\"js-addCart\" id=\"addCardBtn\" data-id=\"").concat(item.id, "\">\u52A0\u5165\u8CFC\u7269\u8ECA</a>\n    <h3>").concat(item.title, "</h3>\n    <del class=\"originPrice\">").concat(item.origin_price, "</del>\n    <p class=\"nowPrice\">").concat(item.price, "</p>\n    </li>");
}

function renderProductList() {
  var str = "";
  productData.forEach(function (item) {
    str += combinebineProductHTMLItem(item);
  });
  productList.innerHTML = str;
} // 監聽 productSelect 下拉選單


productSelect.addEventListener("change", function (e) {
  var category = e.target.value;

  if (category == "全部") {
    renderProductList();
    return;
  }

  var str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combinebineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
}); // 將物品加入購物車

productList.addEventListener("click", function (e) {
  e.preventDefault();
  var addCartClass = e.target.getAttribute("class");

  if (addCartClass !== "js-addCart") {
    return;
  }

  var productId = e.target.getAttribute("data-id");
  var numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });
  axios.post("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/carts"), {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function (response) {
    alert("加入購物車");
    getCartList();
  });
}); // 取得購物車列表

function getCartList() {
  axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/carts")).then(function (response) {
    document.querySelector(".js-total").textContent = response.data.finalTotal;
    cartData = response.data.carts; // 增加購物車

    var str = "";
    cartData.forEach(function (item) {
      str += "<tr>\n            <td>\n                <div class=\"cardItem-title\">\n                    <img src=\"".concat(item.product.images, "\" alt=\"\">\n                    <p>").concat(item.product.title, "</p>\n                </div>\n            </td>\n            <td>").concat(item.product.price, "</td>\n            <td>").concat(item.quantity, "</td>\n            <td>").concat(item.product.price * item.quantity, "</td>\n            <td class=\"discardBtn\">\n                <a href=\"#\" class=\"material-icons\" data-id=\"").concat(item.id, "\">\n                    clear\n                </a>\n            </td>\n        </tr>");
    });
    cartList.innerHTML = str;
  });
} // 刪除單筆資料


cartList.addEventListener("click", function (e) {
  e.preventDefault();
  var cartId = e.target.getAttribute("data-id");

  if (cartId == null) {
    alert("點擊錯誤");
    return;
  }

  axios["delete"]("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/carts/").concat(cartId)).then(function (response) {
    alert("刪除單筆資料成功");
    getCartList();
  });
}); // 刪除全部商品

var discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios["delete"]("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/carts")).then(function (response) {
    alert("刪除全部購物車成功");
    getCartList();
  }) // 再執行一次會出現錯誤 因為都沒有東西了 所以可以寫一個錯誤判斷
  ["catch"](function (response) {
    alert("購物車已清空，請勿重複點擊˙");
  });
}); // 訂單

var orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();

  if (cartData.length == 0) {
    alert('請加入購物車');
    return;
  }

  var customerName = document.querySelector('#customerName').value;
  var customerPhone = document.querySelector('#customerPhone').value;
  var customerEmail = document.querySelector('#customerEmail').value;
  var customerAddress = document.querySelector('#customerAddress').value;
  var tradeWay = document.querySelector('#tradeWay').value;

  if (customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || tradeWay == '') {
    alert('請輸入訂單資訊');
    return;
  }

  axios.post("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/".concat(api_path, "/orders"), {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  }).then(function (response) {
    alert('訂單建立成功'); // 字串清空

    document.querySelector('#customerName').value = '';
    document.querySelector('#customerPhone').value = '';
    document.querySelector('#customerEmail').value = '';
    document.querySelector('#customerAddress').value = '';
    document.querySelector('#tradeWay').value = 'ATM';
    getCartList();
  });
});