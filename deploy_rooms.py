#!/usr/bin/env python3
import sys
import subprocess

# Read the CreateRooms.jsx file
with open('dasboard/src/pages/CreateRooms.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Write to server using SSH
ssh_cmd = [
    'ssh', 'root@139.84.211.200',
    'python3', '-c',
    f'''
import sys
content = """{content.replace('"""', '\\"\\"\\"')}"""
with open("/var/www/resort/Resort_first/dasboard/src/pages/CreateRooms.jsx", "w", encoding="utf-8") as f:
    f.write(content)
'''
]

subprocess.run(ssh_cmd)

