let user = {};
let units = ["Unit 1", "Unit 2"];
let topics = ["Topic 1", "Topic 2"];
let questions = [{
  unit: "Unit 1",
  topic: "Topic 1",
  question: "What is HVAC?",
  alternatives: ["Heating", "Ventilation", "Air Conditioning"],
  rightAnswer: "Heating",
  tips: {
    right: "Correct! 🎉",
    wrong: "Hint: It's one of the basic functions."
  },
  comment: "HVAC stands for Heating, Ventilation, and Air Conditioning.",
  questionType: "Multiple Choice",
  levelOfDifficulty: "Easy",
  maxAnswerTime: 30
}];

function login() {
  user.name = document.getElementById("username").value;
  user.email = document.getElementById("email").value;
  document.getElementById("login").style.display = "none";
  document.getElementById("units").style.display = "block";
  loadUnits();
}

function loadUnits() {
  let unitButtons = document.getElementById("unit-buttons");
  units.forEach(unit => {
    let button = document.createElement("button");
    button.innerText = unit;
    button.onclick = function() {
      user.unit = unit;
      goToTopics();
    };
    unitButtons.appendChild(button);
  });
}

function goToTopics() {
  document.getElementById("units").style.display = "none";
  document.getElementById("topics").style.display = "block";
  loadTopics();
}

function loadTopics() {
  let topicButtons = document.getElementById("topic-buttons");
  topics.forEach(topic => {
    let button = document.createElement("button");
    button.innerText = topic;
    button.onclick = function() {
      user.topic = topic;
      startQuiz();
    };
    topicButtons.appendChild(button);
  });
}

function startQuiz() {
  document.getElementById("topics").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  loadQuestion();
}

function loadQuestion() {
  let question = questions.find(q => q.unit === user.unit && q.topic === user.topic);
  document.getElementById("question").innerText = question.question;
  let alternatives = document.getElementById("alternatives");
  alternatives.innerHTML = '';
  question.alternatives.forEach(alt => {
    let button = document.createElement("button");
    button.innerText = alt;
    button.onclick = function() {
      document.getElementById("answer").value = alt;
    };
    alternatives.appendChild(button);
  });
}

function submitAnswer() {
  let question = questions.find(q => q.unit === user.unit && q.topic === user.topic);
  let userAnswer = document.getElementById("answer").value;
  if (userAnswer === question.rightAnswer) {
    document.getElementById("comment").innerText = question.tips.right;
  } else {
    document.getElementById("comment").innerText = question.tips.wrong;
  }
}

function nextQuestion() {
  document.getElementById("comment").innerText = '';
  document.getElementById("answer").value = '';
  loadQuestion();
}
