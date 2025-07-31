import { pollSessionManager } from "../services/pollSessionManager";

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
  testSequentialPolls().catch(console.error);
}

export { testSequentialPolls };
