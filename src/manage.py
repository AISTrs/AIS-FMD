#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import threading
import time

import requests
from dotenv import load_dotenv


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "AIS_FMD.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


def thread_update_database():
    while True:
        # Make a POST request to the API endpoint to update the database
        try:
            BASE_URL = os.getenv('BASE_URL', '')
            response = requests.post(f'{BASE_URL}/api/update_database')
            if response.status_code == 200:
                print("Database updated successfully")
            else:
                print("Failed to update database")

            # Wait for 24 hours before the next update
            time.sleep(24 * 60 * 60)
        except Exception as ex:
            time.sleep(60 * 60)
            print("Failed to update database", ex)


if __name__ == "__main__":
    load_dotenv()

    update_thread = threading.Thread(target=thread_update_database)
    update_thread.daemon = True
    update_thread.start()

    main()
