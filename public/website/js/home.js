var app = angular.module('ecomApp', ['angularUtils.directives.dirPagination','ngCookies']);


app.controller('homeCtrl', function($scope, $http,$cookies) {

    $scope.BASE_URL="http://127.0.0.1:8000/api/";


    $scope.mainCatList=[];
    $scope.topSelling=[];
    $scope.topCatList=[];
    $scope.dealProducts=[];
    $scope.whatsNew=[];
    $scope.recentSelling=[];
    $scope.searchProducts=[];
    $scope.searchProductsCatWise=[];
    $scope.allSubCat=[];
    $scope.cardList=[];
    $scope.filteredCardList=[];

    $scope.latitude=18.57695;
    $scope.longitude=73.737439;

    if(!localStorage.getItem("cart_products")){
        localStorage.setItem("cart_products","{}")
    }else{
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
    }
     // For All Map Cordinator
    // if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(function(position){
    //             $scope.latitude=position.coords.latitude;
    //             $scope.longitude=position.coords.longitude;
    //             console.log($scope.longitude)
    //         });
    // }

   $scope.getAllCateogoriesProducts=function(){
        // For All Categories and Products
        $http.get($scope.BASE_URL+"cat")
        .then(function(response) {
            var tdata=[];
            $scope.mainCatList=response.data.data
            for(let item_main of  $scope.mainCatList){
                for(let item_sub of  item_main.subcategory){
                    $scope.allSubCat.push(item_sub)
                    $http.post($scope.BASE_URL+"cat_product",{'lat':$scope.latitude,'lng':$scope.longitude,'cat_id':item_sub.cat_id})
                    .then(function(response1) {
                        for(let item of response1.data.data){
                            if($cookies.get('cat_id')){
                                if($cookies.get('cat_id')==item_sub.cat_id){
                                    $scope.searchProducts.push(item)
                                }
                            }
                            if(!$cookies.get('cat_id')){
                                $scope.searchProducts.push(item)
                            }
                        }
                        tdata[item_sub.cat_id]=response1.data.data;
                    });

                }
            }
            $scope.searchProductsCatWise=tdata
        });
   }


   
   $scope.getHomeData=function(){
        // Home Page
        $http.post($scope.BASE_URL+'homepage', {'lat':$scope.latitude,'lng':$scope.longitude}).then(function (response) {
            $scope.topSelling=response.data.top_selling;
            $scope.topCatList=response.data.top_category;
            $scope.dealProducts=response.data.deal_products;
            $scope.whatsNew=response.data.whats_new;
            $scope.recentSelling=response.data.recentselling;
            //  console.log(response.data)
        });
   }
     $scope.serachProductFun=function(cat_id){
         if(cat_id=="ALL"){
            $cookies.remove('cat_id');
            // $scope.getAllCateogoriesProducts();
            $scope.searchProducts=[];
            var count=0;
            for(let itemMain of $scope.allSubCat){
                for(let item of $scope.searchProductsCatWise[itemMain.cat_id]){
                    console.log(item)
                    $scope.searchProducts[count++]=item
                }
            }
         }
         else{
            $scope.searchProducts=$scope.searchProductsCatWise[cat_id]
         }
     }
     $scope.openProduct=function(cat_id){
        $cookies.put('cat_id',cat_id);
        window.location.href = "product-grid.html";
     }

     $scope.addRemoveProductToCart=function(product){
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
        if($scope.cardList[product.product_id]){
            delete $scope.cardList[product.product_id]
        }
        else{
            product.cartCount=1;
            $scope.cardList[product.product_id]=product
        }
        localStorage.setItem("cart_products", JSON.stringify($scope.cardList));
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
        console.log(product)
        $scope.getCartCount()
     }
     $scope.checkPCartStatus=function(product){
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
       return $scope.cardList[product.product_id]? true:false
     }
     $scope.getCartCount=function(){
        return Object.keys(JSON.parse(localStorage.getItem("cart_products"))).length
     }

    //  For Cart
     $scope.$watch("cardList", function(newVal) {
        $scope.filteredCardList = newVal;
      }, true);

     $scope.getAllCartPrice=function(){
        var total=0;
        for(var key of Object.keys(JSON.parse(localStorage.getItem("cart_products")))){
            total=total+(Number($scope.cardList[key].cartCount)*Number($scope.cardList[key].price))
        }
        return total;
     }
     $scope.getAllCartMrp=function(){
        var total=0;
        for(var key of Object.keys(JSON.parse(localStorage.getItem("cart_products")))){
            total=total+(Number($scope.cardList[key].cartCount)*Number($scope.cardList[key].mrp))
        }
        return total;
     }
     $scope.changeCount=function(product,no){
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
        if((product.stock>=(product.cartCount+no)) && no==1){
            product.cartCount=product.cartCount+no;
        }
        else if(product.cartCount>1 && no==-1){
            product.cartCount=product.cartCount+no;
        }
        $scope.cardList[product.product_id]=product
        localStorage.setItem("cart_products", JSON.stringify($scope.cardList));
        $scope.cardList=JSON.parse(localStorage.getItem("cart_products"))
     }
    //  $scope.getAllCartPrice();
     $scope.getHomeData();
     $scope.getAllCateogoriesProducts();

     console.log($scope.cardList)
});