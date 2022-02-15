let root = document.documentElement;

let guess = 0;
let guesses;
let guess_length;
let num_colors;
let guessed = {};
let objective = {};
let selected;
let mode = "normal";
let theme = "light";
let highlights;
let stats;
let useableColors = {};
let hidden_controls;
let hideIncorrectGuesses;
let helpShown = false;

let previous_green;
let previous_blue;

let shape = 1;

let shadow_size = "1.5vmin";

//////////////////////////////////GAMEPLAY//////////////////////////////

//On Color Clicked
function setColor(color) {
    if (selected > -1) {
        id(selected).style.backgroundColor = useableColors[color];

        guessed[selected % guess_length] = {
            "color": color,
            "id": selected
        }

        if (selected + 1 < guess_length * (guess + 1)) {
            id(selected).style.borderColor = cellColors.active[theme];
            selected ++;
            id(selected).style.borderColor = cellColors.selected[theme];
        } 
    }
}

//Check the guess
function checkGuess() { 
    //If Guess is correct length
    if (Object.keys(guessed).length == guess_length) {

        let win = true;
        let green = [];
        let red = {};
        let used = {};
        let guessed_arr = [];

        let num_green = 0;
        let num_blue = 0;
        let num_red = 0;

        for (let i = 0; i < guess_length; i++) {
            guessed_arr.push(guessed[i].color);
            used[guessed[i].color] = 0;
        }

        let objective_amount = amountOfColor(Object.values(objective));
        let guessed_amount = amountOfColor(guessed_arr);

        /*console.log("\n");
        console.log("GUESS", guessed);
        console.log("Objective", objective);
        console.log("\n");*/

        //console.log("Checking Green");
        
        //For each guessed color
        //Check if color is in the correct position
        for (let i = 0; i < guess_length; i++) {
            //console.log("Checking if guessed color", guessed[i].color, "equals", objective[i], guessed[i].color == objective[i]);
            //Check if element it correct
            if (objective[i] == guessed[i].color) {
                //Add to green array
                green.push(i);
            
                //Increment number of this color used
                used[guessed[i].color]++;

                //Add color to array of correct positions
                previous_green.push(i);

                //Incrememt number of correct grens
                num_green++;

                //Set Shadow green
                highlights.green.push(guessed[i].id);
                setHighlights();
            }
            else {
                win = false;
            }
        }

        //console.log("Correct ", green);
        //console.log("\n");

        //console.log("Checking Blue");
        //Check if color is contained but in the wrong position 
        for (let guess_position = 0; guess_position < guess_length; guess_position++) {

            //console.log("Checking if guessed", guessed[guess_position].color, "exists in objective", objective[guess_position].includes(guessed[guess_position].color));

            if (Object.values(objective).includes(guessed[guess_position].color)) {

                //console.log("Exists!, Making Sure it's not replacing a green");
                let empty = true;

                //If color is in the same position as a green :/
                green.forEach(green_position => {
                    if (green_position == guess_position) empty = false;
                });

                if (empty) {
                    //console.log(empty, "NOT in same position as a green :)");

                    let color = guessed[guess_position].color;

                    /*console.log("Amount of", color, "in objective", objective_amount[color]);
                    console.log("Amount of", color, "in guess", guessed_amount[color]);
                    console.log("Amount of", color, "used", used[color]);*/

                    if (used[color] < guessed_amount[color] && used[color] < objective_amount[color]) {

                        //Add color to array of inclueded colors with incorrect positions
                        previous_blue.push(guess_position);

                        //Increment number of this color used
                        used[color]++;

                        //Incrememt number of blue guess
                        num_blue++;

                        //Set Shadow blue
                        highlights.blue.push(guessed[guess_position].id)
                        setHighlights();
                    }
                    else {
                        //Object is included but wrong, set red but dont remove control
                        red[guess_position] = false;
                        //console.log("Position Used");
                    }
                }
                //else console.log(empty, "In same position as a green");
            }
            else {
                //Object is not included, set red, remove control
                red[guess_position] = true;
            }
        }

        id("greenstat" + guess).textContent = num_green;
        id("bluestat" + guess).textContent = num_blue;

        Object.entries(red).forEach(entry => {
            position = entry[0];

            highlights.red.push(guessed[position].id); 
            setHighlights();  

            if (entry[1]) {
                hidden_controls.push(guessed[position].color);
                setControls();
            }
        });      

        if (win) {
            winGame();
        }
        else {
            guessed = {};
            if (guess + 1 == guesses) {
                loseGame();
            }
            else {
                guess += 1;
                setActiveRow();
            }
        }
    }
    else {
        alert("Please Complete Your Guess");
    }
    //console.log("\n");
}

//Get amount of each color in oject
function amountOfColor(arr) {
    const counts = {};

    for (const num of arr) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    return counts;
}

//This runs onload and after each guess or when reset theme
function setActiveRow() {
    //Reset all borders and set borders of current row
    resetBorders(guess);

    //Remove all event listeners
    removeEventListeners();

    //For each item in current row
    document.querySelectorAll(".row" + guess).forEach(cell => {
        //
        resetBorders();

        //Add Shadow on mouse over
        cell.addEventListener("mouseover", function (e) {
            setShadow([e.target.id], shadow_size, shadows.default);
            e.target.style.cursor = "pointer";
        });

        //Remove Shadow on mouse out
        cell.addEventListener("mouseout", function (e) {
           removeShadow([e.target.id]);
        });


        cell.addEventListener("mousedown", function (e) {
            resetBorders();
            selected = e.target.id;
            e.target.style.borderColor = cellColors.selected[theme];
            e.target.style.cursor = "grab";
        });

        cell.addEventListener("mouseup", function(e) {
            e.target.style.cursor = "pointer";
        });
    });

    selected = guess * guess_length;
    document.getElementById(selected).style.borderColor = cellColors.selected[theme];
}

//Sets all cells to default border
function resetBorders() {
    document.querySelectorAll(".cell").forEach(cell => {
        if (cell.id < guess * guess_length) {
            cell.style.border = "none";
        }
        else {
            cell.style.border = "1px solid";
            cell.style.borderColor = cellColors.border[theme];
        }
    });

    //Sets current row to black
    document.querySelectorAll(".row" + guess).forEach(cell => {
        cell.style.borderColor = cellColors.active[theme];
    });
}

function removeEventListeners() {
    for (let i = 0; i < guess_length * guesses; i++) {
        document.querySelectorAll(".row" + i).forEach(cell => {
            cell.replaceWith(cell.cloneNode(true));
        });
    }
}

function removeAllBorders() {
    for (let i = 0; i < guess_length * guesses; i++) {
        document.querySelectorAll(".row" + i).forEach(cell => {
            cell.style.border = "none";
        });
    }
}

//Set Game Mode
function setMode(m) {
    mode = m;

    removeShadow(["modeBtn_normal", "modeBtn_classic", "modeBtn_hard"]);
    setShadow(["modeBtn_"+ m], "5px", option_color );

    if (mode == "normal") {
        id("mode_header").textContent = "Normal Mode ˅";
        id("redHighlightsSwitch").checked = true;
        id("highlightsSwitch").checked = true;
        id("statsSwitch").checked = false;
        id("hideIncorrectSwitch").checked = true;
        highlights.red_on = true;
        highlights.on = true;
        stats = false;
        hideIncorrectGuesses = true;
    }
    else if (mode == "classic") {
        id("mode_header").textContent = "Classic Mode ˅";
        id("redHighlightsSwitch").checked = false;
        id("highlightsSwitch").checked = false;
        id("statsSwitch").checked = true;
        id("hideIncorrectSwitch").checked = false;
        highlights.red_on = false;
        highlights.on = false;
        stats = true;
        hideIncorrectGuesses = false;
    }
    else if (mode == "hard") {
        id("mode_header").textContent = "Hard Mode ˅";
        id("redHighlightsSwitch").checked = true;
        id("highlightsSwitch").checked = true;
        id("statsSwitch").checked = false;
        id("hideIncorrectSwitch").checked = true;
        highlights.red_on = true;
        highlights.on = true;
        stats = false;
        hideIncorrectGuesses = true;
    }

    setStats();
    setHighlights();
    setControls();
    //showPopup(true);
}

//Set Shape
function setShape(s) {

    let cell_radius = 0;
    let control_radius = 0;
    shape = s;

    removeShadow(["cell_option", "rounded_option", "square_option"]);

    if (shape == 0) {
        cell_radius = document.querySelector(".cell").getBoundingClientRect().width;
        control_radius = document.querySelector(".color").getBoundingClientRect().width;
        setShadow(["cell_option"], "5px", shadows.shapeType);
    }
    else if (shape == 1) {
        cell_radius = document.querySelector(".cell").getBoundingClientRect().width / 4;
        control_radius = document.querySelector(".color").getBoundingClientRect().width / 4;
        setShadow(["rounded_option"], "5px", shadows.shapeType);
    }

    else if (shape == 2) {
        setShadow(["square_option"], "5px", shadows.shapeType);
    } 

    document.querySelectorAll(".cell").forEach(cell => {
        cell.style.borderRadius = cell_radius + "px"; 
    });
    document.querySelectorAll(".color").forEach(control => {
        control.style.borderRadius = control_radius + "px"; 
    });
}

id("guessSizeInput").addEventListener("change", (event) => {
    showPopup(true)
});

id("guessesInput").addEventListener("change", (event) => { 
    showPopup(true)
});

id("numColorsInput").addEventListener("change", (event) => { 
    showPopup(true)
});

//Set Whether Incorrect Cells are highlighted red
id("redHighlightsSwitch").addEventListener("change", function(e) {
    highlights.red_on = this.checked;
    setHighlights();
});

//Set Whether Incorrect Cells are highlighted red
id("highlightsSwitch").addEventListener("change", function(e) {
    highlights.on = this.checked;
    setHighlights();
});

//Set Whether Incorrect Cells are highlighted red
id("hideIncorrectSwitch").addEventListener("change", function(e) {
    hideIncorrectGuesses = this.checked;
    setControls();
});

//Change Theme
id("themeSwitch").addEventListener("change", function(e) {

    if (this.checked) theme = "dark";
    else theme = "light";

    setTheme();
    
});

//Change Theme
id("statsSwitch").addEventListener("change", function(e) {
    stats = this.checked;
    setStats();
});

//Hide popus on mouseout
id("popup").addEventListener("mousedown", (event) => {
    showPopup(false);
});

//Show reset notice popup
function showPopup(show) {
    if(show) id("popup").style.display = "block";
    else id("popup").style.display = "none";
}

function setTheme() {

    root.style.setProperty("--background-color", bodyColors.background[theme]);
    root.style.setProperty("--default-hover-color", dropDown.hover[theme]);
    root.style.setProperty("--text-color", textColors.default[theme]);
    root.style.setProperty("--enter-button-background", controlColors.enter[theme]);
    root.style.setProperty("--dropdown-button-border", dropDown.border[theme]);
    root.style.setProperty("--reset-image-color", headerColors.resetButton[theme]);
    root.style.setProperty("--header-border", headerColors.border[theme]);
    root.style.setProperty("--control-border", controlColors.border[theme]);
    root.style.setProperty("--dropdown-content-background", dropDown.background[theme]);
    root.style.setProperty("--dropdown-content-shadow", dropDown.shadow[theme]);
    root.style.setProperty("--default-shadow", shadows.default[theme]);
    root.style.setProperty("--", shadows.default[theme]);
    root.style.setProperty("--dark-mode-switch", option_input["dark"]);
    root.style.setProperty("--option-input-background", option_input[theme]);
    root.style.setProperty("--svg-color", svg[theme]);
    id("classic_img_1").src = classic_example.one[theme];

    removeShadow(["modeBtn_normal", "modeBtn_classic", "modeBtn_hard"]);
    setShadow(["modeBtn_" + mode], "5px", option_color );

    //Game Area
    setShape(shape);
    setActiveRow();
}

function setStats() {
    if (stats) root.style.setProperty("--display-stats", "flex");
    else root.style.setProperty("--display-stats", "none");
}

function setHighlights() {
    //If highlights on
    if (highlights.on) {
        setShadow(highlights.green, shadow_size, shadows.green);
        setShadow(highlights.blue, shadow_size, shadows.blue);
        if (highlights.red_on) setShadow(highlights.red, shadow_size, shadows.red);
        else removeShadow(highlights.red);
    }
    else {
        removeShadow(highlights.green);
        removeShadow(highlights.blue);
        removeShadow(highlights.red);
    }
}

function setControls() {
    hidden_controls.forEach(hidden_control => {
        if (hideIncorrectGuesses) id(hidden_control).style.display = "none";
        else id(hidden_control).style.display = "block";
    });

    sizeControls();
}

//////////////////////////THEMES / COLOR STUFF////////////////

function setShadow(items, size, color) {
    items.forEach(item => {
        //console.log("SETTING SHADOW", id(item), "0 0 " + size + " " + color[theme]);
        id(item).style.boxShadow = "0 0 " + size + " " + color[theme];
    });
}

function removeShadow(items) {
    items.forEach(item => {
        //console.log("REMOVEING SHADOW", id(item));
        id(item).style.boxShadow = "";
    });
}

function sizeControls() {
    let controlAreaWidth;
    let controls = document.querySelectorAll(".color");
    let num_controls = controls.length;

    //console.log("SIZING CONTROLS: ", num_controls);

    //Size is 80% of a guess cell
    let control_margin = 2;
    let control_size = (document.querySelector(".cell").getBoundingClientRect().width * 0.8);

    let area_height = id("controlArea").getBoundingClientRect().height;

    //console.log("CONTROL SIZE: ", control_size);

    //Find the max rows we can have:
    let num_rows;
    for (let rows = num_controls; rows > 0; rows--) {
        if ((rows * control_size) + (rows * control_margin * 2) < area_height) {
            num_rows = rows;
            break;
        }
    }
    //console.log("ROWS SHOULD BE", num_rows);

    if (num_controls < 7) controlAreaWidth = (control_size * 3) + (6 * control_margin);
    else controlAreaWidth = Math.ceil(((num_controls / num_rows) * control_size) + (num_rows * 2 * control_margin));

    id("controlArea").style.width = controlAreaWidth + "px";

    //console.log("CALCED WIDTH", controlAreaWidth);

    root.style.setProperty("--control-width", control_size + "px");
    root.style.setProperty("--control-height", control_size + "px");
    root.style.setProperty("--control-margin", control_margin + "px");

    setShape(shape);
}

function id(id) { return document.getElementById(id) }

window.addEventListener('resize', function(e) {
    setShape(shape);
    sizeControls();
});

//////////////////////////START / RESET GAME//////////////////////////
loadGame();

function loadGame() {

    guesses = id("guessesInput").value;
    guess_length = id("guessSizeInput").value;
    num_colors = id("numColorsInput").value;

    guess = 0;
    selected = 0;
    guessed = {};
    objective = {};
    previous_green = [];
    previous_blue = [];
    hidden_controls = [];
    hideIncorrectGuesses = id("hideIncorrectSwitch").checked;

    highlights = {
        red:[],
        green:[],
        blue:[],
        on:id("highlightsSwitch").checked,
        red_on:id("redHighlightsSwitch").checked
    }
    
    id("gameArea").innerHTML = ""; 
    id("controlArea").innerHTML = "";
    id("endArea").innerHTML = "";
    id("endArea").style.display = "none";
    id("controlArea").style.display = "flex";
    
    getUseableColors();
    generateControls();
    generateGameArea();
    setActiveRow();
    setObjective();
    sizeControls();
    setShape(shape);
    showPopup(false);
    setTheme();
    setStats();
    setHighlights();

    console.log("OBJECTIVE", objective[0], objective[1], objective[2], objective[3]);
}

function generateControls() {
    for (const [key, value] of Object.entries(useableColors)) {
        const color = document.createElement("input");
        color.setAttribute("class", "color");
        color.setAttribute("type", "button");
        color.setAttribute("onclick", 'setColor("'+ key + '")');
        color.setAttribute("id", key);
        color.style.backgroundColor = value;

        id("controlArea").appendChild(color);
    }

    const color = document.createElement("input");
    color.setAttribute("class", "color enter");
    color.setAttribute("type", "button");
    color.setAttribute("value", "OK");
    color.setAttribute("color", "green");
    color.setAttribute("onclick", "checkGuess()");
    id("controlArea").appendChild(color);
}

function generateGameArea() {
    let count = 0;

    //Create rows
    for (let i = 0; i < guesses; i++) {
        const row = document.createElement("div");
        row.setAttribute("id", "row" + i);
        row.setAttribute("class", "row");

        //Create Cirlces
        for (let j = 0; j < guess_length; j++) {
            const cell = document.createElement("input");
            cell.setAttribute("type", "button");
            cell.setAttribute("id", count);  
            cell.setAttribute("class", "cell row" + i);
            cell.style.backgroundColor = "";
            row.appendChild(cell);
            count++;
        }

        //Add Classic Mode
        
            const stat_container = document.createElement("div");

            stat_container.setAttribute("class", "stat_container");

            stat_container.appendChild(getStat("green", i));
            stat_container.appendChild(getStat("blue", i));
            
            row.appendChild(stat_container);

        id("gameArea").appendChild(row);
    }
}

function getStat(type, num) {

    const guess_stats = document.createElement("div");
    guess_stats.setAttribute("class", "guess_stats");

    const rect = document.createElement("div");
    rect.setAttribute("class", "guess_rect");
    rect.style.backgroundColor = type;

    const stat = document.createElement("p");
    stat.setAttribute("class", "guess_stat");
    stat.setAttribute("id", type + "stat" + num);
    stat.textContent = "-";
    
    guess_stats.appendChild(rect);
    guess_stats.appendChild(stat);

    return guess_stats;
}

function getUseableColors() {
    useableColors = {};

    let tempColors = Object.assign({}, colors);

    for (let  i = num_colors; i > 0; i--) {
    
        let keys = Object.keys(tempColors);
        let index = keys.length * Math.random() << 0;
        let key = keys[index];
        randomColor = tempColors[keys[index]].color;

        useableColors[key] = randomColor;

        delete tempColors[key];
    }

}

function setObjective() {
    var size = Object.keys(useableColors).length;
    for (let i = 0; i < guess_length; i++) {
        objective[i] = Object.keys(useableColors)[Math.floor(Math.random() * size)];
    }
}

function endGame(win) {
    id("controlArea").style.display = "none";
    id("endArea").style.display = "flex";
    removeEventListeners();
    removeAllBorders();

    //remove rows after last guess
    for (let i = guess + 1; i < guesses; i++) {
        id("row" + i).style.display = "none";
    }

}

function winGame() {
    party.confetti(id("gameArea"), {
        count: party.variation.range(80, 80)
    });

    let message = document.createElement("p");
    message.setAttribute("class", "winMessage");
    message.textContent ="You Win !";

    let guesses_taken_message = document.createElement("p");
    guesses_taken_message.setAttribute("class", "winMessage");
    guesses_taken_message.textContent = "Guesses Taken: " +  (guess + 1);

    id("endArea").appendChild(message);
    id("endArea").appendChild(guesses_taken_message);

    endGame();
}

function loseGame() {
    let loseArea = document.createElement("div");
    loseArea.setAttribute("class", "loseArea");

    let message = document.createElement("p");
    message.setAttribute("class", "loseMessage");
    message.textContent ="You Lose :(";

    let looking_for_message = document.createElement("p");
    looking_for_message.setAttribute("class", "loseMessage");
    looking_for_message.textContent = "Here's what you were looking for";

    for (let i = 0; i < guess_length; i++) {
        let endColor = document.createElement("div");
        endColor.setAttribute("class", "endColor");
        endColor.style.backgroundColor = useableColors[objective[i]];
        loseArea.appendChild(endColor);
    }
    id("endArea").appendChild(message);
    id("endArea").appendChild(looking_for_message);
    id("endArea").appendChild(loseArea);
    endGame();
}

function showHelp() {
    console.log("HELPING");
    if (!helpShown) id("help_menu").style.display = "flex";
    else id("help_menu").style.display = "none";
    helpShown = !helpShown;
}