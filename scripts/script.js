function createGame() {
    const foodList = [
        {name: "RICE", clues: [
            "It gets soft when heated.",
            "If you put your mobile phone inside it fixes.",
            "It's a famous meal from Asia.",
            "It's a grain.",
            "Spain has a famous dish with it."
        ]},
        {name: "PIZZA", clues: [
            "It's a famous meal from Italy.",
            "It is flat and shaped like a circle.",
            "It can be combined in many ways (not with pineapple, please).",
            "It's round, cut into triangles and served in a square box.",
            "Walter threw it on top of the roof of Skyler's house."
        ]},
        {name: "OMELETTE", clues: [
            "It's a famous meal from France.",
            "Spain has a famous dish with it and potatoes.",
            "Food dish that can't be made without breaking eggs.",
            "'Frittata' is the italian version.",
            "Mercadona sells it precooked."
        ]},
        {name: "GUACAMOLE", clues: [
            "THE BEST ONES ARE SOLD IN MERCADONA.",
            "Imanol like this.",
            "Imanol like this, A LOT!",
            "It's a green Mexican dish.",
            "Spicy avocado dish."
        ]},
        {name: "ICE CREAM", clues: [
            "It's cold.",
            "It can be of many flavors.",
            "Usually served in a cone.",
            "Everyone likes it a lot.",
            "If you eat it fast, you will have headache."
        ]}
    ];

    const maximumHints = 3;
    const choosedFood = foodList[Math.floor(Math.random() * foodList.length)];
    const word = loadVariableFromLocalStorage('storedWord', choosedFood.name);
    
    let givenHints = loadVariableFromLocalStorage('givenHints', 0);
    let hints = loadObjectFromLocalStorage('storedClues', choosedFood.clues);
    let lives = loadVariableFromLocalStorage('storedLives', 6);
    let totalSeconds = loadVariableFromLocalStorage('storedTime', 180);
    let usedCharacters = loadObjectFromLocalStorage('usedCharacters', []);
    initTime(totalSeconds);
    let interval = setInterval(setTime, 1000);

    if (localStorage.getItem('currentHint') !== null) {
        document.querySelector('#clue').innerText = localStorage.getItem('currentHint');
    } else {
        document.querySelector('#clue').innerText = '-';
    }
    
    document.querySelector('#lives-counter').innerText = lives;
    document.querySelector('#image').setAttribute('src', '/images/hangman_' + lives + '.png');

    function loadVariableFromLocalStorage(key, defaultValue){
        if (localStorage.getItem(key) !== null) {
            return localStorage.getItem(key);
        }

        localStorage.setItem(key, defaultValue);
        return defaultValue;
    }

    function loadObjectFromLocalStorage(key, defaultValue){
        if (localStorage.getItem(key) !== null) {
            return JSON.parse(localStorage.getItem(key));
        }

        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }

    function initTime() {
        let minutesLabel = document.getElementById("minutes");
        let secondsLabel = document.getElementById("seconds");
        secondsLabel.innerHTML = padding(totalSeconds % 60);
        minutesLabel.innerHTML = padding(parseInt(totalSeconds / 60));
    }
    
    function setTime() {
        let minutesLabel = document.getElementById("minutes");
        let secondsLabel = document.getElementById("seconds");
        
        if (totalSeconds > 0){
            --totalSeconds;
            localStorage.setItem('storedTime', totalSeconds);
            secondsLabel.innerHTML = padding(totalSeconds % 60);
            minutesLabel.innerHTML = padding(parseInt(totalSeconds / 60));
        } else {
            gameOver();
        }
    }

    function padding(val) {
        let valString = val + "";

        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    function getDisplay(character){
        if (usedCharacters.includes(character)) {
            return character;
        }
        return  character == ' ' ? ' ' : "__";
    }

    function writeHiddenWord() {
        let wordContainer = document.querySelector('#game__word');

        while (wordContainer.firstChild) {
            wordContainer.removeChild(wordContainer.lastChild);
        }

        for (let position in word) {
            let characterDiv = document.createElement("div"); 
            characterDiv.innerText = getDisplay(word[position]);
            characterDiv.classList.add('character');
            wordContainer.appendChild(characterDiv);
        }
    }

    function applyCharacter(character) {
        usedCharacters.push(character);
        localStorage.setItem('usedCharacters', JSON.stringify(usedCharacters));
        if (word.includes(character)){
            correctCharacter(character);
            if (allCharactersAreVisible()) victory();
        } else {
            wrongCharacter();
        } 
    }

    function correctCharacter(character){
        let characters = document.querySelectorAll('.character');
        
        for (let position = 0; position < word.length; position++) {
            if (word[position] == character){
                characters[position].innerText = character;
            }
        }
    }

    function allCharactersAreVisible() {
        let characters = document.querySelectorAll('.character');
        
        for (let position = 0; position < word.length; position++) {
            if (characters[position].innerText != word[position] && word[position] != ' '){
                return false;
            } 
        }
        
        return true;
    }
    
    function wrongCharacter() {
        decreaseLives();        
    }

    function getHint() {
        if (givenHints < maximumHints && lives > 0) {
            givenHints++;
            localStorage.setItem('givenHints', givenHints);
            decreaseLives();
            let index = Math.floor(Math.random() * hints.length);
            localStorage.setItem('currentHint', hints[index]);
            document.querySelector('#clue').innerText = hints[index];
            hints.splice(index, 1);
        }

        if (givenHints == maximumHints) {
            disableButton(document.querySelector('#hint-button'));
        }
    }

    function decreaseLives(){
        lives--;
        localStorage.setItem('storedLives', lives);
        document.querySelector('#lives-counter').innerText = lives;
        document.querySelector('#image').setAttribute('src', '/images/hangman_' + lives + '.png');
        if (lives <= 0) gameOver();
    }

    function victory() {
        let gamemessage = document.getElementById('game__message');
        gamemessage.innerText = "You win!";
        gamemessage.classList.add("game__message-win");

        document.getElementById('usedLives').innerText = "¡You have used " + (6 - lives) + " lives!";
        document.getElementById('usedHints').innerText = "¡You have used " + givenHints + " hints!";
        document.getElementById('usedTime').innerText = "¡You have used " + (180 - totalSeconds) + " seconds!";
        
        endGame();
    }
    
    function gameOver() {
        let gamemessage = document.getElementById('game__message');
        gamemessage.innerText = "You lose!";
        gamemessage.classList.add("game__message-lose");
        endGame();
    }

    function endGame() {
        clearInterval(interval);
        removeListeners();
        localStorage.clear();
    }

    function removeListeners() {
        disableButton(document.querySelector('#hint-button'));
        let alphabetButtons = document.querySelectorAll('.game__alphabet button');
        alphabetButtons.forEach(button => {
            disableButton(button);
        });
    }

    function createListeners() {
        createAlphabetListeners();
        if (usedCharacters.length !== 0) {
            let alphabetButtons = document.querySelectorAll('.game__alphabet button');

            for (let position = 0; position < alphabetButtons.length; position++) {
                if (usedCharacters.includes(alphabetButtons[position].innerText)) {
                    disableButton(alphabetButtons[position]);
                }
            }
        }

        createHintListener();
        if (givenHints >= maximumHints) {
            disableButton(document.querySelector('#hint-button'));
        }

        createPlayAgainListener();
    }

    return {
        applyCharacter: applyCharacter,
        writeHiddenWord: writeHiddenWord,
        getHint: getHint,
        endGame: endGame,
        createListeners:createListeners
    };
}

function createAlphabetListeners(){
    let alphabetButtons = document.querySelectorAll('.game__alphabet button');
    alphabetButtons.forEach(button => {
        button.classList.remove('disabled');
        button.addEventListener('click', alphabetButtonClicked);
    });
}

function alphabetButtonClicked(event){
    let button = event.target;
    disableButton(button);
    game.applyCharacter(button.innerText);
}

function createHintListener() {
    let button = document.querySelector('#hint-button');
    button.classList.remove('disabled');
    button.addEventListener('click', hintButtonClicked);
}

function hintButtonClicked(event) {
    game.getHint();
}

function createPlayAgainListener() {
    let playAgainButton = document.querySelector('#playAgain-button');
    playAgainButton.addEventListener('click', playAgainButtonClicked);
}

function playAgainButtonClicked(event) {
    game.endGame();
    let gamemessage = document.getElementById('game__message');
    gamemessage.innerText = "";
    game = createGame();
    createAlphabetListeners();
    createHintListener();
    game.writeHiddenWord();
}

function disableButton(button){
    button.classList.add('disabled');
    if (button.id == 'hint-button') {
        button.removeEventListener('click', hintButtonClicked);
    } else {
        button.removeEventListener('click', alphabetButtonClicked);
    }
}

let game = createGame();

document.addEventListener("DOMContentLoaded", function(event) {
    game.createListeners();
    game.writeHiddenWord();
});