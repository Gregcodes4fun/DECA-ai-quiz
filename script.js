const startBtn = document.getElementById("start-btn");
const settingsScreen = document.getElementById("question-settings");
const questionButtons = document.querySelectorAll(".question-count");
const quizScreen = document.getElementById("quiz-screen");
const questionContainer = document.getElementById("question-container");
const submitBtn = document.getElementById("submit-btn");
const resultsScreen = document.getElementById("results-screen");
const scoreDisplay = document.getElementById("score-display");
const explanationsDiv = document.getElementById("explanations");

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

startBtn.onclick = () => {
  document.getElementById("start-screen").classList.add("hidden");
  settingsScreen.classList.remove("hidden");
};

questionButtons.forEach((btn) => {
  btn.onclick = async () => {
    const count = parseInt(btn.dataset.count);
    settingsScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    questions = await generateQuestions(count);
    showQuestion();
  };
});

document.getElementById("next-btn").onclick = () => {
  saveAnswer();
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
};

document.getElementById("prev-btn").onclick = () => {
  saveAnswer();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

submitBtn.onclick = () => {
  saveAnswer();
  let correct = 0;
  explanationsDiv.innerHTML = "";
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.correct) {
      correct++;
    } else {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><strong>Question:</strong> ${q.question}</p>
        <p><strong>Your answer:</strong> ${userAnswers[i] || "No answer"}</p>
        <p><strong>Correct answer:</strong> ${q.correct}</p>
        <p><strong>Explanation:</strong> ${q.explanation}</p>
        <p><strong>Subtopic:</strong> ${q.subtopic}</p>
        <hr />
      `;
      explanationsDiv.appendChild(div);
    }
  });
  scoreDisplay.textContent = `Score: ${correct}/${questions.length}`;
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
};

function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionContainer.innerHTML = `
    <p><strong>Question ${currentQuestionIndex + 1}:</strong> ${q.question}</p>
    ${q.options.map((opt) => `
      <label>
        <input type="radio" name="option" value="${opt}" ${userAnswers[currentQuestionIndex] === opt ? "checked" : ""}>
        ${opt}
      </label><br/>
    `).join("")}
  `;

  if (currentQuestionIndex === questions.length - 1) {
    submitBtn.classList.remove("hidden");
  } else {
    submitBtn.classList.add("hidden");
  }
}

function saveAnswer() {
  const selected = document.querySelector("input[name='option']:checked");
  userAnswers[currentQuestionIndex] = selected ? selected.value : null;
}

// --- AI Question Generator ---
async function generateQuestions(count) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY_HERE"
    },
    body: JSON.stringify({
      model: "ft:gpt-3.5-turbo-0125:personal::XXXXX",
      messages: [
        {
          role: "system",
          content: `You are a DECA practice exam generator. Generate ${count} unique, multiple choice DECA practice questions with 4 options (A-D). Do not reuse any previously known examples. Return JSON only in this format:

[
  {
    "question": "What is the purpose of a business plan?",
    "options": ["To secure funding", "To increase revenue", "To reduce staff", "To change branding"],
    "correct": "To secure funding",
    "explanation": "Business plans help convince investors and guide strategy.",
    "subtopic": "Business Planning"
  }
]
`
        }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
