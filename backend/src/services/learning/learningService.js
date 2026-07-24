const learningModel = require('../../models/learningModel');
const progressModel = require('../../models/progressModel');

const getTopics = () => learningModel.getTopics();

const getLessons = (topicId) => learningModel.getLessons(topicId);

const getQuizWithQuestions = async (quizId) => {
  const quiz = await learningModel.getQuiz(quizId);
  if (!quiz) { const e = new Error('Quiz not found'); e.status = 404; throw e; }
  const questions = await learningModel.getQuizQuestions(quizId);
  // Strip correct_index from response
  return { ...quiz, questions: questions.map(({ correct_index, ...q }) => q) };
};

const submitQuiz = async (userId, quizId, answers) => {
  const questions = await learningModel.getQuizQuestions(quizId);
  if (!questions.length) { const e = new Error('Quiz not found'); e.status = 404; throw e; }
  let score = 0;
  const graded = questions.map((q, i) => {
    const correct = answers[i] === q.correct_index;
    if (correct) score++;
    return { question_id: q.id, selected: answers[i], correct, explanation: q.explanation };
  });
  const attempt = await learningModel.saveAttempt({ userId, quizId, score, total: questions.length, answers: graded });
  await progressModel.upsert(userId, { techniques_learned: score }).catch(() => {});
  return { score, total: questions.length, graded, attempt_id: attempt.id };
};

module.exports = { getTopics, getLessons, getQuizWithQuestions, submitQuiz };
