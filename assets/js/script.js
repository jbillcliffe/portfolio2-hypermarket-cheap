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
    the top of the script
*/

let aisles = [];
let basketStock = [];
let cashHigh = 100.00;
let cashLow = 30.00;
let playerCash = 0.00;
let shopStock = [];
let specialOffers = [];

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

        startCash(customerType);
        startStock(dayType);
        /*
            A delay of 2s gives time to for the 
            arrays of data to populate during the startStock function before
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
    document.getElementById("basket-button").style.display = "flex";
    document.getElementById("the-toolbar").style.justifyContent = "space-between";
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
 * @param {string} customerType - new/same, determines how startCash operates
 * 
 * Function for determining player starting cash amount, if customerType="new"
 * then choose a random amount of cash from a range, if customerType="same"
 * then the cash amount is not changed
 */
function startCash(customerType = "new") {

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

}

/**
 * @param {string} dayType - new/same, determines how startStock operates
 * 
 * Function for determining starting shop stock, if dayType="new"
 * then a new generation of stock is created, new items,amounts and prices. If
 * dayType="same" then no change in prices/stocks for a new game
 */
function startStock(dayType = "new") {
    /*
      Go through each item in items.json and beginning setting stock levels
      also applying specieals as necessary
    */
    //getJSON gets the data from the specials.json file and holds them for stock creation
    $.getJSON("assets/json/specials.json", function (json) {
        for (offer of json) {
            specialOffers.push({ id: offer.id, name: offer.name, chance: offer.chance, factor: offer.factor, occurance: offer.occurance });
        }
    });

    //getJSON gets the data from the items.json file to then work with each item
    $.getJSON("assets/json/items.json", function (data) {
        for (item of data) {

            //adding aisle options
            aisles.indexOf(item.aisle) >= 0 ? null : aisles.push(item.aisle);

            let thisItemStock = Math.round(Math.random() * (item.highStock - item.lowStock) + item.lowStock);
            let thisItemPrice = (Math.random() * (item.highPrice - item.lowPrice) + item.lowPrice).toFixed(2);

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
            let thisItem = { id: item.id, name: item.name, price: thisItemPrice, quantity: thisItemStock, aisle: item.aisle, special: thisSpecial, imageUrl: item.imageUrl };
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

                specialText = document.createTextNode(" ");

            } else {
                let calculatedAmount = (stockItem.price * stockItem.special).toFixed(2);
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
                    } else {
                        continue;
                    }
                }

            }




            /* ----- ADD TO BASKET BUTTON -----
            Define the ID, put a + inside the button and assign the onClick to
            each button. Each button is then given the id of the item to send to
            the basket when it is clicked.
            */
            basketAdd.id = "basket-add_" + stockItem.id;
            basketAdd.onclick = function () { addToBasket(stockItem.id); };
            basketAdd.innerHTML = "+";

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
 * @param {number} itemId - id of the item passed to the function from shopStock
 * 
 * Function to add an item to the basket, done on an individual basis. You 
 * only have one hand when you are holding a basket!
 * It checks if the id of the object is already in the basket. If so it needs
 * to alter the quantity rather than
 */
function addToBasket(itemId) {
    console.log(itemId);
}

function showBasket() {
    console.log("Hello I am the basket");
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
