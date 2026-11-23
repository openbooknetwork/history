#!/usr/bin/env python3
"""Sum the token usage of an agent run from its transcripts.

Usage:
  python3 scripts/token-ledger.py <transcript dir or files...> [--roles <file>]

Each transcript is a JSONL file whose assistant messages carry a `usage` block. Usage is counted once per message id.
The optional roles file maps agent ids to role names: any line with "<role> <agent id>" pairs, such as
"cartographer a16117f30fee4286f". The output is a Markdown table per role, then a total.
"""
import glob
import json
import os
import re
import sys

KEYS = ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens']


def usage(path):
    seen = {}
    with open(path) as fh:
        for line in fh:
            try:
                o = json.loads(line)
            except ValueError:
                continue
            if not isinstance(o, dict):
                continue
            m = o.get('message') or {}
            if not isinstance(m, dict):
                continue
            u = m.get('usage')
            if u:
                seen[m.get('id') or len(seen)] = u
    return len(seen), [sum(u.get(k, 0) for u in seen.values()) for k in KEYS]


def main(argv):
    roles, paths = {}, []
    args = iter(argv)
    for a in args:
        if a == '--roles':
            for line in open(next(args)):
                for role, aid in re.findall(r'([\w-]+) (a[0-9a-f]{16})', line):
                    roles[aid] = role
        elif os.path.isdir(a):
            paths += sorted(glob.glob(os.path.join(a, '*.output')) + glob.glob(os.path.join(a, '*.jsonl')))
        else:
            paths.append(a)
    groups, total = {}, [0, 0, 0, 0]
    for p in paths:
        aid = re.search(r'(a[0-9a-f]{16})', os.path.basename(p))
        role = roles.get(aid.group(1), '?') if aid else os.path.basename(p)
        role = re.sub(r'-?\d{3}$', '', role) or role
        n, sums = usage(p)
        if not n:
            continue
        g = groups.setdefault(role, [0, 0, 0, 0, 0])
        g[0] += 1
        for i, v in enumerate(sums):
            g[i + 1] += v
            total[i] += v
    print('| Role | Agents | Input | Cache write | Cache read | Output |')
    print('|---|---|---|---|---|---|')
    for role, g in sorted(groups.items(), key=lambda kv: -sum(kv[1][1:])):
        print(f'| {role} | {g[0]} | ' + ' | '.join(f'{v:,}' for v in g[1:]) + ' |')
    print(f'| **total** | {sum(g[0] for g in groups.values())} | ' + ' | '.join(f'{v:,}' for v in total) + ' |')


if __name__ == '__main__':
    main(sys.argv[1:])
