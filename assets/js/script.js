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
    //file data imported to this array
    //let stockData = [];
    //getJSON gets the data from the items.json file and holds them in stockData
    $.getJSON("assets/json/items.json", function (data) {
        //stockData = data;

        for (item of data) {
            //console.log(item);
            let thisItemStock = Math.round(Math.random() * (item.highStock - item.lowStock) + item.lowStock);
            let thisItemPrice = (Math.random() * (item.highPrice - item.lowPrice) + item.lowPrice).toFixed(2);
            let thisItem = { id: item.id, name: item.name, price: thisItemPrice, quantity: thisItemStock };
            shopStock.push(thisItem);
            //console.log(thisItemPrice);
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
