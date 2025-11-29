# Adding OpenAI API Key (Optional)

The Health Fact Guardian works in two modes:

## 🔹 Demo Mode (Current - No API Key)
- ✅ PubMed integration works
- ✅ Finds real medical research articles
- ⚠️ Returns "Unverified" verdict with safe fallback message
- ✅ Perfect for demonstrating the architecture

## 🔹 Full AI Mode (With OpenAI API Key)
- ✅ PubMed integration works
- ✅ LLM analyzes evidence and provides real verdicts
- ✅ Returns: "True", "False", "Misleading", or "Unverified"
- ✅ Smart explanations based on medical evidence

---

## How to Enable Full AI Mode

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### Step 2: Add to Environment

```bash
cd backend
echo 'LLM_API_KEY=sk-your-actual-key-here' >> .env
```

### Step 3: Restart Backend

The backend will auto-reload and start using real AI analysis!

---

## Cost Estimate

Using `gpt-3.5-turbo` (default):
- ~$0.002 per rumor check
- 500 checks = ~$1.00

Using `gpt-4` (more accurate):
- ~$0.03 per rumor check  
- 500 checks = ~$15.00

To use GPT-4, add to `.env`:
```bash
LLM_MODEL=gpt-4
```

---

## Current Status

✅ **Everything works without API key** - perfect for demo!  
🎯 Add key anytime to unlock full AI analysis
