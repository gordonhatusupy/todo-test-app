import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function promptClaude(userMessage, maxTokens = 500) {
  try {
    console.log("🤖 Asking Claude...");
    console.log("📝 Your prompt:", userMessage);
    console.log("─".repeat(50));
    
    const resp = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: userMessage }
      ],
    });
    
    console.log("✨ Claude's response:");
    console.log(resp.content[0].text);
    console.log("─".repeat(50));
    
    return resp.content[0].text;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

async function main() {
  // Example 1: Simple coding question
  await promptClaude("Write a JavaScript function to check if a number is prime.");
  
  // Example 2: More detailed request
  await promptClaude(`
    Create a React component that displays a list of todos. 
    Include:
    - Add new todo functionality
    - Mark todos as complete
    - Delete todos
    - Use modern React hooks
  `);
  
  // Example 3: Problem-solving
  await promptClaude(`
    I'm building a web app and need help with this problem:
    
    Problem: Users can upload images, but some are too large and slow down the site.
    Requirements: 
    - Compress images before storing
    - Maintain good quality
    - Support JPEG and PNG
    - Work in the browser
    
    Suggest a solution with code examples.
  `);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
