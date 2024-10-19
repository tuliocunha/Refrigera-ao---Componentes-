// Load quiz data from IndexedDB
const dbName = 'hvacTulioQuiz';
const dbVersion = 1;

let db;

const openRequest = indexedDB.open(dbName, dbVersion);

openRequest.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Create object stores
  const questionsStore = db.createObjectStore('questions', { keyPath: 'questionId' });
  questionsStore.createIndex('unit', 'unit', { unique: false });
  questionsStore.createIndex('topic', 'topic', { unique: false });
  questionsStore.createIndex('questionType', 'questionType', { unique: false });

  const quizUsersStore = db.createObjectStore('quizUsers', { keyPath: 'userId' });
  quizUsersStore.createIndex('username', 'username', { unique: false });

  const questionsAlternativesStore = db.createObjectStore('questionsAlternatives', { keyPath: 'questionId' });
  questionsAlternativesStore.createIndex('questionId', 'questionId', { unique: false });
};

openRequest.onsuccess = (event) => {
  db = event.target.result;

  // Load quiz data from IndexedDB and populate the UI
  const questionsStore = db.transaction('questions', 'readonly').objectStore('questions');
  questionsStore.getAll().onsuccess = (event) => {
    const questions = event.target.result;
    // Populate the unit and topic lists
    populateUnitList(questions);

    // Load avatar images and populate the avatar grid
    loadAvatarImages();

    // Load random login screen background image
    loadRandomLoginBackgroundImage();
  };
};

openRequest.onerror = (event) => {
  displayErrorMessage('Error opening IndexedDB:', event.target.error);
};

// Function to populate the unit list
function populateUnitList(questions) {
  const units = new Set(questions.map(question => question.unit));
  const unitList = document.getElementById('unit-list');
  units.forEach(unit => {
    const li = document.createElement('li');
    li.textContent = unit;
    li.addEventListener('click', () => {
      // Show topic selection screen and populate the topic list
      document.getElementById('units-screen').style.display = 'none';
      document.getElementById('topics-screen').style.display = 'block';

      const topics = questions.filter(question => question.unit === unit).map(question => question.topic);
      const topicList = document.getElementById('topic-list');
      topicList.innerHTML = '';
      topics.forEach(topic => {
        const li = document.createElement('li');
        li.textContent = topic;
        li.addEventListener('click', () => {
          // Show question screen and present the first question
          document.getElementById('topics-screen').style.display = 'none';
          document.getElementById('questions-screen').style.display = 'block';

          const questionsForTopic = questions.filter(question => question.unit === unit && question.topic === topic);
          let currentQuestionIndex = 0;
          presentQuestion(questionsForTopic[currentQuestionIndex]);

          // Handle answer submission and feedback
          document.getElementById('submit-answer-btn').addEventListener('click', () => {
            const selectedAnswer = document.querySelector('input[name="answer"]:checked');
            if (selectedAnswer) {
              const isCorrect = selectedAnswer.value === questionsForTopic[currentQuestionIndex].correctAnswer;
              const feedbackMessage = isCorrect ? 'Correct!' : 'Incorrect.';
              document.getElementById('feedback-message').textContent = feedbackMessage;

              // Update score
              const score = localStorage.getItem('score') || 0;
              localStorage.setItem('score', parseInt(score) + (isCorrect ? questionsForTopic[currentQuestionIndex].points : 0));
              document.getElementById('score').textContent = `Score: ${localStorage.getItem('score')}`;

              // Present the next question
              currentQuestionIndex++;
              if (currentQuestionIndex < questionsForTopic.length) {
                presentQuestion(questionsForTopic[currentQuestionIndex]);
              } else {
                // Show score screen
                document.getElementById('questions-screen').style.display = 'none';
                document.getElementById('score-screen').style.display = 'block';

                // Update final score
                document.getElementById('final-score').textContent = `Final Score: ${localStorage.getItem('score')}`;
              }
            } else {
              displayErrorMessage('Please select an answer before submitting.');
            }
          });
        });
        topicList.appendChild(li);
      });
    });
    unitList.appendChild(li);
  });
}

// Function to present a question
function presentQuestion(question) {
  document.getElementById('question-text').textContent = question.question;
  const answerOptionsDiv = document.getElementById('answer-options');
  answerOptionsDiv.innerHTML = '';
  question.alternatives.forEach(alternative => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = alternative.text;
    input.id = `answer-${alternative.id}`; // Assign a unique ID for accessibility
    const label = document.createElement('label');
    label.textContent = alternative.text;
    label.setAttribute('for', `answer-${alternative.id}`); // Link the label to the input
    answerOptionsDiv.appendChild(input);
    answerOptionsDiv.appendChild(label);
  });
}

// Function to display an error message
function displayErrorMessage(message, error) {
  const errorMessageElement = document.getElementById('error-message');
  if (!errorMessageElement) {
    const errorMessageElement = document.createElement('p');
    errorMessageElement.id = 'error-message';
    document.body.appendChild(errorMessageElement);
  }
  errorMessageElement.textContent = `Error: ${message} ${error ? error.message : ''}`;
}

// Function to load a random login screen background image
function loadRandomLoginBackgroundImage() {
  const loginScreenBackground = document.getElementById('login-screen-background');

  // Fetch the list of image files from the specified directory
  fetch('images/login_screen_background/')
    .then(response => response.json())
    .then(files => {
      // Select a random image file
      const randomIndex = Math.floor(Math.random() * files.length);
      const selectedImage = files[randomIndex];

      // Set the background image
      loginScreenBackground.src = `images/login_screen_background/${selectedImage}`;
    })
    .catch(error => {
      console.error('Error fetching background images:', error);
    });
}