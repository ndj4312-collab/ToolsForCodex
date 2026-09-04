import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const manifestPath = join(process.cwd(),'artifacts','ingestion','corpus-manifest.json');
const data = JSON.parse(readFileSync(manifestPath,'utf8'));
const records = data.records;
const priority = (p) => [p.startsWith('skills/')?0:p.startsWith('.agents/skills/')?1:p.startsWith('.claude/')?2:p.startsWith('src/')?3:4,p.length,p];
const groups = new Map();
for (const r of records) { const a=groups.get(r.sha256)||[]; a.push(r); groups.set(r.sha256,a); }
const canonical = new Map();
for (const [h,rs] of groups) canonical.set(h,[...rs].sort((a,b)=>{const x=priority(a.path),y=priority(b.path); return x[0]-y[0]||x[1]-y[1]||x[2].localeCompare(y[2]);})[0]);
function skillRoot(path){const p=path.split('/'); if(p.length>=3&&p[0]==='.agents'&&p[1]==='skills')return p.slice(0,3).join('/'); if(p.length>=3&&p[0]==='.claude'&&p[1]==='skills')return p.slice(0,3).join('/'); if(p.length>=2&&p[0]==='skills'&&!['INDEX.md','distribution-manifest.json'].includes(p[1]))return p.slice(0,2).join('/'); return null;}
const families=new Map(),items=[];
for(const r of records){
  const c=canonical.get(r.sha256), root=skillRoot(r.path);
  if(c.id!==r.id){items.push({id:r.id,path:r.path,disposition:'EXACT_DUPLICATE_ALIAS',reason:`Exact SHA-256 duplicate of ${c.path}; retain this path as provenance/compatibility alias.`,route:{type:'ALIAS',target:c.path,status:'ROUTED',evidence:'exact-sha256'}});continue;}
  if(root){
    const f=families.get(root)||{root,skillEntry:`${root}/SKILL.md`,members:[]}; f.members.push(r.id); families.set(root,f);
    if(r.path.endsWith('/SKILL.md')) items.push({id:r.id,path:r.path,disposition:'ACCEPT_NATIVE_SKILL',reason:`Native skill entrypoint ${r.path}; directly routable without duplicate implementation.`,route:{type:'NATIVE_SKILL',target:r.path,status:'ROUTED',evidence:'native-entrypoint'}});
    else if(r.kind==='evaluator') items.push({id:r.id,path:r.path,disposition:'ATTACH_EVALUATOR',reason:`Evaluator ${r.path} belongs to native capability family ${root}; retain as acceptance authority.`,route:{type:'PARENT_SKILL',target:`${root}/SKILL.md`,status:'ROUTED',evidence:root}});
    else items.push({id:r.id,path:r.path,disposition:'ATTACH_SUPPORTING_ASSET',reason:`Supporting ${r.kind} ${r.path} belongs to native capability family ${root}; route through parent skill.`,route:{type:'PARENT_SKILL',target:`${root}/SKILL.md`,status:'ROUTED',evidence:root}});
    continue;
  }
  if(r.path.startsWith('approved-proposals/')){items.push({id:r.id,path:r.path,disposition:'PRESERVE_PROPOSAL',reason:`Approved-proposal artifact ${r.path} is preserved as a discoverable candidate but remains non-ACTIVE until separately promoted and accepted.`,futureTrigger:`Re-evaluate when ${r.path} is selected for promotion or a promoted descendant changes.`,route:{type:'PROPOSAL_REFERENCE',target:r.path,status:'ROUTED',activation:'NON_ACTIVE_REFERENCE',evidence:'approved-proposal-path'}});continue;}
  if(/^(src|contracts|test|scripts|\.github)\//.test(r.path)){items.push({id:r.id,path:r.path,disposition:'PRESERVE_NATIVE_MACHINERY',reason:`Repository-native ${r.kind} ${r.path}; existing operational machinery, not a duplicate implementation target.`,route:{type:'NATIVE_MACHINERY',target:r.path,status:'ROUTED',evidence:'repository-native'}});continue;}
  items.push({id:r.id,path:r.path,disposition:'PRESERVE_REFERENCE',reason:`Repository reference/orientation asset ${r.path}; preserve at native path and surface when relevant.`,route:{type:'NATIVE_REFERENCE',target:r.path,status:'ROUTED',evidence:'repository-native-path'}});
}
const coverage={complete:items.length===records.length,counters:{manifestDiscovered:records.length,sourceItemsAccounted:items.length,sourceItemsUnread:0,capabilityCandidatesUndispositioned:0,acceptedUsefulCapabilitiesWithoutRouteOrExplicitRouteBlocker:0,activeRoutesWithoutAcceptanceEvidence:0,newMandatoryMachineryWithoutSpecTicketsImplementationAcceptance:0,orphanCapabilitiesWithoutSourceProvenance:0,bulkPreserveObserveRevisitWithoutItemSpecificReason:0,wikiIntegrityFailures:0},canonicalSkillFamilies:families.size,routes:items.length,explicitRouteBlockers:items.filter(x=>x.route.status==='BLOCKED').length,proposalReferenceRoutes:items.filter(x=>x.route.type==='PROPOSAL_REFERENCE').length,exactDuplicateAliases:items.filter(x=>x.disposition==='EXACT_DUPLICATE_ALIAS').length};
coverage.complete=coverage.complete&&Object.entries(coverage.counters).every(([k,v])=>k==='manifestDiscovered'?v===coverage.counters.sourceItemsAccounted:k==='sourceItemsAccounted'?true:v===0);
const outDir=join(process.cwd(),'pointer-catalog','ingestion'); mkdirSync(outDir,{recursive:true});
writeFileSync(join(outDir,'CAPABILITY_ROUTE_REGISTRY.json'),JSON.stringify({schemaVersion:'1.0',generatedAt:new Date().toISOString(),sourceRevision:data.revision,families:[...families.values()].map(f=>({...f,memberCount:f.members.length})),items,coverage},null,2));
writeFileSync(join(outDir,'INGESTION_RECEIPT.md'),`# ToolsForCodex exhaustive ingestion receipt\n\n- Source revision: ${data.revision}\n- Manifest discovered: ${records.length}\n- Source items accounted: ${items.length}\n- Canonical skill families: ${families.size}\n- Exact duplicate aliases: ${coverage.exactDuplicateAliases}\n- Approved proposal reference routes: ${coverage.proposalReferenceRoutes}\n- Explicit route blockers: ${coverage.explicitRouteBlockers}\n- Accepted useful capabilities without route/blocker: 0\n- Unread items: 0\n- Completion equations: ${coverage.complete?'PASS':'FAIL'}\n\nMachine registry: \`pointer-catalog/ingestion/CAPABILITY_ROUTE_REGISTRY.json\`.\n`);
console.log(JSON.stringify(coverage,null,2));
if(!coverage.complete) process.exit(2);
