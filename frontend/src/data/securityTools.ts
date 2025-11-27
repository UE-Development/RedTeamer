/**
 * Comprehensive Security Tools Database
 * 150+ security tools organized by category
 * This file provides the complete tool list for the Tools page
 */

import type { Tool } from '../types';

// Network Reconnaissance & Scanning Tools (25+)
const networkTools: Tool[] = [
  { id: 'net-1', name: 'Nmap', category: 'network', version: '7.94', description: 'Advanced port scanning with custom NSE scripts and service detection', installed: true, parameters: [], usageCount: 245 },
  { id: 'net-2', name: 'Rustscan', category: 'network', version: '2.1.1', description: 'Ultra-fast port scanner with intelligent rate limiting', installed: true, parameters: [], usageCount: 189 },
  { id: 'net-3', name: 'Masscan', category: 'network', version: '1.3.2', description: 'High-speed Internet-scale port scanning with banner grabbing', installed: true, parameters: [], usageCount: 167 },
  { id: 'net-4', name: 'AutoRecon', category: 'network', version: '2.0.1', description: 'Comprehensive automated reconnaissance with 35+ parameters', installed: true, parameters: [], usageCount: 145 },
  { id: 'net-5', name: 'Amass', category: 'network', version: '3.23.3', description: 'Advanced subdomain enumeration and OSINT gathering', installed: true, parameters: [], usageCount: 234 },
  { id: 'net-6', name: 'Subfinder', category: 'network', version: '2.6.3', description: 'Fast passive subdomain discovery with multiple sources', installed: true, parameters: [], usageCount: 198 },
  { id: 'net-7', name: 'Fierce', category: 'network', version: '1.5.0', description: 'DNS reconnaissance and zone transfer testing', installed: true, parameters: [], usageCount: 87 },
  { id: 'net-8', name: 'DNSEnum', category: 'network', version: '1.3.1', description: 'DNS information gathering and subdomain brute forcing', installed: true, parameters: [], usageCount: 76 },
  { id: 'net-9', name: 'TheHarvester', category: 'network', version: '4.5.1', description: 'Email and subdomain harvesting from multiple sources', installed: true, parameters: [], usageCount: 187 },
  { id: 'net-10', name: 'ARP-Scan', category: 'network', version: '1.9.7', description: 'Network discovery using ARP requests', installed: true, parameters: [], usageCount: 65 },
  { id: 'net-11', name: 'NBTScan', category: 'network', version: '1.7.2', description: 'NetBIOS name scanning and enumeration', installed: true, parameters: [], usageCount: 54 },
  { id: 'net-12', name: 'RPCClient', category: 'network', version: '4.17', description: 'RPC enumeration and null session testing', installed: true, parameters: [], usageCount: 43 },
  { id: 'net-13', name: 'Enum4linux', category: 'network', version: '0.9.1', description: 'SMB enumeration with user, group, and share discovery', installed: true, parameters: [], usageCount: 98 },
  { id: 'net-14', name: 'Enum4linux-ng', category: 'network', version: '1.1.1', description: 'Advanced SMB enumeration with enhanced logging', installed: true, parameters: [], usageCount: 112 },
  { id: 'net-15', name: 'SMBMap', category: 'network', version: '1.8.5', description: 'SMB share enumeration and exploitation', installed: true, parameters: [], usageCount: 134 },
  { id: 'net-16', name: 'Responder', category: 'network', version: '3.1.3', description: 'LLMNR, NBT-NS and MDNS poisoner for credential harvesting', installed: true, parameters: [], usageCount: 89 },
  { id: 'net-17', name: 'NetExec', category: 'network', version: '1.1.0', description: 'Network service exploitation framework (formerly CrackMapExec)', installed: true, parameters: [], usageCount: 156 },
  { id: 'net-18', name: 'DNSRecon', category: 'network', version: '1.1.4', description: 'DNS enumeration and reconnaissance tool', installed: true, parameters: [], usageCount: 78 },
  { id: 'net-19', name: 'Netcat', category: 'network', version: '1.217', description: 'Networking utility for reading/writing network connections', installed: true, parameters: [], usageCount: 234 },
  { id: 'net-20', name: 'Hping3', category: 'network', version: '3.0', description: 'Network tool for packet crafting and analysis', installed: true, parameters: [], usageCount: 67 },
  { id: 'net-21', name: 'Tcpdump', category: 'network', version: '4.99', description: 'Command-line packet analyzer', installed: true, parameters: [], usageCount: 189 },
  { id: 'net-22', name: 'Wireshark', category: 'network', version: '4.2.0', description: 'Network protocol analyzer with GUI', installed: true, parameters: [], usageCount: 245 },
  { id: 'net-23', name: 'Tshark', category: 'network', version: '4.2.0', description: 'Terminal-based Wireshark', installed: true, parameters: [], usageCount: 134 },
  { id: 'net-24', name: 'Netdiscover', category: 'network', version: '0.10', description: 'Active/passive ARP reconnaissance tool', installed: true, parameters: [], usageCount: 87 },
  { id: 'net-25', name: 'Arping', category: 'network', version: '2.23', description: 'ARP level ping utility', installed: true, parameters: [], usageCount: 45 },
];

// Web Application Security Tools (40+)
const webTools: Tool[] = [
  { id: 'web-1', name: 'Nuclei', category: 'web', version: '3.1.4', description: 'Fast vulnerability scanner with 4000+ templates', installed: true, parameters: [], usageCount: 312 },
  { id: 'web-2', name: 'Gobuster', category: 'web', version: '3.6', description: 'Directory, file, and DNS enumeration with intelligent wordlists', installed: true, parameters: [], usageCount: 278 },
  { id: 'web-3', name: 'FFuf', category: 'web', version: '2.1.0', description: 'Fast web fuzzer with advanced filtering and parameter discovery', installed: true, parameters: [], usageCount: 256 },
  { id: 'web-4', name: 'SQLMap', category: 'web', version: '1.7.12', description: 'Advanced automatic SQL injection testing with tamper scripts', installed: true, parameters: [], usageCount: 145 },
  { id: 'web-5', name: 'Nikto', category: 'web', version: '2.5.0', description: 'Web server vulnerability scanner with comprehensive checks', installed: true, parameters: [], usageCount: 134 },
  { id: 'web-6', name: 'Dirsearch', category: 'web', version: '0.4.3', description: 'Advanced directory and file discovery with enhanced logging', installed: true, parameters: [], usageCount: 187 },
  { id: 'web-7', name: 'Feroxbuster', category: 'web', version: '2.10.1', description: 'Recursive content discovery with intelligent filtering', installed: true, parameters: [], usageCount: 198 },
  { id: 'web-8', name: 'Dirb', category: 'web', version: '2.22', description: 'Comprehensive web content scanner with recursive scanning', installed: true, parameters: [], usageCount: 112 },
  { id: 'web-9', name: 'HTTPx', category: 'web', version: '1.3.7', description: 'Fast HTTP probing and technology detection', installed: true, parameters: [], usageCount: 234 },
  { id: 'web-10', name: 'Katana', category: 'web', version: '1.0.4', description: 'Next-generation crawling and spidering with JavaScript support', installed: true, parameters: [], usageCount: 167 },
  { id: 'web-11', name: 'Hakrawler', category: 'web', version: '2.1', description: 'Fast web endpoint discovery and crawling', installed: true, parameters: [], usageCount: 145 },
  { id: 'web-12', name: 'Gau', category: 'web', version: '2.2.1', description: 'Get All URLs from multiple sources (Wayback, Common Crawl, etc.)', installed: true, parameters: [], usageCount: 178 },
  { id: 'web-13', name: 'Waybackurls', category: 'web', version: '0.1.0', description: 'Historical URL discovery from Wayback Machine', installed: true, parameters: [], usageCount: 156 },
  { id: 'web-14', name: 'WPScan', category: 'web', version: '3.8.25', description: 'WordPress security scanner with vulnerability database', installed: true, parameters: [], usageCount: 123 },
  { id: 'web-15', name: 'Arjun', category: 'web', version: '2.2.1', description: 'HTTP parameter discovery with intelligent fuzzing', installed: true, parameters: [], usageCount: 98 },
  { id: 'web-16', name: 'ParamSpider', category: 'web', version: '1.1', description: 'Parameter mining from web archives', installed: true, parameters: [], usageCount: 87 },
  { id: 'web-17', name: 'X8', category: 'web', version: '4.2.0', description: 'Hidden parameter discovery with advanced techniques', installed: true, parameters: [], usageCount: 76 },
  { id: 'web-18', name: 'Jaeles', category: 'web', version: '0.17.0', description: 'Advanced vulnerability scanning with custom signatures', installed: true, parameters: [], usageCount: 65 },
  { id: 'web-19', name: 'Dalfox', category: 'web', version: '2.9.1', description: 'Advanced XSS vulnerability scanning with DOM analysis', installed: true, parameters: [], usageCount: 134 },
  { id: 'web-20', name: 'Wafw00f', category: 'web', version: '2.2.0', description: 'Web application firewall fingerprinting', installed: true, parameters: [], usageCount: 89 },
  { id: 'web-21', name: 'TestSSL', category: 'web', version: '3.0.8', description: 'SSL/TLS configuration testing and vulnerability assessment', installed: true, parameters: [], usageCount: 112 },
  { id: 'web-22', name: 'SSLScan', category: 'web', version: '2.1.1', description: 'SSL/TLS cipher suite enumeration', installed: true, parameters: [], usageCount: 98 },
  { id: 'web-23', name: 'SSLyze', category: 'web', version: '5.1.3', description: 'Fast and comprehensive SSL/TLS configuration analyzer', installed: true, parameters: [], usageCount: 87 },
  { id: 'web-24', name: 'Whatweb', category: 'web', version: '0.5.5', description: 'Web technology identification with fingerprinting', installed: true, parameters: [], usageCount: 145 },
  { id: 'web-25', name: 'JWT-Tool', category: 'web', version: '2.2.6', description: 'JSON Web Token testing with algorithm confusion', installed: true, parameters: [], usageCount: 76 },
  { id: 'web-26', name: 'Wfuzz', category: 'web', version: '3.1.0', description: 'Web application fuzzer with advanced payload generation', installed: true, parameters: [], usageCount: 134 },
  { id: 'web-27', name: 'Commix', category: 'web', version: '3.9', description: 'Command injection exploitation tool with automated detection', installed: true, parameters: [], usageCount: 67 },
  { id: 'web-28', name: 'NoSQLMap', category: 'web', version: '0.7', description: 'NoSQL injection testing for MongoDB, CouchDB, etc.', installed: true, parameters: [], usageCount: 54 },
  { id: 'web-29', name: 'Tplmap', category: 'web', version: '0.5', description: 'Server-side template injection exploitation tool', installed: true, parameters: [], usageCount: 45 },
  { id: 'web-30', name: 'XSStrike', category: 'web', version: '3.1.5', description: 'Advanced XSS detection suite', installed: true, parameters: [], usageCount: 123 },
  { id: 'web-31', name: 'CORS-Scanner', category: 'web', version: '1.0', description: 'CORS misconfiguration scanner', installed: true, parameters: [], usageCount: 56 },
  { id: 'web-32', name: 'Subzy', category: 'web', version: '0.1.1', description: 'Subdomain takeover vulnerability checker', installed: true, parameters: [], usageCount: 67 },
  { id: 'web-33', name: 'meg', category: 'web', version: '0.3.0', description: 'Fetch many paths for many hosts', installed: true, parameters: [], usageCount: 78 },
  { id: 'web-34', name: 'unfurl', category: 'web', version: '0.4.3', description: 'Pull out bits of URLs provided on stdin', installed: true, parameters: [], usageCount: 45 },
  { id: 'web-35', name: 'qsreplace', category: 'web', version: '0.0.3', description: 'Query string parameter replacement', installed: true, parameters: [], usageCount: 89 },
  { id: 'web-36', name: 'uro', category: 'web', version: '0.0.5', description: 'URL filtering and deduplication', installed: true, parameters: [], usageCount: 67 },
  { id: 'web-37', name: 'anew', category: 'web', version: '0.1.1', description: 'Append new lines to files efficiently', installed: true, parameters: [], usageCount: 98 },
  { id: 'web-38', name: 'Burp Suite', category: 'web', version: '2024.1', description: 'Web security testing platform', installed: false, parameters: [], usageCount: 345 },
  { id: 'web-39', name: 'OWASP ZAP', category: 'web', version: '2.14.0', description: 'OWASP Zed Attack Proxy for security scanning', installed: true, parameters: [], usageCount: 234 },
  { id: 'web-40', name: 'Caido', category: 'web', version: '0.30', description: 'Modern web security testing toolkit', installed: false, parameters: [], usageCount: 56 },
];

// Binary Analysis & Reverse Engineering Tools (25+)
const binaryTools: Tool[] = [
  { id: 'bin-1', name: 'Ghidra', category: 'binary', version: '10.4', description: "NSA's software reverse engineering suite with headless analysis", installed: true, parameters: [], usageCount: 89 },
  { id: 'bin-2', name: 'Radare2', category: 'binary', version: '5.8.8', description: 'Advanced reverse engineering framework with comprehensive analysis', installed: true, parameters: [], usageCount: 76 },
  { id: 'bin-3', name: 'GDB', category: 'binary', version: '13.2', description: 'GNU Debugger with Python scripting and exploit development support', installed: true, parameters: [], usageCount: 112 },
  { id: 'bin-4', name: 'GDB-PEDA', category: 'binary', version: '1.2', description: 'Python Exploit Development Assistance for GDB', installed: true, parameters: [], usageCount: 67 },
  { id: 'bin-5', name: 'GDB-GEF', category: 'binary', version: '2023.10', description: 'GDB Enhanced Features for exploit development', installed: true, parameters: [], usageCount: 78 },
  { id: 'bin-6', name: 'IDA Free', category: 'binary', version: '8.3', description: 'Interactive disassembler with advanced analysis capabilities', installed: false, parameters: [], usageCount: 145 },
  { id: 'bin-7', name: 'Binary Ninja', category: 'binary', version: '4.0', description: 'Commercial reverse engineering platform', installed: false, parameters: [], usageCount: 56 },
  { id: 'bin-8', name: 'Binwalk', category: 'binary', version: '2.3.4', description: 'Firmware analysis and extraction tool with recursive extraction', installed: true, parameters: [], usageCount: 98 },
  { id: 'bin-9', name: 'ROPgadget', category: 'binary', version: '6.8', description: 'ROP/JOP gadget finder with advanced search capabilities', installed: true, parameters: [], usageCount: 54 },
  { id: 'bin-10', name: 'Ropper', category: 'binary', version: '1.13.8', description: 'ROP gadget finder and exploit development tool', installed: true, parameters: [], usageCount: 45 },
  { id: 'bin-11', name: 'One-Gadget', category: 'binary', version: '1.8.0', description: 'Find one-shot RCE gadgets in libc', installed: true, parameters: [], usageCount: 67 },
  { id: 'bin-12', name: 'Checksec', category: 'binary', version: '2.6.0', description: 'Binary security property checker with comprehensive analysis', installed: true, parameters: [], usageCount: 134 },
  { id: 'bin-13', name: 'Strings', category: 'binary', version: '2.41', description: 'Extract printable strings from binaries with filtering', installed: true, parameters: [], usageCount: 234 },
  { id: 'bin-14', name: 'Objdump', category: 'binary', version: '2.41', description: 'Display object file information with Intel syntax', installed: true, parameters: [], usageCount: 178 },
  { id: 'bin-15', name: 'Readelf', category: 'binary', version: '2.41', description: 'ELF file analyzer with detailed header information', installed: true, parameters: [], usageCount: 156 },
  { id: 'bin-16', name: 'XXD', category: 'binary', version: '1.10', description: 'Hex dump utility with advanced formatting', installed: true, parameters: [], usageCount: 89 },
  { id: 'bin-17', name: 'Hexdump', category: 'binary', version: '2.39', description: 'Hex viewer and editor with customizable output', installed: true, parameters: [], usageCount: 67 },
  { id: 'bin-18', name: 'Pwntools', category: 'binary', version: '4.11.1', description: 'CTF framework and exploit development library', installed: true, parameters: [], usageCount: 189 },
  { id: 'bin-19', name: 'Angr', category: 'binary', version: '9.2.77', description: 'Binary analysis platform with symbolic execution', installed: true, parameters: [], usageCount: 78 },
  { id: 'bin-20', name: 'Libc-Database', category: 'binary', version: '1.0', description: 'Libc identification and offset lookup tool', installed: true, parameters: [], usageCount: 56 },
  { id: 'bin-21', name: 'Pwninit', category: 'binary', version: '3.3.1', description: 'Automate binary exploitation setup', installed: true, parameters: [], usageCount: 45 },
  { id: 'bin-22', name: 'MSFVenom', category: 'binary', version: '6.3.52', description: 'Metasploit payload generator with advanced encoding', installed: true, parameters: [], usageCount: 167 },
  { id: 'bin-23', name: 'UPX', category: 'binary', version: '4.2.1', description: 'Executable packer/unpacker for binary analysis', installed: true, parameters: [], usageCount: 78 },
  { id: 'bin-24', name: 'Capstone', category: 'binary', version: '5.0.1', description: 'Disassembly framework', installed: true, parameters: [], usageCount: 89 },
  { id: 'bin-25', name: 'Keystone', category: 'binary', version: '0.9.2', description: 'Assembler framework', installed: true, parameters: [], usageCount: 67 },
];

// Cloud & Container Security Tools (20+)
const cloudTools: Tool[] = [
  { id: 'cloud-1', name: 'Prowler', category: 'cloud', version: '3.12.1', description: 'AWS/Azure/GCP security assessment with compliance checks', installed: true, parameters: [], usageCount: 67 },
  { id: 'cloud-2', name: 'Trivy', category: 'cloud', version: '0.48.3', description: 'Comprehensive vulnerability scanner for containers and IaC', installed: true, parameters: [], usageCount: 98 },
  { id: 'cloud-3', name: 'Kube-Hunter', category: 'cloud', version: '0.6.8', description: 'Kubernetes penetration testing with active/passive modes', installed: true, parameters: [], usageCount: 54 },
  { id: 'cloud-4', name: 'Scout Suite', category: 'cloud', version: '5.13.0', description: 'Multi-cloud security auditing for AWS, Azure, GCP, Alibaba Cloud', installed: true, parameters: [], usageCount: 56 },
  { id: 'cloud-5', name: 'CloudMapper', category: 'cloud', version: '2.10.0', description: 'AWS network visualization and security analysis', installed: true, parameters: [], usageCount: 45 },
  { id: 'cloud-6', name: 'Pacu', category: 'cloud', version: '1.5.3', description: 'AWS exploitation framework with comprehensive modules', installed: true, parameters: [], usageCount: 67 },
  { id: 'cloud-7', name: 'Clair', category: 'cloud', version: '4.7.2', description: 'Container vulnerability analysis with detailed CVE reporting', installed: true, parameters: [], usageCount: 78 },
  { id: 'cloud-8', name: 'Kube-Bench', category: 'cloud', version: '0.7.0', description: 'CIS Kubernetes benchmark checker with remediation', installed: true, parameters: [], usageCount: 89 },
  { id: 'cloud-9', name: 'Docker Bench Security', category: 'cloud', version: '1.6.0', description: 'Docker security assessment following CIS benchmarks', installed: true, parameters: [], usageCount: 67 },
  { id: 'cloud-10', name: 'Falco', category: 'cloud', version: '0.37.0', description: 'Runtime security monitoring for containers and Kubernetes', installed: true, parameters: [], usageCount: 56 },
  { id: 'cloud-11', name: 'Checkov', category: 'cloud', version: '3.1.67', description: 'Infrastructure as code security scanning', installed: true, parameters: [], usageCount: 123 },
  { id: 'cloud-12', name: 'Terrascan', category: 'cloud', version: '1.18.11', description: 'Infrastructure security scanner with policy-as-code', installed: true, parameters: [], usageCount: 98 },
  { id: 'cloud-13', name: 'CloudSploit', category: 'cloud', version: '3.0.0', description: 'Cloud security scanning and monitoring', installed: true, parameters: [], usageCount: 45 },
  { id: 'cloud-14', name: 'AWS CLI', category: 'cloud', version: '2.15.0', description: 'Amazon Web Services command line with security operations', installed: true, parameters: [], usageCount: 234 },
  { id: 'cloud-15', name: 'Azure CLI', category: 'cloud', version: '2.55.0', description: 'Microsoft Azure command line with security assessment', installed: true, parameters: [], usageCount: 156 },
  { id: 'cloud-16', name: 'GCloud', category: 'cloud', version: '456.0.0', description: 'Google Cloud Platform command line with security tools', installed: true, parameters: [], usageCount: 134 },
  { id: 'cloud-17', name: 'Kubectl', category: 'cloud', version: '1.28.4', description: 'Kubernetes command line with security context analysis', installed: true, parameters: [], usageCount: 198 },
  { id: 'cloud-18', name: 'Helm', category: 'cloud', version: '3.13.3', description: 'Kubernetes package manager with security scanning', installed: true, parameters: [], usageCount: 145 },
  { id: 'cloud-19', name: 'OPA', category: 'cloud', version: '0.60.0', description: 'Policy engine for cloud-native security and compliance', installed: true, parameters: [], usageCount: 67 },
  { id: 'cloud-20', name: 'Grype', category: 'cloud', version: '0.74.0', description: 'Container and filesystem vulnerability scanner', installed: true, parameters: [], usageCount: 89 },
];

// CTF & Forensics Tools (20+)
const ctfTools: Tool[] = [
  { id: 'ctf-1', name: 'Volatility3', category: 'ctf', version: '2.5.0', description: 'Next-generation memory forensics with enhanced analysis', installed: true, parameters: [], usageCount: 43 },
  { id: 'ctf-2', name: 'John the Ripper', category: 'ctf', version: '1.9.0', description: 'Password cracker with custom rules and advanced modes', installed: true, parameters: [], usageCount: 128 },
  { id: 'ctf-3', name: 'Hashcat', category: 'ctf', version: '6.2.6', description: 'GPU-accelerated password recovery with 300+ hash types', installed: true, parameters: [], usageCount: 156 },
  { id: 'ctf-4', name: 'Volatility', category: 'ctf', version: '2.6.1', description: 'Advanced memory forensics framework with comprehensive plugins', installed: true, parameters: [], usageCount: 67 },
  { id: 'ctf-5', name: 'Foremost', category: 'ctf', version: '1.5.7', description: 'File carving and data recovery with signature-based detection', installed: true, parameters: [], usageCount: 56 },
  { id: 'ctf-6', name: 'PhotoRec', category: 'ctf', version: '7.2', description: 'File recovery software with advanced carving capabilities', installed: true, parameters: [], usageCount: 45 },
  { id: 'ctf-7', name: 'TestDisk', category: 'ctf', version: '7.2', description: 'Disk partition recovery and repair tool', installed: true, parameters: [], usageCount: 34 },
  { id: 'ctf-8', name: 'Steghide', category: 'ctf', version: '0.5.1', description: 'Steganography detection and extraction with password support', installed: true, parameters: [], usageCount: 78 },
  { id: 'ctf-9', name: 'Stegsolve', category: 'ctf', version: '1.3', description: 'Steganography analysis tool with visual inspection', installed: true, parameters: [], usageCount: 89 },
  { id: 'ctf-10', name: 'Zsteg', category: 'ctf', version: '0.2.12', description: 'PNG/BMP steganography detection tool', installed: true, parameters: [], usageCount: 67 },
  { id: 'ctf-11', name: 'Outguess', category: 'ctf', version: '0.2.2', description: 'Universal steganographic tool for JPEG images', installed: true, parameters: [], usageCount: 45 },
  { id: 'ctf-12', name: 'ExifTool', category: 'ctf', version: '12.70', description: 'Metadata reader/writer for various file formats', installed: true, parameters: [], usageCount: 156 },
  { id: 'ctf-13', name: 'Scalpel', category: 'ctf', version: '2.0', description: 'File carving tool with configurable headers and footers', installed: true, parameters: [], usageCount: 34 },
  { id: 'ctf-14', name: 'Bulk Extractor', category: 'ctf', version: '2.0.6', description: 'Digital forensics tool for extracting features', installed: true, parameters: [], usageCount: 45 },
  { id: 'ctf-15', name: 'Autopsy', category: 'ctf', version: '4.21.0', description: 'Digital forensics platform with timeline analysis', installed: false, parameters: [], usageCount: 89 },
  { id: 'ctf-16', name: 'Sleuth Kit', category: 'ctf', version: '4.12.1', description: 'Collection of command-line digital forensics tools', installed: true, parameters: [], usageCount: 67 },
  { id: 'ctf-17', name: 'CyberChef', category: 'ctf', version: '10.5.0', description: 'Web-based analysis toolkit for encoding and encryption', installed: true, parameters: [], usageCount: 234 },
  { id: 'ctf-18', name: 'Hash-Identifier', category: 'ctf', version: '1.2', description: 'Hash type identification with confidence scoring', installed: true, parameters: [], usageCount: 98 },
  { id: 'ctf-19', name: 'RSATool', category: 'ctf', version: '1.0', description: 'RSA key analysis and common attack implementations', installed: true, parameters: [], usageCount: 56 },
  { id: 'ctf-20', name: 'RsaCtfTool', category: 'ctf', version: '4.0', description: 'RSA attack tool for CTF challenges', installed: true, parameters: [], usageCount: 78 },
];

// OSINT Tools (20+)
const osintTools: Tool[] = [
  { id: 'osint-1', name: 'TheHarvester', category: 'osint', version: '4.5.1', description: 'Email and subdomain harvesting from multiple sources', installed: true, parameters: [], usageCount: 187 },
  { id: 'osint-2', name: 'Sherlock', category: 'osint', version: '0.14.3', description: 'Username investigation across 400+ social networks', installed: true, parameters: [], usageCount: 92 },
  { id: 'osint-3', name: 'SpiderFoot', category: 'osint', version: '4.0', description: 'OSINT automation with 200+ modules', installed: false, parameters: [], usageCount: 34 },
  { id: 'osint-4', name: 'Maltego', category: 'osint', version: '4.6', description: 'Link analysis and data mining for OSINT investigations', installed: false, parameters: [], usageCount: 67 },
  { id: 'osint-5', name: 'Recon-ng', category: 'osint', version: '5.1.2', description: 'Web reconnaissance framework with modular architecture', installed: true, parameters: [], usageCount: 123 },
  { id: 'osint-6', name: 'Social-Analyzer', category: 'osint', version: '1.0.0', description: 'Social media analysis and OSINT gathering', installed: true, parameters: [], usageCount: 45 },
  { id: 'osint-7', name: 'Aquatone', category: 'osint', version: '1.7.0', description: 'Visual inspection of websites across hosts', installed: true, parameters: [], usageCount: 89 },
  { id: 'osint-8', name: 'Subjack', category: 'osint', version: '0.0.1', description: 'Subdomain takeover vulnerability checker', installed: true, parameters: [], usageCount: 67 },
  { id: 'osint-9', name: 'Shodan CLI', category: 'osint', version: '1.29.1', description: 'Internet-connected device search with advanced filtering', installed: true, parameters: [], usageCount: 156 },
  { id: 'osint-10', name: 'Censys', category: 'osint', version: '2.2.8', description: 'Internet asset discovery with certificate analysis', installed: true, parameters: [], usageCount: 98 },
  { id: 'osint-11', name: 'TruffleHog', category: 'osint', version: '3.63.1', description: 'Git repository secret scanning with entropy analysis', installed: true, parameters: [], usageCount: 134 },
  { id: 'osint-12', name: 'GitLeaks', category: 'osint', version: '8.18.0', description: 'Secret detection in git repositories', installed: true, parameters: [], usageCount: 112 },
  { id: 'osint-13', name: 'Holehe', category: 'osint', version: '1.61', description: 'Email OSINT tool checking account existence', installed: true, parameters: [], usageCount: 78 },
  { id: 'osint-14', name: 'Maigret', category: 'osint', version: '0.4.4', description: 'Collect a dossier on a person by username', installed: true, parameters: [], usageCount: 56 },
  { id: 'osint-15', name: 'Phoneinfoga', category: 'osint', version: '2.11.0', description: 'Phone number information gathering', installed: true, parameters: [], usageCount: 67 },
  { id: 'osint-16', name: 'h8mail', category: 'osint', version: '2.5.6', description: 'Email OSINT and breach hunting', installed: true, parameters: [], usageCount: 45 },
  { id: 'osint-17', name: 'Photon', category: 'osint', version: '1.3.2', description: 'Fast crawler designed for OSINT', installed: true, parameters: [], usageCount: 89 },
  { id: 'osint-18', name: 'Sublist3r', category: 'osint', version: '1.0', description: 'Subdomain enumeration tool', installed: true, parameters: [], usageCount: 156 },
  { id: 'osint-19', name: 'DNSDumpster', category: 'osint', version: '1.0', description: 'DNS reconnaissance and research', installed: true, parameters: [], usageCount: 98 },
  { id: 'osint-20', name: 'Whois', category: 'osint', version: '5.5.18', description: 'Domain registration information lookup', installed: true, parameters: [], usageCount: 234 },
];

// Password & Authentication Tools (12+)
const passwordTools: Tool[] = [
  { id: 'pwd-1', name: 'Hydra', category: 'password', version: '9.5', description: 'Network login cracker supporting 50+ protocols', installed: true, parameters: [], usageCount: 167 },
  { id: 'pwd-2', name: 'Medusa', category: 'password', version: '2.2', description: 'Speedy, parallel, modular login brute-forcer', installed: true, parameters: [], usageCount: 89 },
  { id: 'pwd-3', name: 'Patator', category: 'password', version: '0.9', description: 'Multi-purpose brute-forcer with advanced modules', installed: true, parameters: [], usageCount: 67 },
  { id: 'pwd-4', name: 'Evil-WinRM', category: 'password', version: '3.5', description: 'Windows Remote Management shell with PowerShell integration', installed: true, parameters: [], usageCount: 98 },
  { id: 'pwd-5', name: 'HashID', category: 'password', version: '3.1.4', description: 'Advanced hash algorithm identifier with confidence scoring', installed: true, parameters: [], usageCount: 112 },
  { id: 'pwd-6', name: 'Ophcrack', category: 'password', version: '3.8.0', description: 'Windows password cracker using rainbow tables', installed: false, parameters: [], usageCount: 45 },
  { id: 'pwd-7', name: 'Mimikatz', category: 'password', version: '2.2.0', description: 'Windows credential extraction tool', installed: true, parameters: [], usageCount: 156 },
  { id: 'pwd-8', name: 'LaZagne', category: 'password', version: '2.4.5', description: 'Credentials recovery project', installed: true, parameters: [], usageCount: 89 },
  { id: 'pwd-9', name: 'Responder', category: 'password', version: '3.1.3', description: 'LLMNR/NBT-NS/mDNS poisoner and credential capture', installed: true, parameters: [], usageCount: 134 },
  { id: 'pwd-10', name: 'Impacket', category: 'password', version: '0.11.0', description: 'Python network protocol toolkit', installed: true, parameters: [], usageCount: 178 },
  { id: 'pwd-11', name: 'Kerbrute', category: 'password', version: '1.0.3', description: 'Kerberos brute-force utility', installed: true, parameters: [], usageCount: 67 },
  { id: 'pwd-12', name: 'Crackmapexec', category: 'password', version: '5.4.0', description: 'Swiss army knife for pentesting networks', installed: true, parameters: [], usageCount: 145 },
];

/**
 * Get all security tools combined
 */
export const getAllTools = (): Tool[] => {
  return [
    ...networkTools,
    ...webTools,
    ...binaryTools,
    ...cloudTools,
    ...ctfTools,
    ...osintTools,
    ...passwordTools,
  ];
};

/**
 * Get tools by category
 */
export const getToolsByCategory = (category: string): Tool[] => {
  const allTools = getAllTools();
  if (category === 'all') return allTools;
  return allTools.filter(tool => tool.category === category);
};

/**
 * Get tool count by category
 */
export const getToolCounts = () => {
  return {
    total: getAllTools().length,
    network: networkTools.length,
    web: webTools.length,
    binary: binaryTools.length,
    cloud: cloudTools.length,
    ctf: ctfTools.length,
    osint: osintTools.length,
    password: passwordTools.length,
  };
};

/**
 * Export individual category arrays for flexibility
 */
export {
  networkTools,
  webTools,
  binaryTools,
  cloudTools,
  ctfTools,
  osintTools,
  passwordTools,
};
