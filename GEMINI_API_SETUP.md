# Setting Up Google Gemini API for AI-Generated Report Summaries

## Step 1: Get Your Free API Key

1. **Visit Google AI Studio**: https://ai.google.dev/
2. **Sign in** with your Google account
3. **Click "Get API Key"** button (usually in the top right)
4. **Create API Key**:
   - If prompted, create a new Google Cloud project (or use existing)
   - Copy your API key immediately (you won't be able to see it again)

## Step 2: Set Up Locally (Development)

### Option A: Environment Variable (Recommended)

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your_api_key_here"
```

### Option B: Create .env File

1. Create a file named `.env` in the `backend/` folder
2. Add this line:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Install python-dotenv (if not already installed):
   ```bash
   pip install python-dotenv
   ```
4. Update `backend/main.py` to load .env file (add at the top):
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

## Step 3: Set Up for Render Deployment

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your **backend service** (e.g., `dqa-backend`)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_api_key_here`
6. Click **Save Changes**
7. Render will automatically redeploy with the new environment variable

## Step 4: Verify It's Working

1. Restart your backend server (if running locally)
2. Go to UCMB Dashboard
3. Click **"Generate Enhanced Report"**
4. Open the downloaded Excel file
5. Check the **"Executive Summary"** sheet
6. You should see AI-generated summary instead of the "not available" message

## Free Tier Limits

- **15 requests per minute** (RPM)
- **No credit card required**
- **Generous free usage** for development and small-scale production

## Troubleshooting

### "AI summary not available" still showing?
- Make sure you restarted the backend server after setting the environment variable
- Check that the API key is correct (no extra spaces)
- Verify the environment variable is set: `echo $GEMINI_API_KEY` (Linux/Mac) or `echo %GEMINI_API_KEY%` (Windows)

### API errors?
- Check your API key is valid at https://ai.google.dev/
- Verify you haven't exceeded the free tier rate limit (15 RPM)
- Check backend logs for specific error messages

## Security Note

**Never commit your API key to GitHub!**
- The `.env` file should be in `.gitignore`
- Use environment variables for production
- Keep your API key private




