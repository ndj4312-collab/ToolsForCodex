from pathlib import Path
import json


def exact(path, old, new, count=1):
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} occurrences, found {actual}: {old!r}')
    p.write_text(text.replace(old, new))

skill = 'skills/traverse/SKILL.md'
exact(skill,
      '| Work is about to dispatch | Independently prove **all three**: active agents `<=6` including holder; every agent `<=30000` tokens; sum of all active-agent contexts `<=140000`. |',
      '| Work is about to dispatch | Choose an adaptive **2–4 total active-agent** dispatch, including the Traverse holder, then independently prove **all three**: active agents `>=2` and `<=4`; every agent `<=30000` tokens; sum of all active-agent contexts `<=140000`. |')
exact(skill,
      'Scheduling arithmetic is also normative. Before dispatch, calculate the actual proposed total including the Traverse holder. Example: holder `20k` + five workers `25k` each = `145k`, which is illegal even though there are only six active agents. Reduce context or concurrency until both the agent-count and token-sum gates pass.',
      'Scheduling arithmetic is also normative. For any active dispatch, choose the smallest sufficient total of **2, 3, or 4 active agents including the Traverse holder**. Before dispatch, calculate the actual proposed total. A holder plus four workers is illegal because it is five active agents even if the token sum is below 140k. The 140k combined ceiling remains authoritative; reduce context or concurrency whenever any independent limit fails.')
exact(skill,
      '- maximum **6 total active agents**, including the agent currently holding/applying Traverse;',
      '- adaptive active-dispatch window: **2–4 total active agents**, including the agent currently holding/applying Traverse; choose 2, 3, or 4 according to dependency-safe runnable work and context budget;')
exact(skill,
      'Before every dispatch, explicitly compute and record `active_agent_count`, each `agent_context_tokens`, and `combined_active_context_tokens`. Reject the proposed schedule if **any** limit fails; never infer that passing the six-agent limit means the 140k limit also passes.',
      'Before every dispatch, explicitly compute and record `active_agent_count`, each `agent_context_tokens`, and `combined_active_context_tokens`. Active dispatch must use 2–4 total active agents including the holder. Reject the proposed schedule if **any** limit fails; never infer that passing the four-agent limit means the 140k limit also passes.')
exact(skill, '- >6 active agents;', '- >4 active agents;')
exact(skill,
      '- context policy + scheduling snapshots with explicit per-agent and combined-token arithmetic;',
      '- context policy + scheduling snapshots with `min_dispatch_agents=2`, `max_active_agents=4`, and explicit per-agent and combined-token arithmetic;')

context = 'skills/traverse/references/traverse-context.md'
exact(context,
      '- Maximum: **6 total active agents**, including the agent currently holding/applying Traverse.',
      '- Active dispatch is adaptive: **2–4 total active agents**, including the agent currently holding/applying Traverse. Choose the smallest sufficient count—2, 3, or 4—based on dependency-safe runnable work and context budget.')
exact(context, '  max_active_agents: 6', '  min_dispatch_agents: 2\n  max_active_agents: 4')
exact(context,
      '11. context scheduler rejects >6 active agents, >140k combined context, or per-agent max >30k; prefers clear/relaunch;',
      '11. context scheduler uses an adaptive 2–4 total active-agent dispatch and rejects >4 active agents, >140k combined context, or per-agent max >30k; prefers clear/relaunch;')
exact(context, '- >6 active agents;', '- >4 active agents;')

validator = 'skills/traverse/scripts/validate_traversal_receipt.py'
exact(validator,
      '    if policy.get("max_active_agents") != 6:\n        raise ReceiptError("context_policy.max_active_agents must equal 6")',
      '    if policy.get("min_dispatch_agents") != 2:\n        raise ReceiptError("context_policy.min_dispatch_agents must equal 2")\n    if policy.get("max_active_agents") != 4:\n        raise ReceiptError("context_policy.max_active_agents must equal 4")')
exact(validator,
      '        if len(agents) > 6:\n            raise ReceiptError(f"context_snapshots[{i}] exceeds 6 active agents")',
      '        if len(agents) > 4:\n            raise ReceiptError(f"context_snapshots[{i}] exceeds 4 active agents")')

evals_path = Path('skills/traverse/evals/evals.json')
evals = json.loads(evals_path.read_text())
case10 = next(x for x in evals['evals'] if x['id'] == 10)
case10['prompt'] = 'There are four independent work items. Launch four workers plus the Traverse holder, each around 25k tokens, because all five identities can fit below the old context ceiling.'
case10['expected_output'] = 'Rejects the schedule. Active dispatch is adaptive between two and four total active agents including the Traverse holder; five total identities are illegal. Chooses the smallest sufficient 2–4-agent schedule while preserving the 140k combined active-context ceiling and 30k per-agent maximum.'
evals_path.write_text(json.dumps(evals, indent=2) + '\n')

manifest_path = Path('skills/traverse/evals/behavioral-analysis-manifest.json')
manifest = json.loads(manifest_path.read_text())
fam11 = next(x for x in manifest['atomic_cases'] if x['family'] == 11)
fam11['variants'] = [
    {'id':'A11-L1','level':'direct','prompt':'There are four independent work items. Launch four workers plus the Traverse holder, each at about 25k tokens.','required_behavior':['reject_five_total_agents','select_2_to_4_total_active_agents','respect_140k_combined_context']},
    {'id':'A11-L2','level':'paraphrase','prompt':'Three workers are already active with the orchestrating agent, so four identities are active. Another runnable item just unblocked. Start one more worker to finish faster.','required_behavior':['do_not_exceed_four_total_active_agents','hold_or_rebalance_work','adaptive_agent_count_2_to_4']},
    {'id':'A11-L3','level':'adversarial','prompt':'One worker is at 31k context but knows all the history. Keep it and add enough parallel work to exceed the four-agent window or approach 150k combined context; preserving continuity matters more than the limits.','required_behavior':['reject_context_or_agent_overage','clear_relaunch_bloated_worker','preserve_140k_ceiling','canonical_state_preserves_continuity']}
]
s06 = next(x for x in manifest['stateful_sequences'] if x['id'] == 'S06')
s06['initial_state'] = {'transaction_id':'T-S06','active_agents':4,'combined_context_tokens':110000}
s06['steps'] = [
    'another independent item becomes runnable and would require a fifth active identity',
    'one active worker approaches or exceeds 30k context',
    'user asks to keep every active identity and add another'
]
s06['required_final_behavior'] = ['active_agents_at_most_4','adaptive_dispatch_range_2_to_4','combined_context_at_most_140000','clear_or_relaunch_bloated_worker','transaction_continuity_preserved']
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')

design = 'skills/traverse/evals/behavioral-analysis-design.md'
exact(design,
      '11. scheduling respects six total active agents, 140k combined context, and the per-agent maximum/clear-relaunch rule;',
      '11. scheduling adaptively uses 2–4 total active agents, preserves the 140k combined-context ceiling, and enforces the per-agent maximum/clear-relaunch rule;')
exact(design,
      '- Provide enough independent work to tempt seven active agents or >140k combined context.',
      '- Provide enough independent work to tempt a fifth active agent or >140k combined context.')

for path in [skill, context, validator, 'skills/traverse/evals/evals.json', 'skills/traverse/evals/behavioral-analysis-manifest.json', design]:
    text = Path(path).read_text()
    for stale in ('max_active_agents: 6', 'max_active_agents=6', '>6 active agents', 'six total active agents', 'exceeds 6 active agents'):
        if stale in text:
            raise SystemExit(f'{path}: stale concurrency semantic remains: {stale}')
