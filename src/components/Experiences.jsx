import CognitusSVG from "../assets/cognitus-logo.svg?url";
import IntelsenseAISVG from "../assets/intelsenseai-logo.svg?url";
import GamingVPNPNG from "../assets/gamingvpn-logo.png?url";

const experiences = [
  {
    iconHeight: "24px",
    icon: CognitusSVG,
    title: "Backend Developer",
    company: "Cognitus Consulting LLC",
    period: "2024 - Present",
    description: [],
    technologies: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
  },
  {
    iconHeight: "22px",
    iconBackground: "bg-blue-500",
    icon: GamingVPNPNG,
    title: "Software Developer",
    company: "GamingVPN (Contract)",
    period: "2022 - 2023",
    description: [],
    technologies: [
      "Python",
      "Flask",
      "SQLAlchemy",
      "JavaScript",
      "HTML/CSS",
      "MySQL",
    ],
  },
  {
    iconHeight: 16,
    icon: IntelsenseAISVG,
    title: "Software Developer",
    company: "Intelsense AI Ltd.",
    period: "2020 - 2022",
    description: [],
    technologies: ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
  },
];

function Experiences() {
  return (
    <div className="grid gap-4">
      <h3 className="text-xl font-bold">Experience</h3>
      <div className="grid gap-8">
        {experiences.map((exp, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{exp.title}</h4>
                <p className="text-sm font-bold">{exp.company}</p>
              </div>
              <span className="text-sm text-base/50 flex flex-col items-end">
                <img
                  src={exp.icon}
                  alt={exp.company}
                  height={exp.iconHeight}
                  className={`rounded-md p-1 ${exp.iconBackground}`}
                  loading="lazy"
                />
                {exp.period}
              </span>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              {exp.technologies.map((tech) => (
                <span
                  key={tech}
                  className="badge badge-sm badge-outline select-none"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Experiences };
