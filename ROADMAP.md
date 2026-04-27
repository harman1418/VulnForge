# VulnForge — Complete Brief

## 🎯 What is VulnForge?
VulnForge is an AI-powered autonomous penetration testing SaaS platform built as a B.Tech final year project (Gulzar Group of Institutes, Roll No: 2232100, graduating 2026). It lets security professionals and students run automated security scans against targets, get AI-analyzed results, and download professional PDF reports — all from a web interface, no terminal needed.

## 🤔 Why Are We Building It?
Traditional penetration testing requires installing 15+ tools, knowing complex CLI commands, and manually analyzing results. VulnForge solves this by:
- Automating the entire pentest workflow in one click
- AI-analyzing results using Llama 3.1 8B (Cloudflare)
- Generating professional PDF reports automatically
- Making security testing accessible to non-experts
- Competing with paid platforms like pentest-tools.com ($99/mo)

## 🏗️ Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, hosted locally → Vercel |
| **Backend** | FastAPI (Python), Azure VM (Ubuntu, East Asia) |
| **Database** | MongoDB Atlas |
| **AI Engine** | Cloudflare Workers AI — Llama 3.1 8B |
| **Infrastructure** | Azure VM Standard B2ats v2 (842MB RAM + 2GB swap) |
| **Email** | Resend.com API (custom domain vulnforge.app) |

## ✅ What's Done So Far (57 Tasks completed)
- **Auth System**: Email OTP, JWT, Brute force prevention, Forgot/Reset password.
- **Full Scan Engine**: Light/Medium/Deep scans, WebSocket streaming, AI analysis, email notification.
- **16 Security Tools**: Port Scanner, Subdomain Finder, Whois, Headers, WAF, SSL, CVE, SQLi, XSS, WP Scan, URL Fuzzer, Password Auditor, Google Dorking, CORS, Subdomain Takeover, JWT.
- **PDF Report Generation**: A4 PDF with 8 sections, graphs, tables.
- **Scan Management**: Manage and view all previous scan reports.
- **Frontend UI**: Scramble animations, Toolrunner layout, dark/light toggle.

## ⏳ Todo List (13 Pending Tasks)


### 🔵 Report Improvements
- [x] Cookie security checker in report
- [x] OWASP/CWE mapping per finding
- [x] Scan stats (time taken, tests run)
- [x] Technology version detection

### ⚫ New Tools to Add
- [x] DNS Brute Force
- [x] Virtual Host Finder (ffuf)
- [x] API Endpoint Scanner
- [x] Clickjacking Tester
- [x] Drupal Scanner
- [x] Joomla Scanner
- [x] Email Harvester (theHarvester)
- [x] Shodan Lookup
- [x] Reverse IP Lookup
- [x] Technology Detector
- [x] Cookie Security Checker
- [x] Robots.txt Analyzer

### 🎨 Frontend
- [x] Fix ToolRunner mobile layout
- [x] Matrix rain background (Global, App Pages, and Auth)

### 🟣 Deployment & SaaS
- [ ] HTTPS — Nginx + Let's Encrypt
- [ ] Deploy frontend to Vercel
