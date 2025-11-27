#!/usr/bin/env python3
"""
HexStrike AI Database Module - Persistent Storage for Settings and User Data

This module provides SQLite database support for:
- User settings and preferences
- Scan history and results
- Vulnerability tracking
- Project management
- Agent configurations

Version: 6.0.0
"""

import sqlite3
import json
import os
import logging
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, List
from contextlib import contextmanager
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)

# Default database path (relative to script directory)
DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hexstrike_data.db")

# Valid table names for stats query (whitelist for security)
VALID_TABLES = {'users', 'projects', 'scans', 'vulnerabilities', 'settings', 'audit_log', 'schema_version'}

# Current schema version - increment this when making schema changes
# This allows the database to only reinitialize when there are actual schema changes
CURRENT_SCHEMA_VERSION = 1

# Vulnerability status constants
VULN_STATUS_NEW = 'new'
VULN_STATUS_CONFIRMED = 'confirmed'
VULN_STATUS_FALSE_POSITIVE = 'false_positive'
VULN_STATUS_REMEDIATED = 'remediated'
VULN_STATUSES_REQUIRING_VERIFICATION = {VULN_STATUS_CONFIRMED, VULN_STATUS_FALSE_POSITIVE, VULN_STATUS_REMEDIATED}


class HexStrikeDatabase:
    """
    SQLite database manager for HexStrike AI persistent storage.
    
    Provides:
    - Settings storage (user preferences, tool configurations)
    - User data management (projects, scans, vulnerabilities)
    - Session management
    - Audit logging
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize the database connection.
        
        Args:
            db_path: Path to the SQLite database file. Defaults to hexstrike_data.db
        """
        self.db_path = db_path or DEFAULT_DB_PATH
        self._ensure_db_directory()
        self._initialize_database()
        logger.info(f"🗄️  Database initialized at: {self.db_path}")
    
    def _ensure_db_directory(self):
        """Ensure the database directory exists."""
        db_dir = os.path.dirname(self.db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.
        Ensures proper connection handling and cleanup.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def _get_stored_schema_version(self, conn) -> int:
        """
        Get the stored schema version from the database.
        
        Returns:
            The stored schema version, or 0 if not found (new database)
        """
        cursor = conn.cursor()
        try:
            # Check if schema_version table exists
            cursor.execute('''
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='schema_version'
            ''')
            if not cursor.fetchone():
                return 0
            
            cursor.execute('SELECT version FROM schema_version ORDER BY id DESC LIMIT 1')
            row = cursor.fetchone()
            return row['version'] if row else 0
        except sqlite3.Error:
            return 0
    
    def _update_schema_version(self, cursor, version: int):
        """Update the stored schema version."""
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schema_version (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            )
        ''')
        cursor.execute('''
            INSERT INTO schema_version (version, description) 
            VALUES (?, ?)
        ''', (version, f'Schema version {version} applied'))
    
    def _initialize_database(self):
        """
        Create or update the database schema.
        
        This method checks the current schema version and only applies changes
        when necessary to preserve existing data during updates.
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Check the current schema version
            stored_version = self._get_stored_schema_version(conn)
            
            if stored_version >= CURRENT_SCHEMA_VERSION:
                # Database is up to date, no changes needed
                logger.info(f"✅ Database schema is up to date (version {stored_version})")
                return
            
            if stored_version > 0:
                logger.info(f"🔄 Upgrading database schema from version {stored_version} to {CURRENT_SCHEMA_VERSION}")
            else:
                logger.info("🆕 Creating new database schema")
            
            # Settings table - Key-value store for application settings
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT,
                    value_type TEXT DEFAULT 'string',
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(category, key)
                )
            ''')
            
            # Users table - User account management
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT,
                    password_hash TEXT,
                    role TEXT DEFAULT 'user',
                    is_active BOOLEAN DEFAULT 1,
                    preferences TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            ''')
            
            # Sessions table - Active user sessions
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    session_token TEXT UNIQUE NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')
            
            # Projects table - Security assessment projects
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    client TEXT,
                    status TEXT DEFAULT 'active',
                    settings TEXT,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )
            ''')
            
            # Targets table - Scan targets
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS targets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER,
                    target TEXT NOT NULL,
                    target_type TEXT,
                    status TEXT DEFAULT 'pending',
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id)
                )
            ''')
            
            # Scans table - Scan history
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER,
                    target_id INTEGER,
                    scan_type TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    progress INTEGER DEFAULT 0,
                    current_phase TEXT,
                    tools_used TEXT,
                    results TEXT,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id),
                    FOREIGN KEY (target_id) REFERENCES targets(id)
                )
            ''')
            
            # Vulnerabilities table - Discovered vulnerabilities
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vulnerabilities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scan_id INTEGER,
                    project_id INTEGER,
                    title TEXT NOT NULL,
                    description TEXT,
                    severity TEXT,
                    cvss_score REAL,
                    cve_id TEXT,
                    cwe_id TEXT,
                    location TEXT,
                    proof_of_concept TEXT,
                    remediation TEXT,
                    status TEXT DEFAULT 'new',
                    discovered_by TEXT,
                    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    verified_at TIMESTAMP,
                    FOREIGN KEY (scan_id) REFERENCES scans(id),
                    FOREIGN KEY (project_id) REFERENCES projects(id)
                )
            ''')
            
            # Tool configurations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tool_configs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tool_name TEXT UNIQUE NOT NULL,
                    default_params TEXT,
                    custom_params TEXT,
                    is_enabled BOOLEAN DEFAULT 1,
                    priority INTEGER DEFAULT 50,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Agent configurations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agent_configs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_name TEXT UNIQUE NOT NULL,
                    agent_type TEXT,
                    settings TEXT,
                    is_enabled BOOLEAN DEFAULT 1,
                    priority INTEGER DEFAULT 50,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Audit log table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    resource_type TEXT,
                    resource_id INTEGER,
                    details TEXT,
                    ip_address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')
            
            # Create indexes for performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_scans_project ON scans(project_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_vulns_scan ON vulnerabilities(scan_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)')
            
            # Insert default settings if not exist
            self._insert_default_settings(cursor)
            
            # Update schema version
            self._update_schema_version(cursor, CURRENT_SCHEMA_VERSION)
            
            conn.commit()
            logger.info(f"✅ Database schema initialized successfully (version {CURRENT_SCHEMA_VERSION})")
    
    def _insert_default_settings(self, cursor):
        """Insert default application settings."""
        default_settings = [
            # Server settings
            ('server', 'host', '127.0.0.1', 'string', 'Server bind address'),
            ('server', 'port', '8889', 'integer', 'Server port'),
            ('server', 'debug', 'false', 'boolean', 'Debug mode'),
            ('server', 'auto_port', 'true', 'boolean', 'Automatic port fallback'),
            
            # Frontend settings
            ('frontend', 'port', '3000', 'integer', 'Frontend development server port'),
            ('frontend', 'theme', 'dark', 'string', 'UI theme (dark/light)'),
            
            # Security settings
            ('security', 'session_timeout', '3600', 'integer', 'Session timeout in seconds'),
            ('security', 'max_login_attempts', '5', 'integer', 'Maximum login attempts before lockout'),
            ('security', 'require_auth', 'false', 'boolean', 'Require authentication'),
            
            # Scan settings
            ('scan', 'default_timeout', '300', 'integer', 'Default scan timeout in seconds'),
            ('scan', 'max_concurrent', '5', 'integer', 'Maximum concurrent scans'),
            ('scan', 'auto_resume', 'true', 'boolean', 'Auto-resume interrupted scans'),
            
            # Agent settings
            ('agent', 'default_model', 'gpt-4', 'string', 'Default AI model for agents'),
            ('agent', 'max_tokens', '4096', 'integer', 'Maximum tokens for agent responses'),
            ('agent', 'temperature', '0.7', 'float', 'Agent response temperature'),
        ]
        
        for category, key, value, value_type, description in default_settings:
            cursor.execute('''
                INSERT OR IGNORE INTO settings (category, key, value, value_type, description)
                VALUES (?, ?, ?, ?, ?)
            ''', (category, key, value, value_type, description))
    
    # =========================================================================
    # Settings Management
    # =========================================================================
    
    def get_setting(self, category: str, key: str, default: Any = None) -> Any:
        """
        Get a setting value by category and key.
        
        Args:
            category: Setting category (e.g., 'server', 'security')
            key: Setting key
            default: Default value if setting not found
            
        Returns:
            The setting value, converted to the appropriate type
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT value, value_type FROM settings 
                WHERE category = ? AND key = ?
            ''', (category, key))
            
            row = cursor.fetchone()
            if row:
                return self._convert_value(row['value'], row['value_type'])
            return default
    
    def set_setting(self, category: str, key: str, value: Any, 
                    value_type: str = 'string', description: str = None) -> bool:
        """
        Set a setting value.
        
        Args:
            category: Setting category
            key: Setting key
            value: Setting value
            value_type: Value type (string, integer, float, boolean, json)
            description: Optional description
            
        Returns:
            True if successful
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Convert value to string for storage
            str_value = self._value_to_string(value, value_type)
            
            cursor.execute('''
                INSERT INTO settings (category, key, value, value_type, description, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(category, key) DO UPDATE SET
                    value = excluded.value,
                    value_type = excluded.value_type,
                    description = COALESCE(excluded.description, description),
                    updated_at = CURRENT_TIMESTAMP
            ''', (category, key, str_value, value_type, description))
            
            return True
    
    def get_all_settings(self, category: str = None) -> Dict[str, Dict[str, Any]]:
        """
        Get all settings, optionally filtered by category.
        
        Args:
            category: Optional category filter
            
        Returns:
            Dictionary of settings organized by category
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if category:
                cursor.execute('''
                    SELECT category, key, value, value_type, description 
                    FROM settings WHERE category = ?
                ''', (category,))
            else:
                cursor.execute('''
                    SELECT category, key, value, value_type, description 
                    FROM settings
                ''')
            
            settings = {}
            for row in cursor.fetchall():
                cat = row['category']
                if cat not in settings:
                    settings[cat] = {}
                settings[cat][row['key']] = {
                    'value': self._convert_value(row['value'], row['value_type']),
                    'type': row['value_type'],
                    'description': row['description']
                }
            
            return settings
    
    def _convert_value(self, value: str, value_type: str) -> Any:
        """Convert stored string value to appropriate Python type."""
        if value is None:
            return None
        
        try:
            if value_type == 'integer':
                return int(value)
            elif value_type == 'float':
                return float(value)
            elif value_type == 'boolean':
                return value.lower() in ('true', '1', 'yes')
            elif value_type == 'json':
                return json.loads(value)
            else:
                return value
        except (ValueError, json.JSONDecodeError):
            return value
    
    def _value_to_string(self, value: Any, value_type: str) -> str:
        """Convert Python value to string for storage."""
        if value is None:
            return None
        
        if value_type == 'json':
            return json.dumps(value)
        elif value_type == 'boolean':
            return 'true' if value else 'false'
        else:
            return str(value)
    
    # =========================================================================
    # User Management
    # =========================================================================
    
    def create_user(self, username: str, email: str = None, 
                    password_hash: str = None, role: str = 'user') -> int:
        """Create a new user and return the user ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
            ''', (username, email, password_hash, role))
            return cursor.lastrowid
    
    def get_user(self, user_id: int = None, username: str = None) -> Optional[Dict]:
        """Get user by ID or username."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if user_id:
                cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            elif username:
                cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
            else:
                return None
            
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_user_preferences(self, user_id: int, preferences: Dict) -> bool:
        """Update user preferences."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE users SET preferences = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (json.dumps(preferences), user_id))
            return cursor.rowcount > 0
    
    # =========================================================================
    # Project Management
    # =========================================================================
    
    def create_project(self, name: str, description: str = None, 
                       client: str = None, created_by: int = None) -> int:
        """Create a new project and return the project ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO projects (name, description, client, created_by)
                VALUES (?, ?, ?, ?)
            ''', (name, description, client, created_by))
            return cursor.lastrowid
    
    def get_projects(self, status: str = None) -> List[Dict]:
        """Get all projects, optionally filtered by status."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if status:
                cursor.execute('SELECT * FROM projects WHERE status = ?', (status,))
            else:
                cursor.execute('SELECT * FROM projects')
            
            return [dict(row) for row in cursor.fetchall()]
    
    def get_project(self, project_id: int) -> Optional[Dict]:
        """Get project by ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    # =========================================================================
    # Scan Management
    # =========================================================================
    
    def create_scan(self, project_id: int, target_id: int, scan_type: str) -> int:
        """Create a new scan record and return the scan ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO scans (project_id, target_id, scan_type, status, started_at)
                VALUES (?, ?, ?, 'running', CURRENT_TIMESTAMP)
            ''', (project_id, target_id, scan_type))
            return cursor.lastrowid
    
    def update_scan_progress(self, scan_id: int, progress: int, 
                             current_phase: str = None, tools_used: List[str] = None) -> bool:
        """Update scan progress."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE scans SET 
                    progress = ?,
                    current_phase = COALESCE(?, current_phase),
                    tools_used = COALESCE(?, tools_used)
                WHERE id = ?
            ''', (progress, current_phase, 
                  json.dumps(tools_used) if tools_used else None, scan_id))
            return cursor.rowcount > 0
    
    def complete_scan(self, scan_id: int, status: str, results: Dict = None) -> bool:
        """Mark a scan as completed."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE scans SET 
                    status = ?,
                    progress = 100,
                    results = ?,
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (status, json.dumps(results) if results else None, scan_id))
            return cursor.rowcount > 0
    
    def get_scan_history(self, project_id: int = None, limit: int = 50) -> List[Dict]:
        """Get scan history, optionally filtered by project."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if project_id:
                cursor.execute('''
                    SELECT * FROM scans WHERE project_id = ? 
                    ORDER BY created_at DESC LIMIT ?
                ''', (project_id, limit))
            else:
                cursor.execute('''
                    SELECT * FROM scans ORDER BY created_at DESC LIMIT ?
                ''', (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    # =========================================================================
    # Vulnerability Management
    # =========================================================================
    
    def add_vulnerability(self, scan_id: int, project_id: int, title: str,
                          description: str = None, severity: str = 'medium',
                          cvss_score: float = None, cve_id: str = None,
                          cwe_id: str = None, location: str = None,
                          proof_of_concept: str = None, discovered_by: str = None) -> int:
        """Add a new vulnerability and return its ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO vulnerabilities 
                (scan_id, project_id, title, description, severity, cvss_score,
                 cve_id, cwe_id, location, proof_of_concept, discovered_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (scan_id, project_id, title, description, severity, cvss_score,
                  cve_id, cwe_id, location, proof_of_concept, discovered_by))
            return cursor.lastrowid
    
    def get_vulnerabilities(self, project_id: int = None, scan_id: int = None,
                            severity: str = None) -> List[Dict]:
        """Get vulnerabilities with optional filters."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = 'SELECT * FROM vulnerabilities WHERE 1=1'
            params = []
            
            if project_id:
                query += ' AND project_id = ?'
                params.append(project_id)
            if scan_id:
                query += ' AND scan_id = ?'
                params.append(scan_id)
            if severity:
                query += ' AND severity = ?'
                params.append(severity)
            
            query += ' ORDER BY cvss_score DESC, discovered_at DESC'
            cursor.execute(query, params)
            
            return [dict(row) for row in cursor.fetchall()]
    
    def update_vulnerability_status(self, vuln_id: int, status: str) -> bool:
        """
        Update vulnerability status.
        
        Args:
            vuln_id: Vulnerability ID
            status: One of: new, confirmed, false_positive, remediated
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Use constants for status comparison
            verified_at = datetime.now().isoformat() if status in VULN_STATUSES_REQUIRING_VERIFICATION else None
            
            cursor.execute('''
                UPDATE vulnerabilities SET status = ?, verified_at = ?
                WHERE id = ?
            ''', (status, verified_at, vuln_id))
            return cursor.rowcount > 0
    
    # =========================================================================
    # Agent Configuration
    # =========================================================================
    
    def get_agent_config(self, agent_name: str) -> Optional[Dict]:
        """Get agent configuration."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM agent_configs WHERE agent_name = ?', (agent_name,))
            row = cursor.fetchone()
            if row:
                config = dict(row)
                config['settings'] = json.loads(config['settings']) if config['settings'] else {}
                return config
            return None
    
    def set_agent_config(self, agent_name: str, agent_type: str,
                         settings: Dict = None, is_enabled: bool = True) -> bool:
        """Set or update agent configuration."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO agent_configs (agent_name, agent_type, settings, is_enabled, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(agent_name) DO UPDATE SET
                    agent_type = excluded.agent_type,
                    settings = excluded.settings,
                    is_enabled = excluded.is_enabled,
                    updated_at = CURRENT_TIMESTAMP
            ''', (agent_name, agent_type, json.dumps(settings) if settings else None, is_enabled))
            return True
    
    def get_all_agent_configs(self, enabled_only: bool = False) -> List[Dict]:
        """Get all agent configurations."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if enabled_only:
                cursor.execute('SELECT * FROM agent_configs WHERE is_enabled = 1 ORDER BY priority')
            else:
                cursor.execute('SELECT * FROM agent_configs ORDER BY priority')
            
            configs = []
            for row in cursor.fetchall():
                config = dict(row)
                config['settings'] = json.loads(config['settings']) if config['settings'] else {}
                configs.append(config)
            
            return configs
    
    # =========================================================================
    # Audit Logging
    # =========================================================================
    
    def log_action(self, action: str, resource_type: str = None,
                   resource_id: int = None, details: str = None,
                   user_id: int = None, ip_address: str = None) -> int:
        """Log an action to the audit log."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, action, resource_type, resource_id, details, ip_address))
            return cursor.lastrowid
    
    def get_audit_log(self, action: str = None, resource_type: str = None,
                      limit: int = 100) -> List[Dict]:
        """Get audit log entries."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = 'SELECT * FROM audit_log WHERE 1=1'
            params = []
            
            if action:
                query += ' AND action = ?'
                params.append(action)
            if resource_type:
                query += ' AND resource_type = ?'
                params.append(resource_type)
            
            query += ' ORDER BY created_at DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    # =========================================================================
    # Database Maintenance
    # =========================================================================
    
    def get_schema_version(self) -> int:
        """
        Get the current schema version of the database.
        
        Returns:
            The current schema version, or 0 if not yet initialized
        """
        with self.get_connection() as conn:
            return self._get_stored_schema_version(conn)
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            stats = {
                'database_path': self.db_path,
                'database_size_bytes': os.path.getsize(self.db_path) if os.path.exists(self.db_path) else 0,
                'schema_version': self._get_stored_schema_version(conn),
                'current_schema_version': CURRENT_SCHEMA_VERSION,
            }
            
            # Use the predefined whitelist of valid table names for security
            for table in VALID_TABLES:
                # Table name is validated against whitelist, safe to use in query
                try:
                    cursor.execute(f'SELECT COUNT(*) as count FROM {table}')
                    stats[f'{table}_count'] = cursor.fetchone()['count']
                except sqlite3.OperationalError:
                    # Table may not exist yet
                    stats[f'{table}_count'] = 0
            
            return stats
    
    def vacuum(self):
        """Optimize the database by running VACUUM."""
        with self.get_connection() as conn:
            conn.execute('VACUUM')
        logger.info("Database vacuumed successfully")
    
    def backup(self, backup_path: str = None) -> str:
        """
        Create a backup of the database.
        
        Args:
            backup_path: Path for the backup file. Defaults to timestamped backup.
            
        Returns:
            Path to the backup file
        """
        if backup_path is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = f"{self.db_path}.backup_{timestamp}"
        
        shutil.copy2(self.db_path, backup_path)
        logger.info(f"Database backup created: {backup_path}")
        return backup_path


# Singleton instance for easy access
_db_instance: Optional[HexStrikeDatabase] = None


def get_database(db_path: str = None) -> HexStrikeDatabase:
    """
    Get or create the database singleton instance.
    
    Args:
        db_path: Optional path to database file
        
    Returns:
        HexStrikeDatabase instance
    """
    global _db_instance
    if _db_instance is None:
        _db_instance = HexStrikeDatabase(db_path)
    return _db_instance


def init_database(db_path: str = None) -> HexStrikeDatabase:
    """
    Initialize a new database instance (replaces existing singleton).
    
    Args:
        db_path: Optional path to database file
        
    Returns:
        HexStrikeDatabase instance
    """
    global _db_instance
    _db_instance = HexStrikeDatabase(db_path)
    return _db_instance


# CLI interface for database management
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="HexStrike AI Database Management")
    parser.add_argument("--init", action="store_true", help="Initialize the database")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    parser.add_argument("--vacuum", action="store_true", help="Optimize the database")
    parser.add_argument("--backup", type=str, help="Create a backup to the specified path")
    parser.add_argument("--db-path", type=str, help="Custom database path")
    parser.add_argument("--list-settings", action="store_true", help="List all settings")
    parser.add_argument("--set", nargs=3, metavar=('CATEGORY', 'KEY', 'VALUE'),
                        help="Set a setting value")
    parser.add_argument("--get", nargs=2, metavar=('CATEGORY', 'KEY'),
                        help="Get a setting value")
    
    args = parser.parse_args()
    
    # Configure logging for CLI
    logging.basicConfig(level=logging.INFO, format='%(message)s')
    
    db = get_database(args.db_path)
    
    if args.init:
        print("✅ Database initialized successfully")
    
    if args.stats:
        stats = db.get_database_stats()
        print("\n📊 Database Statistics:")
        print("-" * 40)
        for key, value in stats.items():
            if key == 'database_size_bytes':
                value = f"{value / 1024:.2f} KB"
            print(f"  {key}: {value}")
    
    if args.vacuum:
        db.vacuum()
        print("✅ Database optimized")
    
    if args.backup:
        backup_path = db.backup(args.backup)
        print(f"✅ Backup created: {backup_path}")
    
    if args.list_settings:
        settings = db.get_all_settings()
        print("\n⚙️  All Settings:")
        print("-" * 60)
        for category, items in settings.items():
            print(f"\n[{category}]")
            for key, info in items.items():
                print(f"  {key} = {info['value']} ({info['type']})")
                if info['description']:
                    print(f"    # {info['description']}")
    
    if args.set:
        category, key, value = args.set
        db.set_setting(category, key, value)
        print(f"✅ Set {category}.{key} = {value}")
    
    if args.get:
        category, key = args.get
        value = db.get_setting(category, key)
        print(f"{category}.{key} = {value}")
