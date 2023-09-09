document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-button") === "play-new") {
                startGame("new", "new");
            } else if (this.getAttribute("data-button") === "about") {
                showAbout();
            } else if (this.getAttribute("data-button") === "show-basket") {
                showBasket(lastAisle);
            } else {
                //further functions?
            }
        });
    };
});

/*
    --- Global Variables --- 
    Values that are required across the game. Therefore they are declared at
    the top of the script.
*/

let lastAisle;
let aisles = [];
let basketStock = [];
let shopStock = [];
let specialOffers = [];
let cashHigh = 100.00;
let cashLow = 30.00;
let playerCash = 0.00;
let basketTotalCost = 0.00;


/**
 * * @param {string} customerType - new/same, determines how startGame operates
 * * @param {string} dayType - new/same, determines how startGame operates
 * 
 * Function to start the game.
 * customerType and dayType will determine how the function operates, both of
 * these parameters default as "new". These are changed upon request when the
 * function is called. 
 * Cash, stock and the environment are initated here. The function will also
 * show the loading animation in the toolbar while running
 */
function startGame(customerType = "new", dayType = "new") {

    document.getElementById("toolbar-loading").style.display = "flex";
    document.getElementById("loading-overlay").style.display = "block";

    if (dayType === "new") {

        startingPlayerCash(customerType);
        gameStartingStock(dayType);
        /*
            A delay of 2s gives time to for the 
            arrays of data to populate during the gameStartingStock function before
            performing createEnvironment which relies on these variables
        */
        setTimeout(createEnvironment, 2000);
        emptyBasket();

    }
}

/**
 * Create the game environment which is based on a new customer on a new day.
 * If the day is the same, then a whole new environment is not required.
 * Create buttons for the aisles. Clicking on the buttons will show the shop
 * items associated with the aisle.
 */
function createEnvironment() {
    /*
        Add the aisles, default to no aisle selected and a message to choose an aisle to go to.
    */
    let aisleList = document.getElementById("the-aisles");

    for (let aisle of aisles) {
        let aisleButton = document.createElement("BUTTON");
        aisleButton.className = "aisle-button";
        aisleButton.id = aisle + "_btn";
        aisleButton.onclick = function () {
            changeAisle(aisle, function () {
                document.getElementById("toolbar-loading").style.display = "none";
                document.getElementById("loading-overlay").style.display = "none";
            });
        };
        aisleButton.innerHTML = aisle;
        aisleList.appendChild(aisleButton);
    }

    document.getElementById("game-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    document.getElementById("basket-screen").style.display = "none";
    document.getElementById("wallet-icon").style.display = "flex";
    document.getElementById("basket-button").style.display = "flex";
    document.getElementById("the-toolbar").style.justifyContent = "flex-start";
    document.getElementById("toolbar-loading").style.display = "none";
    document.getElementById("loading-overlay").style.display = "none";
}

/**
 * Function to show the About information
 */
function showAbout() {
    console.log("Show About Info");
}

/**
 * @param {string} customerType - new/same, determines how startingPlayerCash operates
 * 
 * Function for determining player starting cash amount, if customerType="new"
 * then choose a random amount of cash from a range, if customerType="same"
 * then the cash amount is not changed
 */
function startingPlayerCash(customerType = "new") {

    /*
      eg. 0.5 * 70 + 30 = 35 + 30
      eg. 1 * 70 + 30 = 100
      eg. 0 * 70 + 30 = 30
  
      Examples to show how using Math.random (which generates between 0 and 1)
      we can provide the random cash generating element to fit the numbers 
      provided. "toFixed(2)" sets the number to 2 decimal places, accurate
      for cash.
    */
    playerCash = (Math.random() * (cashHigh - cashLow) + cashLow).toFixed(2);
    document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toString());
}

/**
 * @param {string} dayType - new/same, determines how gameStartingStock operates
 * 
 * Function for determining starting shop stock, if dayType="new"
 * then a new generation of stock is created, new items,amounts and prices. If
 * dayType="same" then no change in prices/stocks for a new game
 */
function gameStartingStock(dayType = "new") {
    /*
      Go through each item in items.json and beginning setting stock levels
      also applying specieals as necessary
    */
    //getJSON gets the data from the specials.json file and holds them for stock creation
    $.getJSON("assets/json/specials.json", function (jsonSpecialOfferList) {
        for (jsonSpecialOffer of jsonSpecialOfferList) {
            specialOffers.push({
                id: jsonSpecialOffer.id,
                name: jsonSpecialOffer.name,
                chance: jsonSpecialOffer.chance,
                factor: jsonSpecialOffer.factor,
                occurance: jsonSpecialOffer.occurance
            });
        }
    });

    //getJSON gets the data from the items.json file to then work with each item
    $.getJSON("assets/json/items.json", function (jsonItemsList) {
        for (jsonItem of jsonItemsList) {
            //adding aisle options
            aisles.indexOf(jsonItem.aisle) >= 0 ? null : aisles.push(jsonItem.aisle);

            let thisItemStock = Math.round(Math.random() * (jsonItem.highStock - jsonItem.lowStock) + jsonItem.lowStock);
            let thisItemPrice = Number((Math.random() * (jsonItem.highPrice - jsonItem.lowPrice) + jsonItem.lowPrice).toFixed(2));

            /*
              Chance is used with another Math.random(). There rarer the special offer, the smaller the chance.
              ie. Half price, rarest one, is 0.1. So Math.random() has to get a number below or equal to that.
              But to add a special at all first, it has to get through a previous Math.random and score below 0.4.
            */

            let thisSpecial;
            if (Math.random() < 0.4) {
                for (let i = 0; i < specialOffers.length; i++) {
                    //secondary number generation for "mini-game"
                    let thisScore = Math.random();
                    //if no occurances left of special offers set special to 1 and continue
                    if (specialOffers[i].occurance > 0) {
                        /*
                          if the random number is less or equal to chance then set the special
                          modifier and continue
                        */
                        if (thisScore <= specialOffers[i].chance) {
                            //remove an occurance so specials don't keep forever generating
                            specialOffers[i].occurance--;
                            //set thisSpecial to the modifier
                            thisSpecial = specialOffers[i].factor;
                            break;
                        }
                    } else {
                        thisSpecial = 1;
                    }
                    thisSpecial = 1;
                }
            } else {
                thisSpecial = 1;
            }
            //create the item to go into the shop stock
            let thisItem = {
                id: jsonItem.id,
                name: jsonItem.name,
                price: thisItemPrice,
                quantity: thisItemStock,
                aisle: jsonItem.aisle,
                special: thisSpecial,
                imageUrl: jsonItem.imageUrl,
                alertText: jsonItem.alertText
            };
            shopStock.push(thisItem);
        }
    });

    //ensure that arrays that could be strings, are effectively parsed into objects
    specialOffers = JSON.parse(JSON.stringify(specialOffers));
    shopStock = JSON.parse(JSON.stringify(shopStock));
    aisles = JSON.parse(JSON.stringify(aisles));
}

/**
 * @param {string} requestType - new/same, determines how emptyBasket operates
 * 
 * Function to remove all items from the basket. If requestType="new", this is
 * an emptying to start a new game. If requestType="customer" then the customer
 * has requested the items be returned and this is not the process of beginning
 * a new game
 */
function emptyBasket(requestType = "new") {
    if (requestType === "new") {
        basketStock = [];
    } else {
        /*
          For each item in basket, return to stock. Cash is not altered, 
          this only changes on checkout.
        */
    }
}

/**
 * * @param {number} aisleId - id of the aisle passed to the function eg. "Bakery"
 * 
 * Function which tells the game to change aisle by sending across the id
 * it can use it to filter the JSON data. Starts by clearing the-items div,
 * then populating it with new divs which have content
 */
function changeAisle(aisleId, callback) {

    lastAisle = aisleId;

    document.getElementById("toolbar-loading").style.display = "flex";
    document.getElementById("loading-overlay").style.display = "block";

    for (let aisleButton of aisles) {

        let thisAisleButton = document.getElementById(aisleButton + "_btn");

        if (aisleButton == aisleId) {
            thisAisleButton.classList.toggle("aisle-button-active");
        } else {
            if (thisAisleButton.classList.contains("aisle-button-active")) {
                thisAisleButton.classList.toggle("aisle-button-active");
            }
        }
    }

    //Ensure the shop is emptied each time an aisle button is clicked
    let shopAisle = document.getElementById("the-items");
    shopAisle.innerHTML = "";

    //Iterate through the stock options and add when its the right aisle option
    for (let stockItem of shopStock) {

        if (stockItem.aisle === aisleId) {
            //Creating the elements for each aisle item
            const aisleItem = document.createElement("DIV");
            const itemDisplay = document.createElement("DIV");
            const priceDisplay = document.createElement("DIV");
            const itemImage = document.createElement("IMG");
            const basketAdd = document.createElement("BUTTON");
            const itemPTag = document.createElement("P");
            const stockPTag = document.createElement("P");
            const pricePTag = document.createElement("P");
            const innerStockSpan = document.createElement("SPAN");
            const innerPriceSpan = document.createElement("SPAN");
            const priceAmountSpan = document.createElement("SPAN");
            const specialPTag = document.createElement("P");
            /*
            Variable text nodes for stock, item, price and 
            (if necessary) special text
            */
            let stockStart = document.createTextNode("Stock :");
            let stockText;
            let priceStartText = document.createTextNode("Price :");
            let priceAmountText;
            let specialText;
            let itemText = document.createTextNode(stockItem.name);
            let innerPriceText;
            //The amount paid to pass to the addToBasket function
            let calculatedAmount = 0.00;
            //add the item name to the p element.
            itemPTag.appendChild(itemText);
            /*
            Define class names for the divs that are all present within a
            singular item div in the shop 
            */
            aisleItem.className = "item-container";
            itemImage.className = "item-container-img";
            itemDisplay.className = "item-container-p-div";
            priceDisplay.className = "item-container-p-div price-div";
            itemPTag.className = "item-container-text";
            stockPTag.className = "item-container-text";
            pricePTag.className = "item-container-text";
            innerPriceSpan.className = "item-container-text strikethrough-text";
            priceAmountSpan.className = "item-container-text";
            specialPTag.className = "item-container-text positive-text";
            basketAdd.className = "item-container-button";
            /*
            ----- IMAGE -----
            Search for the image in the directory, if found put it in the box,
            if not, display the no-image 
            */
            checkIfImageExists("assets/images/items/" + stockItem.imageUrl, (exists) => {
                if (exists) {
                    itemImage.src = "assets/images/items/" + stockItem.imageUrl;
                } else {
                    itemImage.src = "assets/images/items/no-image.webp";
                }
            });
            /* ----- STOCK -----
            Setting an id for the stock text area, then setting its text dependant
            on whether the stock is 0, or more. If it is 0, the element is given
            two classes to apply. One, the same as the usual text, the second to
            override the colour of white and to make it red.
            */
            stockPTag.id = "stock_" + stockItem.id;

            if (stockItem.quantity > 0) {
                stockText = document.createTextNode(stockItem.quantity);
                innerStockSpan.className = "item-container-text";
            } else {
                stockText = document.createTextNode("Out Of Stock");
                innerStockSpan.className = "item-container-text negative-text";
            }
            innerStockSpan.appendChild(stockText);
            addElementsToContainer(stockPTag, [stockStart, innerStockSpan]);

            /* ----- PRICING -----
            { id, name, price, quantity, aisle, special, imageUrl };
            the "special" of each object in the shopStock array defines its
            special offer. 
            If it is 1, then it implies that :
            Price = price * 1 - Therefore no special offer
            Price = price * 0.9 - Remove 10% off original price.
            If the price has a special, it needs to display the RRP, special
            price and special offer name. Including css formatting for the offer.
            Also ids for the elements are created here.
            */
            pricePTag.appendChild(priceStartText);
            calculatedAmount = calculateNumberTimes(stockItem.price, stockItem.special);
            priceAmountText = document.createTextNode("£" + (calculatedAmount).toFixed(2));
            priceAmountSpan.appendChild(priceAmountText);
            pricePTag.appendChild(priceAmountSpan);

            if (stockItem.special == 1) {
                specialText = document.createTextNode("&nbsp");

            } else {
                innerPriceText = document.createTextNode("£" + (stockItem.price).toFixed(2));
                innerPriceSpan.appendChild(innerPriceText);
                pricePTag.appendChild(innerPriceSpan);
                /*
                Get the name from the specials.json that has been pulled into
                an array previously
                */
                for (let eachSpecial of specialOffers) {
                    if (eachSpecial.factor === stockItem.special) {
                        specialText = document.createTextNode(eachSpecial.name);
                        specialPTag.appendChild(specialText);
                        break;
                    } else {
                        continue;
                    }
                }

            }
            /* ----- ADD TO BASKET BUTTON -----
            Define the ID, put a + inside the button and assign the onClick to
            each button. Each button is then given the id of the item to send to
            the basket when it is clicked. If there is no stock it will fire an
            alert to remind the user there is none on the shelf
            */
            basketAdd.id = "basket-add_" + stockItem.id;
            if (stockItem.quantity > 0) {
                basketAdd.onclick = function () { addToBasket(stockItem, calculatedAmount, "in-shop"); };
                basketAdd.innerHTML = "+";
            } else {

                basketAdd.onclick = function () { noStockToAdd(stockItem.alertText); };
                basketAdd.innerHTML = `<i class="fas fa-times negative-text"></i>`;
            }
            /*
            Appending to the document. Text nodes to paragraphs, paragraphs
            to text div, the text div to the aisle div and then the button to 
            the aisle div
            */

            // itemDisplay.appendChild(itemPTag);
            // itemDisplay.appendChild(stockPTag);
            // priceDisplay.appendChild(pricePTag);
            // priceDisplay.appendChild(specialPTag);
            // aisleItem.appendChild(itemImage);
            // aisleItem.appendChild(itemDisplay);
            // aisleItem.appendChild(priceDisplay);
            // aisleItem.appendChild(basketAdd);

            addElementsToContainer(itemDisplay, [itemPTag, stockPTag]);
            addElementsToContainer(priceDisplay, [pricePTag, specialPTag]);
            addElementsToContainer(aisleItem, [itemImage, itemDisplay, priceDisplay, basketAdd]);
            //add the item to the shop
            shopAisle.appendChild(aisleItem);
        } else {
            continue;
        }
    }
    callback();
}

/**
 * @param {string} alertingText - the alertText string from the shopStock item
 * 
 * An alert to be fired reminding the user that there is no stock of this item
 * and to try again another time.
 */
function noStockToAdd(alertingText) {
    alert("I'm sorry, there " + alertingText);
}

/**
 * @param {object} itemForBasket - the whole item object passed to the function from shopStock
 * @param {number} amountPaid - the amount "paid" attached to the basket button
 * ```
 * {
 *      id:number, 
 *      name:string, 
 *      price: number, 
 *      quantity: number,
 *      aisle: string,
 *      special: number, 
 *      imageUrl: string ,
 *      alertText: string
 * }
 * ```
 * Function to add an item to the basket, done on an individual basis. You 
 * only have one hand when you are holding a basket!
 * It checks if the id of the object is already in the basket. If so it needs
 * to alter the quantity rather than
 */
function addToBasket(itemForBasket, amountPaid, whichScreen) {
    /*
    First, it needs to be determined if the player has enough money. Otherwise,
    they cannot addToBasket.
    */
    if (playerCash - amountPaid < 0) {
        alert("I'm sorry, you do not have enough money to purchase this");
    } else {

        /*
        subtract the cost from the wallet and set the "wallet-count" data
        attached to the wallet icon to change.
        */

        playerCash = playerCash - amountPaid;
        document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));
        /*
        - If after taking one off the shelf the quantity left is 0, it needs to now
        be marked as out of stock. Otherwise, it is a straightforward quantity 
        adjustment.
        - The ADD button needs to be considered for alteration, as does the text for the stock.
        - Basket tally needs to be altered by +1.
        - basketStock array needs to be altered to include the new item added
        */
        let shopObject = shopStock.find(({ id }) => id === itemForBasket.id);
        shopObject.quantity--;

        let basketTally = document.getElementById("basket-tally");
        basketTally.innerHTML = (parseInt(basketTally.innerHTML) + 1).toString();
        /*
        After checking if this item already exists in the basket. It needs to
        add 1 to the quantity of it, or if not found it needs to create a new
        object into the array based on the initial object with a quantity of 1.
        Remove unnecessary data from the object to go into the basket.
        Then add other values which speed up any further processes
        */
        let itemToGoToBasket = {
            id: itemForBasket.id,
            name: itemForBasket.name,
            price: itemForBasket.price,
            amountPaid: amountPaid,
            quantity: 1,
            aisle: itemForBasket.aisle,
            special: itemForBasket.special,
            imageUrl: itemForBasket.imageUrl
        };

        let itemExistingInBasket = basketStock.find(({ id }) => id === itemToGoToBasket.id);

        if (!(basketStock.find(({ id }) => id === itemToGoToBasket.id))) {
            basketStock.push(itemToGoToBasket);
        } else {
            itemExistingInBasket.quantity++;
        }

        if (whichScreen === "in-shop") {
            let stockTextSpan = document.getElementById("stock_" + itemForBasket.id).children[0];
            let basketButton = document.getElementById("basket-add_" + itemForBasket.id);

            if (shopObject.quantity === 0) {
                basketButton.onclick = function () { noStockToAdd(itemForBasket.alertText); };
                basketButton.innerHTML = `<i class="fas fa-times negative-text"></i>`;
                stockTextSpan.className = "item-container-text negative-text";
                stockTextSpan.innerHTML = "Out Of Stock";
            } else {
                stockTextSpan.innerHTML = shopObject.quantity;
            }
        } else if (whichScreen === "in-basket") {
            //const receiptLineReference = document.getElementsByName("span")[0];
            let receiptLineReference = document.getElementsByName("receipt-line_" + itemForBasket.id)[0];
            let newReceiptLine = createNewReceiptLine(itemForBasket.id, itemForBasket.name, itemForBasket.amountPaid, "no");
            console.log(newReceiptLine);
            receiptLineReference.insertAdjacentElement("beforebegin", newReceiptLine);
            document.getElementById("basket-receipt-total-price").innerHTML = "£" + basketTotalCost.toFixed(2);

            //document.getElementById("the-receipt").innerHTML = "";
            /*for (let a = 0; a < basketStock.length; a++) {
                for (let b = 0; b < basketStock[a].quantity; b++) {
                    createNewReceiptLine(basketStock[a].id, basketStock[a].name, basketStock[a].amountPaid);
                }
            }
            createNewReceiptLine(itemForBasket.id, itemForBasket.name, itemForBasket.amountPaid);*/
        } else {
            //Any other locations?
        }

    }
}
/**
 * ### A function to load and populate the basket window 
 * - Sort basket by item names
 * - Iterate through aisle array and populate as necessary by aisle category
 * - With each iteration, add the item to the basket window, id assigned to container
 * - Container (Image - Name - Price Per - (+) Quantity (-) - Total Price)
 * - When all items added. Need to add a basket total and checkout option.
 */
function showBasket(lastAisle) {

    basketStock.sort(function (a, b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    });

    let basketAisles = aisles;
    basketAisles.sort();

    basketTotalCost = 0.00;

    const gameWindow = document.getElementById("game-screen");
    const basketWindow = document.getElementById("basket-screen");
    const basketItemDisplayDiv = document.getElementById("the-basket");
    const basketReceiptDiv = document.getElementById("the-receipt");
    const basketReturnToShopDiv = document.getElementById("return-to-shop-div");
    const basketReceiptHeader = document.createElement("IMG");
    const basketReturnToShopButton = document.createElement("BUTTON");

    basketReturnToShopDiv.innerHTML = "";
    basketItemDisplayDiv.innerHTML = "";
    basketReceiptDiv.innerHTML = "";

    gameWindow.style.display = "none";
    basketWindow.style.display = "flex";

    basketReturnToShopButton.id = "return-to-shop-button";
    basketReturnToShopButton.onclick = function () { returnToShop(lastAisle); };
    basketReturnToShopButton.innerHTML =
        `<span style="display:flex; align-items:stretch; flex-direction:row;"><i class="fas fa-angle-double-left"></i>&nbspReturn To Shop</span>`;

    basketReturnToShopDiv.appendChild(basketReturnToShopButton);

    basketReceiptHeader.src = "assets/images/logo-white-350.webp";
    basketReceiptHeader.className = "the-receipt-header";
    basketReceiptDiv.appendChild(basketReceiptHeader);



    const receiptTotalDivLine = document.createElement("DIV");
    receiptTotalDivLine.className = "basket-receipt-line total-line";
    const receiptTotalP = document.createElement("P");
    const receiptTotalPriceP = document.createElement("P");
    receiptTotalPriceP.id = "basket-receipt-total-price";
    receiptTotalP.appendChild(document.createTextNode("Total : "));

    for (let a = 0; a < basketStock.length; a++) {
        for (let b = 0; b < basketStock[a].quantity; b++) {
            createNewReceiptLine(basketStock[a].id, basketStock[a].name, basketStock[a].amountPaid);
        }
    }

    receiptTotalPriceP.appendChild(document.createTextNode("£" + basketTotalCost.toFixed(2)));
    addElementsToContainer(receiptTotalDivLine, [receiptTotalP, receiptTotalPriceP]);
    basketReceiptDiv.appendChild(receiptTotalDivLine);

    /*
    For each aisle, check what matches that aisle in the basket
    Each aisle needs to look through the basket array. This then ensures that
    the aisles are alphabetical and the items within the aisles are alphabetical
    aswell. 
    */
    for (let aisleOption of basketAisles) {

        if (basketStock.some(x => x.aisle === aisleOption)) {
            const basketAisleTitleDiv = document.createElement("DIV");
            basketAisleTitleDiv.appendChild(document.createTextNode(aisleOption));
            basketAisleTitleDiv.className = "basket-aisle-title";
            basketAisleTitleDiv.id = "basket-aisle_" + aisleOption;
            basketItemDisplayDiv.appendChild(basketAisleTitleDiv);
        }

        for (let basketItem of basketStock) {
            const basketItemContainer = document.createElement("DIV");
            basketItemContainer.id = "basket-item_" + basketItem.id;
            const basketItemImage = document.createElement("IMG");
            const basketItemName = document.createElement("P");
            const basketItemNameText = document.createTextNode(basketItem.name);
            const basketItemPriceP = document.createElement("P");
            const basketItemPricePer = document.createElement("SPAN");
            const basketItemPricePerRrp = document.createElement("SPAN");
            const basketItemQuantityContainer = document.createElement("DIV");
            const basketItemQuantityPlus = document.createElement("BUTTON");
            const basketItemQuantity = document.createElement("P");
            const basketItemQuantityMinus = document.createElement("BUTTON");
            const basketItemTotalPriceP = document.createElement("P");
            const basketItemTotalPrice = document.createElement("SPAN");
            const basketItemTotalRrp = document.createElement("SPAN");

            if (basketItem.aisle === aisleOption) {
                checkIfImageExists("assets/images/items/" + basketItem.imageUrl, (exists) => {
                    if (exists) {
                        basketItemImage.src = "assets/images/items/" + basketItem.imageUrl;
                    } else {
                        basketItemImage.src = "assets/images/items/no-image.webp";
                    }
                });

                basketItemName.appendChild(basketItemNameText);
                basketItemName.id = "basket-item-name_" + basketItem.id;

                let calculateTotal = calculateNumberTimes(basketItem.amountPaid, basketItem.quantity);
                let calculateTotalRrp = calculateNumberTimes(basketItem.price, basketItem.quantity);
                console.log("COMPARE : " + "price:" + typeof (basketItem.price) + ", " + "paid:" + basketItem.amountPaid);
                if (basketItem.price === basketItem.amountPaid) {
                    basketItemPricePer.appendChild(document.createTextNode("£" + (basketItem.price).toFixed(2)));
                    basketItemTotalPrice.appendChild(document.createTextNode("£" + (calculateTotal).toFixed(2)));

                    basketItemPriceP.className = "basket-item-container-text basket-price-div";
                    basketItemPricePer.className = "basket-item-container-text";
                    basketItemTotalPriceP.className = "basket-item-container-text basket-price-div";
                    basketItemTotalPrice.className = "basket-item-container-text";

                    basketItemPriceP.appendChild(basketItemPricePer);
                    basketItemTotalPriceP.appendChild(basketItemTotalPrice);

                } else {
                    basketItemPricePerRrp.appendChild(document.createTextNode("£" + (basketItem.price).toFixed(2)));
                    basketItemPricePer.appendChild(document.createTextNode("£" + (basketItem.amountPaid).toFixed(2)));
                    basketItemTotalRrp.appendChild(document.createTextNode("£" + (calculateTotalRrp).toFixed(2)));
                    basketItemTotalPrice.appendChild(document.createTextNode("£" + (calculateTotal).toFixed(2)));

                    basketItemPriceP.className = "basket-item-container-text basket-price-div";
                    basketItemPricePer.className = "basket-item-container-text";
                    basketItemPricePerRrp.className = "basket-item-container-text strikethrough-text";

                    basketItemTotalPriceP.className = "basket-item-container-text basket-price-div";
                    basketItemTotalPrice.className = "basket-item-container-text";
                    basketItemTotalRrp.className = "basket-item-container-text strikethrough-text";

                    basketItemPricePerRrp.id = "basket-per-special_" + basketItem.id;
                    basketItemTotalRrp.id = "basket-per-total-special_" + basketItem.id;

                    addElementsToContainer(basketItemPriceP, [basketItemPricePer, basketItemPricePerRrp]);
                    //basketItemPriceP.appendChild(basketItemPricePer);
                    //basketItemPriceP.appendChild(basketItemPricePerRrp);
                    addElementsToContainer(basketItemTotalPriceP, [basketItemTotalPrice, basketItemTotalRrp]);
                    //basketItemTotalPriceP.appendChild(basketItemTotalPrice);
                    //basketItemTotalPriceP.appendChild(basketItemTotalRrp);
                }

                basketItemPricePer.id = "basket-per_" + basketItem.id;
                basketItemTotalPrice.id = "basket-per-total-_" + basketItem.id;

                basketItemQuantityPlus.id = "basket-add_" + basketItem.id;
                basketItemQuantityPlus.className = "basket-item-quantity-button";
                basketItemQuantityPlus.innerHTML = "+";
                basketItemQuantityPlus.onclick = function () { addToBasket(basketItem, basketItem.amountPaid, "in-basket"); };

                basketItemQuantityMinus.id = "basket-sub_" + basketItem.id;
                basketItemQuantityMinus.className = "basket-item-quantity-button";
                basketItemQuantityMinus.innerHTML = "-";
                basketItemQuantityMinus.onclick = function () { removeFromBasket(basketItem.id, basketItemContainer.id, basketItemQuantity.id); };

                basketItemQuantity.appendChild(document.createTextNode(basketItem.quantity));

                addElementsToContainer(basketItemQuantityContainer, [basketItemQuantityPlus, basketItemQuantity, basketItemQuantityMinus]);
                //basketItemQuantityContainer.appendChild(basketItemQuantityPlus);
                //basketItemQuantityContainer.appendChild(basketItemQuantity);
                //basketItemQuantityContainer.appendChild(basketItemQuantityMinus);

                addElementsToContainer(basketItemContainer, [basketItemImage, basketItemName, basketItemPriceP, basketItemQuantityContainer, basketItemTotalPriceP]);
                // basketItemContainer.appendChild(basketItemImage);
                // basketItemContainer.appendChild(basketItemName);
                // basketItemContainer.appendChild(basketItemPriceP);
                // basketItemContainer.appendChild(basketItemQuantityContainer);
                // basketItemContainer.appendChild(basketItemTotalPriceP);

                basketItemContainer.className = "basket-item-container";
                basketItemImage.className = "basket-item-container-img";
                basketItemName.className = "basket-item-container-text";
                basketItemQuantityContainer.className = "basket-item-container-quantity-div";
                basketItemQuantity.className = "basket-item-container-text";
                basketItemQuantity.id = "basket-item-quantity_" + basketItem.id;
                basketItemDisplayDiv.appendChild(basketItemContainer);

            } else {
                continue;
            }
        }
    }
}

/**
 * Function to remove an item to the basket (including its quantity). Whjole 
 * object is passed to the function. It is the manipulated in the basketStock
 * and returned to shopStock. 
 * NOTE : shopStock can have quantity of 0, the basketStock cannot. If this
 * results in basketStock having a quantity of 0 on the item, it needs removing
 * from the array entirely. If the shopStock was out of stock prior, it would 
 * become In Stock as its quantity will increase
 */
function removeFromBasket(removeId, removeContainer, removeQuantity) {

    let shopStockItem = shopStock.find(({ id }) => id === removeId);
    shopStockItem.quantity++;
    let basketStockItem = basketStock.find(({ id }) => id === removeId);
    let basketItemAisle = "basket-aisle_" + basketStockItem.aisle;
    basketStockItem.quantity--;
    basketTotalCost -= basketStockItem.amountPaid;
    playerCash += basketStockItem.amountPaid;

    document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));

    let basketTally = document.getElementById("basket-tally");
    basketTally.innerHTML = (parseInt(basketTally.innerHTML) - 1).toString();
    console.log("remove 2. " + basketStock);


    //get all lines that match the id, remove the first, they all are the same
    let receiptLines = document.getElementsByName("receipt-line_" + removeId);
    console.log(receiptLines);
    receiptLines[0].remove();
    document.getElementById("basket-receipt-total-price").innerHTML = "£" + basketTotalCost.toFixed(2);

    if (basketStockItem.quantity === 0) {

        let basketContainer = document.getElementById(removeContainer);

        const removeIndex = basketStock.findIndex(({ id }) => id === removeId);
        basketStock.splice(removeIndex, 1);
        console.log("remove 3. " + basketStock);
        console.log(JSON.parse(JSON.stringify(basketStock)));

        if (basketStock.some(x => x.aisle === basketStockItem.aisle)) {
            //if any found, do not delete the header
        } else {
            let aisleHeader = document.getElementById(basketItemAisle);
            console.log(aisleHeader);
            aisleHeader.remove();
        }
        basketContainer.remove();

    } else if (basketStockItem.quantity > 0) {
        let quantityContainer = document.getElementById(removeQuantity);
        quantityContainer.innerHTML = basketStockItem.quantity;
        let basketPerTotalContainer = document.getElementById("basket-per-total-_" + removeId);
        console.log(typeof (basketStockItem.amountPaid) + "," + basketStockItem.quantity);
        basketPerTotalContainer.innerHTML = "£" + calculateNumberTimes(basketStockItem.amountPaid, basketStockItem.quantity);
    } else {

    }
}

function returnToShop(lastAisle) {
    let gameWindow = document.getElementById("game-screen");
    let basketWindow = document.getElementById("basket-screen");

    gameWindow.style.display = "flex";
    basketWindow.style.display = "none";

    changeAisle(lastAisle, function () {
        document.getElementById("toolbar-loading").style.display = "none";
        document.getElementById("loading-overlay").style.display = "none";
    });
}

/**
 * Function to checkout. This will display items bought, amount spent,
 * amount remaining and then provide a choice of a starting a new game with new
 * values to play with or to start again with remaining shop items and cash.
 */
function checkoutBasket() {

}

/**
 * 
 * @param {string} url - url of the image to search
 * 
 * This function will use the url provided to determine if it is found on the
 * website.
 */
function checkIfImageExists(url, callback) {

    const img = new Image();
    img.src = url;

    if (img.complete) {

        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };

        img.onerror = () => {
            callback(false);
        };
        callback(false);
    }
}

function calculateNumberTimes(a, b) {
    return Number((a * b).toFixed(2));
}

function addElementsToContainer(container, elements) {
    for (let element of elements) {
        container.appendChild(element);
    }
}

function createNewReceiptLine(receiptid, receiptname, receiptpaid, goOrNo = "go") {
    const receiptDivLine = document.createElement("DIV");
    const receiptNameP = document.createElement("P");
    const receiptPriceP = document.createElement("P");
    receiptDivLine.className = "basket-receipt-line";
    receiptDivLine.setAttribute("name", "receipt-line_" + receiptid);

    receiptNameP.appendChild(document.createTextNode(receiptname));
    receiptPriceP.appendChild(document.createTextNode("£" + (receiptpaid).toFixed(2)));
    addElementsToContainer(receiptDivLine, [receiptNameP, receiptPriceP]);

    basketTotalCost += receiptpaid;
    //document.getElementById("basket-receipt-total-price").innerHTML = "£" + basketTotalCost.toFixed(2);

    if (goOrNo === "go") {
        document.getElementById("the-receipt").appendChild(receiptDivLine);
    } else {
        return receiptDivLine;
    }
}