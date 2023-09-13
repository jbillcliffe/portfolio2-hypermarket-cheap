/*
Initial function to get the first buttons and assign their functions based on
data-attributes. Reference the Love Maths exercise
*/
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
 * ## Function to start the game
 * customerType and dayType will determine how the function operates, both of
 * these parameters default as "new". These are changed upon request when the
 * function is called. 
 * Cash, stock and the environment are initated here. The function will also
 * show the loading animation in the toolbar while running
 * @param {string} customerType - new/same, determines how startGame operates.
 * @param {string} dayType - new/same, determines how startGame operates.
 */
function startGame(customerType = "new", dayType = "new") {

    document.getElementById("toolbar-loading").style.display = "flex";
    document.getElementById("loading-overlay").style.display = "block";
    document.getElementById("game-end-modal").style.display = "none";

    startingPlayerCash(customerType);

    if (dayType == "new") {
        gameStartingStock("new");
    }
    /*
    A delay of 4s gives time to for the 
    arrays of data to populate during the gameStartingStock function before
    performing createEnvironment which relies on these variables
    */
    setTimeout(createEnvironment, 4000, customerType, dayType);

}

/**
 * ## Function for creating the game environment
 * - Create the game environment which is based on a new customer on a new day.
 * - If the day is the same, then a whole new environment is not required.
 * - This function will also be required after emptyBasket() when a "same" value
 * is returned for customerType.
 * - Create buttons for the aisles. Clicking on the buttons will show the shop
 * items associated with the aisle.
 * @param {string} customerType - new/same, determines how createEnvironment operates.
 * @param {string} dayType - new/same, determines how createEnvironment operates.
 */
function createEnvironment(customerType = "new", dayType = "new") {
    /*
        Add the aisles, default to no aisle selected and a message to choose an aisle to go to.
    */
    let aisleList = document.getElementById("the-aisles");
    aisleList.innerHTML = "";

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
    /*hide these elements from their string names passed to a function to
    operate with an array and getElementById*/

    hideElementArray(["game-menu", "about-screen", "basket-screen", "toolbar-loading", "loading-overlay"]);
    showElementArray(["game-screen", "wallet-icon", "basket-button"]);
    document.getElementById("the-toolbar").style.justifyContent = "flex-start";
    emptyBasket();
}

/**
 * ## Function to show the About information
 */
function showAbout() {
    document.getElementById("game-menu").style.display = "none";
    document.getElementById("about-screen").style.display = "flex";
}

/**
 * ## Function for determining player starting cash amount
 * - If customerType="new" then choose a random amount of cash from a range,
 * - if customerType="same" then the cash amount is not changed
 * @param {string} customerType - new/same, determines how startingPlayerCash operates
 */
function startingPlayerCash(customerType = "new") {

    if (customerType == "same") {
        //if the same person, do not regenerate the cash amount
    } else {
        playerCash = (Math.random() * (cashHigh - cashLow) + cashLow);
    }

    document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));
}

/**
 * ## Function for determining starting shop stock
 * - If dayType="new" then a new generation of stock is created, new items,
 * amounts and prices. 
 * - If dayType="same" then no change in prices/stocks for a new game.
 * @param {string} dayType - new/same, determines how gameStartingStock operates
 */
function gameStartingStock(dayType = "new") {
    
    /*This function is only run when the day is new, so it has to generate new stock.
    These arrays need to be cleared before restarting */
    specialOffers = [];
    aisles = [];
    shopStock = [];
    lastAisle = "Home";

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
        //small timeout before moving to the next section, making sure data loaded
        setTimeout(thenGetItems(), 1500);
    });

    //getJSON gets the data from the items.json file to then work with each item
    function thenGetItems() {
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
                        let thisScore = Math.random();
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
        /*
        parsing a string, ensures that data is definitely correct and in a JSON
        format
        */
        specialOffers = JSON.parse(JSON.stringify(specialOffers));
        shopStock = JSON.parse(JSON.stringify(shopStock));
        aisles = JSON.parse(JSON.stringify(aisles));
    }
}
/**
 * ## Function to remove all items from the basket. 
 * If customerType="new", this is an emptying to start a new game. If 
 * customerType="customer" then the customer has requested the items be returned
 * and this is not the process of beginning a new game
 * @param {string} customerType - new/same, determines how emptyBasket operates
 */
function emptyBasket(customerType = "new") {
    if (customerType === "new") {
        basketStock = [];
    } else {
        /*
          - For each item in basket, return to stock. 
          - Cash needs to be restored to previous level, which is done 
          in this loop.
          - perform createEnvironment function, which leaves the basket and reloads
        */
        for (let basketItem of basketStock) {
            let shopObject = shopStock.find(({ id }) => id === basketItem.id);
            shopObject.quantity += basketItem.quantity;
            playerCash += basketItem.amountPaid * basketItem.quantity;
            startingPlayerCash("same");
        }

        //empty the array and update the wallet to display current cash
        basketStock = [];
        document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));
    }

    let basketTally = document.getElementById("basket-tally");
    basketTally.innerHTML = "0";

    //Ensure the shop is emptied
    let shopAisle = document.getElementById("the-items");
    shopAisle.innerHTML = "";
}

/**
 * ## Function which tells the game to change aisle
 * By sending across the id it can use it to filter the JSON data. 
 * Starts by clearing the-items div, then populating it with new divs
 * which have content. The content is chosen by iterating through the options
 * available from the shop and inserting only those where the aisle matches.
 * @param {number} aisleId - id of the aisle passed to the function eg. "Bakery"
 */
function changeAisle(aisleId, callback) {

    if(!aisleId || aisleId === "Home")
    {
        //this will default no matches and leave the shop empty
        lastAisle = "Home";
    } else {
        lastAisle = aisleId;
    }

    document.getElementById("toolbar-loading").style.display = "flex";
    document.getElementById("loading-overlay").style.display = "block";

    for (let aisleButton of aisles) {

        let thisAisleButton = document.getElementById(aisleButton + "_btn");

        /*
        If the id sent to the function matches this in the array, then set this
        button to have to active class, to clearly show the aisle currently in
        */
        if (aisleButton == aisleId) {
            thisAisleButton.classList.toggle("aisle-button-active");
        } else {
            if (thisAisleButton.classList.contains("aisle-button-active")) {
                thisAisleButton.classList.toggle("aisle-button-active");
            }
        }
    }
    //Ensure the shop is emptied each time an aisle button is clicked
    let changeShopAisle = document.getElementById("the-items");
    changeShopAisle.innerHTML = "";

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
            let calculatedAmount = 0.00;
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
            addElementsToContainer(itemDisplay, [itemPTag, stockPTag]);
            addElementsToContainer(priceDisplay, [pricePTag, specialPTag]);
            addElementsToContainer(aisleItem, [itemImage, itemDisplay, priceDisplay, basketAdd]);
            //add the item to the shop
            changeShopAisle.appendChild(aisleItem);
        } else {
            continue;
        }
    }
    callback();
}

/**
 * ## Function to send an alert when + button clicked when there is no stock
 * Tell user to try again another time, alertingText is given from the item's
 * alertText value in its object
 * @param {string} alertingText - the alertText string from the shopStock item
 */
function noStockToAdd(alertingText) {
    alert("I'm sorry, there " + alertingText);
}

/**
 * ## Function to add an item to the basket.
 * ```
 * BasketItem
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
 * This is done on a +1 basis. You only have one hand when you are holding a basket!
 * - Checks if there is enough cash. If not display an alert.
 * - Subtract cost from wallet
 * - Checks if object with same id already exists in basketStock 
 *      - if yes, +1 to quantity
 *      - if no, add new object to basketStock array with quantity 1
 * - Then checks to see if this was performed "in-shop" or "in-basket"
 * - In Shop 
 *      - Update required text elements
 *      - Checks the stock level after update.
 *      - If 0, change the + button to display an alert instead when clicked.
 *      - Also change the + to a red X to signify no stock
 * - In Basket
 *      - Insert a new line into the receipt
 *      - Calculate new receipt total
 *      - If this was last of stock, remove the ability to add more by removing + button
 * @param {object} itemForBasket - the whole item object passed to the function from shopStock
 * @param {number} amountPaid - the amount "paid" attached to the basket button
 * @param {string} whichScreen - From basket or shop determines how its added
 */
function addToBasket(itemForBasket, amountPaid, whichScreen) {

    //Alert if no money
    if (playerCash - amountPaid < 0) {
        alert("I'm sorry, you do not have enough money to purchase this");
    } else {

        //Subtract from playerCash the cost after "special" modifier
        playerCash = playerCash - amountPaid;
        document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));

        //-1 off the item in the shopStock
        let shopObject = shopStock.find(({ id }) => id === itemForBasket.id);
        shopObject.quantity--;

        //increase the tally in the toolbar +1
        let basketTally = document.getElementById("basket-tally");
        basketTally.innerHTML = (parseInt(basketTally.innerHTML) + 1).toString();

        /*
        Create the object as a reference for this item alone being added to
        the basket
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

        //Search for item's existence in the basket
        let itemExistingInBasket = basketStock.find(({ id }) => id === itemToGoToBasket.id);

        //if false, add to basket new object, else +1 quantity
        if (!(basketStock.find(({ id }) => id === itemToGoToBasket.id))) {
            basketStock.push(itemToGoToBasket);
            itemExistingInBasket = itemToGoToBasket;
        } else {
            itemExistingInBasket.quantity++;
        }

        //Dependent upon location, determines which DOM Elements need updating.
        if (whichScreen === "in-shop") {
            let stockTextSpan = document.getElementById("stock_" + itemForBasket.id).children[0];
            let basketButton = document.getElementById("basket-add_" + itemForBasket.id);
            /*
            If this was the last of the stock, change the function on the
            + button and edit texts and classes. If not, then just amend the
            stock text to the new number
            */
            if (shopObject.quantity === 0) {
                basketButton.onclick = function () { noStockToAdd(itemForBasket.alertText); };
                basketButton.innerHTML = `<i class="fas fa-times negative-text"></i>`;
                stockTextSpan.className = "item-container-text negative-text";
                stockTextSpan.innerHTML = "Out Of Stock";
            } else {
                stockTextSpan.innerHTML = shopObject.quantity;
            }
        } else if (whichScreen === "in-basket") {
            /*
            When this is done in the basket, it is required to add a new line
            to the receipt in real time.
            */
            let receiptLineReference = document.getElementsByName("receipt-line_" + itemForBasket.id)[0];
            let newReceiptLine = createNewReceiptLine(itemForBasket.id, itemForBasket.name, itemForBasket.amountPaid, "no");
            receiptLineReference.insertAdjacentElement("beforebegin", newReceiptLine);
            document.getElementById("basket-receipt-total-price").innerHTML = "£" + basketTotalCost.toFixed(2);
            document.getElementById("basket-item-quantity_" + itemExistingInBasket.id).innerHTML = itemExistingInBasket.quantity;
            let totalPaid = calculateNumberTimes(itemExistingInBasket.amountPaid, itemExistingInBasket.quantity);
            document.getElementById("basket-per-total_" + itemExistingInBasket.id).innerHTML = "£" + totalPaid.toFixed(2);
            let rrpAmount = calculateNumberTimes(itemExistingInBasket.price, itemExistingInBasket.quantity);

            /*
            if there is a special offer (factor of multiplication less than 1)
            then the text needs to be added
            */
            if (itemExistingInBasket.special < 1) {
                document.getElementById("basket-per-total-special_" + itemExistingInBasket.id).innerHTML = "£" + rrpAmount.toFixed(2);
            } else {
            }

            //stock validation for + button removal if necessary
            if (shopObject.quantity === 0) {
                removePlusQuantityButton(itemForBasket.id);
            }
        } else {
            //Any other locations?
        }
    }
}
/**
 * ### A function to load and populate the basket window 
 * - Sort basket by item names and aisle options by name
 * - Iterate through aisle array and populate as necessary by aisle category
 * - Container (Image - Name - Price Per - (+) Quantity (-) - Total Price)
 * - When all items added. Need to add a basket total and checkout option.
 * @param {string} lastAisle - This allows the user to return to their previous aisle on closing basket
 */
function showBasket(lastAisle) {

    //Sorting an object array : 
    //Credit : https://www.w3schools.com/js/js_array_sort.asp
    basketStock.sort(function (a, b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    });

    let basketAisles = aisles;
    basketAisles.sort();

    //reset to 0 and recalculate
    basketTotalCost = 0.00;

    //creating necessary elements
    const gameWindow = document.getElementById("game-screen");
    const basketWindow = document.getElementById("basket-screen");
    const basketItemDisplayDiv = document.getElementById("the-basket");
    const basketReceiptDiv = document.getElementById("the-receipt");
    const basketReturnToShopDiv = document.getElementById("return-to-shop-div");
    const basketReceiptHeader = document.createElement("IMG");
    const basketReturnToShopButton = document.createElement("BUTTON");
    const basketCheckoutButton = document.createElement("BUTTON");

    //empty divs for repopulation
    basketReturnToShopDiv.innerHTML = "";
    basketItemDisplayDiv.innerHTML = "";
    basketReceiptDiv.innerHTML = "";

    //hide game, show basket
    gameWindow.style.display = "none";
    basketWindow.style.display = "flex";

    //setting attributes and onclick for the basketToShop button, then add to secondary toolbar
    basketReturnToShopButton.id = "return-to-shop-button";
    basketReturnToShopButton.onclick = function () { returnToShop(lastAisle); };
    basketReturnToShopButton.innerHTML =
        `<span style="display:flex; align-items:stretch; flex-direction:row;"><i class="fas fa-angle-double-left"></i>&nbspReturn To Shop</span>`;
    basketReturnToShopDiv.appendChild(basketReturnToShopButton);

    //setting attributes and onclick for the checkout button, then add to secondary toolbar
    basketCheckoutButton.id = "checkout-button";
    basketCheckoutButton.onclick = function () { checkoutBasket(); };
    basketCheckoutButton.innerHTML =
        `<span style="display:flex; align-items:stretch; flex-direction:row;">Checkout! &nbsp<i class="fas fa-angle-double-right"></i></span>`;
    basketReturnToShopDiv.appendChild(basketCheckoutButton);

    //setting the header image for the receipt on screen, then add to the receipt div
    basketReceiptHeader.src = "assets/images/logo-white-350.webp";
    basketReceiptHeader.className = "the-receipt-header";
    basketReceiptDiv.appendChild(basketReceiptHeader);

    //setting and then adding the total line for the receipt
    const receiptTotalDivLine = document.createElement("DIV");
    receiptTotalDivLine.className = "basket-receipt-line total-line";
    const receiptTotalP = document.createElement("P");
    const receiptTotalPriceP = document.createElement("P");
    receiptTotalPriceP.id = "basket-receipt-total-price";
    receiptTotalP.appendChild(document.createTextNode("Total : "));

    //for each basket item, add it to the receipt
    for (let a = 0; a < basketStock.length; a++) {
        for (let b = 0; b < basketStock[a].quantity; b++) {
            createNewReceiptLine(basketStock[a].id, basketStock[a].name, basketStock[a].amountPaid);
        }
    }

    //adding the receipt line to the receipt div
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

        /*
        some() checks if it exists at all, not where.
        If the aisle exists at all then add the header to the basket display
        */
        if (basketStock.some(x => x.aisle === aisleOption)) {
            const basketAisleTitleDiv = document.createElement("DIV");
            basketAisleTitleDiv.appendChild(document.createTextNode(aisleOption));
            basketAisleTitleDiv.className = "basket-aisle-title";
            basketAisleTitleDiv.id = "basket-aisle_" + aisleOption;
            basketItemDisplayDiv.appendChild(basketAisleTitleDiv);
        }

        /*
        while still in this aisle, add basket items to the basket div that share
        the same aisle
        */
        for (let basketItem of basketStock) {
            //Create the elements required
            const basketItemContainer = document.createElement("DIV");
            basketItemContainer.id = "basket-item_" + basketItem.id;
            const basketItemImage = document.createElement("IMG");
            const basketItemName = document.createElement("P");
            const basketItemNameText = document.createTextNode(basketItem.name);
            const basketItemPriceP = document.createElement("P");
            const basketItemPricePer = document.createElement("SPAN");
            const basketItemPricePerRrp = document.createElement("SPAN");
            const basketItemQuantityContainer = document.createElement("DIV");
            const basketItemQuantity = document.createElement("P");
            const basketItemQuantityMinus = document.createElement("BUTTON");
            const basketItemTotalPriceP = document.createElement("P");
            const basketItemTotalPrice = document.createElement("SPAN");
            const basketItemTotalRrp = document.createElement("SPAN");

            //look for existing image of the item
            if (basketItem.aisle === aisleOption) {
                checkIfImageExists("assets/images/items/" + basketItem.imageUrl, (exists) => {
                    if (exists) {
                        basketItemImage.src = "assets/images/items/" + basketItem.imageUrl;
                    } else {
                        basketItemImage.src = "assets/images/items/no-image.webp";
                    }
                });

                //add and set id of the name
                basketItemName.appendChild(basketItemNameText);
                basketItemName.id = "basket-item-name_" + basketItem.id;

                //calculating amount paid and what rrp would have
                let calculateTotal = calculateNumberTimes(basketItem.amountPaid, basketItem.quantity);
                let calculateTotalRrp = calculateNumberTimes(basketItem.price, basketItem.quantity);

                /*
                This determines if there was a special price applied or not.
                Then sets classes and texts for elements in the pricing container.
                Then adds the pricing container to the basket item
                */
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
                    addElementsToContainer(basketItemTotalPriceP, [basketItemTotalPrice, basketItemTotalRrp]);
                }

                basketItemPricePer.id = "basket-per_" + basketItem.id;
                basketItemTotalPrice.id = "basket-per-total_" + basketItem.id;

                //Minus will always be added, as you can always lose what is in the basket
                basketItemQuantityMinus.id = "basket-sub_" + basketItem.id;
                basketItemQuantityMinus.className = "basket-item-quantity-button";
                basketItemQuantityMinus.innerHTML = "-";
                basketItemQuantityMinus.onclick = function () { removeFromBasket(basketItem.id, basketItemContainer.id, basketItemQuantity.id); };

                basketItemQuantity.appendChild(document.createTextNode(basketItem.quantity));

                /*
                Shop stock needs checking to make sure something that is 
                out of stock cannot be further added. Adding something which
                theoretically does not exist. 
                - Check if quantity > 0.
                - If yes, run addElementsToContainer with 3 elements (+|qty|-)
                - Otherwise with two, (qty|-)
                - this function will create the basketItemQuantityContainer
                */
                let basketItemQuantityPlus;
                let shopStockItem = shopStock.find(({ id }) => id === basketItem.id);

                if (shopStockItem.quantity > 0) {
                    basketItemQuantityPlus = document.createElement("BUTTON");
                    basketItemQuantityPlus.id = "basket-add_" + basketItem.id;
                    basketItemQuantityPlus.innerHTML = "+";
                    basketItemQuantityPlus.className = "basket-item-quantity-button";
                    basketItemQuantityPlus.onclick = function () { addToBasket(basketItem, basketItem.amountPaid, "in-basket"); };
                } else {
                    basketItemQuantityPlus = document.createElement("P");
                    basketItemQuantityPlus.className = "basket-item-quantity-button-blank";
                    basketItemQuantityPlus.appendChild(document.createTextNode("+"));

                }
                addElementsToContainer(basketItemQuantityContainer, [basketItemQuantityPlus, basketItemQuantity, basketItemQuantityMinus]);
                addElementsToContainer(basketItemContainer, [basketItemImage, basketItemName, basketItemPriceP, basketItemQuantityContainer, basketItemTotalPriceP]);

                /*
                Final attributes for items inside the container.
                Then add the container to the basket div
                */
                basketItemContainer.className = "basket-item-container";
                basketItemImage.className = "item-container-img";
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
 * ## Function to remove an item to the basket. 
 * This is achieved by either removing an object from the array or reducing
 * its quantity.
 * NOTE : shopStock can have quantity of 0, the basketStock cannot. If this
 * results in basketStock having a quantity of 0 on the item, it needs removing
 * from the array entirely. If the shopStock was out of stock prior, it would 
 * become In Stock as its quantity will increase.
 * @param removeId - id of the item to be removed
 * @param removeContainer - the element containing the item
 * @param removeQuantity - the element containing the quantity
 */
function removeFromBasket(removeId, removeContainer, removeQuantity) {

    //get the shopStock reference of the item and +1 quantity
    let shopStockItem = shopStock.find(({ id }) => id === removeId);
    shopStockItem.quantity++;

    //get the basketStock of the item and -1 quantity
    let basketStockItem = basketStock.find(({ id }) => id === removeId);
    let basketItemAisle = "basket-aisle_" + basketStockItem.aisle;
    basketStockItem.quantity--;

    //Minus the cost of the basket -- Add to player cash
    basketTotalCost -= basketStockItem.amountPaid;
    playerCash += basketStockItem.amountPaid;
    document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toFixed(2));

    //remove one from the tally in the basket
    let basketTally = document.getElementById("basket-tally");
    basketTally.innerHTML = (parseInt(basketTally.innerHTML) - 1).toString();

    /*
    get all lines that match the id, remove the first, they all are the same
    but 0 is always an easy referal
    */
    let receiptLines = document.getElementsByName("receipt-line_" + removeId);
    receiptLines[0].remove();
    document.getElementById("basket-receipt-total-price").innerHTML = "£" + basketTotalCost.toFixed(2);

    /*
    Check for quantity of the item in question if it is 0 after amending the 
    quantity the container in the basket needs removing.
    Also if it was the last item in an aisle category, then the aisle header
    needs to be removed
    */
    if (basketStockItem.quantity === 0) {

        let basketContainer = document.getElementById(removeContainer);
        const removeIndex = basketStock.findIndex(({ id }) => id === removeId);
        basketStock.splice(removeIndex, 1);

        if (basketStock.some(x => x.aisle === basketStockItem.aisle)) {
            //if any found, do not delete the header
        } else {
            let aisleHeader = document.getElementById(basketItemAisle);
            aisleHeader.remove();
        }
        basketContainer.remove();

        /*
        When the quantity is > 0, it means it still exists in the basket but with
        one less than before. Therefore it just needs the quantity and pricing
        text updating
        */

    } else if (basketStockItem.quantity > 0) {
        let quantityContainer = document.getElementById(removeQuantity);
        quantityContainer.innerHTML = basketStockItem.quantity;
        let basketPerTotalContainer = document.getElementById("basket-per-total_" + removeId);
        basketPerTotalContainer.innerHTML = "£" + calculateNumberTimes(basketStockItem.amountPaid, basketStockItem.quantity).toFixed(2);

        let rrpAmount = calculateNumberTimes(basketStockItem.price, basketStockItem.quantity);
        if (basketStockItem.special < 1) {
            document.getElementById("basket-per-total-special_" + basketStockItem.id).innerHTML = "£" + rrpAmount.toFixed(2);
        } else {
        }
    } else {
    }

    /*
    If after returning the item to the shop, the quantity is 1. It means that
    the previous quantity was 0 and therefore there would have been no + button,
    now there is stock in the shop, the + needs to return
    */
    if (shopStockItem.quantity === 1) {
        addPlusQuantityButton(basketStockItem.id, basketStockItem, basketStockItem.amountPaid);
    }
}

/**
 * ## Function to leave the basket
 * It then will send the user back to the last aisle they were in.
 * @param {string} lastAisle - String data of last aisle.
 */
function returnToShop(lastAisle) {
    let gameWindow = document.getElementById("game-screen");
    let basketWindow = document.getElementById("basket-screen");

    gameWindow.style.display = "flex";
    basketWindow.style.display = "none";
    //return to the top of the aisle screen
    gameWindow.scrollTop = 0;

    //perform the changeAisle function, using the last aisle data to send there.
    changeAisle(lastAisle, function () {
        document.getElementById("toolbar-loading").style.display = "none";
        document.getElementById("loading-overlay").style.display = "none";

    });
}

/**
 * ## Function to checkout.
 * This will display items bought, amount spent, amount remaining and then
 * provide a choice of a starting a new game with new values to play with or
 * to start again with remaining shop items and cash.
 */
function checkoutBasket() {

    //write content to a new blank window for printing
    let myWindow = window.open('', 'PRINT', 'height=400,width=600');
    myWindow.document.write('<html><head><title> Hypermarket Cheap </title>');
    myWindow.document.write('</head><body>');
    myWindow.document.write('<h1>Thank you for shopping today!</h1>');
    myWindow.document.write('<img src="assets/images/header-logo.webp">');
    myWindow.document.write('<div id="print-receipt-table">');
    myWindow.document.write('</body></html>');

    let receiptTable = createReceiptForPrint(basketStock);

    myWindow.document.getElementById("print-receipt-table").appendChild(receiptTable);
    myWindow.document.body.appendChild(receiptTable);
    myWindow.document.close(); // necessary for IE >= 10
    myWindow.focus(); // necessary for IE >= 10

    myWindow.onafterprint = (event) => {
        document.getElementById("game-end-modal").style.display = "flex";
    };

    myWindow.print();
    myWindow.close();

}

/**
 * ## Function to show multiple elements
 * Take an array of element ids as strings, then display them by
 * setting their style to flex.
 * 
 * @param {Array} theseElements 
 */
function showElementArray(theseElements) {
    for (let element of theseElements) {
        document.getElementById(element).style.display = "flex";
    }
}

/**
 * ## Function to hide multiple elements
 * Take an array of element ids as strings, then hide them by
 * setting their style to none.
 * 
 * @param {Array} theseElements 
 */
function hideElementArray(theseElements) {
    for (let element of theseElements) {
        document.getElementById(element).style.display = "none";
    }
}
/**
 * ## Function to check existence of an image in the directory
 * This function will use the url provided to determine if it is found on the
 * website.
 * @param {string} url - url of the image to search
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

/**
 * ## Function to multiply two numbers and return a 2dp number
 */
function calculateNumberTimes(a, b) {
    return Number((a * b).toFixed(2));
}

/**
 * ## Function that adds elements to another single element
 * Takes a singular container element, then uses an array of elements based 
 * on their ids as strings
 * @param {string} container 
 * @param {Array} elements 
 */
function addElementsToContainer(container, elements) {
    for (let element of elements) {
        container.appendChild(element);
    }
}

/**
 * ## Function to create, then add a new line to the receipt.
 * Create the div, the elements required within, append text nodes
 * to give it visible text data. Then append the constructed line
 * to the receipt
 * @param {} receiptid 
 * @param {string} receiptname 
 * @param {*} receiptpaid 
 * @param {*} goOrNo 
 * @returns 
 */
function createNewReceiptLine(receiptid, receiptname, receiptpaid, goOrNo = "go") {
    //create required elements
    const receiptDivLine = document.createElement("DIV");
    const receiptNameP = document.createElement("P");
    const receiptPriceP = document.createElement("P");

    //set div line class, and give it a name based on its id
    receiptDivLine.className = "basket-receipt-line";
    receiptDivLine.setAttribute("name", "receipt-line_" + receiptid);

    //add text to the <p> tags 
    receiptNameP.appendChild(document.createTextNode(receiptname));
    receiptPriceP.appendChild(document.createTextNode("£" + (receiptpaid).toFixed(2)));

    //run the multi elements to container function
    addElementsToContainer(receiptDivLine, [receiptNameP, receiptPriceP]);
    //increase basket cost
    basketTotalCost += receiptpaid;

    //if this was added from within the basket then it needs adding now.
    if (goOrNo === "go") {
        document.getElementById("the-receipt").appendChild(receiptDivLine);
    } else {
        return receiptDivLine;
    }
}

/**
 * ## Function to add a (+) button in the basket on an item
 * If an item has max stock in the basket, it has no (+), but 
 * the user can remove one and this will then allow a (+) to appear
 * enabling the user to take it back.
 * @param {*} buttonId 
 * @param {Object} item 
 * @param {Number} paid 
 */
function addPlusQuantityButton(buttonId, item, paid) {

    //create the button, assign id, content, class and an onclick function.
    const basketItemQuantityPlus = document.createElement("BUTTON");
    basketItemQuantityPlus.id = "basket-add_" + buttonId;
    basketItemQuantityPlus.innerHTML = "+";
    basketItemQuantityPlus.className = "basket-item-quantity-button";
    basketItemQuantityPlus.onclick = function () { addToBasket(item, paid, "in-basket"); };

    //get the quantity text container for this item
    const currentQuantityText = document.getElementById("basket-item-quantity_" + buttonId);

    /*
    Get the sibling before this (sibling before quantity text is a blank space or (+)).
    Then insert the new (+) button before this sibling. Finally, then removing
    the "currentBlankSpace"
    */
    const currentBlankSpace = currentQuantityText.previousElementSibling;
    currentQuantityText.insertAdjacentElement("beforebegin", basketItemQuantityPlus);
    currentBlankSpace.remove();
}

/**
 * ## Function to prevent over-adding of stock.
 * The point of this is to now allow > 10 in the basket, when there may only be 10 in store.
 * Once the quantity of the shopStock reaches 0. This function is very important.
 * @param {*} buttonId 
 */
function removePlusQuantityButton(buttonId) {

    //create P tag, assign class to it. Then add a text node
    const basketItemQuantityPlus = document.createElement("P");
    basketItemQuantityPlus.className = "basket-item-quantity-button-blank";
    basketItemQuantityPlus.appendChild(document.createTextNode("+"));

    /*
    Find the quantity in basket text, then get its parent, and remove the first child of the parent
    DOM traversingf towards the plus button and removing it
    */
    const currentQuantityText = document.getElementById("basket-item-quantity_" + buttonId);
    currentQuantityText.insertAdjacentElement("beforebegin", basketItemQuantityPlus);
    currentQuantityText.parentElement.removeChild(currentQuantityText.parentElement.children[0]);
}

/**
 * ## Function to generate the table of the receipt for printing
 * 
 * @param {Array} basketData - basketStock
 * @returns The constructed table for print
 */
function createReceiptForPrint(basketData) {

    let tempBasket = basketData.sort();
    let table = document.createElement("TABLE");
    let tBody = document.createElement("TBODY");
    let tHead = document.createElement("THEAD");
    let tHRow = document.createElement("TR");
    let headerArray = ["Item", "Per Item (RRP/Paid)", "Quantity", "Total"];
    let jsonProperty = ["name", "price", "quantity", "amountPaid"];
    let basketTotal = 0.00;
    let basketRRP = 0.00;
    let basketSaving = 0.00;
    /*
    Build the header row for the table
    */
    for (let i = 0; i < headerArray.length; i++) {
        let tH = document.createElement("TH");
        let tHText = document.createTextNode(headerArray[i]);
        if (i === (headerArray.length - 1)) {
            tH.appendChild(tHText);
            tHRow.appendChild(tH);
            tHead.appendChild(tHRow);
        } else {
            tH.appendChild(tHText);
            tHRow.appendChild(tH);
        }
    }

    /*building the body*/
    for (let j = 0; j < tempBasket.length; j++) {

        let tR = document.createElement("TR");
        let rrpRow = document.createElement("TR");
        let savingRow = document.createElement("TR");
        let toPayRow = document.createElement("TR");

        for (let k = 0; k < headerArray.length; k++) {

            let tD = document.createElement("TD");
            if (jsonProperty[k] == "amountPaid") {
                let quantityPrice = tempBasket[j].amountPaid * tempBasket[j].quantity;
                tD.appendChild(document.createTextNode("£" + quantityPrice.toFixed(2)));
                basketTotal += quantityPrice;
            } else if (jsonProperty[k] == "price") {
                let quantityPrice = tempBasket[j].price;
                let paidPrice = tempBasket[j].amountPaid;
                tD.appendChild(document.createTextNode("( £" + quantityPrice.toFixed(2) + "/ £" + paidPrice.toFixed(2) + ")"));
                basketRRP += quantityPrice * basketStock[j].quantity;
            } else {
                tD.appendChild(document.createTextNode(tempBasket[j][jsonProperty[k]]));
            }
            tR.appendChild(tD);

            if (j === (tempBasket.length - 1)) {

                let blankTD = document.createElement("TD");
                blankTD.appendChild(document.createTextNode(""));
                let rrpTD = document.createElement("TD");
                let savingTD = document.createElement("TD");
                let toPayTD = document.createElement("TD");

                basketSaving = basketRRP - basketTotal;

                if (k === (headerArray.length - 2)) {
                    rrpTD.appendChild(document.createTextNode("RRP : "));
                    savingTD.appendChild(document.createTextNode("Saving : "));
                    toPayTD.appendChild(document.createTextNode("Total Due : "));
                } else if (k === headerArray.length - 1) {
                    rrpTD.appendChild(document.createTextNode("£" + basketRRP.toFixed(2)));
                    savingTD.appendChild(document.createTextNode("£" + basketSaving.toFixed(2)));
                    toPayTD.appendChild(document.createTextNode("£" + basketTotal.toFixed(2)));
                } else {
                    rrpTD.appendChild(document.createTextNode(""));
                    savingTD.appendChild(document.createTextNode(""));
                    toPayTD.appendChild(document.createTextNode(""));
                }

                rrpRow.appendChild(rrpTD);
                savingRow.appendChild(savingTD);
                toPayRow.appendChild(toPayTD);
                addElementsToContainer(tBody, [tR, rrpRow, savingRow, toPayRow]);
            } else {
                tBody.appendChild(tR);
                addElementsToContainer(table, [tHead, tBody]);
            }
        }
    }

    return table;
}