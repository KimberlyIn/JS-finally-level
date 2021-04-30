// 後台訂單
let orderData = [];
const orderList = document.querySelector('.js-orderList');
function init(){
    getOrderList();
}
init();
// 圖表
function renderC3(){
    // 物件資料蒐集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    let chart = c3.generate({
        bindto: '#chart', 
        data: {
            type: "pie",
            columns: newData,
        },
    });
}

function getOrderList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        headers: {
            'authorization': token,
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        // 組字串資料
        let str = '';
        orderData.forEach(function(item){
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            console.log(orderTime);
            let productStr = '';
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
            })
            // 判斷訂單處理狀態
            let orderStatus = '';
            if(item.paid == true){
                orderStatus = '已處理';
            } else {
                orderStatus = '未處理';
            }
            // 對照訂單輸入變數
            str += `<tr>
            <td>${item.id}</td>
            <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
            ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
            <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML = str;
        renderC3();
    })
}

orderList.addEventListener('click', function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute('class');
    let id = e.target.getAttribute('data-id');
    if(targetClass == 'delSingleOrder-Btn js-orderDelete'){
        deleteOrderItem(id);
        return;
    }
    if(targetClass == 'orderStatus'){
        let status = e.target.getAttribute('data-status');
        changeOrderStatus(status,id);
        return;
    }
})

// 訂單狀態
function changeOrderStatus(status,id){
    let newStatus;
    if(status == 'true'){
        newStatus = false;
    } else {
        newStatus = true;
    }
    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id": id,
            "paid": newStatus
        }
    },
    {
        headers: {
            'authorization': token,
        }
    })
    .then(function(response){
        alert('修改訂單狀態成功');
        getOrderList();
    })
}
// 刪除
function deleteOrderItem(id){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers: {
            'authorization': token,
        }
    })
    .then(function(response){
        alert('刪除該筆訂單成功');
        getOrderList();
    })
}
// 清除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        headers: {
            'authorization': token,
        }
    })
    .then(function(response){
        alert('全部刪除成功');
        getOrderList();
    })
})
