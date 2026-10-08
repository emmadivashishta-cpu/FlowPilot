# FlowPilot 🚀

> An AI-driven, enterprise-grade workflow automation engine built for the modern workforce. 

FlowPilot is a robust web application that leverages Generative AI (Groq API) to instantly architect complex multi-step workflows, dynamically assign them to relevant departments based on roles, and track execution logs—all wrapped in a secure, scalable, and responsive UI.

## 🌟 Key Features

- **AI-Powered Workflow Generation:** Input a single prompt (e.g., "Onboard a new software engineer"), and FlowPilot's AI generates a complete, structured multi-step workflow.
- **Human-in-the-Loop (Draft Mode):** Step-by-step editing interface allows users to modify, add, or delete AI-generated steps before approval.
- **Role-Based Access Control (RBAC):** Strict security ensuring only Admins, Creators, or users with matching departmental roles can execute workflows.
- **Dynamic Email Routing:** Automatically reads the required departments for a workflow and dispatches notification emails to real users assigned to those roles.
- **End-to-End Security:** Passwords hashed with `bcryptjs`, secure JWT-based authentication, fallback secret protection, and API Rate Limiting to prevent brute-force attacks.
- **Modern UI/UX:** Built with React and Tailwind CSS, featuring full Dark Mode support, smooth transitions, and responsive micro-animations.

## 🛠 Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Supabase)
- **AI Integration:** Groq API (LLaMA 3)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Emails:** Nodemailer
- **Deployment:** Render

## 🔗 Live Deployments

- **Frontend App:** [https://flowpilot-frontend-cyan.vercel.app/](https://flowpilot-frontend-cyan.vercel.app/)
- **Backend API:** [https://flowpilot-backend-vo5e.onrender.com/](https://flowpilot-backend-vo5e.onrender.com/)

## 🚀 Local Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/emmadivashishta-cpu/FlowPilot.git
   cd FlowPilot
   \`\`\`

2. **Setup Backend:**
   \`\`\`bash
   cd backend
   npm install
   # Create a .env file with SUPABASE_URL, SUPABASE_KEY, GROQ_API_KEY, JWT_SECRET, EMAIL_USER, EMAIL_PASS
   npm start
   \`\`\`

3. **Setup Frontend:**
   \`\`\`bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_URL=http://localhost:5000
   npm run dev
   \`\`\`

---
*Built with passion for hackathon excellence.*
