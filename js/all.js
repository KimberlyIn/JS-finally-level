const productList = document.querySelector(".productWrap");
const cartList = document.querySelector(".shoppingCart-tableList");
const productSelect = document.querySelector(".productSelect"); 
let productData = [];
let cartData = [];
// 初始化
function init(){
    getProductList();
    getCartList();
}
init();
// 購物車印出
function getProductList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        productData = response.data.products;
        renderProductList();
    })
}
// 清除空字串的重複 進行重構
function combinebineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}">
    <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">${item.origin_price}</del>
    <p class="nowPrice">${item.price}</p>
    </li>`
}
function renderProductList(){
    let str = ""; 
    productData.forEach(function(item){
        str += combinebineProductHTMLItem(item); 
    })
    productList.innerHTML = str;
}
// 監聽 productSelect 下拉選單
productSelect.addEventListener("change", function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach(function(item){
        if(item.category == category){
            str += combinebineProductHTMLItem(item);
        }
    })
    productList.innerHTML = str; 
})

// 將物品加入購物車
productList.addEventListener("click", function(e){
    e.preventDefault(); 
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "js-addCart"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;

    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity += 1;
        }
    })

    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    })
    .then(function(response){
        alert("加入購物車");
        getCartList(); 
    })
})
// 取得購物車列表
function getCartList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        document.querySelector(".js-total").textContent = response.data.finalTotal;
        cartData = response.data.carts;
        // 增加購物車
        let str = "";
        cartData.forEach(function(item){
            str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
        })
        cartList.innerHTML = str;
    })
    
}

// 刪除單筆資料
cartList.addEventListener("click", function(e){
    e.preventDefault(); 
    const cartId = e.target.getAttribute("data-id"); 
    if(cartId == null){
        alert("點擊錯誤");
        return;
    }

    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert("刪除單筆資料成功");
        getCartList(); 
    })
})

// 刪除全部商品
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("刪除全部購物車成功");
        getCartList();
    })
    // 再執行一次會出現錯誤 因為都沒有東西了 所以可以寫一個錯誤判斷
    .catch(function(response){
        alert("購物車已清空，請勿重複點擊˙");
    })
})

// 訂單
const orderInfoBtn =  document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function(e){
    e.preventDefault(); 
    if(cartData.length == 0){
        alert('請加入購物車');
        return;
    }

    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;
    if(customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || tradeWay == ''){
        alert('請輸入訂單資訊');
        return;
    }

    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
            "name": customerName,
            "tel": customerPhone,
            "email": customerEmail,
            "address": customerAddress,
            "payment": tradeWay
            }
        }
    })
    .then(function(response){
        alert('訂單建立成功');
        // 字串清空
        document.querySelector('#customerName').value = '';
        document.querySelector('#customerPhone').value = '';
        document.querySelector('#customerEmail').value = '';
        document.querySelector('#customerAddress').value = '';
        document.querySelector('#tradeWay').value = 'ATM';
        getCartList();
    })
})
