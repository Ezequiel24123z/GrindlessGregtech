#!/usr/bin/python3
import datetime
import json
import os
from pathlib import Path
import subprocess
import sys

LIMIT = 90 * 1024 ** 3
STATE = Path('/var/lib/grindless/egress-budget.json')
MONTH = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
TABLE = 'grindless_egress'


def save(used, running):
    temporary = STATE.with_suffix('.tmp')
    with temporary.open('w') as stream:
        json.dump({'month': MONTH, 'used': used, 'running': running}, stream)
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(STATE)
    descriptor = os.open(STATE.parent, os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def current():
    result = subprocess.run(
        ['nft', '-j', 'list', 'quota', 'inet', TABLE, 'monthly'],
        check=True, capture_output=True, text=True)
    quotas = [entry['quota'] for entry in json.loads(result.stdout)['nftables'] if 'quota' in entry]
    if len(quotas) != 1:
        raise RuntimeError('Expected exactly one monthly egress quota')
    return min(LIMIT, quotas[0]['used'])


def install(used, replace):
    rules = f'delete table inet {TABLE}\n' if replace else ''
    rules += f'''add table inet {TABLE}
add quota inet {TABLE} monthly {{ over {LIMIT} bytes used {used} bytes; }}
add chain inet {TABLE} output {{ type filter hook output priority 10; policy accept; }}
add rule inet {TABLE} output oifname "lo" accept
add rule inet {TABLE} output ip daddr {{ 169.254.169.254, 168.63.129.16, 10.43.0.0/16 }} accept
add rule inet {TABLE} output quota name "monthly" drop
'''
    subprocess.run(['nft', '-c', '-f', '-'], input=rules, text=True, check=True)
    save(used, True)
    subprocess.run(['nft', '-f', '-'], input=rules, text=True, check=True)


action = sys.argv[1]
state = json.loads(STATE.read_text()) if STATE.exists() else {'month': MONTH, 'used': 0, 'running': False}
if action == 'start':
    used = state['used'] if state['month'] == MONTH else 0
    # Fail closed after an unclean shutdown: the unsaved network usage is unknown.
    if state['running'] and state['month'] == MONTH:
        used = LIMIT
    install(used, False)
elif action == 'sync':
    if state['month'] != MONTH:
        install(0, True)
    else:
        save(current(), True)
elif action == 'stop':
    used = current()
    save(used if state['month'] == MONTH else 0, False)
    subprocess.run(['nft', 'delete', 'table', 'inet', TABLE], check=True)
elif action == 'reload':
    install(current(), True)
else:
    raise ValueError(f'Unknown action: {action}')
