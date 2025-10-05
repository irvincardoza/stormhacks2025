#!/usr/bin/env python3
"""
Test script to validate activity_processor output.
Run from: backend/pyton-backend/pyproj/
"""
import json
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pyproj.settings')
django.setup()

from pyapp.services.activity_processor import (
    load_activity_data,
    build_overview_data,
    build_timeline_data,
    compute_hourly_productivity,
    compute_context_switches,
)

def main():
    print("=" * 60)
    print("Testing Activity Processor")
    print("=" * 60)
    
    # Load activities
    print("\n1. Loading activity.jsonl...")
    activities = load_activity_data()
    print(f"   Loaded {len(activities)} activity records")
    
    if activities:
        first = activities[0]
        last = activities[-1]
        print(f"   First: {first['timestamp_iso']} - {first['app_name']}")
        print(f"   Last:  {last['timestamp_iso']} - {last['app_name']}")
    
    # Test hourly productivity
    print("\n2. Computing hourly productivity...")
    hourly = compute_hourly_productivity(activities)
    print(f"   Generated {len(hourly)} hourly points")
    if hourly:
        print(f"   Sample: {json.dumps(hourly[0], indent=2)}")
    
    # Test context switches
    print("\n3. Computing context switches...")
    switches = compute_context_switches(activities)
    print(f"   Generated {len(switches)} hourly switch counts")
    if switches:
        print(f"   Sample: {json.dumps(switches[0], indent=2)}")
    
    # Test overview
    print("\n4. Building overview data...")
    overview = build_overview_data(activities)
    print(f"   Productivity breakdown slices: {len(overview['productivityBreakdown']['slices'])}")
    print(f"   Hourly productivity points: {len(overview['hourlyProductivity']['points'])}")
    if overview['hourlyProductivity']['points']:
        print(f"   Sample point: {json.dumps(overview['hourlyProductivity']['points'][0], indent=2)}")
    
    # Test timeline
    print("\n5. Building timeline data...")
    timeline = build_timeline_data(activities)
    print(f"   Timeline points: {len(timeline['dailyTimeline']['points'])}")
    print(f"   Activity events: {len(timeline['activityEvents'])}")
    if timeline['dailyTimeline']['points']:
        print(f"   Sample point: {json.dumps(timeline['dailyTimeline']['points'][0], indent=2)}")
    if timeline['activityEvents']:
        print(f"   Sample event: {json.dumps(timeline['activityEvents'][-1], indent=2)}")
    
    print("\n" + "=" * 60)
    print("✓ Test complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
