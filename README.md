# 🛡️ VulnForge

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Security](https://img.shields.io/badge/Security-VAPT-red?style=for-the-badge)

**VulnForge** is an autonomous, AI-augmented Vulnerability Assessment and Penetration Testing (VAPT) platform. It bridges the gap between manual security auditing and automated defense by orchestrating industry-standard OSINT and scanning tools, utilizing AI for vulnerability triage, and dynamically generating enterprise-grade PDF reports.

---

## ✨ Key Features

* **🚀 Automated Reconnaissance & Scanning:** Seamlessly orchestrates background scans using Nmap, Nuclei, TheHarvester, Shodan InternetDB, and DNS brute-forcing tools.
* **🧠 AI-Powered Triage (Llama 3.1):** Integrates with Cloudflare Workers AI to autonomously analyze raw scan data, filter out false positives, map findings to the OWASP Top 10, and provide actionable remediation steps.
* **📑 Enterprise PDF Reporting:** Automatically compiles all intelligence (executive summaries, asset discovery, and CVEs) into highly professional, Big-4 style PDF reports using ReportLab.
* **🛠️ Crypto Lab:** A built-in, entirely client-side cryptography utility for secure, offline encoding (Base64, Hex, Binary, ROT13) and hashing (SHA-256, MD5) directly in the browser.
* **🔒 Secure Architecture:** Implements robust JWT-based authentication and stores scan histories securely in MongoDB Atlas.

---

## 🏗️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS / Vanilla CSS
* React Router DOM

**Backend:**
* Python (FastAPI & Uvicorn)
* ReportLab (Dynamic PDF Generation)
* Subprocess & Asyncio (Tool Orchestration)

**Databases & APIs:**
* MongoDB Atlas
* Cloudflare Workers AI (Meta Llama 3.1)
* Shodan API

---

## ⚖️ License & Copyright

**Copyright (c) 2026 Harmanjot Singh. All Rights Reserved.**

This project is **PROPRIETARY AND CONFIDENTIAL**. 
It is showcased here solely as a portfolio piece. 
**No permission is granted** to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software or its source code in any form without explicit written consent from the author. 

---

## ⚠️ Disclaimer

**Educational and Authorized Use Only.** 
VulnForge is designed strictly for educational purposes and authorized security auditing. The developer is not responsible for any misuse, damage, or illegal activities conducted with this tool. 

---

## 👨‍💻 Author

**Harmanjot Singh**
* Cybersecurity & VAPT Intern
* [LinkedIn Profile](https://www.linkedin.com/in/harmanjotcs)
