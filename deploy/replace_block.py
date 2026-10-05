#!/usr/bin/env python3
"""Replace the tiprouter.my.id 443 server block in the live nginx config."""
import sys

CONF = "/etc/nginx/sites-enabled/cartethyia"
BLOCK_FILE = "/home/ubuntu/newblock.txt"

src = open(CONF).read()
new_block = open(BLOCK_FILE).read().strip("\n")

# find server blocks by brace matching from each "server {" occurrence
starts = []
i = 0
while True:
    j = src.find("server {", i)
    if j == -1:
        break
    starts.append(j)
    i = j + 1

def block_end(s, start):
    depth = 0
    for k in range(start, len(s)):
        if s[k] == "{":
            depth += 1
        elif s[k] == "}":
            depth -= 1
            if depth == 0:
                return k + 1
    raise ValueError("unbalanced braces")

target = None
for s in starts:
    e = block_end(src, s)
    blk = src[s:e]
    if "server_name tiprouter.my.id;" in blk and "listen 443" in blk:
        if target is not None:
            sys.exit("ERROR: multiple matching blocks")
        target = (s, e)

if target is None:
    sys.exit("ERROR: tiprouter.my.id 443 block not found")

s, e = target
out = src[:s] + new_block + src[e:]
open(CONF, "w").write(out)
print(f"replaced block bytes {s}..{e} (old {e-s} chars -> new {len(new_block)} chars)")
