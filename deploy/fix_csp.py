#!/usr/bin/env python3
"""Add the JSON-LD hash to the CSP script-src in the live nginx config."""
CONF = "/etc/nginx/sites-enabled/cartethyia"
OLD = "'sha256-61mMBtYOKsbjuKRZPwjlIwKU8WjJgANbsDJ/4KK8uxI=' https://telegram.org"
NEW = "'sha256-61mMBtYOKsbjuKRZPwjlIwKU8WjJgANbsDJ/4KK8uxI=' 'sha256-WS768P8nd580JE6vzh7f9xnC52OA0LVWeVvidaYePqA=' https://telegram.org"
src = open(CONF).read()
assert src.count(OLD) == 1, f"expected 1 occurrence, found {src.count(OLD)}"
open(CONF, "w").write(src.replace(OLD, NEW))
print("CSP updated")
