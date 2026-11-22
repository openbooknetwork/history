# Cloud runs

For a story built in a cloud session, where no user sits at the terminal. The steps of `agents/overseer.md`
hold, with the changes below. Do not stop to ask the user mid-run: the one step that waits is the pull request.

## Rulings

Every step where the overseer waits for the user is yours to rule: a section that rests on `wikipedia` alone
or a `thin` claim in step 2, the brief of step 4, the order of step 7, a `weak` fault, an `unsourced` name.
Take the careful side: drop a claim no strong source carries rather than keep it, and take phase pages out
rather than guess positions. Write each ruling into `decisions.md` as `cloud ruling: <what> — <reason>`, so
the review reads them in one place.

An address the researcher cannot fetch is ruled the same way: the section goes on with what was read, and the
unread address goes into `decisions.md` as a `cloud ruling`.

Step 15, the read on a phone, moves after the pull request: the user pulls the branch and reads the story
with `npm run dev`.

## Commits

You make the commits, on the session's branch, never on `main`. Commit at the end of each step with the step's
number and name in the message, so the branch reads as the plan unfolded.

## Images

Add images with `harita image <url>` as `agents/images.md` says. The originals travel with the pull request:
Wikimedia Commons throttles bulk downloads, so nobody fetches them again. When the story passes step 14, run
`node scripts/images-pack.mjs pack`, which collects every original on disk into `images-pack/` as archives
under GitHub's file size limit, and commit `images-pack/` on the branch. The reviewer runs
`node scripts/images-pack.mjs unpack` after pulling the branch, which restores each original into its folder
and checks it against the `sha256` of its `image.yaml`, then removes `images-pack/` before the merge.

## The pull request

When the story passes step 14, and steps 16 to 17 where translations were asked, pack the images as above,
then stop. Report the story, its page count, and every `cloud ruling` of `decisions.md`, and wait for the
user. The user confirms, then you open the pull request, and its text lists the rulings, what was left out,
and the unpack command.
