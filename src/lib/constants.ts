export interface SkillDetail {
  skill: string;
  image: string;
  name: string;
  description: string;
}

export const categories = [
  "ELECTRICAL",
  "PLUMBING",
  "BEAUTY CARE",
  "CARPENTRY",
  "FASHION",
  "PHOTOGRAPHY",
] as const;

const barberDescription =
  "A skilled tradesperson who specializes in their craft, working with clients to deliver reliable, professional service.";

export const electricalDetails: SkillDetail[] = [
  {
    skill: "Electrician",
    image: "/assets/electrician.jpeg",
    name: "Francis Mark",
    description: barberDescription,
  },
  {
    skill: "Electrician",
    image: "/assets/hairstylist.jpg",
    name: "Francis Mark",
    description: barberDescription,
  },
  {
    skill: "Electrician",
    image: "/assets/foundationLayers.jpg",
    name: "Francis Mark",
    description: barberDescription,
  },
];

export const plumberDetails: SkillDetail[] = [
  {
    skill: "Plumber",
    image: "/assets/plumb1.jpeg",
    name: "Francis Mark",
    description: barberDescription,
  },
  {
    skill: "Plumber",
    image: "/assets/plumb2.jpeg",
    name: "Francis Mark",
    description: barberDescription,
  },
  {
    skill: "Plumber",
    image: "/assets/plum3.jpeg",
    name: "Francis Mark",
    description: barberDescription,
  },
];
