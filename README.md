<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kSWxcnb96O8CD3j5vQAAU6X14Hz7PqC4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This project is automatically deployed to GitHub Pages using a GitHub Actions workflow. The workflow is triggered on every push to the `master` branch.

To ensure the deployment succeeds, you need to add your `GEMINI_API_KEY` as a secret to your GitHub repository. You can do this by following these steps:

1.  Go to **Settings > Secrets and variables > Actions** in your repository.
2.  Click **New repository secret**.
3.  Enter `GEMINI_API_KEY` as the name and your API key as the value.
