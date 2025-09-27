import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptClaude(userMessage, maxTokens = 1000) {
  try {
    console.log("\n🤖 Asking Claude...");
    console.log("─".repeat(60));
    
    const resp = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: userMessage }
      ],
    });
    
    console.log("✨ Claude's response:");
    console.log(resp.content[0].text);
    console.log("─".repeat(60));
    
    return resp.content[0].text;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

function askQuestion() {
  rl.question('\n💬 What would you like to ask Claude? (type "exit" to quit): ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('👋 Goodbye!');
      rl.close();
      return;
    }
    
    if (input.trim()) {
      await promptClaude(input);
    }
    
    askQuestion(); // Ask again
  });
}

console.log('🚀 Claude Prompting Tool');
console.log('Ask Claude anything! Type "exit" to quit.\n');

askQuestion();


