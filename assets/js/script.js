document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByTagName("button");

    for (button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-button") === "play-new") {
                startGame("new", "new");
            } else if (this.getAttribute("data-button") === "about") {
                showAbout();
            } else {
                //further functions?
            }
        });
    };
});

//Global Variables - Values that are required across the game.
let playerCash = 0.00;
let specialOffers = [];
let shopStock = [];
let basketStock = [];
let cashLow = 30.00;
let cashHigh = 100.00;

/*
  Special Options and Item Options are created during the initial loading of 
  game, they are then merged into at {item} object, all of these are initially
  assigned to the "shopStock" array, these can then be moved to the
  "basketStock" array and also be returned
*/

/**
 * Function to start the game.
 * customerType and dayType will determine how the function operates, both of
 * these parameters default as "new". These are changed upon request when the
 * function is called.
 */
function startGame(customerType = "new", dayType = "new") {
    console.log(customerType + ", " + dayType);
    //Implement startCash based on new or same customer
    startCash(customerType);
    //Implement startStock based on new or same day
    startStock(dayType);
}

/**
 * Function to show the About information
 */
function showAbout() {
    console.log("Show About Info");
}

/**
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
    console.log(playerCash);
}

/**
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
    console.log(specialOffers);
    //getJSON gets the data from the items.json file to then work with each item
    $.getJSON("assets/json/items.json", function (data) {
        //stockData = data;

        for (item of data) {
            //randomly create an amount of stock
            let thisItemStock = Math.round(Math.random() * (item.highStock - item.lowStock) + item.lowStock);
            //randomly create a price for the current game (will not necessarily be the same next time)
            let thisItemPrice = (Math.random() * (item.highPrice - item.lowPrice) + item.lowPrice).toFixed(2);
            /*
                Chance is used with another Math.random(). There rarer the special offer, the smaller the chance.
                ie. Half price, rarest one, is 0.1. So Math.random() has to get a number below or equal to that.
                But to add a special at all first, it has to get through a previous Math.random and score below 0.4.
            */

            //empty variable for special modifier
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
            let thisItem = { id: item.id, name: item.name, price: thisItemPrice, quantity: thisItemStock, special: thisSpecial };
            shopStock.push(thisItem);


        }
    });

    console.log(shopStock);


}

/**
 * Function to remove all items from the basket. If requestType="new", this is
 * an emptying to start a new game. If requestType="customer" then the customer
 * has requested the items be returned and this is not the process of beginning
 * a new game
 */
function emptyBasket(requestType = "new") {

}

/**
 * Function to add an item to the basket (including its quantity). itemId is
 * passed to the function
 */
function addToBasket(itemId) {

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
