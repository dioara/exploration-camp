# How to Deploy Exploration Camp to GitHub Pages

GitHub Pages is a great free option for hosting static websites like this game. Here are the steps to deploy the game files:

## Prerequisites

*   A GitHub account (sign up at [https://github.com/](https://github.com/))
*   The `exploration_camp_files.zip` archive containing the game files (`index.html`, `style.css`, `script.js`, `README.md`, and the `images/` folder).

## Steps

1.  **Create a New GitHub Repository:**
    *   Log in to your GitHub account.
    *   Click the "+" icon in the top-right corner and select "New repository".
    *   Choose a repository name (e.g., `exploration-camp`).
    *   You can make it Public or Private (GitHub Pages works with both, but public is simpler for sharing).
    *   **Important:** Do NOT initialize the repository with a README, .gitignore, or license yet, as you will be uploading the existing files.
    *   Click "Create repository".

2.  **Upload Game Files:**
    *   On your new repository's main page, you'll see instructions for getting started. Look for the option "uploading an existing file". Click that link.
    *   Unzip the `exploration_camp_files.zip` archive on your computer.
    *   Drag and drop all the unzipped files and the `images` folder directly onto the GitHub upload page.
        *   This should include: `index.html`, `style.css`, `script.js`, `README.md`, and the `images` folder (which contains `rocket_scout.png`, `rocket_hauler.png`, `rocket_explorer.png`).
    *   Wait for all files to upload.
    *   Add a commit message (e.g., "Initial commit of game files").
    *   Click "Commit changes".

3.  **Enable GitHub Pages:**
    *   In your repository, click the "Settings" tab (usually near the top).
    *   In the left sidebar, click "Pages".
    *   Under the "Build and deployment" section, select the Source as "Deploy from a branch".
    *   Under "Branch", select `main` (or `master` if that's your default branch name) and keep the folder as `/root`.
    *   Click "Save".

4.  **Access Your Live Game:**
    *   GitHub Pages will now build and deploy your site. This might take a minute or two.
    *   Refresh the "Pages" settings page after a minute.
    *   Once deployed, a green banner will appear at the top saying "Your site is live at [URL]".
    *   The URL will typically be in the format: `https://<your-github-username>.github.io/<repository-name>/`
    *   Click the provided URL to visit your live Exploration Camp game!

## Troubleshooting

*   **404 Error:** If you get a 404 error, wait a few more minutes for the deployment to complete. Also, double-check that your main HTML file is named `index.html` and is in the root directory of the repository.
*   **CSS/JS Not Loading:** Ensure the `style.css` and `script.js` files are in the root directory alongside `index.html`. Check the browser's developer console (usually F12) for errors.
*   **Images Not Loading:** Make sure the `images` folder was uploaded correctly and is in the root directory. The image paths in `script.js` and `index.html` (`images/rocket_...png`) assume this structure.

That's it! Your game should now be hosted and accessible via the GitHub Pages URL.

