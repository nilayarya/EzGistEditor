# Gist Viewer/Editor

Simple web app to view and edit GitHub Gists. Supports PDF conversion.

## Setup

1.  **Clone your fork:**
    First, fork the repository on GitHub. Then clone your fork locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/gist2pdf.git
    cd gist2pdf
    ```
    *(Replace `YOUR_USERNAME`)*

2.  **Add Upstream Remote:**
    ```bash
    git remote add upstream https://github.com/nilayarya/gist2pdf.git
    git fetch upstream
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Contributing

Contributions are welcome! Please follow these steps:

1.  **Create a Branch:** Branch off the `main` branch from the upstream repository:
    ```bash
    git checkout -b my-feature-branch -t upstream/main
    ```

2.  **Make Changes:** Write your code and add tests if applicable. Ensure code follows existing style.

3.  **Commit Changes:** Use semantic commit messages [[2]](https://www.electronjs.org/docs/latest/development/pull-requests#commit-message-guidelines).
    ```bash
    git add .
    git commit -m "feat: Add PDF generation button"
    # or
    git commit -m "fix: Correct preview pane alignment"
    # or
    git commit -m "docs: Update README setup instructions"
    ```
    Common prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Add `BREAKING CHANGE:` in the body/footer for breaking changes [[2]](https://www.electronjs.org/docs/latest/development/pull-requests#breaking-changes).

4.  **Rebase:** Before pushing, synchronize with the main repository:
    ```bash
    git fetch upstream
    git rebase upstream/main
    ```
    Resolve any conflicts that arise during the rebase.

5.  **Push:** Push your branch to your fork:
    ```bash
    git push origin my-feature-branch
    ```

6.  **Open Pull Request:** Go to the original repository (`nilayarya/gist2pdf`) on GitHub and open a pull request from your fork's branch (`my-feature-branch`) to the original `main` branch. Fill out the pull request template.
