# 91 CrPC Analyzer AI Tool

A comprehensive AI-powered system for analyzing and processing criminal cases under Section 91 of the Code of Criminal Procedure (CrPC). This Next.js application provides law enforcement agencies with tools for case management, message classification, suspect analysis, and automated report generation.

## 🚀 Features

- **Case Management**: Complete case lifecycle management with suspect tracking
- **Message Classification**: AI-powered analysis of communications and evidence
- **Suspect Profiling**: Advanced suspect analysis and risk assessment
- **Analytics Dashboard**: Comprehensive insights and statistics
- **Email Workflow**: Automated email processing and notifications
- **SLA Monitoring**: Service level agreement tracking and compliance
- **Decoy Chat**: Simulated communication environment for investigations
- **Form Generator**: Dynamic form creation for data collection
- **File Analysis**: Advanced file upload and content analysis

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.4 with TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js, Recharts
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **File Processing**: Custom file analysis pipeline
- **AI Integration**: Custom AI analysis endpoints

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/91-crpc-analyzer-AI-tool.git
cd 91-crpc-analyzer-AI-tool
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon public key
4. Update your `.env.local` file

### Database Schema

The application expects the following main tables:
- `cases_s1` - Case management
- `suspects` - Suspect information
- `sessions_s2` - Investigation sessions
- `chats_s2` - Communication logs
- `classifications` - Message classifications

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
The easiest way to deploy is using the [Vercel Platform](https://vercel.com).

## 📖 Usage

1. **Dashboard**: Overview of all cases and analytics
2. **Case Management**: Create and manage criminal cases
3. **Message Classification**: Upload and analyze communications
4. **Analytics**: View comprehensive case statistics
5. **File Upload**: Process evidence files and documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

This application handles sensitive law enforcement data. Ensure proper security measures:

- Use environment variables for sensitive configuration
- Implement proper authentication and authorization
- Regular security audits and updates
- Secure database access and encryption

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- UI components from Radix UI
- Icons from Lucide React

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
![bot working2](https://github.com/user-attachments/assets/18eb34f0-82ef-433d-89fc-5a1ed6f19c84)
![bot Working1](https://github.com/user-attachments/assets/444aa07b-734b-456f-90ba-4990e8922945)


https://github.com/user-attachments/assets/d4630bd6-ced5-4c7e-b515-a0561e2e1e28

![winner ](https://github.com/user-attachments/assets/d1b70c0f-b177-4089-a17a-4b6dc0c9f0e0)
