import { pollSessionManager } from "../services/pollSessionManager";

async function testSubmissionBug() {
  console.log("🐛 Testing Submission Bug...\n");

  // Clear any existing state
  pollSessionManager.resetSession();

  // Step 1: Create a poll first (before student joins)
  console.log("1. Creating poll first...");
  const poll = pollSessionManager.createPoll(
    "What is 2 + 2?",
    ["3", "4", "5", "6"],
    60
  );
  console.log("✅ Poll created:", poll.pollId, "Status:", poll.status);

  // Step 2: Start the poll immediately
  console.log("\n2. Starting poll...");
  const started = pollSessionManager.startPoll();
  console.log("✅ Poll started:", started, "Status:", poll.status);

  // Step 3: Add student AFTER poll is already active (this is the problematic flow)
  console.log("\n3. Adding student AFTER poll is active...");
  const student = pollSessionManager.addStudent("socket-123", "TestStudent");
  console.log("✅ Student added:", student?.id, student?.name);

  // Step 4: Try to submit response (this should fail currently)
  console.log("\n4. Attempting to submit response...");
  const studentId = "98792a87-3830-48ee-8c7e-d6c2d51cd123"; // Use the actual failing ID
  const optionIndex = 0;

  console.log(
    `📝 Submitting: studentId=${studentId}, optionIndex=${optionIndex}`
  );
  const submitResult = pollSessionManager.submitResponse(
    studentId,
    optionIndex
  );
  console.log("❌ Submit result:", submitResult);

  // Step 5: Let's also try with the correct student ID that was just created
  console.log("\n5. Trying with correct student ID...");
  if (student) {
    const submitResult2 = pollSessionManager.submitResponse(
      student.id,
      optionIndex
    );
    console.log("✅ Submit result with correct ID:", submitResult2);
  }

  // Step 6: Check current poll state
  console.log("\n6. Current poll state:");
  const currentPoll = pollSessionManager.getCurrentPoll();
  if (currentPoll) {
    console.log("   Poll ID:", currentPoll.pollId);
    console.log("   Status:", currentPoll.status);
    console.log("   Students in poll:", currentPoll.students.size);
    console.log("   Student IDs:", Array.from(currentPoll.students.keys()));
    console.log("   Responses:", currentPoll.responses.size);
  }

  console.log("\n🔍 Bug reproduction complete!");
}

async function testSequentialPolls() {
  console.log("🧪 Testing Sequential Poll System...\n");

  // Test 1: Create First Poll (Question 1)
  console.log("1. Creating first poll...");
  const poll1 = pollSessionManager.createPoll(
    "What is your favorite programming language?",
    ["JavaScript", "TypeScript", "Python", "Go"],
    60
  );
  console.log(
    "✅ Poll 1 created:",
    poll1.pollId,
    "Question Number:",
    poll1.questionNumber
  );

  // Test 2: Add Students
  console.log("\n2. Adding students...");
  const student1 = pollSessionManager.addStudent("socket1", "Alice");
  const student2 = pollSessionManager.addStudent("socket2", "Bob");
  console.log("✅ Students added:", student1?.name, student2?.name);

  // Test 3: Start First Poll
  console.log("\n3. Starting first poll...");
  const started1 = pollSessionManager.startPoll();
  console.log("✅ Poll 1 started:", started1);

  // Test 4: Submit Responses for Poll 1
  console.log("\n4. Submitting responses for Poll 1...");
  if (student1) pollSessionManager.submitResponse(student1.id, 1); // TypeScript
  if (student2) pollSessionManager.submitResponse(student2.id, 0); // JavaScript

  // Test 5: Get Results for Poll 1
  console.log("\n5. Getting results for Poll 1...");
  const results1 = pollSessionManager.getPollResults();
  console.log("✅ Poll 1 Results:", JSON.stringify(results1, null, 2));

  // Test 6: Create Second Poll (Question 2)
  console.log("\n6. Creating second poll...");
  const poll2 = pollSessionManager.createPoll(
    "Which framework do you prefer?",
    ["React", "Vue", "Angular", "Svelte"],
    45
  );
  console.log(
    "✅ Poll 2 created:",
    poll2.pollId,
    "Question Number:",
    poll2.questionNumber
  );

  // Test 7: Start Second Poll
  console.log("\n7. Starting second poll...");
  const started2 = pollSessionManager.startPoll();
  console.log("✅ Poll 2 started:", started2);

  // Test 8: Submit Responses for Poll 2
  console.log("\n8. Submitting responses for Poll 2...");
  if (student1) pollSessionManager.submitResponse(student1.id, 0);
  if (student2) pollSessionManager.submitResponse(student2.id, 0);

  // Test 9: Get Results for Poll 2
  console.log("\n9. Getting results for Poll 2...");
  const results2 = pollSessionManager.getPollResults();
  console.log("✅ Poll 2 Results:", JSON.stringify(results2, null, 2));

  // Test 10: Check Session History
  console.log("\n10. Checking session history...");
  const history = pollSessionManager.getSessionHistory();
  console.log("✅ Session History:");
  history.forEach((entry, index) => {
    console.log(
      `   Question ${entry.questionNumber}: ${entry.question} - ${entry.results.totalResponses} responses`
    );
  });

  // Test 11: Get Final Stats
  console.log("\n11. Getting final stats...");
  const stats = pollSessionManager.getStats();
  console.log("✅ Final Stats:", JSON.stringify(stats, null, 2));

  console.log("\n🎉 Sequential poll tests passed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSubmissionBug().catch(console.error);
}

export { testSequentialPolls, testSubmissionBug };
