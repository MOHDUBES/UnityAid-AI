require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Check API key
let genAI;
if (process.env.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY.trim();
    console.log("API KEY LOADED:", "YES");
    console.log("KEY START:", key.substring(0, 4) + "...");
    console.log("KEY LENGTH:", key.length);
    genAI = new GoogleGenerativeAI(key);
} else {
    console.log("API KEY LOADED: NO (Check your .env file)");
}

let chatHistory = [];

function getSmartFallback(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes("food") || lower.includes("shelter")) {
        return `### 🍲 Organizing a Food Drive: A Step-by-Step Guide
**Goal:** To collect non-perishable food items for individuals and families experiencing food insecurity.

#### Phase 1: Planning & Preparation
- **Define Goals:** Target quantity (e.g., 1000 items) and identify beneficiary (local shelter).
- **Core Team:** Assign Project Lead, Logistics Coordinator, and Outreach Lead.
- **Location:** Choose secure collection points and a central sorting area.
- **Resources:** Arrange sturdy boxes, transportation (vans/trucks), and supplies.

#### Phase 2: Promotion & Recruitment
- **Marketing:** Create eye-catching flyers, social media kits, and email templates.
- **Partnerships:** Engage schools, faith-based groups, and local businesses.
- **Recruitment:** Define roles for attendants, sorters, and drivers.

#### Phase 3: Execution (The Food Drive Days)
- **Setup:** Staff collection points with clear signage and labeled bins.
- **Quality Check:** Sort items by category and discard expired/damaged goods.
- **Engagement:** Thank every donor and explain the impact.

#### Phase 4: Post-Event Follow-up
- **Delivery:** Transport all sorted donations to the beneficiary.
- **Recognition:** Send personalized thanks to volunteers, donors, and partners.
- **Reporting:** Announce total weight/items collected to the community.

**UnityAid Pro Tip:** Use digital tools like Google Forms for sign-ups and create a dedicated hashtag for social media!`;
    }

    if (lower.includes("blood") || lower.includes("donor")) {
        return `### 🩸 Emergency Blood Donor Coordination Guide
**Goal:** To organize a rapid-response blood donation drive to support local hospitals.

#### Phase 1: Preparation & Legal
- **Hospital Liaison:** Contact local blood banks to verify the most needed blood types (O-ve, B+ve).
- **Venue:** Ensure the location is hygienic, temperature-controlled, and accessible.
- **Permits:** Check for health and safety clearances required for medical events.

#### Phase 2: Recruitment & Awareness
- **Donor Registry:** Use UnityAid database to map donors within a 5-10km radius.
- **Campaign:** Launch "Save a Life" social media blast and radio announcements.
- **Incentives:** Organize healthy snacks and certificates for donors.

#### Phase 3: On-Site Coordination
- **Registration:** Professional intake process with health screening.
- **Donation Area:** Coordinate with medical staff for smooth flow.
- **Post-Donation:** Monitor donors for 15-20 minutes in a designated recovery zone.

#### Phase 4: Logistics & Storage
- **Cold Chain:** Ensure immediate transport of units to the blood bank in specialized coolers.
- **Data Update:** Record successful donations and update the community impact meter.

**UnityAid Coordinator:** Shall I initiate the broadcast to the registered donor list?`;
    }

    if (lower.includes("teach") || lower.includes("educat")) {
        return `### 📚 Weekend Education Support Strategy
**Goal:** To provide academic support and skill-building for underprivileged students.

#### Phase 1: Curriculum & Volunteers
- **Need Assessment:** Identify subjects (Math, Science, Coding) and student grade levels.
- **Recruitment:** Onboard subject-matter experts and university student volunteers.
- **Materials:** Prepare lesson plans, worksheets, and interactive tools.

#### Phase 2: Logistics & Setup
- **Space:** Secure classrooms at the Unity Community Center or local schools.
- **Supplies:** Ensure whiteboards, markers, stationery kits, and tablets are ready.
- **Safety:** Verify student registration and parent contact details.

#### Phase 3: Engagement & Delivery
- **Interactive Learning:** Use group activities and hands-on experiments.
- **Mentorship:** Pair older students with mentors for career guidance.
- **Feedback:** Conduct a quick quiz or feedback session at the end.

#### Phase 4: Impact Tracking
- **Progress Reports:** Track attendance and improvements in student confidence.
- **Appreciation:** Award "Student of the Week" certificates.

**UnityAid Coordinator:** I have the schedule ready. Shall I send reminders to the parents?`;
    }

    if (lower.includes("business plan") || lower.includes("startup")) {
        return `### 📊 Social Enterprise Business Plan: UnityAid Strategic Framework
**Focus:** Sustainable Community Impact & Scalability

#### 1. Executive Summary
- **Vision:** To bridge the gap between resources and community needs using AI-driven coordination.
- **Mission:** Empowering local volunteers with strategic tools for rapid response and long-term social impact.

#### 2. Market Analysis & Problem Statement
- **The Gap:** Lack of real-time communication between resource providers (donors) and seekers (NGOs).
- **Target Audience:** Non-profits, community leaders, corporate CSR departments, and individual changemakers.

#### 3. Strategic Solution: UnityAid AI
- **Smart Allocation:** Real-time matching of donor supplies to urgent needs.
- **Logistics Optimization:** Integrated route planning and volunteer scheduling.
- **Offline Resilience:** Ensuring coordination continues even in low-connectivity areas.

#### 4. SWOT Analysis
- **Strengths:** Rapid deployment, user-friendly mobile interface, high community trust.
- **Weaknesses:** Early-stage data collection for donor trends.
- **Opportunities:** Global scaling for disaster management, government integration.
- **Threats:** Regional data privacy variations, competition from generalized platforms.

#### 5. Financial & Impact Projection (Year 1)
- **Sustainability Model:** Tiered subscription for institutional users + grant-based funding for core features.
- **Impact KPI:** Target 10,000+ successful resource matches and 5,000+ registered active volunteers.

**UnityAid Coordinator:** This plan is ready to be exported. Would you like to deep-dive into the Financial Projection or the Marketing Strategy?`;
    }

    return `### 🛡️ UnityAid Strategic Coordination Plan
It sounds like you're working on a vital social impact project. Even in Offline Optimization Mode, I can provide a comprehensive framework for:

1. **Strategic Goal Setting:** Defining the core mission and impact metrics.
2. **Resource Mapping:** Tracking volunteers, vehicles, and essential supplies.
3. **Execution Roadmap:** Providing step-by-step phases for planning, promotion, and delivery.

**UnityAid AI:** Tell me more about your project (e.g., "Help me with medical supplies", "Plan a food drive", or "Create a business plan") and I will generate a detailed guide for you!`;
}

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Please enter a message." });
        if (!genAI) return res.status(500).json({ reply: "API key not configured." });

        console.log(`Incoming message: "${message}"`);

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: "You are UnityAid AI, an intelligent resource coordinator for the Google Solution Challenge 2026. Your mission is to assist in Smart Resource Allocation for social impact. You help users organize volunteer events, match skills to needs, and provide logistics advice. Keep responses professional, encouraging, and structured (using markdown). Focus on practical coordination and community support."
        });

        console.log(`Incoming message: "${message}"`);

        // Format history for @google/generative-ai
        const chat = model.startChat({
            history: chatHistory.map(h => ({
                role: h.role === "model" ? "model" : "user",
                parts: [{ text: h.parts[0].text }]
            })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Save to local history
        chatHistory.push({ role: "user", parts: [{ text: message }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });
        if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

        return res.json({ reply: text });

    } catch (error) {
        console.error("--- GENI API ERROR ---", error.message);
        const fallback = getSmartFallback(req.body.message);
        return res.json({ 
            reply: fallback 
        });
    }
});

const os = require('os');

// Detect Local IP for mobile testing
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

app.listen(port, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n-----------------------------------------');
    console.log(`  UnityAid AI is running!`);
    console.log(`  > Local:    http://localhost:${port}`);
    console.log(`  > Network:  http://${localIP}:${port}`);
    console.log('-----------------------------------------\n');
});