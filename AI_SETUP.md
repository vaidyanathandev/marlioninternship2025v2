# AI Integration Setup

## Important Note About "DigitalOcean AI"

As of January 2025, DigitalOcean does not have a native AI API service. The AI package (`@marlion/ai`) has been configured to work with **OpenAI-compatible APIs**, which gives you flexibility to use:

### Recommended Options:

1. **OpenAI (Recommended)**
   - Endpoint: `https://api.openai.com/v1`
   - Model: `gpt-4-turbo-preview` or `gpt-3.5-turbo`
   - Get API key: https://platform.openai.com/api-keys

2. **Anthropic Claude**
   - Endpoint: `https://api.anthropic.com/v1`
   - Requires slight API format adjustments (see below)
   - Get API key: https://console.anthropic.com/

3. **Local Ollama (Free, runs locally)**
   - Endpoint: `http://localhost:11434/v1`
   - Install: https://ollama.ai/
   - No API key needed
   - Models: llama2, mistral, etc.

4. **Other OpenAI-Compatible Services:**
   - Together.ai
   - Groq
   - Anyscale
   - Azure OpenAI

## Configuration

Update your `.env.local`:

```bash
# For OpenAI
VITE_AI_API_KEY=sk-...
VITE_AI_ENDPOINT=https://api.openai.com/v1
VITE_AI_MODEL=gpt-4-turbo-preview

# For Ollama (local, free)
VITE_AI_API_KEY=not-needed
VITE_AI_ENDPOINT=http://localhost:11434/v1
VITE_AI_MODEL=llama2
```

## Using Anthropic Claude

If you want to use Anthropic Claude, you'll need to modify `/packages/ai/src/index.ts`:

1. Change the API format from OpenAI to Anthropic
2. Update the `makeAIRequest` function
3. Adjust message format and parameters

Example:
```typescript
const response = await fetch(`${config.endpoint}/messages`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": config.apiKey,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: 2000,
    messages: messages.map(m => ({
      role: m.role === "system" ? "user" : m.role,
      content: m.role === "system" ? `System: ${m.content}` : m.content
    })),
  }),
});
```

## Cost Considerations

### OpenAI Pricing (as of Jan 2025):
- GPT-4 Turbo: $0.01/1K input tokens, $0.03/1K output tokens
- GPT-3.5 Turbo: $0.0005/1K input tokens, $0.0015/1K output tokens

### Estimated Usage:
- Interview evaluation: ~1,000 tokens/interview
- Course help queries: ~500 tokens/query
- FAQ responses: ~300 tokens/query

**Recommended:** Start with GPT-3.5 Turbo for development, upgrade to GPT-4 for production.

## Testing AI Integration

Before deploying, test all AI functions:

```bash
# In packages/ai/src, create a test file
npm run test:ai

# Or test manually via app:
1. Home page FAQ chatbot
2. AI interview system
3. Course help tutor
4. Knowledge checks
```

## Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Add to packages/ai/src/index.ts
const rateLimiter = {
  requests: new Map(),
  limit: 10, // requests per minute per user
  window: 60000, // 1 minute
};
```

## Removing Gemini

The original code used `@google/genai`. This has been completely removed and replaced with the new AI package. No Gemini dependencies remain.

## Questions?

If you need help setting up a specific AI provider, refer to their documentation or contact support@marliontech.com.
