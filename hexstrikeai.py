#!/usr/bin/env python3
"""
HexStrike AI CLI Wrapper

Provides a command-line interface for managing HexStrike AI services.

Usage:
    hexstrikeai server [--port PORT] [--host HOST] [--production] [--debug]
    hexstrikeai status
    hexstrikeai health
    hexstrikeai version
    hexstrikeai --help

Can also be run as:
    python -m hexstrikeai <command>
"""

import argparse
import os
import sys
import subprocess
import signal
import time
from pathlib import Path

# Version info
__version__ = "6.0.0"


def get_script_dir() -> Path:
    """Get the directory containing the HexStrike AI scripts."""
    return Path(__file__).parent.resolve()


def get_venv_python() -> Path:
    """Get the path to the virtual environment Python."""
    script_dir = get_script_dir()
    venv_python = script_dir / "hexstrike-env" / "bin" / "python"
    if venv_python.exists():
        return venv_python
    # Fallback to current Python
    return Path(sys.executable)


def check_server_health(host: str = "127.0.0.1", port: int = 8889) -> dict:
    """Check the health of the HexStrike AI server."""
    import urllib.request
    import urllib.error
    import json

    url = f"http://{host}:{port}/health"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {"status": "healthy", "data": data}
    except urllib.error.URLError as e:
        return {"status": "unreachable", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def cmd_server(args):
    """Start the HexStrike AI server."""
    script_dir = get_script_dir()
    server_script = script_dir / "hexstrike_server.py"
    venv_python = get_venv_python()

    if not server_script.exists():
        print(f"Error: Server script not found at {server_script}")
        sys.exit(1)

    # Build command
    cmd = [str(venv_python), str(server_script)]

    if args.port:
        cmd.extend(["--port", str(args.port)])

    if args.debug:
        cmd.append("--debug")

    # Warn about public exposure
    if args.host == "0.0.0.0":
        print("\033[33m⚠️  WARNING: Server will be exposed publicly on all interfaces!\033[0m")
        print("\033[33m   Consider using --host=127.0.0.1 for local-only access.\033[0m")
        print()

    if args.production:
        # Check for gunicorn using shutil.which for proper executable detection
        import shutil
        gunicorn_path = shutil.which("gunicorn")
        if gunicorn_path is None:
            # Try the venv path
            venv_gunicorn = script_dir / "hexstrike-env" / "bin" / "gunicorn"
            if venv_gunicorn.exists():
                gunicorn_path = str(venv_gunicorn)
        
        if gunicorn_path:
            print(f"🚀 Starting HexStrike AI in PRODUCTION mode on {args.host}:{args.port}...")
            cmd = [
                gunicorn_path,
                "--bind", f"{args.host}:{args.port}",
                "--workers", "4",
                "--timeout", "300",
                "--access-logfile", "-",
                "--error-logfile", "-",
                "hexstrike_server:app"
            ]
            os.chdir(script_dir)
        else:
            print("\033[33mgunicorn not installed, using development server\033[0m")
            print(f"🚀 Starting HexStrike AI Server on {args.host}:{args.port}...")
    else:
        print(f"🚀 Starting HexStrike AI Server on {args.host}:{args.port}...")

    # Handle graceful shutdown
    def signal_handler(signum, frame):
        print("\n\033[33mShutting down...\033[0m")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start the server
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\033[31mServer exited with error code {e.returncode}\033[0m")
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        print("\n\033[33mServer stopped.\033[0m")


def cmd_status(args):
    """Check the status of HexStrike AI services."""
    health = check_server_health(args.host, args.port)

    print("HexStrike AI Status")
    print("=" * 40)

    if health["status"] == "healthy":
        print(f"\033[32m✓ Server: Running on {args.host}:{args.port}\033[0m")
        data = health.get("data", {})
        if "version" in data:
            print(f"  Version: {data['version']}")
        if "uptime" in data:
            print(f"  Uptime: {data['uptime']}")
    elif health["status"] == "unreachable":
        print(f"\033[31m✗ Server: Not running on {args.host}:{args.port}\033[0m")
    else:
        print(f"\033[33m? Server: Error checking status\033[0m")
        print(f"  {health.get('error', 'Unknown error')}")


def cmd_health(args):
    """Perform a health check on the HexStrike AI server."""
    health = check_server_health(args.host, args.port)

    if health["status"] == "healthy":
        print("\033[32m✓ HexStrike AI is healthy\033[0m")
        data = health.get("data", {})
        for key, value in data.items():
            print(f"  {key}: {value}")
        sys.exit(0)
    else:
        print(f"\033[31m✗ HexStrike AI health check failed\033[0m")
        print(f"  Status: {health['status']}")
        if "error" in health:
            print(f"  Error: {health['error']}")
        sys.exit(1)


def cmd_version(args):
    """Show version information."""
    print(f"HexStrike AI v{__version__}")
    print("AI-Powered Cybersecurity Automation Platform")
    print()
    print(f"Python: {sys.version}")
    print(f"Script Directory: {get_script_dir()}")

    # Check if venv exists
    venv_python = get_venv_python()
    if venv_python.exists() and "hexstrike-env" in str(venv_python):
        print(f"Virtual Environment: \033[32m✓ Available\033[0m")
    else:
        print(f"Virtual Environment: \033[33m! Not set up (run install.sh)\033[0m")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        prog="hexstrikeai",
        description="HexStrike AI - AI-Powered Cybersecurity Automation Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  hexstrikeai server                   Start the server on default port (8889)
  hexstrikeai server --port 9999       Start on a custom port
  hexstrikeai server --production      Start with gunicorn (production mode)
  hexstrikeai status                   Check if server is running
  hexstrikeai health                   Perform health check
  hexstrikeai version                  Show version information
        """
    )

    parser.add_argument(
        "--version", "-V",
        action="version",
        version=f"HexStrike AI v{__version__}"
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Server command
    server_parser = subparsers.add_parser("server", help="Start the HexStrike AI server")
    server_parser.add_argument(
        "--port", "-p",
        type=int,
        default=8889,
        help="Port to run the server on (default: 8889)"
    )
    server_parser.add_argument(
        "--host", "-H",
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)"
    )
    server_parser.add_argument(
        "--production",
        action="store_true",
        help="Run in production mode with gunicorn"
    )
    server_parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode"
    )
    server_parser.set_defaults(func=cmd_server)

    # Status command
    status_parser = subparsers.add_parser("status", help="Check server status")
    status_parser.add_argument("--host", default="127.0.0.1", help="Server host")
    status_parser.add_argument("--port", type=int, default=8889, help="Server port")
    status_parser.set_defaults(func=cmd_status)

    # Health command
    health_parser = subparsers.add_parser("health", help="Perform health check")
    health_parser.add_argument("--host", default="127.0.0.1", help="Server host")
    health_parser.add_argument("--port", type=int, default=8889, help="Server port")
    health_parser.set_defaults(func=cmd_health)

    # Version command
    version_parser = subparsers.add_parser("version", help="Show version information")
    version_parser.set_defaults(func=cmd_version)

    # Parse arguments
    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(0)

    # Execute the command
    args.func(args)


if __name__ == "__main__":
    main()
