const errorMsg = `429 google error: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit.
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
Please retry in 52.040466367s.`.toLowerCase();

console.log("errorMsg includes 404:", errorMsg.includes("404"));
console.log("errorMsg includes not found:", errorMsg.includes("not found"));
console.log("errorMsg includes quota:", errorMsg.includes("quota"));
console.log("errorMsg includes 429:", errorMsg.includes("429"));

if ((errorMsg.includes("404") || errorMsg.includes("not found")) && !errorMsg.includes("quota") && !errorMsg.includes("429")) {
  console.log("ENTERED BLOCK");
} else {
  console.log("DID NOT ENTER BLOCK");
}
