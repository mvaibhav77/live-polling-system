// Utility functions to sanitize data to prevent circular references

export function sanitizeStats(stats: any) {
  return {
    hasPoll: stats.hasPoll,
    pollStatus: stats.pollStatus,
    currentQuestionNumber: stats.currentQuestionNumber,
    studentsCount: stats.studentsCount,
    responsesCount: stats.responsesCount,
    totalQuestionsAsked: stats.totalQuestionsAsked,
    sessionStudentsCount: stats.sessionStudentsCount,
  };
}

export function sanitizePoll(poll: any) {
  if (!poll) return null;
  return {
    pollId: poll.pollId,
    question: poll.question,
    options: poll.options,
    timeLimit: poll.timeLimit,
    status: poll.status,
    startTime: poll.startTime,
    endTime: poll.endTime,
    questionNumber: poll.questionNumber,
    createdAt: poll.createdAt,
  };
}

export function sanitizeStudent(student: any) {
  if (!student) return null;
  return {
    id: student.id,
    name: student.name,
    hasAnswered: student.hasAnswered,
  };
}
