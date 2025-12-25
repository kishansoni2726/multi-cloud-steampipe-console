#!/usr/bin/env python3
# File: refresh_azure_config.py

import json
import subprocess
import os
from pathlib import Path

def get_azure_subscriptions():
    """Get all enabled Azure subscriptions"""
    try:
        result = subprocess.run(
            ['az', 'account', 'list', '--query', "[?state=='Enabled'].{id:id, name:name}", '-o', 'json'],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error getting subscriptions: {e}")
        return []

def sanitize_name(name):
    """Create a safe connection name"""
    safe = name.replace(' ', '_').replace('-', '_')
    safe = ''.join(c for c in safe if c.isalnum() or c == '_')
    return safe.lower()

def generate_config(subscriptions):
    """Generate Steampipe config for all subscriptions"""
    config_lines = [
        "# Auto-generated Azure configuration",
        f"# Generated on: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}",
        ""
    ]
    
    connection_names = []
    
    # Generate individual connections
    for sub in subscriptions:
        sub_id = sub['id']
        sub_name = sanitize_name(sub['name'])
        conn_name = f"azure_{sub_name}_{sub_id[:8]}"
        
        connection_names.append(conn_name)
        
        config_lines.extend([
            f'connection "{conn_name}" {{',
            f'  plugin          = "azure"',
            f'  subscription_id = "{sub_id}"',
            '}',
            ''
        ])
    
    # Generate aggregator
    connections_list = ', '.join([f'"{name}"' for name in connection_names])
    config_lines.extend([
        'connection "azure_all" {',
        '  plugin      = "azure"',
        '  type        = "aggregator"',
        f'  connections = [{connections_list}]',
        '}',
        ''
    ])
    
    return '\n'.join(config_lines)

def write_config(config_content):
    """Write config to Steampipe directory"""
    config_path = Path.home() / '.steampipe' / 'config' / 'azure.spc'
    config_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(config_path, 'w') as f:
        f.write(config_content)
    
    print(f"✓ Config written to {config_path}")

def restart_steampipe():
    """Restart Steampipe service"""
    print("Restarting Steampipe service...")
    
    subprocess.run(['steampipe', 'service', 'stop'], check=False)
    
    # Clear cache
    internal_path = Path.home() / '.steampipe' / 'internal'
    if internal_path.exists():
        for db_file in internal_path.glob('*.db'):
            db_file.unlink()
    
    subprocess.run(['steampipe', 'service', 'start'], check=True)
    print("✓ Steampipe restarted")

def main():
    print("=== Azure Subscription Auto-Discovery ===\n")
    
    # Get subscriptions
    print("Discovering Azure subscriptions...")
    subscriptions = get_azure_subscriptions()
    
    if not subscriptions:
        print("No enabled subscriptions found!")
        return
    
    print(f"Found {len(subscriptions)} subscription(s):")
    for sub in subscriptions:
        print(f"  - {sub['name']} ({sub['id']})")
    
    # Generate config
    print("\nGenerating Steampipe config...")
    config = generate_config(subscriptions)
    
    # Write config
    write_config(config)
    
    # Show config
    print("\nGenerated config:")
    print("-" * 50)
    print(config)
    print("-" * 50)
    
    # Restart Steampipe
    restart_steampipe()
    
    print("\n=== Auto-Discovery Complete ===")
    print("To refresh in the future, just run this script again!")

if __name__ == '__main__':
    main()