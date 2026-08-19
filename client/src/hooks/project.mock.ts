import type { Project } from "@tsa/shared";

export const MOCK_PROJECT: Project = {
  _id: "demo-1",
  slug: "lefta-wealth",
  title: "Lefta Wealth",
  category: "Product Design",
  cohort: "June 2026 Cohort",
  summary: "A modern investment app for growing and managing wealth.",
  description:
    "Lefta Wealth is a modern investment app designed to help individuals grow and manage their wealth with ease. It offers curated investment opportunities, portfolio tracking, and financial insights.",
  coverImageUrl: "",
  teamMembers: [
    { name: "Sulaiman Adekunle", role: "Lead Designer" },
    { name: "John Doe", role: "UX Researcher" },
    { name: "Jane Doe", role: "UI Designer" },
  ],
  links: { figma: "https://figma.com/", github: "https://github.com/" },
  status: "published",
};
