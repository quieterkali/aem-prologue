/*
 *  Copyright 2016 Adobe Systems Incorporated
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
;(function (angular, undefined) {

    "use strict";

    var WishList = function(StorageService, value) {

        this.items = StorageService.fetch('wishlist') || [];

        this.getWishList = function() {
            return this.items;
        };

        this.isWishListProduct = function(product) {
            return doesWishListContainProduct(this.items, product);
        };

        this.addProduct = function(product) {
            if (!doesWishListContainProduct(this.items, product)) {
                this.items.push(product);
                StorageService.save("wishlist", this.items);
                return true;
            } else {
                return false;
            }
        };

        this.removeProduct = function(product) {
            if (doesWishListContainProduct(this.items, product)) {

                var index = this.items.indexOf(product);
                if (index > -1) {
                    this.items.splice(index, 1);
                }

                StorageService.save("wishlist", this.items);
                return true;
            } else {
                return false;
            }
        };


        var doesWishListContainProduct = function(items, product) {
            if (!product) {
                console.log("Can not check a null product");
                return false;
            }

            if (!items) {
                return false;
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.SKU === product.SKU) {
                    return true;
                }
            }
            return false;
        };

    };

    angular.module('cqMobileApps')
        .factory('wishList', ['StorageService', function(StorageService) {
            return new WishList(StorageService);
        }]);

}(angular));