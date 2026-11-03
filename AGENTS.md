<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- CodeDuel is powered by a Java Spring Boot backend located in `/backend` on port 8088. All problems, players, user profiles, matches, and stats come dynamically from the Spring Boot REST APIs (`/api/*`), with no hardcoded data in the frontend.
- Code execution is powered by Judge0 integration via `/api/code/run` and `/api/code/submit`. Judge0 endpoint is configured to the dedicated instance at `http://54.196.209.169:2358`, configurable via `application.properties` or environment variables (`JUDGE0_API_URL`, `JUDGE0_API_KEY`, `JUDGE0_API_HOST`). When unreachable, it gracefully runs in transparent fallback evaluation mode.
