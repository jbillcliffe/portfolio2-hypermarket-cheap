document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByTagName("button");

    for (button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "play-new") {
                startNewGame();
            } else if (this.getAttribute("data-type") === "about") {
                showAbout();
            } else {
                //further functions
            }
        });
    };
});