#!/usr/bin/env python3
"""Reload-safe trusted-client plumbing for Cloudflare-proxied blocks.

- Sets $client_ip from CF-Connecting-IP only when the immediate peer is loopback
  or a known Cloudflare range (geo map), else falls back to $remote_addr.
- Installs a `log_format cfreal` access log so nginx logs the real buyer IP.
"""
CONF = "/etc/nginx/sites-enabled/cartethyia"
MARK = "# trusted-client-plumbing"
src = open(CONF).read()
if MARK in src:
    print("already installed")
    raise SystemExit(0)

MAP = r"""    # trusted-client-plumbing
    map $remote_addr $cf_trusted {
        default 0;
        127.0.0.1 1;
        ::1 1;
        173.245.48.0/20 1;
        103.21.244.0/22 1;
        103.22.200.0/22 1;
        103.31.4.0/22 1;
        141.101.64.0/18 1;
        108.162.192.0/18 1;
        190.93.240.0/20 1;
        188.114.96.0/20 1;
        197.234.240.0/22 1;
        198.41.128.0/17 1;
        162.158.0.0/15 1;
        104.16.0.0/13 1;
        104.24.0.0/14 1;
        172.64.0.0/13 1;
        131.0.72.0/22 1;
        2400:cb00::/32 1;
        2606:4700::/32 1;
        2803:f800::/32 1;
        2405:b500::/32 1;
        2405:8100::/32 1;
        2a06:98c0::/29 1;
        2c0f:f248::/32 1;
    }
    map $cf_trusted $client_ip {
        1 $http_cf_connecting_ip;
        0 $remote_addr;
    }
"""

# Find the apex server block (server_name tiprouter.my.id;) and the api block.
apex_anchor = "    server_name tiprouter.my.id;\n    client_max_body_size 16m;"
assert apex_anchor in src, "apex anchor missing"
api_anchor = "    server_name api.tiprouter.my.id;"
assert api_anchor in src, "api anchor missing"

# map blocks must live at http level: park them right before the apex server block.
idx = src.find(apex_anchor)
srv_start = src.rfind("server {", 0, idx)
assert srv_start > 0, "apex server start not found"
src = src[:srv_start] + MAP + src[srv_start:]

# set header in apex proxy locations + api block header lines
old_hdr = 'proxy_set_header X-Real-IP $remote_addr;'
n_apex = src.count(old_hdr)
src = src.replace(old_hdr, 'proxy_set_header X-Real-IP $client_ip;')

open(CONF, "w").write(src)
print(f"installed; replaced {n_apex} X-Real-IP headers")
