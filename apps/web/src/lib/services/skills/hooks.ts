import { useQuery } from "@tanstack/react-query";

import { getSkillInstructions, getSkillMeta, SKILLS_PATHS } from "./fetch";

export const useGetSkillMeta = (skillName: string) =>
    useQuery({
        queryKey: [SKILLS_PATHS.GET_META(skillName)],
        queryFn: () => getSkillMeta(skillName),
        staleTime: 5 * 60 * 1000,
    });

export const useGetSkillInstructions = (skillName: string) =>
    useQuery({
        queryKey: [SKILLS_PATHS.GET_INSTRUCTIONS(skillName)],
        queryFn: () => getSkillInstructions(skillName),
    });
