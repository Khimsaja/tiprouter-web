#!/usr/bin/env python3
"""Temporary bypass: owner's current egress IPs until his DNS cache picks up Cloudflare."""
CONF = "/etc/nginx/sites-enabled/cartethyia"
src = open(CONF).read()
add = "    allow 158.140.170.3; # owner-bypass-temp\n    allow 158.140.170.111; # owner-bypass-temp\n"
if "owner-bypass-temp" in src:
    print("already present")
else:
    anchor = "    deny all;"
    assert src.count(anchor) >= 1, "deny anchor missing"
    src = src.replace(anchor, add + anchor, 1)
    open(CONF, "w").write(src)
    print("bypass added")
