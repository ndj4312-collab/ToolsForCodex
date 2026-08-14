import type { SkillIr } from "../domain/skill-ir";

export interface DependencyGraphResult { readonly edges: readonly { from: string; to: string }[]; readonly missing: readonly string[]; readonly cycles: readonly string[][]; readonly userToUser: readonly { from: string; to: string }[] }

export function analyzeDependencies(skills: readonly SkillIr[]): DependencyGraphResult {
  const names = new Set(skills.map((skill) => `/${skill.name}`));
  const byName = new Map(skills.map((skill) => [`/${skill.name}`, skill]));
  const edges = skills.flatMap((skill) => skill.dependencies.map((dependency) => ({ from: `/${skill.name}`, to: dependency })));
  const missing = edges.filter((edge) => !names.has(edge.to)).map((edge) => edge.to).sort();
  const userToUser = edges.filter((edge) => byName.get(edge.from)?.invocationMode === "user" && byName.get(edge.to)?.invocationMode === "user");
  const adjacency = new Map<string, string[]>();
  for (const name of names) adjacency.set(name, []);
  for (const edge of edges) if (names.has(edge.to)) adjacency.get(edge.from)?.push(edge.to);
  let index = 0;
  const indexes = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const cycles: string[][] = [];
  function visit(node: string): void {
    indexes.set(node, index); low.set(node, index); index += 1; stack.push(node); onStack.add(node);
    for (const next of adjacency.get(node) ?? []) {
      if (!indexes.has(next)) { visit(next); low.set(node, Math.min(low.get(node) ?? 0, low.get(next) ?? 0)); }
      else if (onStack.has(next)) low.set(node, Math.min(low.get(node) ?? 0, indexes.get(next) ?? 0));
    }
    if (low.get(node) === indexes.get(node)) {
      const component: string[] = [];
      let current = "";
      do { current = stack.pop() ?? ""; onStack.delete(current); component.push(current); } while (current !== node);
      const first = component[0];
      if (component.length > 1 || (first !== undefined && adjacency.get(first)?.includes(first))) cycles.push(component.sort());
    }
  }
  for (const name of names) if (!indexes.has(name)) visit(name);
  return { edges, missing, cycles, userToUser };
}
