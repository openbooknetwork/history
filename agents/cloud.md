# Cloud runs

For a story built in a cloud session, where no user sits at the terminal. The steps of `agents/overseer.md`
hold, with the changes below. Do not stop to ask the user: the run ends with the pull request it opens itself.

## Rulings

Every step where the overseer waits for the user is yours to rule, and so is what a section lead sends up: a section that rests on `wikipedia` alone
or a `thin` claim at `survey` and `research`, the brief at `final-brief`, the page lists at `pre-plan-check`, a
`weak` fault, an `unsourced` name.
Take the careful side: drop a claim no strong source carries rather than keep it, and take phase pages out
rather than guess positions. Write each ruling into `decisions.md` as `cloud ruling: <what> — <reason>`, so
the review reads them in one place.

An address the researcher cannot fetch is ruled the same way: the section goes on with what was read, and the
unread address goes into `decisions.md` as a `cloud ruling`.

The read on a phone moves after the pull request: the user pulls the branch and reads the story
with `npm run dev`.

## Builds

A background command stops after two hours, so a dev server does not last the run. No server is
shared: each agent builds the story once into an `--out` folder of its own and serves that static build, as
"Checking a story" in `agents/pages.md` says, and its dispatch says `serve: static`.

The store holds no upload of a new story before the maintainer's, and the strict build fails on that alone. At
`story` run `./node_modules/.bin/harita build --strict --no-store --story <story>`, which runs every strict check and leaves the store unasked.

## Commits

You make the commits, on the session's branch, never on `main`. Commit at the end of each step with the step's
name in the message, so the branch reads as the plan unfolded, and push the branch each time: a container that is
taken away keeps nothing that was not pushed. Save the run's ledger with each of those commits too, to
`content/<story>/.plan/run/<session id>.json`, and run `node scripts/transcripts-pack.mjs pack`, which adds what is
new among the session's transcripts to `transcripts-pack/`: commit that folder with the step. The transcripts end
with the session, and they are what says why a step cost what it did. The reviewer runs
`node scripts/transcripts-pack.mjs unpack` after pulling the branch, and removes the folder with `images-pack/`
before the merge by squash.

## Images

Add images with `harita image <url>` as `agents/images.md` says. The originals travel with the pull request:
Wikimedia Commons throttles bulk downloads, so nobody fetches them again. When the story passes `story`, run
`node scripts/images-pack.mjs pack`, which collects every original on disk into `images-pack/` as archives
under GitHub's file size limit, and commit `images-pack/` on the branch. The reviewer runs
`node scripts/images-pack.mjs unpack` after pulling the branch, which restores each original into its folder
and checks it against the `sha256` of its `image.yaml`, then removes `images-pack/` in one more commit. The pull
request is merged by squash after that, since a merge commit or a rebase copies the pack into the history of
`main`.

## The pull request

When the story passes `story`, and `name-forms` and `translation` where translations were asked, pack the images as above, push
the branch and open the pull request yourself, into the branch the session started from, with the built-in GitHub
tools or `gh api repos/{owner}/{repo}/pulls`: `gh pr create` is refused in a cloud session. Its text lists every `cloud ruling` of `decisions.md`, what was
left out and the unpack command, and says that it is merged by squash once the pack is removed. Then report the
story, its page count and the pull request's link.
