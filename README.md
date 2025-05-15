# OSFM Credentials Manager

OSFM Credentials Manager is a modern, open source, privacy-focused credentials manager built with React, TypeScript, and Tailwind CSS. It allows you to securely store, manage, and back up your sensitive credentials (API keys, SSH keys, GPG keys, passwords, and more) directly in your browser, with optional encrypted backup to your own Google Drive.

## Features

- **Local-First Security:**
  - All credentials are encrypted and stored locally in your browser using your master password. No data is sent to any external server.
- **Google Drive Backup:**
  - Optionally back up your encrypted credentials to your own Google Drive account. Restore them on any device, any time.
- **Multiple Credential Types:**
  - Store API keys, SSH keys, GPG keys, passwords, and other sensitive information.
- **Tagging & Search:**
  - Organize credentials with tags and quickly search/filter through them.
- **Import/Export:**
  - Securely import/export your credentials as encrypted files for easy migration or backup.
- **Dark/Light/AMOLED Themes:**
  - Beautiful, production-ready UI with full support for light, dark, and AMOLED black themes. Theme automatically adapts to your system preference.
- **Open Source & Auditable:**
  - 100% open source. Review, audit, and contribute to the codebase.
- **No Vendor Lock-in:**
  - Your data is always yours. Export or back up at any time.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/osfm-creds-ui.git
   cd osfm-creds-ui
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Google OAuth credentials if you want Google Drive backup.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open the app:**
   - Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- **First Run:**
  - Set a strong master password. This password is used to encrypt all your credentials.
- **Adding Credentials:**
  - Click "Add Credential" and fill in the details. You can add tags for easy organization.
- **Backup & Restore:**
  - Connect your Google Drive in Settings to enable cloud backup and restore.
- **Import/Export:**
  - Use the Import/Export page to move credentials between devices or keep offline backups.
- **Theme:**
  - Toggle between light, dark, and AMOLED black themes. The app will also follow your system theme automatically.

## Security & Privacy

- **Encryption:** All data is encrypted locally using your master password. The app never sees or stores your password or credentials.
- **Google Drive:** If enabled, backups are encrypted and stored in your own Google Drive. The app never has access to your Google account or files beyond the backup.
- **Open Source:** The code is fully open source and auditable by anyone.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, features, or improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Community & Support

- [Privacy Policy](./PRIVACY_POLICY.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
- For questions, open an issue or discussion on the repository.

---

**OSFM Credentials Manager** — Secure, private, and open source credential management for everyone.
