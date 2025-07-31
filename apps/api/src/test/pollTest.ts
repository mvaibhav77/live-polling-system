// import { pollSessionManager } from "../services/pollSessionManager";

// async function testPollSession() {
//   console.log("🧪 Testing Poll Session Manager...\n");

//   // Test 1: Create Poll
//   console.log("1. Creating poll...");
//   const poll = pollSessionManager.createPoll(
//     "What is your favorite programming language?",
//     ["JavaScript", "TypeScript", "Python", "Go"],
//     60
//   );
//   console.log("✅ Poll created:", poll.pollId);

//   // Test 2: Add Students
//   console.log("\n2. Adding students...");
//   const student1 = pollSessionManager.addStudent("socket1", "Alice");
//   const student2 = pollSessionManager.addStudent("socket2", "Bob");
//   const student3 = pollSessionManager.addStudent("socket3", "Charlie");
//   console.log(
//     "✅ Students added:",
//     student1?.name,
//     student2?.name,
//     student3?.name
//   );

//   // Test 3: Start Poll
//   console.log("\n3. Starting poll...");
//   const started = pollSessionManager.startPoll();
//   console.log("✅ Poll started:", started);

//   // Test 4: Submit Responses
//   console.log("\n4. Submitting responses...");
//   if (student1) pollSessionManager.submitResponse(student1.id, 1); // TypeScript
//   if (student2) pollSessionManager.submitResponse(student2.id, 0); // JavaScript
//   if (student3) pollSessionManager.submitResponse(student3.id, 1); // TypeScript

//   // Test 5: Get Results
//   console.log("\n5. Getting results...");
//   const results = pollSessionManager.getPollResults();
//   console.log("✅ Results:", JSON.stringify(results, null, 2));

//   // Test 6: Stats
//   console.log("\n6. Getting stats...");
//   const stats = pollSessionManager.getStats();
//   console.log("✅ Stats:", JSON.stringify(stats, null, 2));

//   console.log("\n🎉 All tests passed!");
// }

// // Run tests if this file is executed directly
// if (require.main === module) {
//   testPollSession().catch(console.error);
// }

// export { testPollSession };
