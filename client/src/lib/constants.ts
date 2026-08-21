import type { GetProjectsResponse, Project } from "@tsa/shared";


export const CATEGORIES = [
	"All",
	"Product Design",
	"Full Stack Web Development",
	"Data Analysis",
	"Cyber Security",
] as const;

export const SORT_OPTIONS = ["Most Recent", "Oldest"] as const;
export type SortOrder = (typeof SORT_OPTIONS)[number];

export type ProjectsPage = NonNullable<GetProjectsResponse["body"]>;

function sortProjects(projects: Project[], sort: SortOrder): Project[] {
	const sorted = [...projects];
	const key = (project: Project) => {
		const time = project.createdAt ? Date.parse(project.createdAt) : NaN;
		return Number.isNaN(time) ? Number(project._id) || 0 : time;
	};
	sorted.sort((a, b) =>
		sort === "Oldest" ? key(a) - key(b) : key(b) - key(a),
	);
	return sorted;
}

/** Simulates a server-side `GET /projects` (filter + sort + paginate) using mock data. */
export function getProjectsPage({
	page,
	limit,
	category = "All",
	sort = "Most Recent",
}: {
	page: number;
	limit: number;
	category?: string;
	sort?: SortOrder;
}): ProjectsPage {
	const filtered =
		category && category !== "All"
			? MOCK_PROJECTS.filter((project) => project.category === category)
			: MOCK_PROJECTS;

	const sorted = sortProjects(filtered, sort);

	const safePage = Math.max(1, Math.floor(page));
	const start = (safePage - 1) * limit;
	return {
		items: sorted.slice(start, start + limit),
		page: safePage,
		total: filtered.length,
		totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
	};
}

export const MOCK_PROJECTS: Project[] = [
	{
		_id: "1",
		slug: "1918-deluxe-auto-insurance",
		title: "1918 Deluxe Auto Insurance",
		category: "Cyber Security",
		cohort: "June 2026 Cohort",
		summary:
			"A compliance dashboard that monitors policy data access and flags anomalies.",
		description:
			"1918 Deluxe Auto Insurance is a security monitoring platform built for an auto insurance firm. It centralizes policy data access logs, flags suspicious activity in real time, and keeps the organization aligned with regulatory compliance standards.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Tunde Bakare", role: "Security Analyst" },
			{ name: "Chiamaka Nwosu", role: "Cybersecurity Engineer" },
			{ name: "Ibrahim Musa", role: "Data Analyst" },
			{ name: "Grace Okafor", role: "Product Designer" },
		],
		links: { url: "https://github.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "2",
		slug: "streamline-workflow-ai-powered-solution",
		title: "Streamline Work Flow With AI Powered Solution",
		category: "Product Design",
		cohort: "June 2026 Cohort",
		summary:
			"An AI-assisted workflow tool that cuts repetitive tasks and connects teams.",
		description:
			"Streamline is an AI-powered workflow solution that helps product teams cut repetitive work. It surfaces smart task suggestions, automates status updates, and keeps everyone aligned across sprints.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6b7e3?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Amara Eze", role: "Product Designer" },
			{ name: "Daniel Adebayo", role: "UX Researcher" },
			{ name: "Halima Yusuf", role: "UI Designer" },
		],
		links: { figma: "https://figma.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "3",
		slug: "accelerate-business-profit-10x",
		title: "Accelerate Your Business Profit 10X",
		category: "Full Stack Web Development",
		cohort: "June 2026 Cohort",
		summary:
			"A revenue analytics platform that turns sales data into growth levers.",
		description:
			"Accelerate is a full-stack business intelligence platform that turns raw sales data into growth levers. It offers dashboards, forecasting, and drill-down reports that help small businesses find their next 10x opportunity.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Kelechi Obi", role: "Full Stack Developer" },
			{ name: "Fatima Bello", role: "Frontend Developer" },
			{ name: "Samuel Ajayi", role: "Backend Developer" },
			{ name: "Ngozi Umeh", role: "Data Analyst" },
		],
		links: { url: "https://github.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "4",
		slug: "ai-generated-resources",
		title: "AI Generated Resources",
		category: "Data Analysis",
		cohort: "June 2026 Cohort",
		summary:
			"A content intelligence engine that classifies and curates learning resources.",
		description:
			"AI Generated Resources is a data analysis project that ingests large libraries of learning material and uses NLP to classify, rank, and recommend resources by topic and difficulty.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1522252234503-e356532cafd5?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Oluwaseun Adeyemi", role: "Data Analyst" },
			{ name: "Chinwe Okafor", role: "Machine Learning Engineer" },
			{ name: "Emeka Obi", role: "Data Engineer" },
		],
		links: { github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "5",
		slug: "empowering-change-sustainable-future",
		title: "Empowering Change for a Sustainable Future",
		category: "Product Design",
		cohort: "May 2026 Cohort",
		summary:
			"A community app that connects citizens with local sustainability initiatives.",
		description:
			"Empowering Change is a product design project for a platform that connects citizens with local sustainability initiatives. It simplifies volunteering, tracks community impact, and celebrates small wins.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6b7e3?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Yemi Adeleke", role: "Product Designer" },
			{ name: "Zainab Abdullahi", role: "UX Researcher" },
			{ name: "Kwame Mensah", role: "UI Designer" },
		],
		links: { figma: "https://figma.com/" },
		status: "published",
	},
	{
		_id: "6",
		slug: "securewave-threat-monitor",
		title: "SecureWave Threat Monitor",
		category: "Cyber Security",
		cohort: "May 2026 Cohort",
		summary:
			"A live threat intelligence dashboard for tracking intrusions across networks.",
		description:
			"SecureWave Threat Monitor is a cybersecurity project that aggregates intrusion signals from across a network into a single live dashboard. It visualizes attack vectors and prioritizes incidents by severity.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Aisha Mohammed", role: "Security Analyst" },
			{ name: "David Osei", role: "Cybersecurity Engineer" },
			{ name: "Funmilayo Adebisi", role: "Data Analyst" },
		],
		links: { url: "https://github.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "7",
		slug: "seamless-automated-event-ticketing",
		title: "Experience Seamless and Automated Event Ticketing",
		category: "Full Stack Web Development",
		cohort: "May 2026 Cohort",
		summary:
			"An end-to-end ticketing platform with automated check-in and payments.",
		description:
			"This project is a full-stack event ticketing platform that handles everything from purchase to check-in. It automates seat allocation, sends digital tickets, and gives organizers a real-time attendance view.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6b7e3?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Tobi Alabi", role: "Full Stack Developer" },
			{ name: "Mariam Suleiman", role: "Frontend Developer" },
			{ name: "Chidi Nnaji", role: "Backend Developer" },
			{ name: "Aisha Bello", role: "Product Designer" },
		],
		links: { url: "https://github.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "8",
		slug: "read-stories-speak-stories",
		title: "Read Stories, Speak Stories",
		category: "Data Analysis",
		cohort: "May 2026 Cohort",
		summary:
			"A reading analytics project that measures literacy growth across schools.",
		description:
			"Read Stories, Speak Stories is a data analysis project that tracks literacy outcomes across schools. It aggregates reading logs, measures progress against benchmarks, and surfaces insights for educators.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Nnamdi Eze", role: "Data Analyst" },
			{ name: "Lara Adeyemi", role: "Data Visualization" },
			{ name: "Kunle Fashola", role: "Research Lead" },
		],
		links: { github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "9",
		slug: "network-intrusion-detection-suite",
		title: "Network Intrusion Detection Suite",
		category: "Cyber Security",
		cohort: "May 2026 Cohort",
		summary:
			"An IDS toolkit that detects and categorizes network anomalies in real time.",
		description:
			"The Network Intrusion Detection Suite is a cybersecurity project that monitors network traffic and detects anomalies in real time. It categorizes attack types, generates alerts, and provides replayable evidence for incident response.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1600&auto=format&fit=crop",
		media: [
			{ mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-1" },
			{ mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", publicId: "mock-media-2" },
		],
		teamMembers: [
			{ name: "Bisi Adewale", role: "Security Analyst" },
			{ name: "Kola Ogunleye", role: "Network Engineer" },
			{ name: "Ada Obi", role: "Cybersecurity Engineer" },
		],
		links: { url: "https://github.com/", github: "https://github.com/" },
		status: "published",
	},
	{
		_id: "10",
		slug: "lefta-wealth",
		title: "Lefta Wealth",
		category: "Product Design",
		cohort: "June 2026 Cohort",
		summary: "A modern investment app for growing and managing wealth.",
		description:
			"Lefta Wealth is a modern investment app designed to help individuals grow and manage their wealth with ease. It offers curated investment opportunities, portfolio tracking, and financial insights.",
		coverImageUrl:
			"https://images.unsplash.com/photo-1617952739760-1dcae19a1d93?q=80&w=1600&auto=format&fit=crop",
		teamMembers: [
			{ name: "Sulaiman Adekunle", role: "Lead Designer" },
			{ name: "John Doe", role: "UX Researcher" },
			{ name: "Jane Doe", role: "UI Designer" },
		],
		links: { figma: "https://figma.com/", github: "https://github.com/" },
		status: "published",
	},
];
