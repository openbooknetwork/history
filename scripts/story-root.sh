#!/bin/zsh
# Builds one story on its own in .cache/<story>-root and serves its dist/ on a port, so a check takes seconds and
# other stories' pages are left out. Rerun it to rebuild. Run from anywhere:
#   scripts/story-root.sh <story id> <port> [root name]   (a root name of its own per agent building at the same time)
story=$1; port=$2
repo=${0:A:h:h}; R=$repo/.cache/${3:-$story}-root
if [[ -z $port || ! -f $repo/content/$story/story.yaml ]]; then echo "usage: scripts/story-root.sh <story id> <port> [root name]"; exit 2; fi
mkdir -p $R/content $R/.cache $R/dist
ln -sfn ../../../content/$story $R/content/$story
ln -sfn ../../plugins $R/plugins
ln -sfn ../../i18n $R/i18n
ln -sfn ../../../.cache/harita $R/.cache/harita   # the elevation tiles the main build downloaded
printf 'title: Open History Atlas\nlanguages: [en, tr]\ndefault_language: en\nstories: [%s]\ntheme: cool\n' $story > $R/site.yaml
(cd $R && node $repo/node_modules/@openhistoryatlas/harita/bin/harita.mjs build) || exit 1
pgrep -f "http.server $port" >/dev/null || (cd $R/dist && python3 -m http.server $port >/dev/null 2>&1 &)
echo "http://localhost:$port/$story/"
