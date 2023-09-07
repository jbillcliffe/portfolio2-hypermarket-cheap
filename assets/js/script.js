document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-button") === "play-new") {
                startGame("new", "new");
            } else if (this.getAttribute("data-button") === "about") {
                showAbout();
            } else if (this.getAttribute("data-button") === "show-basket") {
                showBasket();
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

let aisles = [];
let basketStock = [];
let shopStock = [];
let specialOffers = [];
let cashHigh = 100.00;
let cashLow = 30.00;
let playerCash = 0.00;


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
        aisleButton.id = aisle;
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
    document.getElementById("the-basket").style.display = "none";
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
            let thisItemPrice = (Math.random() * (jsonItem.highPrice - jsonItem.lowPrice) + jsonItem.lowPrice).toFixed(2);

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
    document.getElementById("toolbar-loading").style.display = "flex";
    document.getElementById("loading-overlay").style.display = "block";

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
            let calculatedAmount;

            //add the item name to the p element.
            itemPTag.appendChild(itemText);
            /*
            Define class names for the divs that are all present within a
            singular item div in the shop 
            */
            aisleItem.className = "aisle-item";
            itemImage.className = "aisle-item-img";
            itemDisplay.className = "aisle-item-p-div";
            priceDisplay.className = "aisle-item-p-div price-div";
            itemPTag.className = "aisle-item-text";
            stockPTag.className = "aisle-item-text";
            pricePTag.className = "aisle-item-text";
            innerPriceSpan.className = "aisle-item-text strikethrough-text";
            priceAmountSpan.className = "aisle-item-text";
            specialPTag.className = "aisle-item-text positive-text";
            basketAdd.className = "aisle-item-button";

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
                innerStockSpan.className = "aisle-item-text";
            } else {
                stockText = document.createTextNode("Out Of Stock");
                innerStockSpan.className = "aisle-item-text negative-text";
            }
            innerStockSpan.appendChild(stockText);
            stockPTag.appendChild(stockStart);
            stockPTag.appendChild(innerStockSpan);

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

            if (stockItem.special == 1) {

                priceAmountText = document.createTextNode("£" + stockItem.price);
                priceAmountSpan.appendChild(priceAmountText);
                pricePTag.appendChild(priceAmountSpan);
                specialText = document.createTextNode("&nbsp");
                calculatedAmount = stockItem.price;

            } else {
                calculatedAmount = (stockItem.price * stockItem.special).toFixed(2);
                priceAmountText = document.createTextNode("£" + calculatedAmount.toString());
                priceAmountSpan.appendChild(priceAmountText);
                pricePTag.appendChild(priceAmountSpan);


                innerPriceText = document.createTextNode("£" + stockItem.price);
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

                basketAdd.onclick = function () { addToBasket(stockItem, calculatedAmount); };
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
            itemDisplay.appendChild(itemPTag);
            itemDisplay.appendChild(stockPTag);
            priceDisplay.appendChild(pricePTag);
            priceDisplay.appendChild(specialPTag);

            aisleItem.appendChild(itemImage);
            aisleItem.appendChild(itemDisplay);
            aisleItem.appendChild(priceDisplay);
            aisleItem.appendChild(basketAdd);

            //add the item to the shop
            shopAisle.appendChild(aisleItem);

        } else {
            //skip this iteration and move to next
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
 * Function to add an item to the basket, done on an individual basis. You 
 * only have one hand when you are holding a basket!
 * It checks if the id of the object is already in the basket. If so it needs
 * to alter the quantity rather than
 */
function addToBasket(itemForBasket, amountPaid) {

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
        playerCash = (playerCash - amountPaid).toFixed(2);
        document.getElementById("wallet-icon").setAttribute("wallet-count", "£" + playerCash.toString());

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

        let stockTextSpan = document.getElementById("stock_" + itemForBasket.id).children[0];
        let basketButton = document.getElementById("basket-add_" + itemForBasket.id);

        if (shopObject.quantity === 0) {

            basketButton.onclick = function () { noStockToAdd(itemForBasket.alertText); };
            basketButton.innerHTML = `<i class="fas fa-times negative-text"></i>`;
            stockTextSpan.className = "aisle-item-text negative-text";
            stockTextSpan.innerHTML = "Out Of Stock";
        } else {
            stockTextSpan.innerHTML = shopObject.quantity;
        }

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
        console.log(itemExistingInBasket);

        if (!(basketStock.find(({ id }) => id === itemToGoToBasket.id))) {
            basketStock.push(itemToGoToBasket);
        } else {
            itemExistingInBasket.quantity++;
        }
    }
}

function showBasket() {
    let gameWindow = document.getElementById("game-screen");
    let basketWindow = document.getElementById("the-basket");

    gameWindow.style.display = "none";
    basketWindow.style.display = "flex";

    /*<button class="the-toolbar" id="basket-return"></button>*/

    const basketReturnToShopDiv = document.createElement("DIV");
    const basketReturnToShopButton = document.createElement("BUTTON");

    basketReturnToShopDiv.style.padding = "20px";

    basketReturnToShopButton.id = "return-to-shop-button";
    basketReturnToShopButton.innerHTML = `<span style="font-family:'Courier Prime', monospace;"><i class="fas fa-angle-double-left"></i> Return To Shop</span>`;

    basketReturnToShopDiv.appendChild(basketReturnToShopButton);
    basketWindow.appendChild(basketReturnToShopDiv);
    /*const basketAdd = document.createElement("BUTTON");
    const itemPTag = document.createElement("P");*/
}

/**
 * Function to remove an item to the basket (including its quantity). itemId is
 * passed to the function
 */
function removeFromBasket(itemId) {

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
