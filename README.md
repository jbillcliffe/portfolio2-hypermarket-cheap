# Hypermarket Cheap
<div style="width:100%; height:100px; background-color:white; margin-left:auto;margin-right:auto;">
<a href="https://jbillcliffe.github.io/portfolio2-hypermarket-cheap/" target="_self">
            <img class="header-logo" src="assets/images/header-logo.webp" alt="Hypermarket Sweep"
                aria-label="Hypermarket Sweep game home page">
        </a>
</div>

***Click this banner to load the website.***

Hypermarket sweep is a simple to use simulator for shopping. Preferrably on your own, especially not your kids.
Gail Hinton is the manager of this store and she looks forward to welcoming you to her store in Wales.
"When you see the sheep, that's Hypermarket Cheap!" - Gail

**Play now and enjoy your shopping today!?**

![Responsive view of webpage](readme/design/am-i-responsive.png)

## User Experience Design

### Target Audience

- Just users looking to have a bit of escapist fun

### Website User Stories

- I want to find play straight away
    1. Simple interface, one button to click and you are in the game
    2. The objective is simple, the buttons labelled and it is intuitive in how users operate today with computers.
- I want replay value
    1. No game is the same!
    2. Each new game has a new pricing system, different allocation of special offers, different starting cash and stock levels
- I want to see my "achievements"
    1. A printed receipt at the end is a wonderful souvenir(is it?!)

### Wireframe Design

Wireframe was created using Figma[^1]. The wireframe includes initial function ideas and allocation of variables, functions and
how to apply a good flow to the program to ensure it is effective
![Image of wireframe created for Hypermarket Cheap](readme/design/wireframe-figma.png)

### Logo

The logo was created using the website LOGO.com.[^2]

#### Branding Including Logo

Full branding was provided at the end of the step by step development process.

![Full branding theme for Renterprise](readme/design/branding.png)

### Breakdown of Design

#### Colour Theme

Colour theme was initially chosen from the branding. But a darker green and cyan was used in the game also.
This was merely to achieve a better range for button hovers and backgrounds.

#### Typography

The font chosen, was initially based upon the font in the logo - "Wallpoet", a secondary font of Roboto was chosen as it was a very easy to read font.
Roboto, was then chosen as the main font as Wallpoet is hard to read at smaller sizes. It does remain in a couple of buttons and the logo.
A third font was introduced "Courier Prime" as I was looking to try and achieve a different look in the basket, similar to a receipt.
All of these are sourced from Google Fonts[^4].

## Features

### Existing Features

#### Galaxy Fold Resolution Drop (280px)

The website has been checked to ensure that it can resize down to the smallest available resolution for a mobile device (excluding watches).
Currently the Galaxy Zfold (3/4/5) which has a front screen resolution width of 280px
![An example of 280px wide styling](readme/menu/menu-280.png)

#### Clear Menu

Clear, easy to read buttons are present whenever required.
![Main menu buttons for Hypermarket Cheap](readme/buttons/menu-buttons.png)

### Footer

A responsive social media links area included in the footer which is present at all times, it scales the size of footer without comprimising
the Fontawesome[^5] icons. Each one has an aria-label which describes where the link goes to and explains that it will open
in a separate window. The footer also includes the same blue hover as the menu, for consistency and clarity to the user.

#### Facebook

![Footer on Hypermarket Cheap, showing Facebook label](readme/footer/facebook-link.png)

#### Twitter (Now "X/Twitter")

![Footer on Hypermarket Cheap, showing x/Twitter label](readme/footer/x-formerly-twitter-link.png)

#### YouTube

![Footer on Hypermarket Cheap, showing YouTube label](readme/footer/youtube-link.png)

#### Instagram

![Footer on Hypermarket Cheap, showing Instagram label](readme/footer/instagram-link.png)

## Testing

## HTML and CSS Validation Tool

The W3C Markup Validation Service[^6] was used to validate the html. Things were all in place on the GitHub Pages for testing HTML.
For the CSS, I had to copy the full style.css. Results shown in the table below.

### CSS Validation - All Passed

Three css files to validate and main page is validated where all css files are referenced.

#### loading.css

![Validation for Hypermarket Cheap loading.css](readme/validate/validate-loading-css.png)

#### modal.css

![Validation for Hypermarket Cheap modal.css](readme/validate/validate-modal-css.png)

#### style.css

![Validation for Hypermarket Cheap style.css](readme/validate/validate-style-css.png)

#### Overall

![Validation for Hypermarket Cheap](readme/validate/css-validation.png)

### HTML Validation -- All passed

Only one page for validation as everything is run within the index.html

![Validation for Hypermarket Cheap](readme/validate/html-validation.png)

### HTML Validation Error

To start the validation failed, due to :

- Trailing /, which have been removed. 
- Incorrect assignment of a variable in the "i" tag element.
    - The wallet which has an ::after associated with it to display player cash.


| Issue        | Resolution                                                                                   |
| -------------| ---------------------------------------------------------------------------------------------|
| Trailing /'s | Removing any unnecessary /'s on elements within the index.html page                          |
| i tag issue  | The problem was I forgot to assign it as "data-wallet-count", instead it was just "wallet-count" this was causing the issue, when I change this, all resolved                 |
| Duplicate Id | Inadvertently assigned the "about-screen" id twice, which the validator picked. Now resolved |

## WAVE, Google Chrome extension.

WAVE is a measure of website issues. There was only one error. This was stating I was missing an alt on an image.
This too has been rectified.
![Wave Analysis for Hypermarket Cheap](readme/wave/wave-page.png)

## Lighthouse, Google Chrome Inspect (F12) Mode

Scoring for Lighthouse was done on the Index (landing) page :
|  Page   |  Source        |                                                                                 |
| ------- | -------------- | ------------------------------------------------------------------------------- |
| Index   | Desktop/Mobile | [View](readme/lighthouse/lighthouse-score.png "Score on index.html")     |

The performance does not log as perfect by any means.
However, this is a game that has to load data in to work with. Unlike where a website speed can be key, people playing games,
on the whole understand that sometimes things take a little bit of time.

**HOWEVER!!**

When reloading, the JSON is already in the cache and the following results occur :

Scoring for Lighthouse was done on the Index (landing) page, and what would be the most demanding page (contact.html) :
|  Page   |  Source |                                                                                                      |
| ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| Index   | Desktop | [View](readme/lighthouse/lighthouse-desktop.png "Desktop Lighthouse score on index.html")     |
| Index   | Mobile  | [View](readme/lighthouse/lighthouse-mobile.png "Mobile Lighthouse score on index.html")       |

This is a noticeable difference, but it shows that the only issue is before the data is loaded.

## Further Testing

- The game was tested on Google Chrome, Microsoft Edge and Mozilla Firefox
- Although not viewed on multiple physical devices. Google Chrome's development console allows for a very large amount of emulated devices to be used.
- Repeated testing through each page, ensured functions were working correctly.

## Deployment

The steps below were followed to deploy the page to GitHub pages :

**From Github, click on the repository required :**

![Github deployment step one, choose repository](readme/deployment/deployment-step-1.png)

**As shown in the below image, click on the settings within the repository :**

![Github deployment step two, choose settings](readme/deployment/deployment-step-2.png)

**Select "Pages, then select source "Deploy From Branch" and change Branch to "main" and select the "root" folder:**

![Github deployment step three, choose option->source->branch](readme/deployment/deployment-step-3.png)

**After refreshing and viewing again, you should (there could be a delay in the upload process) have the link to the website (hosted by GitHub) where the project is viewable :**

![Github deployment step four, refresh/reload to get the link for the project](readme/deployment/deployment-step-4.png)

**[LIVE HYPERMARKET CHEAP WEBSITE](https://jbillcliffe.github.io/portfolio2-hypermarket-cheap/ "Go to Hypermarket Cheap")**

## Technologies Used

### Languages

- HTML5
- CSS3
- Javascript
- jQuery

### Frameworks, Libraries & Programs Used

- Google Fonts[^4]
- Font Awesome[^17]
- CodeAnywhere [^21]
- Figma[^1]
- Am I Responsive?[^22]

## Website Tutorials/References

- Button Hover Animation Tutorial (W3Schools)[^23]
- HTML/CSS Cards[^24]
- Responsive iframes, used for the map on the contact.html[^25]
- W3Schools[^26] - Invaluable for providing details on elements and their attributes and so much HTML/CSS information.
- Image Resizer.com[^27] - Very useful for providing a way of cropping and resizing images. This was used for all
  of the items in the shop.

## Images

Images were all sourced for free :

| Filename                | Used         |                                                                         |
| ----------------------- | ------------ | ----------------------------------------------------------------------- |
| crm.webp[^5]            | product.html | [View](assets/images/crm.webp "Customer Relationship Management Image") |
| delivery.webp[^6]       | product.html | [View](assets/images/delivery.webp "Delivery Image")                    |
| growth.webp[^7]         | index.html   | [View](assets/images/growth.webp "Growth Image")                        |
| inventory.webp[^8]      | product.html | [View](assets/images/inventory.webp "Inventory Image")                  |
| money.webp[^9]          | index.html   | [View](assets/images/money.webp "Money Image")                          |
| move-forward.webp[^10]  | N/A          | [View](assets/images/move-forward.webp "Forward Arrows Image")          |
| opportunity.webp[^11]   | index.html   | [View](assets/images/opportunity.webp "Opportunity Image")              |
| payments.webp[^12]      | product.html | [View](assets/images/payments.webp "Card Payments Image")               |
| reporting.webp [^13]    | N/A          | [View](assets/images/reporting.webp "Reporting Image")                  |
| server.webp [^14]       | N/A          | [View](assets/images/server.webp "Server Image")                        |
| streamline.webp [^15]   | index.html   | [View](assets/images/streamline.webp "Streamline Image")                |
| workflow.webp [^16]     | N/A          | [View](assets/images/workflow.webp "Workflow Image")                    |

*NB. All those that are N/A were due to be entered as further entries into the product.html page*

## References 
[^1]: Figma is a free website for designing storyboards and wireframes : https://www.figma.com/
[^2]: LOGO website used for creating a logo and branding from scratch for free : https://app.logo.com/
[^3]: Coolors website for creating free colour themes : https://www.coolors.com/
[^4]: Google's font listing, a very large database of free online hosted fonts : https://fonts.google.com/
[^5]: Fontawesome a large database of free (and premium) icons : https://www.fontawesome.com
[^6]: W3 Validator : https://validator.w3.org/
[^18]: PHPMailer is an email creation class library for PHP : https://github.com/PHPMailer/PHPMailer
[^19]: JSON file for all the country code data so that it was not on the html page, it would been very untidy in that case. : assets/json/country.json

[^21]: Cloud based IDE for development : https://app.codeanywhere.com/
[^22]: Am I Responsive? A Website designed to display a singular website at multiple resolutions : https://ui.dev/amiresponsive
[^23]: Button hover animation : https://www.w3schools.com/howto/howto_css_animate_buttons.asp
[^24]: Cards, used for proposition cards on index.html : https://www.w3schools.com/howto/howto_css_cards.asp
[^25]: Responsive iframes : https://www.w3schools.com/howto/howto_css_responsive_iframes.asp
[^26]: W3Schools, comprehensive database of information for HTML and CSS : https://www.w3schools.com/
[^27]: Image Resizer.com, Easily resize images online for free : https://imageresizer.com/