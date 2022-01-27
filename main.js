// alert("js loaded!");
// this is a basic structure for evaluation of a single choice exercise
// INTENTIONALLY parts of the code have been deleted.
//  It should serve as a hint towards finding a suitable solution for single choice exercise
// Written by GSoosalu ndr3svt
const API_KEY = "AIzaSyDQNwROozFi8edyHduP79ZLnoMS6rWLy8E";
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

/**
 * Define variables for algorithm.
 */
let states = [];
let options = ["this", "this not", "this either"];
let correctAnswerIndex;
let selectedAnswerIndex;
let question;
let point;
let totalPoints = 0;
/**
 * Assigned this variable for, questions getting step by step. With this variable, user can not see the answer and next question until he/she choose an option.
 */

/**
 * Define variables for the elements we need to access.
 */
let resultDiv;
let nextBtn;
let questionDiv;
let optionsContainer;
let checktBtn;
let resetBtn;
let mainWrapper;
/**
 * loading used for showing the loading animation.
 */
let loading;
/**
 * Audios used for playing the correct and wrong audio when user check the answer.
 */
var correctAudio;
var wrongAudio;

/**
 * Wil get getSecureQuestionIndex from an array the index of the question.
 */
let questionIndexArray = [2, 3, 4, 5, 6, 7, 8, 9, 10];
let getSecureQuestionIndex = randomSecureQuestionIndexGenerator();

function randomSecureQuestionIndexGenerator() {
  rin = Math.floor(Math.random() * questionIndexArray.length);
  gsqi = questionIndexArray[rin];
  questionIndexArray.splice(rin, 1);
  return gsqi;
}

function handleClientLoad() {
  gapi.load("client", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    })
    .then(
      function () {
        getExerciseData(`D${getSecureQuestionIndex}`, "first");
      },
      function (error) {
        console.log(JSON.stringify(error, null, 2));
      }
    );
}

/**
 * This function is for get the exercise data from the sheet with the parameters like A1, F10.
 * @param end is for which end of the sheet to get the data from
 * @param type is for which function to get new question (first) or get answer and for check answer (checkAnswer)
 */
async function getExerciseData(end, type) {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: "1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc",
    range: `Learning!A${getSecureQuestionIndex}:${end}`,
  });
  /**
   * If the type is checkAnswer, then get the answer and check the answer. If it is not user can not see the answer on the network.
   */
  if (type == "checkAnswer") {
    correctAnswerIndex = response.result.values[0][4];
    point = response.result.values[0][5];
    /**
     * If the type is first, then get the question and options.
     */
  } else if (type == "first") {
    question = response.result.values[0][2];
    options = response.result.values[0][3].split(";");
    /**
     * If there is question and options, initialize the exercise and remove the loading animation and show the main wrapper.
     */
    if (question && options) {
      init();
      mainWrapper.style.display = "block";
      loading.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", init);

/**
 * Assign the elements to variables.
 * Create question and options elements.
 */
function init() {
  questionDiv = document.querySelector("#question");
  nextBtn = document.querySelector("#next-btn");
  optionsContainer = document.querySelector("#options-wrapper");
  resultDiv = document.querySelector("#result");
  checktBtn = document.querySelector("#check-btn");
  mainWrapper = document.querySelector("#main-wrapper");
  loading = document.querySelector("#loading");
  correctAudio = document.getElementById("correct-audio");
  wrongAudio = document.getElementById("wrong-audio");
  resetBtn = document.querySelector("#reset-btn");

  /**
   * Create question element.
   */
  questionDiv.innerHTML = question;

  /**
   * First remove old options and create new options elements.
   */
  optionsContainer.innerHTML = "";
  for (let i = 0; i < options.length; i++) {
    optionsContainer.innerHTML +=
      `<div class='unchosen option' id='${`option${i}`}' onclick='chooseOption(
        ${i},${`options[${i}]`}
        )'=><p class='text'>` +
      options[i] +
      "</p></div>";
  }
}

/**
 * Function for check the answer.
 */
async function checkAnswer() {
  /**
   * Check if the getSecureQuestionIndex is 10, if it is, then the user get score for the exercise.
   */
  if (questionIndexArray.length == 0) {
    nextBtn.innerHTML = "Get Score!";
  }
  /**
   * Get the question answer from the sheet. This is not called on the first time, because user can see the answer from network.
   */

  await getExerciseData(`F${getSecureQuestionIndex}`, "checkAnswer");
  resultDiv.style.display = "block";

  /**
   * Check user is selected an option, if not, show warning message for select and option.
   */
  if (selectedAnswerIndex == undefined) {
    resultDiv.innerHTML = `<p class="warning">Please select an option!</p>`;
  } else if (selectedAnswerIndex == correctAnswerIndex) {
    /**
     * Check if the user answer is correct, if it is, show the congrats message.
     */
    totalPoints += Number(point);
    resultDiv.innerHTML = `<p class="success">Congrats, You are right! 👏</p>`;
    nextBtn.style.display = "block";
    checktBtn.style.display = "none";
    correctAudio.play();
    states = [...states, true];
  } else if (selectedAnswerIndex != correctAnswerIndex) {
    /**
     * Check if the user answer is wrong, if it is, show the error message.
     */
    resultDiv.innerHTML = `<p class="error">Wrong answer! Try again!</p>`;
    nextBtn.style.display = "block";
    checktBtn.style.display = "none";
    wrongAudio.play();
    states = [...states, false];
  }

  for (let i = 0; i < states.length; i++) {
    if (states[i] === true) {
      let bar = document.querySelector(`#bar-${i + 1}`);
      bar.style.backgroundColor = "green";
      bar.style.color = "white";
    } else if (states[i] === false) {
      let bar = document.querySelector(`#bar-${i + 1}`);
      bar.style.backgroundColor = "red";
      bar.style.color = "white";
    }
  }

  /**
   * This variable assigned undefined to using on another question.
   */
  selectedAnswerIndex = undefined;
  correctAnswerIndex = undefined;
}

/**
 * With this function, user can choose an option.
 * @param  i is the index of the option that user selected.
 */
function chooseOption(i) {
  selectedAnswerIndex = i;
  /**
   * This code block is for styling the selected option.
   */
  for (let x = 0; x < options.length; x++) {
    let option = document.querySelector(`#option${x}`);
    if (x == i) {
      option.classList.add("chosen");
      option.classList.remove("unchosen");
    } else {
      option.classList.add("unchosen");
      option.classList.remove("chosen");
    }
  }
}

/**
 * After choose an option and show the result message, user can click this button to get next question.
 */
function nextQuestion() {
  /**
   * getSecureQuestionIndex is the index of the question that user get from the sheet.
   * When getSecureQuestionIndex is less than 10, user can keep on the exercise.
   */

  if (questionIndexArray.length > 0) {
    // getSecureQuestionIndex += 1;
    getSecureQuestionIndex = randomSecureQuestionIndexGenerator();
    getExerciseData(`D${getSecureQuestionIndex}`, "first");
    resultDiv.innerHTML = "";
    resultDiv.style.display = "none";
    nextBtn.style.display = "none";
    checktBtn.style.display = "block";
  } else {
    /**
     * When getSecureQuestionIndex is equal or more than  10, user get score for the exercise.
     */
    resultDiv.innerHTML = `<p class="success">You got ${totalPoints} points!</p>`;
    resetBtn.style.display = "block";
    nextBtn.style.display = "none";
  }
}

/**
 * This function is for reset the exercise after completed the exercise.
 */
function reset() {
  questionIndexArray = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  getSecureQuestionIndex = randomSecureQuestionIndexGenerator();
  totalPoints = 0;
  getExerciseData(`D${getSecureQuestionIndex}`, "first");
  resultDiv.style.display = "none";
  resetBtn.style.display = "none";
  checktBtn.style.display = "block";
}
