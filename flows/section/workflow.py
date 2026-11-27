"""One section of a story built from its plans to its reviewed pages, as a Winslow workflow.

Run from the folder `flows`, for a story that is on the log (agents/log.md):

    cd flows && winslow run --mode headless --workflow section --story joan-of-arc --section 050

Each task is the first run of one role. Its `dependencies` are the tasks its work is made from, so the order
of the work is these declarations and nothing else. `check()` asks the story's log whether the run has ended,
so a run that was stopped goes on where it stopped. `run()` starts the role's agent in a headless session.

What comes after a first run is the gate's: `node scripts/next.mjs <story> <section>` lists each fix and each
recheck that is due, and the two settle tasks dispatch what it lists until it lists none. A line that waits
for a ruling is the section lead's, and the last task asks for it.
"""

import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yaml
from winslow import ConfigOption, Parameter, Task, Workflow

ROOT = Path(__file__).resolve().parents[2]
ROUNDS = 6  # the most times the gate is asked in one settling
# what a dispatch of each role says: its step, and whether it takes captures of the built pages
ROLES = {
    "cartographer": ("maps", True),
    "map-auditor": ("maps", True),
    "section-writer": ("texts", False),
    "image-finder": ("images", False),
    "battle-implementor": ("phases", True),
    "battle-auditor": ("phases", True),
    "fact-checker": ("facts", False),
    "section-reviewer": ("facts", False),
}
CHECKERS = ("map-auditor", "fact-checker", "battle-auditor")  # a checker's open work is a recheck
BATTLE = ("battle-implementor", "battle-auditor")


class Section(Workflow):
    story = ConfigOption(identifier=True, help_text="The story's folder name.")
    section = ConfigOption(identifier=True, help_text="The section's three digits.")
    scratchpad = ConfigOption(default=".cache/scratch", help_text="Where each agent keeps its own files.")
    model = ConfigOption(default="claude-sonnet-5-5", help_text="The model of the session that starts an agent.")


# -- the story's files ----------------------------------------------------------


def story_dir(story):
    for file in (ROOT / "content").glob("**/story.yaml"):
        if file.parent.name == story:
            return file.parent
    raise FileNotFoundError(f"no story folder is named {story}")


def battles_with_phases(cfg):
    plans = list((story_dir(cfg.story) / ".plan").glob(f"{cfg.section}-*/battles.yaml"))
    rows = yaml.safe_load(plans[0].read_text()) if plans else []
    return [str(row["id"]) for row in rows or [] if row.get("phases") is True]


def events(cfg):
    """The events of the section's log, in the order they were written."""
    file = story_dir(cfg.story) / ".plan" / "log" / f"{cfg.section}.jsonl"
    if not file.exists():
        return []
    out = []
    for line in file.read_text().splitlines():
        try:
            out.append(json.loads(line))
        except ValueError:
            pass  # a line cut short
    return out


def ended(cfg, role, task, battle=None):
    return any(
        e.get("type") == "end" and e.get("role") == role and e.get("task") == task and e.get("battle") == battle
        for e in events(cfg)
    )


def node(cfg, script, *args):
    done = subprocess.run(["node", f"scripts/{script}", cfg.story, cfg.section, *args], cwd=ROOT, capture_output=True, text=True)
    return done.stdout.strip()


def gate(cfg, roles):
    """What scripts/next.mjs lists for the section: the fixes and rechecks of these roles, and the other lines."""
    work, rest = {"fix": [], "recheck": []}, []
    for line in node(cfg, "next.mjs").splitlines():
        found = re.match(r"^\d{3}\s+(fix|recheck|agree|rule|why)\s+(.*)$", line.strip())
        if not found:
            continue
        verb, role = found.group(1), (re.match(r"^([a-z-]+):", found.group(2)) or [None, None])[1]
        if verb in work:
            if role in roles and role not in work[verb]:
                work[verb].append(role)
        else:
            rest.append(line.strip())
    return work, rest


def dispatch(cfg, role, task, battle=None):
    """One run of one role, in a headless session that starts the agent and waits for it."""
    step, serve = ROLES[role]
    block = [f"story: {cfg.story}", f'section: "{cfg.section}"']
    if battle:
        block.append(f"battle: {battle}")
    block += [f"step: {step}", f"task: {task}", f"scratchpad: {cfg.scratchpad}/{cfg.section}-{role}{'-' + battle if battle else ''}"]
    if serve:
        block.append("serve: static")
    label = f"{step} {cfg.section} {role} {task}"
    prompt = (
        "You start one agent of this repo's pipeline and wait for it. Call the Agent tool once, in the foreground, with "
        f'subagent_type "{role}", description "{label}", and this prompt, as it is and with nothing added:\n\n'
        + "\n".join(block)
        + "\n\nWhen the agent returns, answer with the last line of its return and nothing else. Do no work of the "
        "agent yourself, edit nothing, and start no other agent. If the call is refused, answer with the refusal as it is."
    )
    subprocess.run(
        ["claude", "-p", prompt, "--model", cfg.model, "--allowedTools", "Agent Bash Read Edit Write Glob Grep WebFetch WebSearch", "--output-format", "json"],
        cwd=ROOT, capture_output=True, text=True, timeout=3 * 3600,
    )


# -- the tasks -------------------------------------------------------------------


class AgentTask(Task):
    """The first run of one role: done once the log holds its end."""

    role = None
    task = None

    class Meta:
        abstract = True

    @property
    def of_battle(self):
        return getattr(self, "battle", None)

    def run(self):
        dispatch(self.workflow_config, self.role, self.task, self.of_battle)

    def check(self):
        cfg = self.workflow_config
        if not ended(cfg, self.role, self.task, self.of_battle):
            return False
        line = subprocess.run(
            ["node", "scripts/fault.mjs", "line", cfg.story, cfg.section, "--by", self.role], cwd=ROOT, capture_output=True, text=True
        ).stdout.strip()
        self.fail_if(line.startswith("blocked"), f"{self.role} is blocked: {line}")
        return True


class SettleTask(Task):
    """Dispatches the fixes and rechecks the gate lists for its roles, until it lists none."""

    roles = ()
    after = ()  # the runs that must have ended before the gate's answer means anything: (role, task)

    class Meta:
        abstract = True

    def check(self):
        cfg = self.workflow_config
        if not all(ended(cfg, role, task) for role, task in self.after):
            return False
        work, _ = gate(cfg, self.roles)
        return not work["fix"] and not work["recheck"]

    def run(self):
        cfg = self.workflow_config
        battles = battles_with_phases(cfg)
        for _ in range(ROUNDS):
            work, _ = gate(cfg, self.roles)
            # the fixes first, since a fix is a change its checker then looks at
            verb = "fix" if work["fix"] else "recheck"
            if not work[verb]:
                return
            jobs = [
                (role, "recheck" if verb == "recheck" or role in CHECKERS else "fix", battle)
                for role in work[verb]
                for battle in (battles if role in BATTLE else [None])
            ]
            with ThreadPoolExecutor(max_workers=len(jobs)) as pool:
                list(pool.map(lambda job: dispatch(cfg, *job), jobs))


class Draw(AgentTask):
    role, task = "cartographer", "draw"


class AuditMap(AgentTask):
    role, task = "map-auditor", "audit"
    dependencies = Draw


class Write(AgentTask):
    # the writer needs the marker ids and not the final borders, so it does not wait for the map audit
    role, task = "section-writer", "write"
    dependencies = Draw


class SettleMaps(SettleTask):
    roles = ("cartographer", "map-auditor")
    after = (("map-auditor", "audit"),)
    dependencies = AuditMap


class BuildBattle(AgentTask):
    role, task = "battle-implementor", "build"
    battle = Parameter(values=battles_with_phases)
    dependencies = (SettleMaps, Write)


class AuditBattle(AgentTask):
    role, task = "battle-auditor", "audit"
    groups = "battles"
    battle = Parameter(values=battles_with_phases)
    dependencies = BuildBattle

    def depends_on(self, task):
        return task.battle == self.battle


class FindImages(AgentTask):
    role, task = "image-finder", "find"
    dependencies = Write


class FactCheck(AgentTask):
    # a caption and a marker's image are text the fact check reads, so the images are its input as the texts are
    role, task = "fact-checker", "check"
    dependencies = (Write, FindImages, AuditBattle)


class Review(AgentTask):
    role, task = "section-reviewer", "review"
    dependencies = FactCheck


class Settle(SettleTask):
    roles = tuple(ROLES)
    after = (("section-reviewer", "review"),)
    dependencies = (Review, SettleMaps)


class Rulings(Task):
    """What the gate still lists once every fix and recheck is done: the section lead's to answer."""

    dependencies = Settle

    def check(self):
        _, rest = gate(self.workflow_config, ())
        if rest:
            self.require_action("; ".join(rest))
        return True
