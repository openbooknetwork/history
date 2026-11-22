# Agents

Working notes for coding agents in this repository. `README.md` covers the project for people.

Run every command from the repo root, and the book's commands as `./node_modules/.bin/harita <args>`.

The notes are split by job. Read the file of each job you were given.

| Job | Read |
|---|---|
| Plan and build a story, from its brief to the finished pages | `agents/overseer.md` |
| Size a story: its pages and their count | `agents/outline.md` |
| Gather, plan from or check the sources | `agents/evidence.md` |
| Report to the overseer | `agents/report.md` |
| Build or change pages: maps, battles and zones | `agents/pages.md` |
| Write or edit a page's English text | `agents/text.md` |
| Find, add or change images | `agents/images.md` |
| Translate a story or update its translations | `node_modules/@openbooknetwork/kitap/agents/translating.md` |

The agents of `.claude/agents/` name their own files:

| Agent | Work |
|---|---|
| `researcher` | searches for a story's sources, fetches them and writes the digest |
| `names` | decides the form of each person's and place's name |
| `map-architect` | designs a story's map: its extent, families and shared zones |
| `section-coordinator` | plans one chapter and picks the sources of each page |
| `section-writer`, `fact-checker`, `section-reviewer` | a chapter's texts |
| `cartographer`, `map-auditor` | a chapter's zones, routes, markers and page files |
| `battle-coordinator`, `battle-implementor`, `battle-auditor` | a battle's plan, card and phase pages |
| `image-finder` | a chapter's images |
| `editor` | the order and the cohesion of the chapters, in the plans and then in the texts |
| `story-auditor` | audits a finished story against its sources |
| `name-finder` | looks up each name in sources of one language and keeps `i18n/names/<lang>.yaml` |
| `translator`, `translation-reviewer` | a story's translations |
